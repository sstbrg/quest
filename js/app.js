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
    stars.forEach(function(s) {
      var twinkle = 0.5 + 0.5 * Math.sin(time * s.speed * 1000 + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 190, 140, ' + (s.alpha * twinkle) + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function() { resize(); createStars(); });
  resize();
  createStars();
  requestAnimationFrame(draw);
})();

// ---------- Quest Logic ----------

var TOTAL_STAGES = 8;
var REVEAL_STAGE = TOTAL_STAGES + 1; // stage9

var ANSWERS = {
  1: ['pat', 'patricia', 'patrice'],
  2: ['lilac', 'lilacs', 'לילך', 'לילכים'],
  3: ['karl', 'carl'],
  4: ['gottfried', 'gotfried'],
  5: ['fox', 'the fox', 'שועל', 'השועל'],
  6: ['rose', 'a rose', 'his rose', 'the rose', 'ורד'],
  7: ['tiberias', 'tverya', 'tveria', 'tiberius', 'טבריה', 'טבריא'],
  8: ['kinneret', 'kineret', 'כינרת', 'כנרת', 'sea of galilee', 'galilee']
};

var DISPLAY_ANSWERS = {
  1: 'Pat',
  2: 'Lilacs',
  3: 'Karl',
  4: 'Gottfried',
  5: 'Fox',
  6: 'A rose',
  7: 'Tiberias',
  8: 'Kinneret'
};

var attemptCounts = {};
var hintVisible = {};
var hintTimers = {};
var revealTimers = {};
for (var i = 1; i <= TOTAL_STAGES; i++) {
  attemptCounts[i] = 0;
  hintVisible[i] = false;
}

function startQuest() {
  transitionTo('stage1');
}

function transitionTo(stageId) {
  var current = document.querySelector('.stage.active');
  if (current) {
    current.style.opacity = '0';
    current.style.transform = 'translateY(-20px)';
    current.style.transition = 'all 0.6s ease';
    setTimeout(function() {
      current.classList.remove('active');
      current.style.opacity = '';
      current.style.transform = '';
      current.style.transition = '';

      var next = document.getElementById(stageId);
      next.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      var stageNum = parseInt(stageId.replace('stage', ''));
      if (stageNum >= 1 && stageNum <= TOTAL_STAGES) {
        startHintTimer(stageNum);
        setTimeout(function() {
          var input = document.getElementById('answer' + stageNum);
          if (input) input.focus();
        }, 800);
      }

      // Fire confetti on reveal
      if (stageNum === REVEAL_STAGE) {
        setTimeout(launchConfetti, 600);
      }
    }, 600);
  }
}

// Show hint button after 20 seconds OR after a wrong answer
function startHintTimer(stage) {
  if (hintTimers[stage]) clearTimeout(hintTimers[stage]);
  hintTimers[stage] = setTimeout(function() {
    showHintButton(stage);
  }, 20000);
}

function showHintButton(stage) {
  var hintBtn = document.getElementById('hintBtn' + stage);
  if (hintBtn) hintBtn.classList.remove('hidden');
}

function showHint(stage) {
  var hint = document.getElementById('hint' + stage);
  var hintBtn = document.getElementById('hintBtn' + stage);
  if (hint) hint.classList.remove('hidden');
  if (hintBtn) hintBtn.classList.add('hidden');
  hintVisible[stage] = true;
  if (hintTimers[stage]) clearTimeout(hintTimers[stage]);

  // Show "reveal answer" button after 8 seconds
  if (revealTimers[stage]) clearTimeout(revealTimers[stage]);
  revealTimers[stage] = setTimeout(function() {
    var revealBtn = document.getElementById('revealBtn' + stage);
    if (revealBtn) revealBtn.classList.remove('hidden');
  }, 8000);
}

function revealAnswer(stage) {
  var input = document.getElementById('answer' + stage);
  var revealBtn = document.getElementById('revealBtn' + stage);
  if (revealBtn) revealBtn.classList.add('hidden');

  var answer = DISPLAY_ANSWERS[stage];
  input.value = '';
  var idx = 0;
  var typeInterval = setInterval(function() {
    input.value += answer[idx];
    idx++;
    if (idx >= answer.length) {
      clearInterval(typeInterval);
      setTimeout(function() { checkAnswer(stage); }, 500);
    }
  }, 120);
}

function checkAnswer(stage) {
  var input = document.getElementById('answer' + stage);
  var val = input.value.trim().toLowerCase();

  if (!val) {
    input.classList.add('shake');
    setTimeout(function() { input.classList.remove('shake'); }, 500);
    return;
  }

  var correct = ANSWERS[stage].some(function(a) {
    return val === a || val.includes(a) || a.includes(val);
  });

  // Also try without spaces/dashes
  if (!correct) {
    var valClean = val.replace(/[\s\-]/g, '');
    correct = ANSWERS[stage].some(function(a) {
      var aClean = a.replace(/[\s\-]/g, '');
      return valClean === aClean || valClean.includes(aClean) || aClean.includes(valClean);
    });
  }

  if (correct) {
    input.classList.add('success');
    input.disabled = true;
    var error = document.getElementById('error' + stage);
    if (error) error.classList.add('hidden');
    var hintBtn = document.getElementById('hintBtn' + stage);
    if (hintBtn) hintBtn.classList.add('hidden');
    var revealBtn = document.getElementById('revealBtn' + stage);
    if (revealBtn) revealBtn.classList.add('hidden');
    if (hintTimers[stage]) clearTimeout(hintTimers[stage]);
    if (revealTimers[stage]) clearTimeout(revealTimers[stage]);

    setTimeout(function() {
      transitionTo('stage' + (stage + 1));
    }, 1000);
  } else {
    attemptCounts[stage]++;
    input.classList.add('shake');
    setTimeout(function() { input.classList.remove('shake'); }, 500);

    var error = document.getElementById('error' + stage);
    if (error) error.classList.remove('hidden');

    // Show hint button after first wrong answer
    if (attemptCounts[stage] >= 1) {
      if (hintTimers[stage]) clearTimeout(hintTimers[stage]);
      showHintButton(stage);
    }

    // If hint is already visible and 3+ wrong attempts, show reveal button
    if (hintVisible[stage] && attemptCounts[stage] >= 3) {
      if (revealTimers[stage]) clearTimeout(revealTimers[stage]);
      var revealBtn = document.getElementById('revealBtn' + stage);
      if (revealBtn) revealBtn.classList.remove('hidden');
    }

    input.value = '';
    input.focus();
  }
}

// Enter key to submit
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    var active = document.querySelector('.stage.active');
    if (!active) return;
    var stageNum = parseInt(active.id.replace('stage', ''));
    if (stageNum >= 1 && stageNum <= TOTAL_STAGES) {
      checkAnswer(stageNum);
    }
  }
});

// ---------- Confetti ----------
function launchConfetti() {
  var canvas = document.getElementById('confetti-canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var pieces = [];
  var COLORS = ['#d4a853', '#f0d48a', '#a07830', '#f5e6c8', '#e8d5b0', '#fff', '#ffd700'];
  var PIECE_COUNT = 150;

  for (var i = 0; i < PIECE_COUNT; i++) {
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

  var frame = 0;
  var MAX_FRAMES = 300;

  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frame > MAX_FRAMES - 60) {
      pieces.forEach(function(p) { p.alpha = Math.max(0, p.alpha - 0.016); });
    }

    pieces.forEach(function(p) {
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
