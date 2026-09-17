import { NORMAL_LETTERS } from '../utils/turkish';
import { validateRoundAnswers, ValidationResult } from './validator';

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  answers: Record<string, string>;
  filledCount: number;
  totalScore: number;
  roundScore: number;
}

export interface OnlineRoom {
  code: string;
  hostId: string;
  guestId?: string;
  status: 'waiting' | 'playing' | 'scored' | 'finished';
  currentLetter: string;
  roundNumber: number;
  maxRounds: number;
  roundTimeLimit: number; // 30, 45, 60, 120 seconds
  stoppedBy?: string;
  results?: any[];
  players: Record<string, RoomPlayer>;
}

export interface CategoryResultItem {
  categoryId: string;
  categoryName: string;
  icon: any;
  p1Word: string;
  p1Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty';
  p1Points: number;
  p1Corrected?: string;
  p2Word: string;
  p2Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty';
  p2Points: number;
  p2Corrected?: string;
  isPisti?: boolean;
}

type RoomCallback = (room: OnlineRoom) => void;
type ScoredCallback = (room: OnlineRoom, results: CategoryResultItem[]) => void;

interface DuelMessage {
  type: 'ANNOUNCE' | 'JOIN_REQUEST' | 'ROOM_STATE' | 'PROGRESS' | 'DUR' | 'ROUND_SCORED' | 'NEXT_ROUND' | 'REMATCH' | 'LEAVE';
  senderId: string;
  roomCode: string;
  timestamp: number;
  payload?: any;
}

class OnlineService {
  private currentRoom: OnlineRoom | null = null;
  private myPlayerId: string = '';
  private isHost: boolean = false;
  private roomCode: string = '';
  private broadcastChannel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private pollInterval: any = null;
  private announceInterval: any = null;
  private currentAnswers: Record<string, string> = {};
  private seenMessageIds: Set<string> = new Set();

  private roomListeners: Set<RoomCallback> = new Set();
  private scoredListeners: Set<ScoredCallback> = new Set();

  public getPlayerId(): string {
    return this.myPlayerId;
  }

  public getCurrentRoom(): OnlineRoom | null {
    return this.currentRoom;
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public onRoomUpdate(callback: RoomCallback): () => void {
    this.roomListeners.add(callback);
    return () => this.roomListeners.delete(callback);
  }

  public onScored(callback: ScoredCallback): () => void {
    this.scoredListeners.add(callback);
    return () => this.scoredListeners.delete(callback);
  }

  private notifyRoomUpdate(room: OnlineRoom) {
    this.currentRoom = room;
    this.roomListeners.forEach(cb => {
      try {
        cb(room);
      } catch (err) {
        console.error('Room listener error:', err);
      }
    });
  }

  private notifyScored(room: OnlineRoom, results: CategoryResultItem[]) {
    this.currentRoom = room;
    this.scoredListeners.forEach(cb => {
      try {
        cb(room, results);
      } catch (err) {
        console.error('Scored listener error:', err);
      }
    });
  }

  /**
   * Helper: Normalize room code to format HA-XXXX
   */
  public normalizeCode(raw: string): string {
    const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (/^\d{4}$/.test(cleaned)) {
      return `HA-${cleaned}`;
    }
    if (/^HA\d{4}$/.test(cleaned)) {
      return `HA-${cleaned.slice(2)}`;
    }
    return raw.trim().toUpperCase();
  }

  /**
   * Generates a safe ntfy topic name from room code
   */
  private getTopic(code: string): string {
    const clean = code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `ha_duel_${clean}`;
  }

  /**
   * Establish real-time communication via BroadcastChannel (local 0ms) and ntfy.sh (internet port 443)
   */
  private connectChannels(code: string) {
    this.cleanupChannels();
    this.roomCode = code;

    // 1. BroadcastChannel (Local browser tabs/windows - 0ms instantaneous)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel(`ha_chan_${code}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data) {
            this.handleIncomingMessage(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    // 2. ntfy.sh WebSocket (Cross-device, Internet port 443 WSS)
    const topic = this.getTopic(code);
    try {
      const wsUrl = `wss://ntfy.sh/${topic}/ws`;
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          if (envelope.event === 'message' && envelope.message) {
            const duelMsg = JSON.parse(envelope.message);
            this.handleIncomingMessage(duelMsg);
          }
        } catch {
          // ignore non-json
        }
      };

      ws.onerror = (err) => {
        console.warn('WS error on ntfy, polling fallback active:', err);
      };

      ws.onclose = () => {
        // If room is still active, attempt reconnect after 2s
        if (this.currentRoom && (this.currentRoom.status === 'waiting' || this.currentRoom.status === 'playing')) {
          setTimeout(() => {
            if (this.currentRoom) {
              this.connectWsOnly(topic);
            }
          }, 2000);
        }
      };
    } catch (err) {
      console.warn('WebSocket init failed:', err);
    }

    // 3. Fallback HTTP Poll every 1.8 seconds
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=30s`);
        if (!res.ok) return;
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const envelope = JSON.parse(line);
            if (envelope.event === 'message' && envelope.message) {
              const duelMsg = JSON.parse(envelope.message);
              this.handleIncomingMessage(duelMsg);
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore poll errors
      }
    }, 1800);
  }

  private connectWsOnly(topic: string) {
    try {
      const ws = new WebSocket(`wss://ntfy.sh/${topic}/ws`);
      this.ws = ws;
      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          if (envelope.event === 'message' && envelope.message) {
            const duelMsg = JSON.parse(envelope.message);
            this.handleIncomingMessage(duelMsg);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  }

  /**
   * Broadcasts a message to both BroadcastChannel and ntfy.sh
   */
  private async broadcastMessage(msg: Omit<DuelMessage, 'senderId' | 'roomCode' | 'timestamp'>) {
    const fullMsg: DuelMessage = {
      ...msg,
      senderId: this.myPlayerId,
      roomCode: this.roomCode,
      timestamp: Date.now()
    };

    // 1. BroadcastChannel (local tabs)
    try {
      this.broadcastChannel?.postMessage(fullMsg);
    } catch {
      // ignore
    }

    // 2. ntfy.sh (internet cross-device)
    const topic = this.getTopic(this.roomCode);
    try {
      fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: JSON.stringify(fullMsg)
        })
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  /**
   * Handles messages received from either channel
   */
  private async handleIncomingMessage(msg: DuelMessage) {
    if (!msg || !msg.type || !msg.roomCode) return;
    if (msg.roomCode !== this.roomCode) return;

    // Deduplicate identical messages
    const msgKey = `${msg.type}_${msg.senderId}_${msg.timestamp}`;
    if (this.seenMessageIds.has(msgKey)) return;
    this.seenMessageIds.add(msgKey);
    if (this.seenMessageIds.size > 200) {
      this.seenMessageIds.clear();
    }

    // Ignore self-echoes
    if (msg.senderId === this.myPlayerId) return;

    switch (msg.type) {
      // --- HOST RECEIVES JOIN REQUEST FROM GUEST ---
      case 'JOIN_REQUEST': {
        if (!this.isHost || !this.currentRoom) return;
        const guest = msg.payload?.guest;
        if (!guest || !guest.id) return;

        // Add guest to room and launch game!
        const guestId = guest.id;
        const updatedPlayers = {
          ...this.currentRoom.players,
          [guestId]: {
            id: guestId,
            name: guest.name || 'Oyuncu 2',
            avatar: guest.avatar || '🦁',
            answers: {},
            filledCount: 0,
            totalScore: 0,
            roundScore: 0
          }
        };

        const updatedRoom: OnlineRoom = {
          ...this.currentRoom,
          guestId,
          status: 'playing',
          currentLetter: NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)],
          roundNumber: 1,
          players: updatedPlayers
        };

        this.currentRoom = updatedRoom;
        this.notifyRoomUpdate(updatedRoom);

        // Broadcast game start / updated state to everyone
        this.broadcastMessage({
          type: 'ROOM_STATE',
          payload: { room: updatedRoom }
        });
        break;
      }

      // --- GUEST OR HOST RECEIVES FULL ROOM STATE ---
      case 'ROOM_STATE': {
        const room = msg.payload?.room;
        if (room) {
          this.currentRoom = room;
          this.notifyRoomUpdate(room);
        }
        break;
      }

      // --- LIVE OPPONENT PROGRESS ---
      case 'PROGRESS': {
        if (!this.currentRoom) return;
        const { playerId, filledCount, answers } = msg.payload || {};
        if (playerId && this.currentRoom.players[playerId]) {
          const updated = {
            ...this.currentRoom,
            players: {
              ...this.currentRoom.players,
              [playerId]: {
                ...this.currentRoom.players[playerId],
                filledCount: filledCount || 0,
                answers: answers || this.currentRoom.players[playerId].answers
              }
            }
          };
          this.currentRoom = updated;
          this.notifyRoomUpdate(updated);
        }
        break;
      }

      // --- DUR BUTTON PRESSED OR TIME OUT ---
      case 'DUR': {
        const { playerId, answers } = msg.payload || {};
        if (this.isHost && this.currentRoom && this.currentRoom.status === 'playing') {
          // Record the sender's answers
          if (playerId && this.currentRoom.players[playerId]) {
            this.currentRoom.players[playerId].answers = answers || {};
          }
          // Record host's own latest answers
          if (this.currentRoom.players[this.myPlayerId]) {
            this.currentRoom.players[this.myPlayerId].answers = this.currentAnswers;
          }
          await this.evaluateAndScoreRound(playerId);
        }
        break;
      }

      // --- ROUND SCORED RESULTS RECEIVED (Both host and guest) ---
      case 'ROUND_SCORED': {
        const { room, results } = msg.payload || {};
        if (room && results) {
          this.currentRoom = room;
          this.notifyScored(room, results);
        }
        break;
      }

      // --- NEXT ROUND TRIGGERED ---
      case 'NEXT_ROUND': {
        const room = msg.payload?.room;
        if (room) {
          this.currentAnswers = {};
          this.currentRoom = room;
          this.notifyRoomUpdate(room);
        }
        break;
      }

      // --- REMATCH TRIGGERED ---
      case 'REMATCH': {
        const room = msg.payload?.room;
        if (room) {
          this.currentAnswers = {};
          this.currentRoom = room;
          this.notifyRoomUpdate(room);
        }
        break;
      }

      // --- OPPONENT LEFT ---
      case 'LEAVE': {
        if (this.currentRoom) {
          this.currentRoom.status = 'finished';
          this.notifyRoomUpdate(this.currentRoom);
        }
        break;
      }
    }
  }

  /**
   * Host evaluates round answers and broadcasts scores
   */
  private async evaluateAndScoreRound(stoppedById?: string) {
    if (!this.currentRoom) return;

    const playerIds = Object.keys(this.currentRoom.players);
    const p1Id = this.currentRoom.hostId;
    const p2Id = this.currentRoom.guestId || playerIds.find(id => id !== p1Id);

    const p1 = this.currentRoom.players[p1Id];
    const p2 = p2Id ? this.currentRoom.players[p2Id] : null;

    const targetLetter = this.currentRoom.currentLetter;
    const stopperName = stoppedById && this.currentRoom.players[stoppedById] 
      ? this.currentRoom.players[stoppedById].name 
      : p1.name;

    // Validate P1 answers
    const p1Validation = await validateRoundAnswers(targetLetter, p1.answers || {});
    // Validate P2 answers
    const p2Validation = p2 ? await validateRoundAnswers(targetLetter, p2.answers || {}) : {};

    const categories = [
      { id: 'name', name: 'İsim' },
      { id: 'city', name: 'Şehir' },
      { id: 'animal', name: 'Hayvan' },
      { id: 'plant', name: 'Bitki / Meyve' },
      { id: 'object', name: 'Eşya' },
      { id: 'country', name: 'Ülke' },
    ];

    let p1RoundScore = 0;
    let p2RoundScore = 0;
    const catResults: CategoryResultItem[] = [];

    for (const cat of categories) {
      const res1: ValidationResult = p1Validation[cat.id] || { isValid: false, status: 'empty', points: 0, word: '' };
      const res2: ValidationResult = p2 ? (p2Validation[cat.id] || { isValid: false, status: 'empty', points: 0, word: '' }) : { isValid: false, status: 'empty', points: 0, word: '' };

      const w1 = (res1.word || '').trim().toLocaleLowerCase('tr-TR');
      const w2 = (res2.word || '').trim().toLocaleLowerCase('tr-TR');

      let isPisti = false;
      let p1Pts = res1.points;
      let p2Pts = res2.points;
      let p1Status = res1.status;
      let p2Status = res2.status;

      // PİŞTİ Check: Both gave the exact same valid word
      if (res1.isValid && res2.isValid && w1.length > 0 && w1 === w2) {
        isPisti = true;
        p1Status = 'pisti';
        p2Status = 'pisti';
        p1Pts = 5;
        p2Pts = 5;
      }

      p1RoundScore += p1Pts;
      p2RoundScore += p2Pts;

      catResults.push({
        categoryId: cat.id,
        categoryName: cat.name,
        icon: null,
        p1Word: res1.word || '',
        p1Status,
        p1Points: p1Pts,
        p1Corrected: res1.corrected,
        p2Word: res2.word || '',
        p2Status,
        p2Points: p2Pts,
        p2Corrected: res2.corrected,
        isPisti
      });
    }

    // Update room state
    p1.roundScore = p1RoundScore;
    p1.totalScore += p1RoundScore;
    if (p2) {
      p2.roundScore = p2RoundScore;
      p2.totalScore += p2RoundScore;
    }

    const isFinished = this.currentRoom.roundNumber >= this.currentRoom.maxRounds;

    const scoredRoom: OnlineRoom = {
      ...this.currentRoom,
      status: isFinished ? 'finished' : 'scored',
      stoppedBy: stopperName,
      players: {
        ...this.currentRoom.players,
        [p1Id]: p1,
        ...(p2 && p2Id ? { [p2Id]: p2 } : {})
      }
    };

    this.currentRoom = scoredRoom;
    this.notifyScored(scoredRoom, catResults);

    // Broadcast to guest
    this.broadcastMessage({
      type: 'ROUND_SCORED',
      payload: { room: scoredRoom, results: catResults }
    });
  }

  /**
   * 1. CREATE ROOM (HOST)
   */
  public async createRoom(
    hostProfile: { name: string; avatar: string },
    timeLimit: number
  ): Promise<{ room: OnlineRoom; playerId: string }> {
    this.leaveRoom();

    const code = `HA-${Math.floor(1000 + Math.random() * 9000)}`;
    const hostId = `p_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
    this.myPlayerId = hostId;
    this.isHost = true;
    this.roomCode = code;

    const newRoom: OnlineRoom = {
      code,
      hostId,
      status: 'waiting',
      currentLetter: NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)],
      roundNumber: 1,
      maxRounds: 10,
      roundTimeLimit: [30, 45, 60, 120].includes(timeLimit) ? timeLimit : 60,
      players: {
        [hostId]: {
          id: hostId,
          name: (hostProfile.name || 'Oyuncu 1').trim(),
          avatar: hostProfile.avatar || '🦊',
          answers: {},
          filledCount: 0,
          totalScore: 0,
          roundScore: 0
        }
      }
    };

    this.currentRoom = newRoom;
    this.connectChannels(code);

    // Periodically announce room availability until guest joins
    this.announceInterval = setInterval(() => {
      if (this.currentRoom && this.currentRoom.status === 'waiting') {
        this.broadcastMessage({
          type: 'ANNOUNCE',
          payload: { room: this.currentRoom }
        });
      }
    }, 1500);

    return { room: newRoom, playerId: hostId };
  }

  /**
   * 2. JOIN ROOM (GUEST)
   */
  public async joinRoom(
    rawCode: string,
    guestProfile: { name: string; avatar: string }
  ): Promise<{ room: OnlineRoom; playerId: string }> {
    this.leaveRoom();

    const code = this.normalizeCode(rawCode);
    const guestId = `p_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
    this.myPlayerId = guestId;
    this.isHost = false;
    this.roomCode = code;

    this.connectChannels(code);

    return new Promise((resolve, reject) => {
      let resolved = false;

      // Timeout if host never responds
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.leaveRoom();
          reject(new Error('Odaya bağlanılamadı. Kodun doğruluğundan ve oda sahibinin açık olduğundan emin olun.'));
        }
      }, 10000);

      // Listener for when game starts
      const onRoom = (room: OnlineRoom) => {
        if (room.status === 'playing' && room.players[guestId]) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            clearInterval(joinSender);
            this.roomListeners.delete(onRoom);
            resolve({ room, playerId: guestId });
          }
        }
      };

      this.roomListeners.add(onRoom);

      // Rapidly ping JOIN_REQUEST
      const sendJoin = () => {
        if (!resolved) {
          this.broadcastMessage({
            type: 'JOIN_REQUEST',
            payload: {
              guest: {
                id: guestId,
                name: (guestProfile.name || 'Oyuncu 2').trim(),
                avatar: guestProfile.avatar || '🦁'
              }
            }
          });
        }
      };

      sendJoin();
      const joinSender = setInterval(sendJoin, 1200);
    });
  }

  /**
   * 3. SEND PROGRESS (LIVE TYPING)
   */
  public sendProgress(answers: Record<string, string>) {
    this.currentAnswers = answers;
    const filledCount = Object.values(answers).filter(v => typeof v === 'string' && v.trim().length > 0).length;

    if (this.currentRoom && this.currentRoom.players[this.myPlayerId]) {
      this.currentRoom.players[this.myPlayerId].filledCount = filledCount;
      this.currentRoom.players[this.myPlayerId].answers = answers;
    }

    this.broadcastMessage({
      type: 'PROGRESS',
      payload: {
        playerId: this.myPlayerId,
        filledCount,
        answers
      }
    });
  }

  /**
   * 4. SEND DUR (STOP ROUND)
   */
  public async sendDur(answers: Record<string, string>) {
    this.currentAnswers = answers;

    if (this.isHost) {
      if (this.currentRoom && this.currentRoom.players[this.myPlayerId]) {
        this.currentRoom.players[this.myPlayerId].answers = answers;
      }
      await this.evaluateAndScoreRound(this.myPlayerId);
    } else {
      this.broadcastMessage({
        type: 'DUR',
        payload: {
          playerId: this.myPlayerId,
          answers
        }
      });
    }
  }

  /**
   * 5. NEXT ROUND
   */
  public async nextRound() {
    if (!this.currentRoom) return;

    if (this.isHost) {
      const nextRoundNum = this.currentRoom.roundNumber + 1;
      const isFinished = nextRoundNum > this.currentRoom.maxRounds;

      // Reset players' current round answers and progress
      const resetPlayers: Record<string, RoomPlayer> = {};
      for (const [id, p] of Object.entries(this.currentRoom.players)) {
        resetPlayers[id] = {
          ...p,
          answers: {},
          filledCount: 0,
          roundScore: 0
        };
      }

      const nextRoom: OnlineRoom = {
        ...this.currentRoom,
        roundNumber: nextRoundNum,
        currentLetter: NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)],
        status: isFinished ? 'finished' : 'playing',
        players: resetPlayers
      };

      delete nextRoom.stoppedBy;
      delete nextRoom.results;

      this.currentAnswers = {};
      this.currentRoom = nextRoom;
      this.notifyRoomUpdate(nextRoom);

      this.broadcastMessage({
        type: 'NEXT_ROUND',
        payload: { room: nextRoom }
      });
    } else {
      // Guest asks host for next round
      this.broadcastMessage({
        type: 'NEXT_ROUND',
        payload: {}
      });
    }
  }

  /**
   * 6. REMATCH
   */
  public async rematch() {
    if (!this.currentRoom) return;

    if (this.isHost) {
      const resetPlayers: Record<string, RoomPlayer> = {};
      for (const [id, p] of Object.entries(this.currentRoom.players)) {
        resetPlayers[id] = {
          ...p,
          answers: {},
          filledCount: 0,
          totalScore: 0,
          roundScore: 0
        };
      }

      const freshRoom: OnlineRoom = {
        ...this.currentRoom,
        roundNumber: 1,
        currentLetter: NORMAL_LETTERS[Math.floor(Math.random() * NORMAL_LETTERS.length)],
        status: 'playing',
        players: resetPlayers
      };

      delete freshRoom.stoppedBy;
      delete freshRoom.results;

      this.currentAnswers = {};
      this.currentRoom = freshRoom;
      this.notifyRoomUpdate(freshRoom);

      this.broadcastMessage({
        type: 'REMATCH',
        payload: { room: freshRoom }
      });
    }
  }

  /**
   * Clean up all active listeners, intervals, and sockets
   */
  private cleanupChannels() {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
      this.broadcastChannel = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.announceInterval) {
      clearInterval(this.announceInterval);
      this.announceInterval = null;
    }
  }

  /**
   * Leave room and reset service state
   */
  public leaveRoom() {
    if (this.currentRoom && this.myPlayerId) {
      this.broadcastMessage({
        type: 'LEAVE',
        payload: { playerId: this.myPlayerId }
      }).catch(() => {});
    }

    this.cleanupChannels();
    this.currentRoom = null;
    this.myPlayerId = '';
    this.isHost = false;
    this.roomCode = '';
    this.currentAnswers = {};
  }
}

export const onlineService = new OnlineService();
