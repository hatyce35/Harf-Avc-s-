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

  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private pollInterval: any = null;
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
   * Helper: Normalize room code to format HA-XXXX, even from links or raw digits
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
   * Generates a safe ntfy topic name from room code
   */
  private getTopic(code: string): string {
    const clean = code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `ha_duel_${clean}`;
  }

  /**
   * Establish real-time communication via Server-Sent Events, Polling, BroadcastChannel, and ntfy.sh
   */
  private connectChannels(code: string) {
    this.cleanupChannels();
    this.roomCode = code;

    // 1. Server-Sent Events (SSE) for instantaneous server push
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        this.eventSource = new EventSource(`/api/rooms/${code}/events`);
        this.eventSource.onmessage = (event) => {
          if (event.data && !event.data.startsWith(':')) {
            try {
              const room = JSON.parse(event.data);
              this.handleRoomSync(room);
            } catch {
              // ignore
            }
          }
        };
        this.eventSource.onerror = () => {
          // SSE will reconnect automatically, polling acts as backup
        };
      }
    } catch (e) {
      console.warn('SSE not available:', e);
    }

    // 2. High-speed Polling Backup (every 800ms)
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.room) {
            this.handleRoomSync(data.room);
          }
        }
      } catch {
        // silent
      }
    }, 800);

    // 3. Local BroadcastChannel (instantaneous multi-tab on same machine)
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

    // 4. ntfy.sh WebSocket as internet backup
    const topic = this.getTopic(code);
    try {
      const wsUrl = `wss://ntfy.sh/${topic}/ws`;
      const ws = new WebSocket(wsUrl);
      this.ws = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message' && data.message) {
            const parsed = JSON.parse(data.message);
            this.handleIncomingMessage(parsed);
          }
        } catch {
          // ignore
        }
      };
    } catch (e) {
      console.warn('ntfy WebSocket not available:', e);
    }
  }

  /**
   * Sync room state from server
   */
  private handleRoomSync(room: OnlineRoom) {
    if (!room || !room.code) return;
    const prevRoom = this.currentRoom;
    const prevStatus = prevRoom?.status;

    this.currentRoom = room;

    // Trigger score screen if status is scored
    if (room.status === 'scored' && room.results && prevStatus !== 'scored') {
      this.notifyScored(room, room.results);
      return;
    }

    // If new round started, reset local current answers
    if (prevRoom && (prevRoom.roundNumber !== room.roundNumber || prevRoom.currentLetter !== room.currentLetter)) {
      this.currentAnswers = {};
    }

    this.notifyRoomUpdate(room);
  }

  /**
   * Broadcast message to peer
   */
  private async broadcastMessage(msg: Omit<DuelMessage, 'senderId' | 'roomCode' | 'timestamp'>) {
    const fullMsg: DuelMessage = {
      ...msg,
      senderId: this.myPlayerId,
      roomCode: this.roomCode,
      timestamp: Date.now()
    };

    // 1. BroadcastChannel
    try {
      this.broadcastChannel?.postMessage(fullMsg);
    } catch {
      // ignore
    }

    // 2. ntfy.sh
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
   * Handles peer-to-peer incoming messages
   */
  private async handleIncomingMessage(msg: DuelMessage) {
    if (!msg || !msg.type || !msg.roomCode) return;
    if (msg.roomCode !== this.roomCode) return;

    const msgKey = `${msg.type}_${msg.senderId}_${msg.timestamp}`;
    if (this.seenMessageIds.has(msgKey)) return;
    this.seenMessageIds.add(msgKey);
    if (this.seenMessageIds.size > 200) {
      this.seenMessageIds.clear();
    }

    if (msg.senderId === this.myPlayerId) return;

    switch (msg.type) {
      case 'JOIN_REQUEST': {
        if (!this.isHost || !this.currentRoom) return;
        const guest = msg.payload?.guest;
        if (!guest || !guest.id) return;

        // Add guest if not present
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
          roundNumber: 1,
          players: updatedPlayers
        };

        this.currentRoom = updatedRoom;
        this.notifyRoomUpdate(updatedRoom);

        this.broadcastMessage({
          type: 'ROOM_STATE',
          payload: { room: updatedRoom }
        });
        break;
      }

      case 'ROOM_STATE': {
        const room = msg.payload?.room;
        if (room) {
          this.handleRoomSync(room);
        }
        break;
      }

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

      case 'DUR': {
        const { playerId, answers } = msg.payload || {};
        if (playerId && this.currentRoom && this.currentRoom.players[playerId]) {
          this.currentRoom.players[playerId].answers = answers || {};
        }
        break;
      }

      case 'ROUND_SCORED': {
        const { room, results } = msg.payload || {};
        if (room && results) {
          this.currentRoom = room;
          this.notifyScored(room, results);
        }
        break;
      }

      case 'NEXT_ROUND': {
        const { room } = msg.payload || {};
        if (room) {
          this.handleRoomSync(room);
        }
        break;
      }

      case 'REMATCH': {
        const { room } = msg.payload || {};
        if (room) {
          this.handleRoomSync(room);
        }
        break;
      }

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
   * 1. CREATE ROOM (HOST)
   */
  public async createRoom(
    hostProfile: { name: string; avatar: string },
    timeLimit: number
  ): Promise<{ room: OnlineRoom; playerId: string }> {
    this.leaveRoom();

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: hostProfile.name,
          hostAvatar: hostProfile.avatar,
          roundTimeLimit: timeLimit
        })
      });

      if (!res.ok) {
        throw new Error('Sunucuda oda oluşturulamadı.');
      }

      const data = await res.json();
      const newRoom: OnlineRoom = data.room;
      const hostId: string = data.playerId;

      this.currentRoom = newRoom;
      this.myPlayerId = hostId;
      this.isHost = true;
      this.roomCode = newRoom.code;

      this.connectChannels(newRoom.code);
      return { room: newRoom, playerId: hostId };
    } catch (err: any) {
      console.warn('Server room creation fallback:', err);
      const code = `HA-${Math.floor(1000 + Math.random() * 9000)}`;
      const hostId = `p_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
      this.myPlayerId = hostId;
      this.isHost = true;
      this.roomCode = code;

      const fallbackRoom: OnlineRoom = {
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

      this.currentRoom = fallbackRoom;
      this.connectChannels(code);
      return { room: fallbackRoom, playerId: hostId };
    }
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

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          guestName: guestProfile.name,
          guestAvatar: guestProfile.avatar
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Oda bulunamadı (${code}). Lütfen kodu kontrol edin.`);
      }

      const data = await res.json();
      const room: OnlineRoom = data.room;
      const guestId: string = data.playerId;

      this.currentRoom = room;
      this.myPlayerId = guestId;
      this.isHost = false;
      this.roomCode = room.code;

      this.connectChannels(room.code);
      this.notifyRoomUpdate(room);

      return { room, playerId: guestId };
    } catch (err: any) {
      // Re-throw so user UI displays the exact error message
      throw new Error(err.message || 'Odaya bağlanılamadı. Kodu kontrol edin.');
    }
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

    try {
      const res = await fetch(`/api/rooms/${this.roomCode}/dur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: this.myPlayerId,
          answers
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          this.handleRoomSync(data.room);
        }
      }
    } catch (e) {
      console.warn('Failed to send dur to server:', e);
    }

    this.broadcastMessage({
      type: 'DUR',
      payload: {
        playerId: this.myPlayerId,
        answers
      }
    });
  }

  /**
   * 5. NEXT ROUND
   */
  public async nextRound() {
    if (!this.roomCode) return;

    try {
      const res = await fetch(`/api/rooms/${this.roomCode}/next-round`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          this.handleRoomSync(data.room);
        }
      }
    } catch (e) {
      console.warn('Failed next round:', e);
    }

    this.broadcastMessage({
      type: 'NEXT_ROUND',
      payload: {}
    });
  }

  /**
   * 6. REMATCH
   */
  public async rematch() {
    if (!this.roomCode) return;

    try {
      const res = await fetch(`/api/rooms/${this.roomCode}/rematch`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          this.handleRoomSync(data.room);
        }
      }
    } catch (e) {
      console.warn('Failed rematch:', e);
    }

    this.broadcastMessage({
      type: 'REMATCH',
      payload: {}
    });
  }

  /**
   * Clean up all active listeners, intervals, and sockets
   */
  private cleanupChannels() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {
        // ignore
      }
      this.eventSource = null;
    }

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
