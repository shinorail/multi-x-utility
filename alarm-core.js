let alarmTarget = null;
let isRinging = false;
const sound = document.getElementById('alarmSound');
const statusText = document.getElementById('status');
const stopBtn = document.getElementById('stopBtn');
const setBtn = document.getElementById('setBtn');

// 時計の更新とアラーム判定
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.innerText = `${h}:${m}:${s}`;
    }

    // 秒が00のタイミングで判定
    if (alarmTarget === `${h}:${m}` && !isRinging) {
        ring();
    }
}

// 1秒ごとに実行
setInterval(updateClock, 1000);

// アラーム設定
function setAlarm() {
    const input = document.getElementById('alarmTime');
    if (!input || !input.value) {
        alert("時刻を正しく選択してください");
        return;
    }

    // ブラウザの再生制限を解除するためのダミー再生
    sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
        
        alarmTarget = input.value;
        statusText.innerText = "SET: " + alarmTarget;
        statusText.style.color = "var(--p)";
    }).catch(err => {
        console.error("Audio access error:", err);
        alert("音声の準備ができませんでした。画面を一度クリックしてから再度お試しください。");
    });
}

// 鳴動処理
function ring() {
    isRinging = true;
    sound.play().catch(e => console.log("Play failed:", e));
    document.body.classList.add('flashing');
    stopBtn.style.display = 'block';
    setBtn.style.display = 'none';
    statusText.innerText = "⏰ TIME UP!!";
}

// 停止処理
function stopAlarm() {
    sound.pause();
    sound.currentTime = 0;
    document.body.classList.remove('flashing');
    stopBtn.style.display = 'none';
    setBtn.style.display = 'block';
    alarmTarget = null;
    isRinging = false;
    statusText.innerText = "STOPPED";
    statusText.style.color = "#94a3b8";
}
