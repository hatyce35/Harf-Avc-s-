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
  icon?: any;
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

  private ntfySSE: EventSource | null = null;
  private serverSSE: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private syncInterval: any = null;
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
   * Helper: Normalize room code to format HA-XXXX, even from full links, spaces, or raw digits
   */
  public normalizeCode(raw: string): string {
    if (!raw) return '';
    let s = String(raw).trim().toUpperCase();
    const match = s.match(/(?:ODA|ROOM|JOIN)[=:]([A-Z0-9-]+)/i);
    if (match && match[1]) s = match[1];
    const four = s.match(/\b\d{4}\b/);
    if (four) return `HA-${four[0]}`;
    const haMatch = s.match(/HA[-_ ]?([0-9]{4})/i);
    if (haMatch && haMatch[1]) return `HA-${haMatch[1]}`;
    const digitsOnly = s.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 4) return `HA-${digitsOnly}`;
    return s.replace(/[^A-Z0-9-]/g, '');
  }

  /**
   * Generates a clean, lowercase, alphanumeric ntfy topic name from room code
   */
  private getTopic(code: string): string {
    const digits = code.replace(/[^0-9]/g, '');
    if (digits.length >= 4) {
      return `harfavcisi_oda_${digits.slice(0, 4)}`;
    }
    const clean = code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `harfavcisi_oda_${clean}`;
  }

  /**
   * Connect all communication layers (ntfy SSE for universal cross-device, local BroadcastChannel, and server)
   */
  private connectChannels(code: string) {
    this.cleanupChannels();
    this.roomCode = code;
    const topic = this.getTopic(code);

    // 1. Universal Cross-Device / Cross-Domain: ntfy.sh Server-Sent Events (SSE)
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        const sseUrl = `https://ntfy.sh/${topic}/sse`;
        this.ntfySSE = new EventSource(sseUrl);
        this.ntfySSE.onmessage = (event) => {
          if (!event.data) return;
          try {
            const raw = JSON.parse(event.data);
            if (raw.event === 'message' && raw.message) {
              const duelMsg: DuelMessage = JSON.parse(raw.message);
              this.handleIncomingMessage(duelMsg);
            }
          } catch {
            // ignore non-json
          }
        };
        this.ntfySSE.onerror = () => {
          // SSE reconnects automatically
        };
      }
    } catch (e) {
      console.warn('ntfy SSE init error:', e);
    }

    // 2. Same-device / Same-browser instant communication
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel(`ha_chan_${topic}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data) {
            this.handleIncomingMessage(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 3. Local server SSE backup (if on same container instance)
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        this.serverSSE = new EventSource(`/api/rooms/${code}/events`);
        this.serverSSE.onmessage = (event) => {
          if (event.data && !event.data.startsWith(':')) {
            try {
              const serverRoom = JSON.parse(event.data);
              if (serverRoom && serverRoom.code) {
                this.handleRoomSync(serverRoom);
              }
            } catch {
              // ignore
            }
          }
        };
      }
    } catch {
      // server SSE optional
    }
  }

  /**
   * Handle state synchronization
   */
  private handleRoomSync(room: OnlineRoom) {
    if (!room || !room.code) return;
    const prevRoom = this.currentRoom;
    const prevStatus = prevRoom?.status;

    this.currentRoom = room;

    if (room.status === 'scored' && room.results && prevStatus !== 'scored') {
      this.notifyScored(room, room.results);
      return;
    }

    if (prevRoom && (prevRoom.roundNumber !== room.roundNumber || prevRoom.currentLetter !== room.currentLetter)) {
      this.currentAnswers = {};
    }

    this.notifyRoomUpdate(room);
  }

  /**
   * Broadcast message to peer across all channels
   */
  private async broadcastMessage(msg: Omit<DuelMessage, 'senderId' | 'roomCode' | 'timestamp'>) {
    const fullMsg: DuelMessage = {
      ...msg,
      senderId: this.myPlayerId,
      roomCode: this.roomCode,
      timestamp: Date.now()
    };

    // 1. BroadcastChannel (local tabs - 0ms)
    try {
      this.broadcastChannel?.postMessage(fullMsg);
    } catch {
      // ignore
    }

    // 2. Universal ntfy.sh (internet cross-device, cross-domain)
    const topic = this.getTopic(this.roomCode);
    try {
      fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullMsg)
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  /**
   * Handles peer-to-peer incoming messages
   */
  private async handleIncomingMessage(msg: DuelMessage) {
    if (!msg || !msg.type || !msg.roomCode) return;
    const msgNormalized = this.normalizeCode(msg.roomCode);
    const myNormalized = this.normalizeCode(this.roomCode);
    if (msgNormalized !== myNormalized) return;

    // Ignore self-echoes
    if (msg.senderId === this.myPlayerId) return;

    // Deduplicate identical messages
    const msgKey = `${msg.type}_${msg.senderId}_${msg.timestamp}`;
    if (this.seenMessageIds.has(msgKey)) return;
    this.seenMessageIds.add(msgKey);
    if (this.seenMessageIds.size > 200) {
      this.seenMessageIds.clear();
    }

    switch (msg.type) {
      // HOST receives guest join request
      case 'JOIN_REQUEST': {
        if (!this.isHost || !this.currentRoom) return;
        const guest = msg.payload?.guest;
        if (!guest || !guest.id) return;

        const guestId = guest.id;
        const updatedPlayers: Record<string, RoomPlayer> = {
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
          roundNumber: 1,
          players: updatedPlayers
        };

        this.currentRoom = updatedRoom;
        this.notifyRoomUpdate(updatedRoom);

        // Broadcast game start to guest immediately
        this.broadcastMessage({
          type: 'ROOM_STATE',
          payload: { room: updatedRoom }
        });
        break;
      }

      // Guest or Host receives full room state
      case 'ROOM_STATE':
      case 'ANNOUNCE': {
        const room = msg.payload?.room;
        if (room && room.players) {
          this.handleRoomSync(room);
        }
        break;
      }

      // Real-time typing progress
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
                filledCount: filledCount !== undefined ? filledCount : this.currentRoom.players[playerId].filledCount,
                answers: answers || this.currentRoom.players[playerId].answers
              }
            }
          };
          this.currentRoom = updated;
          this.notifyRoomUpdate(updated);
        }
        break;
      }

      // DUR button pressed
      case 'DUR': {
        const { playerId, answers } = msg.payload || {};
        if (playerId && this.currentRoom && this.currentRoom.players[playerId]) {
          this.currentRoom.players[playerId].answers = answers || {};
        }

        if (this.isHost && this.currentRoom && this.currentRoom.status === 'playing') {
          // Host calculates round score for both players
          await this.evaluateAndScoreRound(playerId);
        }
        break;
      }

      // Host sends scored results
      case 'ROUND_SCORED': {
        const { room, results } = msg.payload || {};
        if (room && results) {
          this.currentRoom = room;
          this.notifyScored(room, results);
        }
        break;
      }

      // Next round started
      case 'NEXT_ROUND': {
        const { room } = msg.payload || {};
        if (room) {
          this.handleRoomSync(room);
        } else if (this.isHost) {
          this.nextRound();
        }
        break;
      }

      // Rematch started
      case 'REMATCH': {
        const { room } = msg.payload || {};
        if (room) {
          this.handleRoomSync(room);
        } else if (this.isHost) {
          this.rematch();
        }
        break;
      }

      // Player left
      case 'LEAVE': {
        if (this.currentRoom) {
          const leavingId = msg.payload?.playerId;
          if (leavingId && this.currentRoom.players[leavingId]) {
            const newPlayers = { ...this.currentRoom.players };
            delete newPlayers[leavingId];
            const updated: OnlineRoom = {
              ...this.currentRoom,
              status: 'waiting',
              players: newPlayers
            };
            this.currentRoom = updated;
            this.notifyRoomUpdate(updated);
          }
        }
        break;
      }
    }
  }

  /**
   * Host evaluates round answers and broadcasts scores
   */
  private async evaluateAndScoreRound(stopperId: string) {
    if (!this.currentRoom) return;
    const playerIds = Object.keys(this.currentRoom.players);
    const p1Id = this.currentRoom.hostId || playerIds[0];
    const p2Id = this.currentRoom.guestId || playerIds.find(id => id !== p1Id) || playerIds[1];

    const p1 = this.currentRoom.players[p1Id];
    const p2 = p2Id ? this.currentRoom.players[p2Id] : null;
    const stopper = this.currentRoom.players[stopperId];
    const stopperName = stopper?.name || 'Bir oyuncu';

    const targetLetter = this.currentRoom.currentLetter;
    const p1Val = await validateRoundAnswers(targetLetter, p1.answers || {});
    const p2Val = p2 ? await validateRoundAnswers(targetLetter, p2.answers || {}) : null;

    const CATEGORIES = [
      { id: 'name', name: 'İsim' },
      { id: 'city', name: 'Şehir' },
      { id: 'animal', name: 'Hayvan' },
      { id: 'plant', name: 'Bitki' },
      { id: 'object', name: 'Eşya' },
      { id: 'country', name: 'Ülke' }
    ];

    const catResults: CategoryResultItem[] = [];
    let p1RoundScore = 0;
    let p2RoundScore = 0;

    for (const cat of CATEGORIES) {
      const p1Item = p1Val[cat.id];
      const p2Item = p2Val ? p2Val[cat.id] : null;

      const p1Word = (p1.answers[cat.id] || '').trim();
      const p2Word = p2 ? (p2.answers[cat.id] || '').trim() : '';

      const p1Norm = p1Word.toLocaleLowerCase('tr-TR');
      const p2Norm = p2Word.toLocaleLowerCase('tr-TR');

      let p1Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty' = p1Item?.status || 'empty';
      let p2Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty' = p2Item?.status || 'empty';
      let p1Points = 0;
      let p2Points = 0;
      let isPisti = false;

      const p1IsValid = p1Status === 'valid' || p1Status === 'typo';
      const p2IsValid = p2Status === 'valid' || p2Status === 'typo';

      if (p1IsValid && p2IsValid) {
        if (p1Norm === p2Norm) {
          // PİŞTİ! Both gave the identical answer
          p1Status = 'pisti';
          p2Status = 'pisti';
          p1Points = 5;
          p2Points = 5;
          isPisti = true;
        } else {
          p1Points = 10;
          p2Points = 10;
        }
      } else if (p1IsValid && !p2IsValid) {
        p1Points = 10;
      } else if (!p1IsValid && p2IsValid) {
        p2Points = 10;
      }

      p1RoundScore += p1Points;
      p2RoundScore += p2Points;

      catResults.push({
        categoryId: cat.id,
        categoryName: cat.name,
        p1Word,
        p1Status,
        p1Points,
        p1Corrected: p1Item?.corrected,
        p2Word,
        p2Status,
        p2Points,
        p2Corrected: p2Item?.corrected,
        isPisti
      });
    }

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
      results: catResults,
      players: {
        ...this.currentRoom.players,
        [p1Id]: p1,
        ...(p2 && p2Id ? { [p2Id]: p2 } : {})
      }
    };

    this.currentRoom = scoredRoom;
    this.notifyScored(scoredRoom, catResults);

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

    // Register on server if available
    fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostName: hostProfile.name,
        hostAvatar: hostProfile.avatar,
        roundTimeLimit: timeLimit
      })
    }).catch(() => {});

    // Continuously announce room presence while waiting
    this.announceInterval = setInterval(() => {
      if (this.currentRoom && this.currentRoom.status === 'waiting') {
        this.broadcastMessage({
          type: 'ANNOUNCE',
          payload: { room: this.currentRoom }
        });
      }
    }, 1200);

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
    if (!code || code.length < 4) {
      throw new Error('Lütfen 4 haneli oda kodunu giriniz.');
    }

    const guestId = `p_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
    this.myPlayerId = guestId;
    this.isHost = false;
    this.roomCode = code;

    this.connectChannels(code);

    return new Promise((resolve, reject) => {
      let resolved = false;

      // 12 second graceful timeout
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          clearInterval(pingSender);
          this.roomListeners.delete(onRoom);
          reject(new Error(`Oda bulunamadı (${code}). Oda sahibinin 'Oda Kur' ekranında beklediğinden emin olun.`));
        }
      }, 12000);

      const onRoom = (room: OnlineRoom) => {
        if (room.status === 'playing') {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            clearInterval(pingSender);
            this.roomListeners.delete(onRoom);
            resolve({ room, playerId: guestId });
          }
        }
      };

      this.roomListeners.add(onRoom);

      // Repeatedly ping JOIN_REQUEST
      const guestObj = {
        id: guestId,
        name: (guestProfile.name || 'Oyuncu 2').trim(),
        avatar: guestProfile.avatar || '🦁'
      };

      const sendJoinPing = () => {
        if (!resolved) {
          this.broadcastMessage({
            type: 'JOIN_REQUEST',
            payload: { guest: guestObj }
          });
        }
      };

      // Send initial ping immediately
      sendJoinPing();
      const pingSender = setInterval(sendJoinPing, 800);

      // Also try local server join in parallel
      fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          guestName: guestProfile.name,
          guestAvatar: guestProfile.avatar
        })
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success && data.room && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          clearInterval(pingSender);
          this.roomListeners.delete(onRoom);
          this.handleRoomSync(data.room);
          resolve({ room: data.room, playerId: data.playerId || guestId });
        }
      })
      .catch(() => {});
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

    if (this.roomCode && this.myPlayerId) {
      fetch(`/api/rooms/${this.roomCode}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: this.myPlayerId,
          answers
        })
      }).catch(() => {});
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
    if (!this.roomCode || !this.myPlayerId) return;

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

    // Also notify server
    fetch(`/api/rooms/${this.roomCode}/dur`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: this.myPlayerId,
        answers
      })
    }).catch(() => {});
  }

  /**
   * 5. NEXT ROUND
   */
  public async nextRound() {
    if (!this.currentRoom) return;

    if (this.isHost) {
      const nextRoundNum = this.currentRoom.roundNumber + 1;
      const isFinished = nextRoundNum > this.currentRoom.maxRounds;

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
      this.broadcastMessage({
        type: 'NEXT_ROUND',
        payload: {}
      });
    }

    fetch(`/api/rooms/${this.roomCode}/next-round`, { method: 'POST' }).catch(() => {});
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
    } else {
      this.broadcastMessage({
        type: 'REMATCH',
        payload: {}
      });
    }

    fetch(`/api/rooms/${this.roomCode}/rematch`, { method: 'POST' }).catch(() => {});
  }

  /**
   * Clean up all active listeners, intervals, and sockets
   */
  private cleanupChannels() {
    if (this.ntfySSE) {
      try {
        this.ntfySSE.close();
      } catch {
        // ignore
      }
      this.ntfySSE = null;
    }

    if (this.serverSSE) {
      try {
        this.serverSSE.close();
      } catch {
        // ignore
      }
      this.serverSSE = null;
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
      this.broadcastChannel = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
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
    if (this.roomCode && this.myPlayerId) {
      fetch(`/api/rooms/${this.roomCode}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: this.myPlayerId })
      }).catch(() => {});

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
