// PKBM Penerus Bangsa - Shared Game Engine, Web Audio Synthesizer, & Reactions

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSfx(type) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'correct') {
      // Happy major chord arpeggio (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'star') {
      const freqs = [784, 987, 1174, 1568];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
      });
    } else if (type === 'win') {
      // Triumphant Happy Fanfare
      const notes = [
        { f: 523.25, t: 0.0, d: 0.12 },
        { f: 659.25, t: 0.14, d: 0.12 },
        { f: 783.99, t: 0.28, d: 0.14 },
        { f: 1046.50, t: 0.44, d: 0.45 },
        { f: 880.00, t: 0.90, d: 0.14 },
        { f: 1046.50, t: 1.06, d: 0.60 }
      ];
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.24, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } else if (type === 'letitgo') {
      // Synthesize the famous "Let It Go" melody chorus!
      // "Let (G4) it (A4) go (B4)... Let (G4) it (A4) gooo (D5)... Can't hold it back anymore..."
      const letItGoNotes = [
        { f: 392.00, t: 0.0, d: 0.25 },  // Let
        { f: 440.00, t: 0.26, d: 0.25 }, // it
        { f: 493.88, t: 0.52, d: 0.55 }, // go~
        { f: 392.00, t: 1.15, d: 0.25 }, // Let
        { f: 440.00, t: 1.41, d: 0.25 }, // it
        { f: 587.33, t: 1.67, d: 0.70 }, // gooo~
        { f: 587.33, t: 2.45, d: 0.22 }, // Can't
        { f: 659.25, t: 2.68, d: 0.22 }, // hold
        { f: 587.33, t: 2.91, d: 0.22 }, // it
        { f: 493.88, t: 3.14, d: 0.22 }, // back
        { f: 440.00, t: 3.37, d: 0.22 }, // a-
        { f: 392.00, t: 3.60, d: 0.85 }  // ny-mooore!
      ];
      letItGoNotes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        gain.gain.setValueAtTime(0.26, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    }
  } catch (e) {
    console.warn("Audio error:", e);
  }
}

// 2. Multilingual Text-to-Speech Engine (Indonesian + English)
let indonesianVoice = null;
let englishVoice = null;

function initVoices() {
  if (!('speechSynthesis' in window)) return;
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    indonesianVoice = voices.find(v => v.lang.startsWith('id') || v.name.includes('Indonesia')) || null;
    englishVoice = voices.find(v => (v.lang.startsWith('en') && (v.lang.includes('US') || v.lang.includes('GB') || v.name.includes('English')))) || 
                   voices.find(v => v.lang.startsWith('en')) || null;
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
initVoices();

function speak(text, btnElement = null, lang = 'id') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (lang === 'en') {
    utterance.lang = 'en-US';
    utterance.rate = 0.84; // calm, clear educational pace for kids
    utterance.pitch = 1.05;
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
  } else {
    utterance.lang = 'id-ID';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }
  }

  if (btnElement) {
    btnElement.classList.add('speaking');
    utterance.onend = () => btnElement.classList.remove('speaking');
    utterance.onerror = () => btnElement.classList.remove('speaking');
  }

  window.speechSynthesis.speak(utterance);
}

function speakEn(text, btnElement = null) {
  speak(text, btnElement, 'en');
}

// 3. Lightweight Canvas Confetti
function launchConfetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const particles = [];
  const colors = ['#4F46E5', '#F59E0B', '#10B981', '#EC4899', '#06B6D4', '#F43F5E'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1.2) * 14,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 8
    });
  }

  let frame = 0;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.vx *= 0.98;
      p.alpha -= 0.01;
      p.rotation += p.vrot;

      if (p.alpha > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    frame++;
    if (activeCount > 0 && frame < 180) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  render();
}

// 4. Outcome Decision: Happy Win Fanfare vs Elsa "Let It Go"
function triggerGameOutcome(score, total, studentName, onRetry = null, isEnglish = false) {
  const isHappy = score >= Math.ceil(total * 0.6);

  if (isHappy) {
    playSfx('win');
    launchConfetti();
    const modal = document.getElementById('victory-modal');
    if (modal) {
      modal.classList.add('active');
    }
  } else {
    playSfx('letitgo');
    let elsaModal = document.getElementById('elsa-modal');
    if (!elsaModal) {
      elsaModal = document.createElement('div');
      elsaModal.id = 'elsa-modal';
      elsaModal.className = 'modal-overlay active';
      
      const elsaSubtitle = isEnglish 
        ? `Don't worry, <b>${studentName}</b>! Mistakes are part of learning.<br>Let it go, take a deep breath, and let's try again together!`
        : `Jangan bersedih, <b>${studentName}</b>! Kesalahan itu wajar dalam proses belajar.<br>Lepaskan rasa ragumu, tarik napas dalam-dalam, dan yuk kita coba sekali lagi!`;
      
      const btnText = isEnglish ? `❄️ Melt the Snow & Try Again!` : `❄️ Cairkan Salju & Coba Lagi!`;

      elsaModal.innerHTML = `
        <div class="modal-card modal-elsa">
          <div class="elsa-snowflakes">❄️ 🌨️ ❄️ 🌨️ ❄️</div>
          <div class="elsa-avatar">👑 ❄️</div>
          <h2 style="font-size: 1.8rem; color: #0369A1; margin-bottom: 8px;">Let It Go, Let It Gooo... ❄️</h2>
          <p style="color: #0C4A6E; font-size: 1.05rem; line-height: 1.6; margin-bottom: 18px;">
            ${elsaSubtitle}
          </p>
          <div style="font-size: 0.95rem; color: #0284C7; font-weight: 700; margin-bottom: 14px;">
            ${isEnglish ? 'Your Score' : 'Skor Kamu'}: ${score}/${total}
          </div>
          <button class="btn-elsa-retry" onclick="retryFromElsa()">
            ${btnText}
          </button>
        </div>
      `;
      document.body.appendChild(elsaModal);
    } else {
      elsaModal.classList.add('active');
    }
    
    window._retryCallback = onRetry || (() => window.location.reload());
  }
}

function retryFromElsa() {
  playSfx('click');
  const elsaModal = document.getElementById('elsa-modal');
  if (elsaModal) elsaModal.classList.remove('active');
  if (window._retryCallback) {
    window._retryCallback();
  } else {
    window.location.reload();
  }
}
