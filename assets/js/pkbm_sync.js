/**
 * PKBM Penerus Bangsa - Universal Live Sync & Remote Telemetry Engine
 * ------------------------------------------------------------------
 * Menghubungkan setiap game ke Teacher Remote Command Center:
 * 1. Remote Navigation: Guru dapat memindahkan halaman murid dari device berbeda.
 * 2. Remote Screen Lock: Guru dapat menjeda/mengunci layar murid agar fokus menyimak Google Meet.
 * 3. Live Screen Mirroring: Guru melihat soal, klik jawaban, dan skor murid secara real-time (tanpa murid perlu share screen).
 * 4. Score History: Otomatis mencatat nilai ke buku raport terpusat.
 */

(function () {
  'use strict';

  // 1. Identifikasi Siswa & Mata Pelajaran secara Otomatis dari URL & Path
  const currentPath = window.location.pathname.toLowerCase();
  
  function detectStudentId() {
    const studentList = ['aqlan', 'mishka', 'selvi', 'kinanti', 'alisya', 'acip', 'ardiansyah', 'aulya', 'hendra', 'shan'];
    for (const s of studentList) {
      if (currentPath.includes(s)) return s;
    }
    return localStorage.getItem('pkbm_active_student_id') || 'aqlan';
  }

  function detectGrade(studentId) {
    if (['aqlan', 'kinanti', 'alisya', 'acip'].includes(studentId)) return 'Kelas 4';
    if (['mishka', 'ardiansyah'].includes(studentId)) return 'Kelas 5';
    if (['selvi', 'aulya', 'hendra', 'shan'].includes(studentId)) return 'Kelas 6';
    return 'Fase B';
  }

  function detectSubject() {
    if (currentPath.includes('/english/')) return 'English';
    if (currentPath.includes('/bahasa/')) return 'Bahasa Indonesia';
    if (currentPath.includes('/math/')) return 'Matematika';
    if (currentPath.includes('/science/')) return 'Sains IPAS';
    if (currentPath.includes('/pai/')) return 'PAI';
    return 'Tematik Terpadu';
  }

  const studentId = detectStudentId();
  const studentName = studentId.charAt(0).toUpperCase() + studentId.slice(1);
  const grade = detectGrade(studentId);
  const subject = detectSubject();
  const gameTitle = document.title.split('•')[0].split('-')[0].trim() || 'Game Pembelajaran PKBM';

  // State Telemetri Siswa
  const liveState = {
    studentId: studentId,
    studentName: studentName,
    grade: grade,
    subject: subject,
    gameTitle: gameTitle,
    url: window.location.href,
    pathname: window.location.pathname,
    status: 'online', // 'online' | 'paused' | 'offline'
    level: 1,
    totalLevels: 1,
    currentQuestion: 'Memulai petualangan...',
    lastAnswer: '-',
    isCorrect: null,
    score: 0,
    maxScore: 100,
    streak: 0,
    accuracy: 100,
    totalAnswers: 0,
    correctAnswers: 0,
    lastActivity: 'Membuka Game',
    lastHeartbeat: Date.now()
  };

  let mqttClient = null;
  let broadcastBus = null;

  // 2. BroadcastChannel Bus (Instant Zero-Latency Sync di Browser/Device yang sama)
  try {
    if ('BroadcastChannel' in window) {
      broadcastBus = new BroadcastChannel('pkbm_sync_bus');
      broadcastBus.onmessage = function (ev) {
        if (ev.data && ev.data.target) {
          handleTeacherCommand(ev.data);
        }
      };
    }
  } catch (e) {
    console.warn('[PKBM Sync] BroadcastChannel not supported:', e);
  }

  // 3. Cloud WebSockets via MQTT (Menghubungkan device murid & device guru di mana pun)
  function initMqtt() {
    if (typeof mqtt === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/mqtt/dist/mqtt.min.js';
      script.onload = connectMqtt;
      script.onerror = () => console.log('[PKBM Sync] Running local BroadcastChannel sync only.');
      document.head.appendChild(script);
    } else {
      connectMqtt();
    }
  }

  function connectMqtt() {
    try {
      const clientId = 'pkbm_std_' + studentId + '_' + Math.random().toString(16).slice(2, 8);
      // EMQX Public WebSocket Broker (SSL WSS)
      mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: clientId,
        clean: true,
        connectTimeout: 6000,
        reconnectPeriod: 3000,
        will: {
          topic: 'pkbm/tiara/telemetry/' + studentId,
          payload: JSON.stringify(Object.assign({}, liveState, { status: 'offline', lastActivity: 'Keluar dari Game' })),
          qos: 0,
          retain: true
        }
      });

      mqttClient.on('connect', function () {
        console.log(`[PKBM Sync] 🟢 Connected to Cloud Command Center for ${studentName}`);
        
        // Subscribe to remote commands from Bu Tiara
        mqttClient.subscribe('pkbm/tiara/control/all', { qos: 0 });
        mqttClient.subscribe('pkbm/tiara/control/' + studentId, { qos: 0 });

        // Kirim status awal
        sendTelemetry('connect', 'Siswa Tersambung ke Server Pemantau');
      });

      mqttClient.on('message', function (topic, message) {
        try {
          const cmd = JSON.parse(message.toString());
          handleTeacherCommand(cmd);
        } catch (err) {
          console.warn('[PKBM Sync] Command parse error:', err);
        }
      });

      mqttClient.on('error', function (err) {
        console.warn('[PKBM Sync] Cloud connection note:', err.message);
      });
    } catch (err) {
      console.warn('[PKBM Sync] Cloud setup note:', err);
    }
  }

  // 4. Pengiriman Telemetri (Real-Time State Transmitter)
  function sendTelemetry(eventType, detail) {
    liveState.lastHeartbeat = Date.now();
    if (detail) liveState.lastActivity = detail;

    // Hitung akurasi berjalan
    if (liveState.totalAnswers > 0) {
      liveState.accuracy = Math.round((liveState.correctAnswers / liveState.totalAnswers) * 100);
    }

    const payload = Object.assign({}, liveState, {
      eventType: eventType || 'heartbeat',
      timestamp: Date.now()
    });

    const payloadStr = JSON.stringify(payload);

    // Cadangan penyimpanan lokal
    try {
      localStorage.setItem('pkbm_last_telemetry_' + studentId, payloadStr);
    } catch (e) {}

    // Kirim via BroadcastChannel
    if (broadcastBus) {
      try {
        broadcastBus.postMessage(payload);
      } catch (e) {}
    }

    // Kirim via Cloud MQTT
    if (mqttClient && mqttClient.connected) {
      try {
        mqttClient.publish('pkbm/tiara/telemetry/' + studentId, payloadStr, { qos: 0, retain: true });
      } catch (e) {}
    }
  }

  // 5. Eksekusi Perintah Jarak Jauh dari Guru (Remote Command Handler)
  function handleTeacherCommand(cmd) {
    if (!cmd || !cmd.action) return;
    
    // Pastikan perintah ditujukan untuk siswa ini atau untuk semua siswa
    if (cmd.target && cmd.target !== 'all' && cmd.target !== studentId) {
      return;
    }

    console.log('[PKBM Sync] 📡 Received remote command from Bu Tiara:', cmd.action, cmd);

    switch (cmd.action) {
      case 'navigate':
        // Navigasi halaman otomatis yang diperintahkan Bu Tiara
        if (cmd.url) {
          executeRemoteNavigation(cmd.url);
        }
        break;

      case 'lock_screen':
        // Kunci layar murid sementara agar memperhatikan Google Meet
        showLockScreenOverlay(cmd.message);
        break;

      case 'unlock_screen':
        // Buka kunci layar murid
        removeLockScreenOverlay();
        break;

      case 'approve_doodle':
        // Persetujuan Sketsa Doodle dari Dasbor Guru
        if (typeof window.onTeacherApproveDoodle === 'function') {
          window.onTeacherApproveDoodle(cmd.questId);
        } else if (typeof approveDoodle === 'function') {
          approveDoodle(cmd.questId, true);
        }
        showTeacherToast('🎨 Bu Tiara telah menyetujui sketsa doodle Soal ' + (cmd.questId || '') + '! ✨');
        break;

      case 'confetti':
        // Beri hadiah confetti & suara kemenangan dari jauh
        triggerCelebrationEffect(cmd.text);
        break;

      case 'toast':
        // Tampilkan pesan teks pop-up dari Bu Tiara di layar murid
        showTeacherToast(cmd.message);
        break;

      case 'ping':
        sendTelemetry('pong', 'Merespons Ping Guru');
        break;
    }
  }

  // Navigasi Cerdas (Menghitung path relatif yang benar dari folder saat ini)
  function executeRemoteNavigation(targetUrl) {
    showTeacherToast('🚀 Bu Tiara mengarahkanmu ke game baru...');
    setTimeout(() => {
      // Jika targetUrl sudah merupakan URL absolut atau dimulai dengan http/https
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.location.href = targetUrl;
        return;
      }
      
      // Hitung posisi relative terhadap root pkbm-games
      // Jika saat ini di subfolder misal /english/ atau /bahasa/
      const depth = (window.location.pathname.match(/\//g) || []).length;
      let prefix = '';
      if (currentPath.includes('/english/') || currentPath.includes('/bahasa/') || 
          currentPath.includes('/math/') || currentPath.includes('/science/') || 
          currentPath.includes('/pai/') || currentPath.includes('/kelas')) {
        prefix = '../';
      }
      
      // Bersihkan targetUrl jika ada prefix ../ berlebih
      const cleanTarget = targetUrl.replace(/^\.\.\//, '').replace(/^\//, '');
      window.location.href = prefix + cleanTarget;
    }, 600);
  }

  // Tampilan Kunci Layar (Perhatikan Penjelasan Bu Tiara)
  function showLockScreenOverlay(customMsg) {
    if (document.getElementById('pkbm-remote-lock')) return;

    liveState.status = 'paused';
    sendTelemetry('screen_locked', 'Layar Dijeda oleh Guru');

    const overlay = document.createElement('div');
    overlay.id = 'pkbm-remote-lock';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      z-index: 999999; display: flex; align-items: center; justify-content: center;
      font-family: 'Segoe UI', Tahoma, sans-serif; color: white;
      text-align: center; padding: 24px; animation: pkbmFadeIn 0.35s ease;
    `;

    overlay.innerHTML = `
      <div style="background: linear-gradient(135deg, #1E293B, #0F172A); border: 2px solid #38BDF8; border-radius: 24px; padding: 36px 30px; max-width: 440px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
        <div style="font-size: 56px; margin-bottom: 14px; animation: pkbmBounce 1.5s infinite;">⏸️✨</div>
        <h2 style="font-size: 22px; font-weight: 800; color: #38BDF8; margin-bottom: 10px;">Sesi Diskusi Bersama Bu Tiara</h2>
        <p style="font-size: 15px; color: #E2E8F0; line-height: 1.6; margin-bottom: 20px;">
          ${customMsg || 'Hai ' + studentName + '! Perhatikan penjelasan dan tanya-jawab bersama Kak Tiara di Google Meet ya! 😊'}
        </p>
        <div style="display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); padding: 8px 18px; border-radius: 20px; font-size: 13px; color: #7DD3FC; font-weight: 600;">
          🔴 Layar Dijeda Sementara oleh Guru
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  function removeLockScreenOverlay() {
    const overlay = document.getElementById('pkbm-remote-lock');
    if (overlay) {
      overlay.remove();
      liveState.status = 'online';
      sendTelemetry('screen_unlocked', 'Layar Dibuka Kembali');
      showTeacherToast('▶️ Layar aktif kembali! Semangat belajarnya!');
    }
  }

  // Efek Perayaan / Hadiah dari Guru
  function triggerCelebrationEffect(text) {
    showTeacherToast(text || '🌟 HEBAT SEKALI! Bintang dari Bu Tiara! ⭐⭐⭐');
    
    // Audio Chime
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (e) {}

    // Confetti Elements
    const colors = ['#f59e0b', '#10b981', '#38bdf8', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 30; i++) {
      const c = document.createElement('div');
      c.style.cssText = `
        position: fixed; z-index: 999998;
        top: -20px; left: ${Math.random() * 100}vw;
        width: ${8 + Math.random() * 10}px; height: ${8 + Math.random() * 10}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none; opacity: 1;
        transition: transform 2.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.5s ease;
      `;
      document.body.appendChild(c);
      setTimeout(() => {
        c.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg)`;
        c.style.opacity = '0';
      }, 20);
      setTimeout(() => c.remove(), 2600);
    }
  }

  // Toast Notifikasi dari Guru
  function showTeacherToast(msg) {
    const existing = document.getElementById('pkbm-toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pkbm-toast-msg';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px;
      background: linear-gradient(135deg, #0F172A, #1E293B);
      border: 2px solid #F59E0B; border-radius: 16px;
      padding: 14px 20px; color: #FEF3C7; font-size: 14px; font-weight: 700;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 999997;
      display: flex; align-items: center; gap: 10px;
      animation: pkbmSlideUp 0.3s ease; font-family: 'Segoe UI', Tahoma, sans-serif;
    `;
    toast.innerHTML = `<span>👩‍🏫</span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // 6. Menyimpan Nilai Permanen ke Raport Terpadu (Universal Score Logger)
  function recordFinalScore(score, maxScore, stars, summary) {
    const record = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      studentId: studentId,
      studentName: studentName,
      grade: grade,
      subject: subject,
      gameTitle: liveState.gameTitle,
      url: window.location.href,
      score: score || liveState.score,
      maxScore: maxScore || liveState.maxScore || 100,
      accuracy: liveState.accuracy || Math.round(((score || liveState.score) / (maxScore || liveState.maxScore || 100)) * 100),
      stars: stars || (liveState.accuracy >= 90 ? 3 : (liveState.accuracy >= 70 ? 2 : 1)),
      summary: summary || 'Menyelesaikan seluruh tantangan materi.',
      completedAt: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      timeStr: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const history = JSON.parse(localStorage.getItem('pkbm_score_history') || '[]');
      history.unshift(record);
      // Simpan maksimal 150 rekaman riwayat
      if (history.length > 150) history.pop();
      localStorage.setItem('pkbm_score_history', JSON.stringify(history));
    } catch (e) {
      console.warn('[PKBM Sync] LocalStorage save error:', e);
    }

    sendTelemetry('game_completed', `Tuntas: Skor ${record.score}/${record.maxScore} (${record.stars}⭐)`);
  }

  // 7. Auto-Hooks: Menangkap Interaksi Game Otomatis (DOM Watchers)
  function attachDomHooks() {
    // Tangkap perubahan teks soal
    const promptSelectors = ['#prompt-text', '#challenge-q', '.question-prompt', '#q-prompt', '#question-text', '.prompt-text'];
    for (const sel of promptSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        liveState.currentQuestion = el.textContent.trim();
        const obs = new MutationObserver(() => {
          liveState.currentQuestion = el.textContent.trim();
          sendTelemetry('question_changed', `Soal: ${liveState.currentQuestion.slice(0, 45)}...`);
        });
        obs.observe(el, { childList: true, characterData: true, subtree: true });
        break;
      }
    }

    // Tangkap Level & Skor jika ada elemennya
    const levelEl = document.querySelector('#level, .stat-val#level');
    if (levelEl) {
      liveState.level = parseInt(levelEl.textContent) || 1;
      new MutationObserver(() => {
        liveState.level = parseInt(levelEl.textContent) || liveState.level;
      }).observe(levelEl, { childList: true, characterData: true });
    }

    const scoreEl = document.querySelector('#score, .stat-val#score');
    if (scoreEl) {
      liveState.score = parseInt(scoreEl.textContent) || 0;
      new MutationObserver(() => {
        liveState.score = parseInt(scoreEl.textContent) || liveState.score;
        sendTelemetry('score_updated', `Skor: ${liveState.score}`);
      }).observe(scoreEl, { childList: true, characterData: true });
    }

    // Deteksi saat modal kemenangan / victory muncul
    const victoryModal = document.querySelector('#victory-modal, #modal-victory, .victory-modal');
    if (victoryModal) {
      new MutationObserver(() => {
        if (victoryModal.style.display !== 'none' && victoryModal.style.display !== '') {
          recordFinalScore(liveState.score, liveState.maxScore, 3, 'Menyelesaikan game dengan sukses');
        }
      }).observe(victoryModal, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    // Tangkap klik opsi jawaban secara delegasi
    document.addEventListener('click', function (ev) {
      const btn = ev.target.closest('.opt-btn, .choice-btn, .option-btn, .btn-choice, .tool-btn');
      if (btn) {
        liveState.lastAnswer = btn.textContent.replace(/^\[[A-D]\]\s*/, '').trim();
        liveState.totalAnswers++;
        setTimeout(() => {
          const isCorrect = btn.classList.contains('correct') || btn.classList.contains('selected-correct');
          const isWrong = btn.classList.contains('wrong') || btn.classList.contains('selected-wrong');
          if (isCorrect) {
            liveState.isCorrect = true;
            liveState.correctAnswers++;
            sendTelemetry('answer_click', `Memilih: "${liveState.lastAnswer.slice(0, 30)}" (Benar ✅)`);
          } else if (isWrong) {
            liveState.isCorrect = false;
            sendTelemetry('answer_click', `Memilih: "${liveState.lastAnswer.slice(0, 30)}" (Salah ❌)`);
          } else {
            sendTelemetry('answer_click', `Memilih: "${liveState.lastAnswer.slice(0, 30)}"`);
          }
        }, 150);
      }
    });
  }

  // 8. Public API Global untuk Game Developer (PKBM_SYNC)
  window.PKBM_SYNC = {
    studentId: studentId,
    studentName: studentName,
    grade: grade,
    subject: subject,

    setStudent: function (id, name, grd) {
      liveState.studentId = id;
      liveState.studentName = name || (id.charAt(0).toUpperCase() + id.slice(1));
      if (grd) liveState.grade = grd;
      localStorage.setItem('pkbm_active_student_id', id);
      sendTelemetry('identity_changed');
    },

    reportQuestion: function (qText, lvl, totalLvl) {
      liveState.currentQuestion = qText;
      if (lvl) liveState.level = lvl;
      if (totalLvl) liveState.totalLevels = totalLvl;
      sendTelemetry('question_update', `Level ${liveState.level}: ${qText.slice(0, 40)}`);
    },

    reportAnswer: function (choiceText, isCorrect, pts, feedback) {
      liveState.lastAnswer = choiceText;
      liveState.isCorrect = isCorrect;
      liveState.totalAnswers++;
      if (isCorrect) {
        liveState.correctAnswers++;
        liveState.score += (pts || 100);
        liveState.streak += 1;
      } else {
        liveState.streak = 0;
      }
      sendTelemetry('answer_reported', `Jawab: "${choiceText.slice(0, 30)}" (${isCorrect ? 'Benar ✅' : 'Salah ❌'})`);
    },

    reportScore: function (currScore, maxScore, streak) {
      liveState.score = currScore;
      if (maxScore) liveState.maxScore = maxScore;
      if (streak !== undefined) liveState.streak = streak;
      sendTelemetry('score_sync');
    },

    reportGameComplete: function (finalScore, maxScore, stars, summary) {
      recordFinalScore(finalScore, maxScore, stars, summary);
    },

    sendUpdate: function (type, detail) {
      sendTelemetry(type, detail);
    }
  };

  // Heartbeat rutin setiap 4 detik
  setInterval(() => {
    sendTelemetry('heartbeat');
  }, 4000);

  // Inisialisasi saat DOM siap
  function initEngine() {
    initMqtt();
    attachDomHooks();
    sendTelemetry('init', 'Halaman game siap');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

  // Tambahkan animasi CSS helper
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pkbmFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
    @keyframes pkbmSlideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes pkbmBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  `;
  document.head.appendChild(style);

})();
