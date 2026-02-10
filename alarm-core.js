let alarmTarget = null;
let isRinging = false;
let isAudioUnlocked = false; // 音がアンロックされたか
const sound = document.getElementById('alarmSound');
const statusText = document.getElementById('status');
const stopBtn = document.getElementById('stopBtn');
const setBtn = document.getElementById('setBtn');
const dialog = document.getElementById('permission-dialog');
const overlay = document.getElementById('overlay');

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

// 1. 設定ボタンを押した時に許可ダイアログを表示
function askPermission() {
    const input = document.getElementById('alarmTime').value;
    if (!input) return alert("時刻を選択してください");
    
    if (!isAudioUnlocked) {
        overlay.style.display = 'block';
        dialog.style.display = 'block';
    } else {
        saveAlarm(input);
    }
}

// 2. ダイアログで「許可」を押した瞬間に音をアンロック
function grantAudio() {
    sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
        isAudioUnlocked = true;
        overlay.style.display = 'none';
        dialog.style.display = 'none';
        
        const input = document.getElementById('alarmTime').value;
        saveAlarm(input);
    }).catch(e => {
        alert("許可に失敗しました。もう一度お試しください。");
    });
}

function saveAlarm(time) {
    alarmTarget = time;
    statusText.innerText = "SET: " + alarmTarget;
    statusText.style.color = "var(--p)";
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
