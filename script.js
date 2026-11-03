// FOREST TYPE 2026 - Moonbeam Forest Adventure
// Matara Technical College ICT Second Batch - 100% Original
// Boo, Ollie, Batty Leader, A,B,C Team, Forest, Boo's Home

const passages = {
  easy: [
    "Boo the friendly ghost was lost in Moonbeam Forest. The full moon was shining bright and fireflies were dancing around the ancient trees. Boo felt scared but brave.",
    "Ollie the wise owl sat on a mossy branch and said don't worry Boo we can find the way together. The forest was calm and peaceful tonight.",
    "Batty the fun bat team flew around happily chirping encouragement. The moonlight made the pathway glow with magic and hope filled Boo's heart."
  ],
  medium: [
    "In the heart of Moonbeam Forest where ancient trees whispered secrets and fireflies painted the night with golden lights Boo the friendly ghost searched for his cozy home. Ollie the wise owl hooted softly from above guiding Boo through the misty pathway.",
    "The forest was alive with magic tonight. Full moon shining through dense canopy fireflies dancing like tiny stars Batty leader and his team A B C bats circling around Boo with cheerful squeaks. Follow the glowing mushrooms Ollie said wisely they lead to your home.",
    "Thank you for helping Boo the friendly ghost navigate through Moonbeam Forest. With every correct word typed Boo moved closer to his cozy home where warm lights glow in every window under the full moon sky. The forest celebrates your kindness."
  ],
  hard: [
    "Deep within Moonbeam Forest where shadows dance and moonbeams pierce through ancient canopy Boo the ethereal friendly ghost drifted lost among towering trees whose bark was covered with luminescent moss. Ollie the nocturnal wise owl with spectacles perched precariously observed from above hooting cryptic directions that only the worthy could decipher.",
    "Batty Leader commander of the nocturnal bat squadron orchestrated an aerial ballet with precision. A the acrobatic bat B the brave bat C the clever bat executed synchronized maneuvers around confused Boo emitting ultrasonic encouragement that resonated through the forest's mystical acoustic chamber. The pathway illuminated by bioluminescent flora revealed fragmented memories of Boo's cozy abode.",
    "Underneath the resplendent full moon where fireflies orchestrated a symphonic display of bioluminescence Boo finally recognized the familiar silhouette of his cozy home perched atop a gentle hill. Warm amber lights emanated from windows curtains fluttering welcomingly. Thank you for helping me to reach my home Boo whispered tears of ectoplasmic joy streaming down transparent cheeks as Moonbeam Forest celebrated another soul finding belonging."
  ]
};

let currentDifficulty = 'easy';
let passageText = '';
let startTime = null;
let timerInterval = null;
let gameActive = false;
let timeLeft = 60;
let currentRoom = null;

// Screen helper
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

// For home play button - if index.html uses old IDs, support both
function show(id) {
  showScreen(id);
}

// Register -> Countdown -> Typing
function startGame() {
  const nameEl = document.getElementById('name');
  const instTypeEl = document.getElementById('instType');
  const instNameEl = document.getElementById('instName');
  const catEl = document.getElementById('category');
  const errEl = document.getElementById('err');

  if (!nameEl || !instTypeEl || !instNameEl || !catEl) {
    // Fallback for new HTML structure
    const n = document.getElementById('playerName');
    if (!n) return;
    if (!n.value.trim()) {
      alert('නම දාන්න! Enter name');
      return;
    }
    localStorage.setItem('forest_player', JSON.stringify({ name: n.value.trim() }));
    startCountdown();
    return;
  }

  const name = nameEl.value.trim();
  const instType = instTypeEl.value;
  const instName = instNameEl.value.trim();
  const category = catEl.value;

  if (!name || !instType || !instName || !category) {
    if (errEl) errEl.textContent = 'සියල්ල පුරවන්න! Fill all fields!';
    else alert('Fill all fields!');
    return;
  }

  const playerData = { name, instType, instName, category, time: Date.now() };
  localStorage.setItem('forest_player', JSON.stringify(playerData));
  
  // Save for leaderboard (GitHub Pages version)
  let leaderboard = JSON.parse(localStorage.getItem('forest_leaderboard') || '[]');
  leaderboard.push(playerData);
  localStorage.setItem('forest_leaderboard', JSON.stringify(leaderboard));

  startCountdown();
}

function startCountdown() {
  // Try both screen IDs
  let screen = document.getElementById('countdownScreen') || document.getElementById('countdown');
  if (!screen) {
    showScreen('typing');
    beginTyping();
    return;
  }
  if (screen.id === 'countdown') {
    showScreen('countdown');
  } else {
    showScreen('countdownScreen');
  }

  let count = 3;
  const numEl = document.getElementById('countdownNumber') || document.getElementById('countdown');
  if (numEl) numEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      if (numEl) {
        numEl.textContent = count;
        numEl.style.animation = 'none';
        numEl.offsetHeight; // trigger reflow
        numEl.style.animation = 'countPulse 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      }
    } else if (count === 0) {
      if (numEl) numEl.textContent = 'GO!';
    } else {
      clearInterval(interval);
      beginTyping();
    }
  }, 1000);
}

function beginTyping() {
  showScreen('typing');

  // Pick random passage based on difficulty
  const pool = passages[currentDifficulty] || passages.easy;
  passageText = pool[Math.floor(Math.random() * pool.length)];

  const passageContainer = document.getElementById('passageText') || document.getElementById('passage');
  if (!passageContainer) return;

  passageContainer.innerHTML = passageText.split('').map((ch, i) => `<span id="char-${i}">${ch}</span>`).join('');
  const first = document.getElementById('char-0');
  if (first) first.classList.add('current');

  const input = document.getElementById('typingInput');
  if (!input) return;
  input.value = '';
  input.disabled = false;
  input.focus();

  startTime = Date.now();
  gameActive = true;
  timeLeft = 60;

  const timerEl = document.getElementById('timer');
  if (timerEl) timerEl.textContent = '01:00';

  timerInterval = setInterval(() => {
    timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    if (timerEl) timerEl.textContent = `${m}:${s}`;

    // Calculate live WPM
    const elapsedMin = (Date.now() - startTime) / 1000 / 60;
    const typed = input.value;
    const wpm = elapsedMin > 0 ? Math.round((typed.length / 5) / elapsedMin) : 0;
    const wpmEl = document.getElementById('wpm');
    if (wpmEl) wpmEl.textContent = `WPM: ${wpm}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishGame();
    }
  }, 1000);

  input.addEventListener('input', onTyping);
  input.addEventListener('paste', e => e.preventDefault());
}

function onTyping(e) {
  if (!gameActive) return;
  const typed = e.target.value;
  let correctCount = 0;

  for (let i = 0; i < typed.length; i++) {
    const span = document.getElementById(`char-${i}`);
    if (!span) continue;
    if (typed[i] === passageText[i]) {
      span.className = 'correct';
      correctCount++;
    } else {
      span.className = 'incorrect';
    }
  }

  // Reset rest
  for (let i = typed.length; i < passageText.length; i++) {
    const span = document.getElementById(`char-${i}`);
    if (!span) continue;
    span.className = i === typed.length ? 'current' : '';
  }

  const accEl = document.getElementById('accuracy') || document.getElementById('acc');
  if (accEl) {
    const acc = typed.length ? Math.round((correctCount / typed.length) * 100) : 100;
    accEl.textContent = `Acc: ${acc}%`;
  }

  // Finish if completed
  if (typed === passageText) {
    finishGame();
  }
}

function finishGame() {
  if (!gameActive) return;
  gameActive = false;
  clearInterval(timerInterval);

  const input = document.getElementById('typingInput');
  if (input) input.disabled = true;

  const wpmEl = document.getElementById('wpm');
  const accEl = document.getElementById('accuracy') || document.getElementById('acc');
  const player = JSON.parse(localStorage.getItem('forest_player') || '{}');

  const wpm = wpmEl ? wpmEl.textContent : 'WPM: 0';
  const acc = accEl ? accEl.textContent : 'Acc: 100%';

  // Save result
  const result = {
    ...player,
    wpm: wpm,
    acc: acc,
    passage: passageText.substring(0, 80),
    timestamp: Date.now()
  };
  localStorage.setItem('forest_last_result', JSON.stringify(result));

  setTimeout(() => {
    showScreen('resultScreen');
    const altResult = document.getElementById('result');
    if (altResult) showScreen('result');

    const statsEl = document.getElementById('finalStats');
    if (statsEl) {
      statsEl.innerHTML = `
        <h2 style="color:#7fff7f">🎉 ${player.name || 'Forest Hero'}</h2>
        <p>${player.instName || ''} ${player.category ? '- ' + player.category : ''}</p>
        <br>
        <div style="display:flex;justify-content:center;gap:20px;font-size:1.3rem">
          <b style="background:rgba(76,175,80,0.3);padding:8px 15px;border-radius:10px">${wpm}</b>
          <b style="background:rgba(255,193,7,0.3);padding:8px 15px;border-radius:10px">${acc}</b>
        </div>
        <p style="margin-top:15px;font-style:italic;opacity:0.8">"${passageText.substring(0, 70)}..."</p>
      `;
    }
  }, 800);
}

// Admin helper - set difficulty from admin.html
function setDifficulty(level) {
  currentDifficulty = level;
  localStorage.setItem('forest_difficulty', level);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const savedDiff = localStorage.getItem('forest_difficulty');
  if (savedDiff) currentDifficulty = savedDiff;

  // Support both play buttons
  const playBtns = document.querySelectorAll('.play-btn');
  playBtns.forEach(btn => {
    if (btn.textContent.includes('PLAY ADVENTURE') || btn.textContent.includes('Join Forest')) {
      // already has onclick
    }
  });

  // Auto focus for new structure
  const playerNameInput = document.getElementById('playerName');
  if (playerNameInput) {
    playerNameInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') startGame();
    });
  }
});

// For admin page to call
window.startGame = startGame;
window.showScreen = showScreen;
window.show = show;
window.setDifficulty = setDifficulty;
window.startCountdown = startCountdown;
