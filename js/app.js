/* ============================================
   Quest App — Three Comrades × Little Prince × Tiberias
   ============================================ */

// ---------- Stars Background ----------
(function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const STAR_COUNT = 120;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.0008 + 0.0003,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * s.speed * 1000 + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 190, 140, ${s.alpha * twinkle})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createStars(); });
  resize();
  createStars();
  requestAnimationFrame(draw);
})();

// ---------- Quest Logic ----------

const TOTAL_STAGES = 7;

const ANSWERS = {
  1: ['pat', 'patricia', 'patrice'],
  2: ['rose', 'roses', 'red roses', 'ורדים', 'ורד'],
  3: ['germany', 'deutschland', 'גרמניה'],
  4: ['fox', 'the fox', 'שועל', 'השועל'],
  5: ['b-612', 'b612', 'b 612', 'asteroid b-612'],
  6: ['tiberias', 'tverya', 'tveria', 'tiberius', 'טבריה', 'טבריא'],
  7: ['kinneret', 'kineret', 'כינרת', 'כנרת', 'sea of galilee', 'galilee']
};

const DISPLAY_ANSWERS = {
  1: 'Pat',
  2: 'Roses',
  3: 'Germany',
  4: 'Fox',
  5: 'B-612',
  6: 'Tiberias',
  7: 'Kinneret'
};

let attemptCounts = {};
let hintShown = {};
let hintTimers = {};
for (let i = 1; i <= TOTAL_STAGES; i++) {
  attemptCounts[i] = 0;
  hintShown[i] = false;
}

function startQuest() {
  transitionTo('stage1');
}

function transitionTo(stageId) {
  const current = document.querySelector('.stage.active');
  if (current) {
    current.style.opacity = '0';
    current.style.transform = 'translateY(-20px)';
    current.style.transition = 'all 0.6s ease';
    setTimeout(() => {
      current.classList.remove('active');
      current.style.opacity = '';
      current.style.transform = '';
      current.style.transition = '';

      const next = document.getElementById(stageId);
      next.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Focus the input and start hint timer for clue stages
      const stageNum = parseInt(stageId.replace('stage', ''));
      if (stageNum >= 1 && stageNum <= TOTAL_STAGES) {
        startHintTimer(stageNum);
        setTimeout(() => {
          const input = document.getElementById('answer' + stageNum);
          if (input) input.focus();
        }, 800);
      }

      // Fire confetti on final reveal stage
      if (stageId === 'stage' + (TOTAL_STAGES + 1)) {
        setTimeout(launchConfetti, 600);
      }
    }, 600);
  }
}

// Show hint button after 20 seconds of being on a stage
function startHintTimer(stage) {
  if (hintTimers[stage]) clearTimeout(hintTimers[stage]);
  hintTimers[stage] = setTimeout(() => {
    const hintBtn = document.getElementById('hintBtn' + stage);
    if (hintBtn) hintBtn.classList.remove('hidden');
  }, 20000);
}

function showHint(stage) {
  const hint = document.getElementById('hint' + stage);
  const hintBtn = document.getElementById('hintBtn' + stage);
  if (hint) hint.classList.remove('hidden');
  if (hintBtn) hintBtn.classList.add('hidden');
  hintShown[stage] = true;

  // Show the "reveal answer" button after 8 seconds
  setTimeout(() => {
    const revealBtn = document.getElementById('revealBtn' + stage);
    if (revealBtn) revealBtn.classList.remove('hidden');
  }, 8000);
}

function revealAnswer(stage) {
  const input = document.getElementById('answer' + stage);
  const revealBtn = document.getElementById('revealBtn' + stage);
  if (revealBtn) revealBtn.classList.add('hidden');

  // Type out the answer letter by letter
  const answer = DISPLAY_ANSWERS[stage];
  input.value = '';
  let i = 0;
  const typeInterval = setInterval(() => {
    input.value += answer[i];
    i++;
    if (i >= answer.length) {
      clearInterval(typeInterval);
      setTimeout(() => checkAnswer(stage), 500);
    }
  }, 120);
}

function checkAnswer(stage) {
  const input = document.getElementById('answer' + stage);
  const val = input.value.trim().toLowerCase();

  if (!val) {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
    return;
  }

  const correct = ANSWERS[stage].some(a => val.includes(a) || a.includes(val));

  if (correct) {
    // Success
    input.classList.add('success');
    input.disabled = true;
    const error = document.getElementById('error' + stage);
    if (error) error.classList.add('hidden');
    const hintBtn = document.getElementById('hintBtn' + stage);
    if (hintBtn) hintBtn.classList.add('hidden');
    const revealBtn = document.getElementById('revealBtn' + stage);
    if (revealBtn) revealBtn.classList.add('hidden');
    if (hintTimers[stage]) clearTimeout(hintTimers[stage]);

    setTimeout(() => {
      transitionTo('stage' + (stage + 1));
    }, 1000);
  } else {
    // Wrong answer
    attemptCounts[stage]++;
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);

    const error = document.getElementById('error' + stage);
    if (error) error.classList.remove('hidden');

    // Show hint button after first wrong attempt
    if (attemptCounts[stage] >= 1) {
      if (hintTimers[stage]) clearTimeout(hintTimers[stage]);
      const hintBtn = document.getElementById('hintBtn' + stage);
      if (hintBtn) hintBtn.classList.remove('hidden');
    }

    input.value = '';
    input.focus();
  }
}

// Allow Enter key to submit answers
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const active = document.querySelector('.stage.active');
    if (!active) return;
    const id = active.id;
    const stageNum = parseInt(id.replace('stage', ''));
    if (stageNum >= 1 && stageNum <= TOTAL_STAGES) {
      checkAnswer(stageNum);
    }
  }
});

// ---------- Confetti ----------
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const COLORS = ['#d4a853', '#f0d48a', '#a07830', '#f5e6c8', '#e8d5b0', '#fff', '#ffd700'];
  const PIECE_COUNT = 150;

  for (let i = 0; i < PIECE_COUNT; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: Math.random() * 2 + 1.5,
      vx: (Math.random() - 0.5) * 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      alpha: 1
    });
  }

  let frame = 0;
  const MAX_FRAMES = 300;

  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frame > MAX_FRAMES - 60) {
      pieces.forEach(p => { p.alpha = Math.max(0, p.alpha - 0.016); });
    }

    pieces.forEach(p => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.02) * 0.5;
      p.rot += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < MAX_FRAMES) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
