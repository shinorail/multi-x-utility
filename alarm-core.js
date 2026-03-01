/**
 * alarm-core.js - 実行エンジン
 * 「許可してセット」が反応しない問題を解消
 */

let alarmTimer = null;
const alarmSound = document.getElementById('alarmSound');
const statusDiv = document.getElementById('status');
const stopBtn = document.getElementById('stopBtn');
const setBtn = document.getElementById('setBtn');

// 1. セットボタン押下時
function askPermission() {
    const alarmTime = document.getElementById('alarmTime').value;
    if (!alarmTime) {
        alert("時刻を入力してください。");
        return;
    }
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('permission-dialog').style.display = 'block';
}

// 2. 「許可してセットする」ボタン押下時（ここが反応しない原因の修正箇所）
function grantAudio() {
    // ユーザー操作の直後でplayを呼び出し、ブラウザのロックを解除する
    alarmSound.play().then(() => {
        // 成功したらすぐ止める（これで音出しの許可が確定する）
        alarmSound.pause();
        alarmSound.currentTime = 0;
        
        // UIを閉じる
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('permission-dialog').style.display = 'none';
        
        // タイマー開始
        startAlarmTimer();
    }).catch(err => {
        console.error("Audio block error:", err);
        alert("音声の再生許可が取れませんでした。ブラウザの設定を確認してください。");
    });
}

// 3. タイマーの監視開始
function startAlarmTimer() {
    const alarmTime = document.getElementById('alarmTime').value;
    statusDiv.innerText = "SET: " + alarmTime + " (監視中)";
    statusDiv.style.color = "var(--p)";

    if (alarmTimer) clearInterval(alarmTimer);

    alarmTimer = setInterval(() => {
        const now = new Date();
        const currentTime = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');

        if (currentTime === alarmTime) {
            triggerAlarm();
        }
    }, 1000);

    setBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
}

// 4. アラーム発動
function triggerAlarm() {
    clearInterval(alarmTimer);
    alarmSound.play();
    document.body.classList.add('flashing');
    statusDiv.innerText = "TIME UP!";
    statusDiv.style.color = "var(--red)";
}

// 5. アラーム停止
function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    document.body.classList.remove('flashing');
    statusDiv.innerText = "WAITING / 未設定";
    statusDiv.style.color = "var(--sub)";
    setBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    if (alarmTimer) clearInterval(alarmTimer);
}
