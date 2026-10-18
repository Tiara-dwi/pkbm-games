// PKBM Penerus Bangsa - Real-Time Telemetry & Progress Tracker
// Menghubungkan aktivitas belajar murid (Aqlan / Mishka) secara langsung ke Teacher Dashboard

(function () {
  const isAqlan = window.location.pathname.toLowerCase().includes('aqlan');
  const studentId = isAqlan ? 'aqlan' : 'mishka';
  const studentName = isAqlan ? 'Aqlan' : 'Mishka';
  const studentGrade = isAqlan ? 4 : 5;

  const sessionStartTime = Date.now();
  let mqttClient = null;
  let broadcastChannel = null;

  // State yang dipantau
  const telemetryState = {
    studentId: studentId,
    studentName: studentName,
    grade: studentGrade,
    status: 'online', // 'online' | 'offline'
    startTime: sessionStartTime,
    durationSeconds: 0,
    lastHeartbeat: Date.now(),
    mood: null,
    currentTool: 'Alat 1 - KPK',
    currentBrush: null,
    kpkProgress: {
      cellsCount: 0,
      bothCount: 0,
      unlocked: false,
      found: false
    },
    cupProgress: {
      triedCups: null,
      success: false
    },
    calendarProgress: {
      renangCount: 0,
      biolaCount: 0,
      unlocked: false,
      found: false
    },
    quizScores: {},
    lastActivity: 'Membuka Halaman Game'
  };

  // 1. Inisialisasi BroadcastChannel untuk pengujian lokal di browser yang sama
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('pkbm_teacher_monitor');
    }
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }

  // 2. Kirim update ke Teacher Dashboard (via MQTT dan BroadcastChannel)
  function sendUpdate(eventType, extraDetail) {
    telemetryState.durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    telemetryState.lastHeartbeat = Date.now();

    const payload = {
      type: eventType || 'heartbeat',
      timestamp: Date.now(),
      detail: extraDetail || '',
      state: telemetryState
    };

    const payloadJson = JSON.stringify(payload);

    // Simpan di localStorage untuk cadangan sinkronisasi lokal
    try {
      localStorage.setItem('pkbm_live_' + studentId, payloadJson);
      localStorage.setItem('pkbm_live_' + studentId + '_lastping', Date.now());
    } catch (e) {}

    // Kirim via BroadcastChannel
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload);
      } catch (e) {}
    }

    // Kirim via MQTT over WebSockets ke internet
    if (mqttClient && mqttClient.connected) {
      try {
        mqttClient.publish('pkbm/tiara/live/' + studentId, payloadJson, { qos: 0, retain: true });
      } catch (e) {
        console.warn('MQTT publish error:', e);
      }
    }
  }

  // 3. Inisialisasi Koneksi MQTT WebSockets
  function initMqtt() {
    if (typeof mqtt === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/mqtt/dist/mqtt.min.js';
      script.onload = () => connectMqtt();
      script.onerror = () => console.log('MQTT library load failed, running local tracking only.');
      document.head.appendChild(script);
    } else {
      connectMqtt();
    }
  }

  function connectMqtt() {
    try {
      const clientId = 'pkbm_student_' + studentId + '_' + Math.random().toString(16).substr(2, 8);
      // Menggunakan public broker EMQX over WSS (Port 8084)
      mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
        clientId: clientId,
        clean: true,
        connectTimeout: 5000,
        will: {
          topic: 'pkbm/tiara/live/' + studentId,
          payload: JSON.stringify({
            type: 'disconnect',
            timestamp: Date.now(),
            state: Object.assign({}, telemetryState, { status: 'offline', lastActivity: 'Keluar dari Game' })
          }),
          qos: 0,
          retain: true
        }
      });

      mqttClient.on('connect', function () {
        console.log(`[Tracker] Connected to live monitoring for ${studentName}`);
        sendUpdate('connect', 'Tersambung ke Server Pemantau Guru');
      });

      mqttClient.on('error', function (err) {
        console.warn('[Tracker] MQTT connection note:', err.message);
      });
    } catch (err) {
      console.warn('[Tracker] MQTT setup exception:', err);
    }
  }

  // 4. Timer Detak Jantung (Heartbeat) setiap 3 detik
  setInterval(function () {
    sendUpdate('heartbeat');
  }, 3000);

  // 5. Tangani saat murid menutup browser / tab
  window.addEventListener('beforeunload', function () {
    telemetryState.status = 'offline';
    telemetryState.lastActivity = 'Tutup Halaman Game';
    sendUpdate('disconnect', 'Keluar dari Game');
  });

  // 6. Ekspor Fungsi Pelacak untuk Diintegrasikan ke Logika Game
  window.reportTrackerMood = function (moodText) {
    telemetryState.mood = moodText;
    telemetryState.lastActivity = `Memilih Mood: ${moodText}`;
    sendUpdate('mood_selected', moodText);
  };

  window.reportTrackerTool = function (toolName) {
    telemetryState.currentTool = toolName;
    telemetryState.lastActivity = `Membuka ${toolName}`;
    sendUpdate('tool_changed', toolName);
  };

  window.reportTrackerBrush = function (brushName, colorHex) {
    telemetryState.currentBrush = `${brushName} (${colorHex})`;
    sendUpdate('brush_changed', brushName);
  };

  window.reportTrackerGrid = function (cellNum, countBoth, countMarked) {
    telemetryState.kpkProgress.cellsCount = countMarked || telemetryState.kpkProgress.cellsCount;
    telemetryState.kpkProgress.bothCount = countBoth || telemetryState.kpkProgress.bothCount;
    telemetryState.lastActivity = `Mewarnai Angka ${cellNum} (Total sel bertumpuk: ${countBoth})`;
    sendUpdate('grid_cell_click', `Angka ${cellNum}`);
  };

  window.reportTrackerKPKUnlocked = function (isUnlocked) {
    telemetryState.kpkProgress.unlocked = isUnlocked;
    if (isUnlocked) {
      telemetryState.lastActivity = 'Membuka Tombol Titik Temu KPK 🎉';
      sendUpdate('kpk_unlocked', 'Tombol KPK Terbuka');
    }
  };

  window.reportTrackerKPKFound = function (kpkValue) {
    telemetryState.kpkProgress.found = true;
    telemetryState.lastActivity = `BERHASIL Menemukan KPK: Angka ${kpkValue} ⭐`;
    sendUpdate('kpk_found', `KPK ${kpkValue}`);
  };

  window.reportTrackerCups = function (cups, isSuccess) {
    telemetryState.cupProgress.triedCups = cups;
    telemetryState.cupProgress.success = isSuccess;
    telemetryState.lastActivity = `Mencoba ${cups} Toples Biskuit: ${isSuccess ? 'BERHASIL FPB!' : 'Masih Ada Sisa'}`;
    sendUpdate('cup_tested', `${cups} Toples (${isSuccess ? 'FPB Sukses' : 'Gagal'})`);
  };

  window.reportTrackerCalendar = function (activity, day) {
    telemetryState.lastActivity = `Menandai Kalender ${activity} di tgl ${day}`;
    sendUpdate('calendar_click', `${activity} tgl ${day}`);
  };

  window.reportTrackerCalKPK = function (foundDay) {
    telemetryState.calendarProgress.found = true;
    telemetryState.lastActivity = `Menemukan Titik Temu Kalender tgl ${foundDay} ⭐`;
    sendUpdate('calendar_kpk_found', `Titik Temu tgl ${foundDay}`);
  };

  window.reportTrackerQuiz = function (qNum, isCorrect) {
    telemetryState.quizScores['Soal ' + qNum] = isCorrect ? 'Benar ✅' : 'Salah ❌';
    telemetryState.lastActivity = `Menjawab Soal ${qNum}: ${isCorrect ? 'Benar' : 'Salah'}`;
    sendUpdate('quiz_answered', `Soal ${qNum}: ${isCorrect ? 'Benar' : 'Salah'}`);
  };

  // Mulai koneksi setelah halaman siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMqtt);
  } else {
    initMqtt();
  }
})();
