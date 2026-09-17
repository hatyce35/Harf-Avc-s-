import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // --- ONLINE MULTIPLAYER ROOMS IN-MEMORY STORE ---
  interface RoomPlayer {
    id: string;
    name: string;
    avatar: string;
    answers: Record<string, string>;
    filledCount: number;
    totalScore: number;
    roundScore: number;
  }

  interface RoomState {
    code: string;
    createdAt: number;
    hostId: string;
    status: 'waiting' | 'playing' | 'scored' | 'finished';
    currentLetter: string;
    roundNumber: number;
    maxRounds: number;
    stoppedBy?: string;
    results?: Record<string, any>;
    players: Record<string, RoomPlayer>;
    lastActivity: number;
  }

  const ONLINE_ROOMS: Map<string, RoomState> = new Map();
  const TURKISH_LETTERS = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'H', 'İ', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'];

  function getRandomLetter(): string {
    return TURKISH_LETTERS[Math.floor(Math.random() * TURKISH_LETTERS.length)];
  }

  // Periodic room cleanup (older than 2 hours)
  setInterval(() => {
    const now = Date.now();
    for (const [code, room] of ONLINE_ROOMS.entries()) {
      if (now - room.lastActivity > 2 * 60 * 60 * 1000) {
        ONLINE_ROOMS.delete(code);
      }
    }
  }, 10 * 60 * 1000);

  // 1. Create Room
  app.post("/api/rooms/create", (req, res) => {
    const { hostName, hostAvatar } = req.body;
    const code = `HA-${Math.floor(1000 + Math.random() * 9000)}`;
    const hostId = `p_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;

    const newRoom: RoomState = {
      code,
      createdAt: Date.now(),
      hostId,
      status: 'waiting',
      currentLetter: getRandomLetter(),
      roundNumber: 1,
      maxRounds: 10,
      players: {
        [hostId]: {
          id: hostId,
          name: (hostName || 'Oyuncu 1').trim(),
          avatar: hostAvatar || '🦊',
          answers: {},
          filledCount: 0,
          totalScore: 0,
          roundScore: 0
        }
      },
      lastActivity: Date.now()
    };

    ONLINE_ROOMS.set(code, newRoom);
    return res.json({ success: true, roomCode: code, playerId: hostId, room: newRoom });
  });

  // 2. Join Room
  app.post("/api/rooms/join", (req, res) => {
    const { roomCode, guestName, guestAvatar } = req.body;
    if (!roomCode) {
      return res.status(400).json({ error: "Oda kodu gerekli" });
    }

    const cleanCode = roomCode.trim().toUpperCase();
    const room = ONLINE_ROOMS.get(cleanCode);
    if (!room) {
      return res.status(404).json({ error: "Oda bulunamadı. Kodu kontrol edin." });
    }

    const playerIds = Object.keys(room.players);
    if (playerIds.length >= 2) {
      return res.status(400).json({ error: "Bu oda maalesef dolu (2/2 oyuncu)." });
    }

    const guestId = `p_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
    room.players[guestId] = {
      id: guestId,
      name: (guestName || 'Oyuncu 2').trim(),
      avatar: guestAvatar || '🦁',
      answers: {},
      filledCount: 0,
      totalScore: 0,
      roundScore: 0
    };

    // Both players joined -> Game starts!
    room.status = 'playing';
    room.currentLetter = getRandomLetter();
    room.roundNumber = 1;
    room.lastActivity = Date.now();

    return res.json({ success: true, roomCode: cleanCode, playerId: guestId, room });
  });

  // 3. Get Room Status (Polled by clients)
  app.get("/api/rooms/:code", (req, res) => {
    const cleanCode = req.params.code.trim().toUpperCase();
    const room = ONLINE_ROOMS.get(cleanCode);
    if (!room) {
      return res.status(404).json({ error: "Oda bulunamadı" });
    }
    room.lastActivity = Date.now();
    return res.json({ room });
  });

  // 4. Update Player Progress (Answers & count)
  app.post("/api/rooms/:code/progress", (req, res) => {
    const cleanCode = req.params.code.trim().toUpperCase();
    const { playerId, answers } = req.body;
    const room = ONLINE_ROOMS.get(cleanCode);
    if (!room || !room.players[playerId]) {
      return res.status(404).json({ error: "Geçersiz oda veya oyuncu" });
    }

    if (room.status === 'playing') {
      room.players[playerId].answers = answers || {};
      room.players[playerId].filledCount = Object.values(answers || {}).filter(
        (a: any) => typeof a === 'string' && a.trim().length > 0
      ).length;
      room.lastActivity = Date.now();
    }

    return res.json({ success: true });
  });

  // 5. DUR! Button Pressed -> Immediately Score the Round for Both Players
  app.post("/api/rooms/:code/dur", (req, res) => {
    const cleanCode = req.params.code.trim().toUpperCase();
    const { playerId } = req.body;
    const room = ONLINE_ROOMS.get(cleanCode);
    if (!room || !room.players[playerId]) {
      return res.status(404).json({ error: "Geçersiz oda veya oyuncu" });
    }

    if (room.status !== 'playing') {
      return res.json({ room }); // Already stopped
    }

    const stopper = room.players[playerId];
    room.status = 'scored';
    room.stoppedBy = stopper.name;

    // Evaluate answers
    const playerIds = Object.keys(room.players);
    const p1 = room.players[playerIds[0]];
    const p2 = playerIds.length > 1 ? room.players[playerIds[1]] : null;

    const categories = ['name', 'city', 'animal', 'plant', 'object', 'country'];
    const results: Record<string, any> = {};
    let p1RoundPoints = 0;
    let p2RoundPoints = 0;

    for (const cat of categories) {
      const a1 = (p1.answers[cat] || '').trim().toLocaleLowerCase('tr-TR');
      const a2 = p2 ? (p2.answers[cat] || '').trim().toLocaleLowerCase('tr-TR') : '';

      const targetLetterLower = room.currentLetter.toLocaleLowerCase('tr-TR');
      const p1Valid = a1.length > 0 && a1.startsWith(targetLetterLower);
      const p2Valid = a2.length > 0 && a2.startsWith(targetLetterLower);

      let p1Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty' = 'empty';
      let p2Status: 'valid' | 'pisti' | 'typo' | 'wrong' | 'empty' = 'empty';
      let p1Pts = 0;
      let p2Pts = 0;

      if (!a1) {
        p1Status = 'empty';
      } else if (!p1Valid) {
        p1Status = 'wrong';
      }

      if (!a2) {
        p2Status = 'empty';
      } else if (!p2Valid) {
        p2Status = 'wrong';
      }

      if (p1Valid && p2Valid) {
        if (a1 === a2) {
          // PİŞTİ! Both gave the exact same word
          p1Status = 'pisti';
          p2Status = 'pisti';
          p1Pts = 5;
          p2Pts = 5;
        } else {
          // Both gave different valid words
          p1Status = 'valid';
          p2Status = 'valid';
          p1Pts = 10;
          p2Pts = 10;
        }
      } else if (p1Valid && !p2Valid) {
        p1Status = 'valid';
        p1Pts = 10;
      } else if (!p1Valid && p2Valid) {
        p2Status = 'valid';
        p2Pts = 10;
      }

      p1RoundPoints += p1Pts;
      p2RoundPoints += p2Pts;

      results[cat] = {
        p1Answer: p1.answers[cat] || '',
        p1Status,
        p1Points: p1Pts,
        p2Answer: p2 ? (p2.answers[cat] || '') : '',
        p2Status,
        p2Points: p2Pts,
        isPisti: p1Status === 'pisti'
      };
    }

    p1.roundScore = p1RoundPoints;
    p1.totalScore += p1RoundPoints;
    if (p2) {
      p2.roundScore = p2RoundPoints;
      p2.totalScore += p2RoundPoints;
    }

    room.results = results;

    // Check 10-round tournament completion
    if (room.roundNumber >= room.maxRounds) {
      room.status = 'finished';
    }

    room.lastActivity = Date.now();
    return res.json({ success: true, room });
  });

  // 6. Next Round (Yeni Harf)
  app.post("/api/rooms/:code/next-round", (req, res) => {
    const cleanCode = req.params.code.trim().toUpperCase();
    const room = ONLINE_ROOMS.get(cleanCode);
    if (!room) {
      return res.status(404).json({ error: "Oda bulunamadı" });
    }

    if (room.roundNumber >= room.maxRounds) {
      room.status = 'finished';
      return res.json({ room });
    }

    room.roundNumber += 1;
    room.currentLetter = getRandomLetter();
    room.status = 'playing';
    delete room.stoppedBy;
    delete room.results;

    for (const pid of Object.keys(room.players)) {
      room.players[pid].answers = {};
      room.players[pid].filledCount = 0;
      room.players[pid].roundScore = 0;
    }

    room.lastActivity = Date.now();
    return res.json({ success: true, room });
  });

  // 7. Rematch (Rövanş Teklif Et)
  app.post("/api/rooms/:code/rematch", (req, res) => {
    const cleanCode = req.params.code.trim().toUpperCase();
    const room = ONLINE_ROOMS.get(cleanCode);
    if (!room) {
      return res.status(404).json({ error: "Oda bulunamadı" });
    }

    room.roundNumber = 1;
    room.currentLetter = getRandomLetter();
    room.status = 'playing';
    delete room.stoppedBy;
    delete room.results;

    for (const pid of Object.keys(room.players)) {
      room.players[pid].answers = {};
      room.players[pid].filledCount = 0;
      room.players[pid].totalScore = 0;
      room.players[pid].roundScore = 0;
    }

    room.lastActivity = Date.now();
    return res.json({ success: true, room });
  });

  // 8. Leave Room
  app.post("/api/rooms/:code/leave", (req, res) => {
    const cleanCode = req.params.code.trim().toUpperCase();
    const { playerId } = req.body;
    const room = ONLINE_ROOMS.get(cleanCode);
    if (room) {
      delete room.players[playerId];
      if (Object.keys(room.players).length === 0) {
        ONLINE_ROOMS.delete(cleanCode);
      } else {
        room.status = 'waiting';
      }
    }
    return res.json({ success: true });
  });

  // Verify Answers Endpoint: evaluates player's answers for category appropriateness
  app.post("/api/verify-answers", async (req, res) => {
    const { targetLetter, answers } = req.body;
    if (!targetLetter || !answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Eksik parametreler" });
    }

    const ai = getGemini();
    if (!ai) {
      return res.json({ fallback: true });
    }

    // Filter non-empty answers
    const activeEntries: Record<string, string> = {};
    for (const [cat, word] of Object.entries(answers)) {
      if (typeof word === "string" && word.trim().length > 0) {
        activeEntries[cat] = word.trim();
      }
    }

    if (Object.keys(activeEntries).length === 0) {
      return res.json({ results: {} });
    }

    const prompt = `Sen Türkçe "İsim Şehir Hayvan" kelime oyunu hakemisin.
Oyuncunun girdiği kelimelerin belirtilen kategoriye ve hedef harfe ('${targetLetter}') UYGUNLUĞUNU denetle.

Kategori Açıklamaları:
- name: Kişi adı (Herhangi bir gerçek Türkçe veya dünyada bilinen kadın/erkek insan ismi, örn: Ahmet, Ayşe, Alperen, Asuman, Atlas, Zeynep vb.)
- city: Şehir (Türkiye'nin 81 ili, tüm ilçeleri örn: Alanya, Bodrum, Çeşme, Zonguldak veya dünyaca bilinen şehirler)
- animal: Hayvan (Her türlü gerçek hayvan, kuş, balık, böcek, memeli, sürüngen vb., örn: Aslan, Akrep, Zebra vb.)
- plant: Bitki / Meyve / Sebze / Çiçek / Ağaç (Örn: Elma, Armut, Ayva, Zambak, Zeytin vb.)
- object: Eşya / Cansız Nesne / Alet / Giysi (Örn: Araba, Ayna, Zil, Zincir, Zımba vb.)
- country: Ülke (Dünyadaki tüm bağımsız ülkeler veya yaygın ülke isimleri, örn: Almanya, Zambiya, Zimbabve vb.)

Denetlenecek Cevaplar:
${JSON.stringify(activeEntries, null, 2)}

Kurallar ve Değerlendirme:
1. Kelime '${targetLetter}' harfi ile başlamalıdır. (Türkçe harf uyumuna dikkat et: örn. İ/I, Ç/C, Ş/S, Ö/O, Ü/U).
2. KELİME DEĞERLENDİRME VE SARI KART (TYPO / YAZIM HATASI):
   - "valid": Tam ve doğru yazılmış sözcük (isValid: true, status: "valid", points: 10).
   - "typo": Kelime gerçek bir isme/şehre/hayvana/bitkiye/eşyaya/ülkeye aittir ANCAK 1-2 harf eksiği, fazlası veya yazım hatası vardır (örneğin: "zynep" -> Zeynep, "zonguldk" -> Zonguldak, "istanbl" -> İstanbul, "zürafa" yerine "zrafa", "elma" yerine "elm", vb.).
     Bu kelimelere KESİNLİKLE kırmızı çarpı VERME! Bunları "typo" olarak değerlendir ve sarı puan (+5) ver!
     (isValid: true, status: "typo", points: 5, corrected: "DoğruKelime", reason: "1 harf eksik/yazım yanlışı").
   - "wrong": Rastgele harf yığını (ör. asdfgh, qwer), uydurma sözcük veya kategoriyle hiçbir ilgisi olmayan kelime. (isValid: false, status: "wrong", points: 0).

Yalnızca aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme:
{
  "results": {
    "kategoriId": {
      "isValid": true,
      "status": "valid" | "typo" | "wrong",
      "points": 10,
      "corrected": "DoğruKelime (sadece typo ise)",
      "reason": "Kategoriye uygun veya Zeynep için 1 harf eksik"
    }
  }
}`;

    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ];

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            results: parsed.results || {}
          });
        }
      } catch (err: any) {
        // Log friendly debug message and try next model if 503 or transient failure
        const status = err?.status || err?.code || "";
        console.log(`Model ${model} unavailable (${status}), trying fallback...`);
      }
    }

    // If all models are temporarily unavailable, signal graceful fallback to local validator
    return res.json({ fallback: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
