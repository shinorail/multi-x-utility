/**
 * Multi-X Alarm Core Logic
 * 篠ノ井業務区 二周年記念モデル
 */

let alarmTarget = null;
let isRinging = false;
let isAudioUnlocked = false;

const sound = document.getElementById('alarmSound');
const statusText = document.getElementById('status');
const stopBtn = document.getElementById('stopBtn');
const setBtn = document.getElementById('setBtn');
const dialog = document.getElementById('permission-dialog');
const overlay = document.getElementById('overlay');

// 時計更新 & アラーム判定
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const currentTimeStr = `${h}:${m}`;
    
    document.getElementById('clock').innerText = `${h}:${m}:${s}`;

    // 判定：時刻一致かつ未鳴動かつ音声解放済み
    if (alarmTarget === currentTimeStr && !isRinging && isAudioUnlocked) {
        ring();
    }
}
setInterval(updateClock, 1000);

// 設定ボタン：まずは許可ダイアログを表示
function askPermission() {
    const timeVal = document.getElementById('alarmTime').value;
    if (!timeVal) {
        alert("時刻を入力してください。");
        return;
    }
    
    overlay.style.display = 'block';
    dialog.style.display = 'block';
}

// 音声の解放（ユーザー操作を起点にする必要がある）
function grantAudio() {
    sound.play().then(() => {
        // 一瞬鳴らしてすぐに止めることで、ブラウザに再生許可を覚えさせる
        sound.pause();
        sound.currentTime = 0;
        isAudioUnlocked = true;
        
        dialog.style.display = 'none';
        overlay.style.display = 'none';
        
        alarmTarget = document.getElementById('alarmTime').value;
        statusText.innerText = "SET COMPLETE: " + alarmTarget;
        statusText.style.color = "var(--p)";
    }).catch(err => {
        console.error("Audio unlock failed:", err);
        alert("音声の許可に失敗しました。ブラウザの設定を確認してください。");
    });
}

function ring() {
    isRinging = true;
    sound.volume = 1.0;
    sound.play();

    document.body.classList.add('flashing');
    stopBtn.style.display = 'block';
    setBtn.style.display = 'none';
    statusText.innerText = "⏰ TIME UP!!";
    
    if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
    }
}

function stopAlarm() {
    sound.pause();
    sound.currentTime = 0;
    document.body.classList.remove('flashing');
    stopBtn.style.display = 'none';
    setBtn.style.display = 'block';
    alarmTarget = null;
    isRinging = false;
    statusText.innerText = "STOPPED / 待機中";
    statusText.style.color = "#94a3b8";
}
