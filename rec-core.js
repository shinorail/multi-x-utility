let mediaRecorder;
let audioChunks = [];
let startTime;
let timerInterval;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const recordingsList = document.getElementById('recordingsList');
const memoArea = document.getElementById('memoArea');

// 録音機能の初期化
if (startBtn) {
startBtn.addEventListener('click', async () => {
try {
// マイク権限の取得
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // サポートされている形式の確認
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/mp4'; // iOS用
        }

        mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = URL.createObjectURL(audioBlob);
            const extension = mimeType.includes('webm') ? 'webm' : 'm4a';
            
            // リストへ追加
            const now = new Date();
            const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `<span>Rec ${timeStr}</span><a href="${audioUrl}" download="rec_${Date.now()}.${extension}">SAVE</a>`;
            recordingsList.prepend(item);

            // ストリームを完全に停止してインジケーターを消す
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();

        // UIの切り替え
        startBtn.style.display = 'none';
        stopBtn.style.display = 'flex';
        startBtn.classList.add('recording');

        // タイマー開始
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');
            timerDisplay.innerText = `${m}:${s}`;
        }, 1000);

    } catch (err) {
        console.error('Recording Error:', err);
        alert("録音を開始できません。マイクの許可設定と、HTTPS接続であることを確認してください。");
    }
});
}

if (stopBtn) {
stopBtn.addEventListener('click', () => {
if (mediaRecorder && mediaRecorder.state !== 'inactive') {
mediaRecorder.stop();
clearInterval(timerInterval);
timerDisplay.innerText = "00:00";
startBtn.style.display = 'flex';
stopBtn.style.display = 'none';
startBtn.classList.remove('recording');
}
});
}

// メモ機能（オートセーブ）
function autoSave() {
localStorage.setItem('recmemo_data', memoArea.value);
const status = document.getElementById('saveStatus');
status.innerText = "保存中...";
setTimeout(() => { status.innerText = "自動保存済み"; }, 500);
}

function clearMemo() {
if(confirm("メモを削除しますか？")) {
memoArea.value = "";
localStorage.removeItem('recmemo_data');
}
}

// ページ読み込み時の復元
window.addEventListener('DOMContentLoaded', () => {
const saved = localStorage.getItem('recmemo_data');
if (saved) memoArea.value = saved;
});
