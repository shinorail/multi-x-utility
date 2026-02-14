/**
 * Multi-X RecMemo Core Logic
 * 篠ノ井業務区 二周年記念アップデート版
 */

const recBtn = document.getElementById('recBtn');
const stopBtn = document.getElementById('stopBtn');
const statusMsg = document.getElementById('status');
const memoField = document.getElementById('memo');
const audioList = document.getElementById('list');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// 1. 自動保存機能
memoField.value = localStorage.getItem('multi_x_memo_v2') || '';
memoField.addEventListener('input', () => {
    localStorage.setItem('multi_x_memo_v2', memoField.value);
});

// 2. センサーおよびシステムの初期化
async function initSystem() {
    // iOSでのセンサー権限要求
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== 'granted') {
            throw new Error('センサーの許可が必要です');
        }
    }

    // 振って停止の監視登録
    window.addEventListener('devicemotion', (e) => {
        if (!isRecording) return;
        const acc = e.accelerationIncludingGravity || e.acceleration;
        if (!acc) return;

        const threshold = 18; // 現場での誤作動を防ぐための最適値
        const force = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);

        if (force > threshold) {
            handleStop();
        }
    }, true);

    // マイクの使用許可取得
    return await navigator.mediaDevices.getUserMedia({ audio: true });
}

// 3. 録音開始
recBtn.addEventListener('click', async () => {
    try {
        statusMsg.innerText = "WAITING FOR PERMISSION...";
        const stream = await initSystem();
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            addAudioItem(url);
        };

        mediaRecorder.start();
        isRecording = true;
        
        statusMsg.innerText = "🔴 RECORDING...";
        recBtn.style.display = 'none';
        stopBtn.style.display = 'block';

        if (navigator.vibrate) navigator.vibrate(50);

    } catch (err) {
        console.error(err);
        statusMsg.innerText = "ERROR: SYSTEM DENIED";
        alert("マイクとセンサーの許可が必要です。設定を確認してください。");
    }
});

// 4. 停止処理
function handleStop() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        isRecording = false;
        
        statusMsg.innerText = "SUCCESSFULLY SAVED";
        recBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
}

stopBtn.addEventListener('click', handleStop);

// 5. リストへの描画
function addAudioItem(url) {
    const div = document.createElement('div');
    div.className = 'audio-item';
    const now = new Date();
    const ts = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    div.innerHTML = `
        <div style="font-size:10px; color:#d4af37; margin-bottom:5px; font-weight:bold;">LOG: ${ts}</div>
        <audio src="${url}" controls></audio>
    `;
    audioList.prepend(div);
}
