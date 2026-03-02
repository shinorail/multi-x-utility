/**
 * alarm-core.js
 */
let alarmTimer = null;
const audio = document.getElementById('alarmSound');
const statusDiv = document.getElementById('status');
const stopBtn = document.getElementById('stopBtn');
const setBtn = document.getElementById('setBtn');

async function watchBluetooth() {
    if (!navigator.bluetooth) return;
    try {
        const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        device.addEventListener('gattserverdisconnected', () => {
            triggerAlarm();
            alert("Bluetooth接続が切れました！本体で鳴らします。");
        });
        await device.gatt.connect();
        statusDiv.innerText = "BT監視中: " + (device.name || "Device");
        statusDiv.style.color = "#3b82f6";
    } catch (error) {
        console.log("BT接続キャンセル");
    }
}

function askPermission() {
    const time = document.getElementById('alarmTime').value;
    if (!time) { alert("時間を設定してください"); return; }
    startAlarmTimer();
}

function startAlarmTimer() {
    const alarmTime = document.getElementById('alarmTime').value;
    statusDiv.innerText = "SET: " + alarmTime + " (監視中)";
    statusDiv.style.color = "var(--p)";
    if (alarmTimer) clearInterval(alarmTimer);
    alarmTimer = setInterval(() => {
        const now = new Date();
        const currentTime = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');
        if (currentTime === alarmTime) triggerAlarm();
    }, 1000);
    setBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
}

function triggerAlarm() {
    clearInterval(alarmTimer);
    audio.play().catch(e => {
        console.error("Audio playback failed", e);
        alert("アラーム時間ですが音がブロックされました。画面をタップしてください。");
    });
    document.body.classList.add('flashing');
    statusDiv.innerText = "TIME UP!";
    statusDiv.style.color = "var(--red)";
}

function stopAlarm() {
    audio.pause();
    audio.currentTime = 0;
    document.body.classList.remove('flashing');
    statusDiv.innerText = "WAITING / 常時点灯中";
    statusDiv.style.color = "var(--sub)";
    setBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    if (alarmTimer) clearInterval(alarmTimer);
}
