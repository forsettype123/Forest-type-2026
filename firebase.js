// FOREST TYPE 2026 - Firebase Config
// Matara Technical College - Moonbeam Forest Adventure
// Multi-player Realtime Typing

// ============================================
// 🔥 STEP 1: Firebase Config එක මෙතන REPLACE කරන්න!
// console.firebase.google.com → Project Settings → Your apps → Config
// ============================================

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "forest-type-2026.firebaseapp.com",
  databaseURL: "https://forest-type-2026-default-rtdb.firebaseio.com",
  projectId: "forest-type-2026",
  storageBucket: "forest-type-2026.appspot.com",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID"
};

// ============================================
// Check if Firebase configured
// ============================================
const isFirebaseConfigured = firebaseConfig.apiKey !== "REPLACE_WITH_YOUR_API_KEY";

let app = null;
let auth = null;
let database = null;
let currentUser = null;

// Initialize Firebase if configured
if (isFirebaseConfigured) {
  try {
    // Load Firebase SDKs dynamically (no need to add script tags in index.html)
    const loadFirebase = async () => {
      if (typeof firebase === 'undefined') {
        // Import via CDN
        const scripts = [
          "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js",
          "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js",
          "https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"
        ];
        for (const src of scripts) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
      }
      
      app = firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      database = firebase.database();

      // Anonymous login
      await auth.signInAnonymously();
      currentUser = auth.currentUser;
      console.log("✅ Firebase Connected! User:", currentUser.uid);
      
      // Show connected badge
      const badge = document.getElementById('firebaseStatus');
      if (badge) {
        badge.textContent = '🔥 Multi-player ON';
        badge.style.background = 'rgba(76,175,80,0.3)';
      }
    };

    loadFirebase().catch(err => {
      console.warn("Firebase load failed, using offline mode:", err);
    });

  } catch (e) {
    console.warn("Firebase init error, offline mode:", e);
  }
} else {
  console.log("⚠️ Firebase config not set - Running in OFFLINE single-player mode. Add config for multi-player!");
}

// ============================================
// OFFLINE FALLBACK (GitHub Pages only) - works without Firebase
// ============================================
function offlineMode() {
  return !isFirebaseConfigured || !database;
}

// ============================================
// ROOM MANAGEMENT (For Admin)
// ============================================

// Create room (admin.html will call this)
async function createRoom(roomCode, settings) {
  roomCode = roomCode.toUpperCase().trim();
  if (!roomCode) throw new Error("Room code needed");

  const roomData = {
    code: roomCode,
    createdAt: Date.now(),
    status: "waiting", // waiting, countdown, typing, finished
    settings: {
      duration: settings.duration || 60,
      difficulty: settings.difficulty || "easy",
      maxPlayers: settings.maxPlayers || 30
    },
    players: {},
    leaderboard: {}
  };

  if (offlineMode()) {
    // Save offline
    localStorage.setItem(`forest_room_${roomCode}`, JSON.stringify(roomData));
    localStorage.setItem('forest_current_room', roomCode);
    return roomData;
  } else {
    await database.ref(`rooms/${roomCode}`).set(roomData);
    return roomData;
  }
}

// Join room (player)
async function joinRoom(roomCode, playerInfo) {
  roomCode = roomCode.toUpperCase().trim();
  
  if (offlineMode()) {
    const roomRaw = localStorage.getItem(`forest_room_${roomCode}`);
    if (!roomRaw) throw new Error("Room not found (offline). Create room first in admin.html");
    const room = JSON.parse(roomRaw);
    
    const playerId = 'player_' + Date.now();
    room.players[playerId] = {
      ...playerInfo,
      id: playerId,
      joinedAt: Date.now(),
      wpm: 0,
      acc: 100,
      progress: 0,
      finished: false
    };
    
    localStorage.setItem(`forest_room_${roomCode}`, JSON.stringify(room));
    localStorage.setItem('forest_player_id', playerId);
    localStorage.setItem('forest_current_room', roomCode);
    return { room, playerId };
  } else {
    if (!currentUser) await auth.signInAnonymously();
    
    const playerId = currentUser.uid;
    const playerRef = database.ref(`rooms/${roomCode}/players/${playerId}`);
    
    await playerRef.set({
      ...playerInfo,
      id: playerId,
      joinedAt: Date.now(),
      wpm: 0,
      acc: 100,
      progress: 0,
      finished: false
    });
    
    const snap = await database.ref(`rooms/${roomCode}`).once('value');
    if (!snap.exists()) throw new Error("Room not found");
    
    localStorage.setItem('forest_current_room', roomCode);
    return { room: snap.val(), playerId };
  }
}

// Update player progress (live typing)
async function updateProgress(wpm, acc, progressPercent, finished = false) {
  const roomCode = localStorage.getItem('forest_current_room');
  const playerId = localStorage.getItem('forest_player_id') || (currentUser ? currentUser.uid : null);
  if (!roomCode || !playerId) return;

  if (offlineMode()) {
    const roomRaw = localStorage.getItem(`forest_room_${roomCode}`);
    if (!roomRaw) return;
    const room = JSON.parse(roomRaw);
    if (room.players[playerId]) {
      room.players[playerId].wpm = wpm;
      room.players[playerId].acc = acc;
      room.players[playerId].progress = progressPercent;
      room.players[playerId].finished = finished;
      localStorage.setItem(`forest_room_${roomCode}`, JSON.stringify(room));
    }
  } else {
    await database.ref(`rooms/${roomCode}/players/${playerId}`).update({
      wpm, acc, progress: progressPercent, finished, lastUpdate: Date.now()
    });
  }
}

// Listen to room status (for auto start)
function listenRoomStatus(roomCode, callback) {
  roomCode = roomCode.toUpperCase().trim();
  if (offlineMode()) {
    // Polling for offline
    setInterval(() => {
      const roomRaw = localStorage.getItem(`forest_room_${roomCode}`);
      if (roomRaw) callback(JSON.parse(roomRaw));
    }, 1000);
  } else {
    database.ref(`rooms/${roomCode}`).on('value', snap => {
      if (snap.exists()) callback(snap.val());
    });
  }
}

// Start game (admin)
async function startGameRoom(roomCode) {
  roomCode = roomCode.toUpperCase().trim();
  if (offlineMode()) {
    const roomRaw = localStorage.getItem(`forest_room_${roomCode}`);
    const room = JSON.parse(roomRaw);
    room.status = "countdown";
    localStorage.setItem(`forest_room_${roomCode}`, JSON.stringify(room));
    setTimeout(() => {
      const r = JSON.parse(localStorage.getItem(`forest_room_${roomCode}`));
      r.status = "typing";
      localStorage.setItem(`forest_room_${roomCode}`, JSON.stringify(r));
    }, 4000);
  } else {
    await database.ref(`rooms/${roomCode}/status`).set("countdown");
    setTimeout(async () => {
      await database.ref(`rooms/${roomCode}/status`).set("typing");
    }, 4000);
  }
}

// Get leaderboard
async function getLeaderboard(roomCode) {
  roomCode = roomCode.toUpperCase().trim();
  if (offlineMode()) {
    const roomRaw = localStorage.getItem(`forest_room_${roomCode}`);
    if (!roomRaw) return [];
    const room = JSON.parse(roomRaw);
    return Object.values(room.players || {}).sort((a,b) => b.wpm - a.wpm);
  } else {
    const snap = await database.ref(`rooms/${roomCode}/players`).once('value');
    if (!snap.exists()) return [];
    return Object.values(snap.val()).sort((a,b) => b.wpm - a.wpm);
  }
}

// Export for global use
window.ForestFirebase = {
  isConfigured: isFirebaseConfigured,
  offlineMode,
  createRoom,
  joinRoom,
  updateProgress,
  listenRoomStatus,
  startGameRoom,
  getLeaderboard,
  config: firebaseConfig
};

console.log(isFirebaseConfigured ? "🔥 Firebase.js loaded - waiting for connection..." : "📴 Firebase.js loaded - OFFLINE mode (single-player). Add config for multi-player!");
