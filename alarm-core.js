let alarmTarget = null;
let isRinging = false;
let isAudioUnlocked = false;

const sound = document.getElementById('alarmSound');
const statusText = document.getElementById('status');
const stopBtn = document.getElementById('stopBtn');
const setBtn = document.getElementById('setBtn');
const dialog = document.getElementById('permission-dialog');
const overlay = document.getElementById('overlay');

// 時計更新
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').innerText = `${h}:${m}:${s}`;

    if (alarmTarget === `${h}:${m}` && !isRinging && isAudioUnlocked) {
        ring();
    }
}
setInterval(updateClock, 1000);

// 設定ボタンが押されたとき
function askPermission() {
    const timeVal = document.getElementById('alarmTime').value;
    if (!timeVal) {
        alert("時刻を入力してください");
        return;
    }
    
    // ダイアログを表示してユーザーのクリックを待つ
    overlay.style.display = 'block';
    dialog.style.display = 'block';
}

// 許可ボタンが押されたとき（ここが重要）
function grantAudio() {
    // ユーザーの操作直後であれば再生が許可される
    sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
        isAudioUnlocked = true;
        
        // ダイアログを閉じる
        dialog.style.display = 'none';
        overlay.style.display = 'none';
        
        // アラームをセット
        alarmTarget = document.getElementById('alarmTime').value;
        statusText.innerText = "SET COMPLETE: " + alarmTarget;
        statusText.style.color = "var(--p)";
    }).catch(err => {
        console.error("Audio unlock failed:", err);
        alert("エラーが発生しました。もう一度お試しください。");
    });
}

function ring() {
    isRinging = true;
    sound.play();
    document.body.classList.add('flashing');
    stopBtn.style.display = 'block';
    setBtn.style.display = 'none';
    statusText.innerText = "⏰ TIME UP!!";
}

function stopAlarm() {
    sound.pause();
    sound.currentTime = 0;
    document.body.classList.remove('flashing');
    stopBtn.style.display = 'none';
    setBtn.style.display = 'block';
    alarmTarget = null;
    isRinging = false;
    statusText.innerText = "STOPPED";
}
