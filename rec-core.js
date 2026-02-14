let mediaRecorder;
let audioChunks = [];
let startTime;
let timerInterval;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const recordingsList = document.getElementById('recordingsList');
const memoArea = document.getElementById('memoArea');

if (startBtn) {
startBtn.addEventListener('click', async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';

        mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const now = new Date();
            const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            const item = document.createElement('div');
            item.className = 'list-item';
            item.style.flexDirection = 'column';
            item.style.alignItems = 'flex-start';
            item.style.gap = '10px';
            item.style.marginBottom = '15px';
            item.style.paddingBottom = '15px';
            item.style.borderBottom = '1px solid rgba(212,175,55,0.2)';

            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <span style="color:var(--p); font-weight:bold;">REC_${timeStr}</span>
                    <a href="${audioUrl}" download="rec_${Date.now()}.mp3" style="font-size:0.75rem; color:#000; background:var(--p); padding:5px 12px; border-radius:50px; text-decoration:none; font-weight:bold;">MP3 SAVE</a>
                </div>
                <audio src="${audioUrl}" controls style="width:100%; height:35px; filter: invert(85%) hue-rotate(150deg);"></audio>
            `;
            recordingsList.prepend(item);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        startBtn.style.display = 'none';
        stopBtn.style.display = 'flex';
        startBtn.classList.add('recording');

        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const s = String(elapsed % 60).padStart(2, '0');
            timerDisplay.innerText = `${m}:${s}`;
        }, 1000);
    } catch (err) {
        alert("録音を開始できません。マイクの許可とHTTPS接続を確認してください。");
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

// メモのテキスト保存機能
function downloadMemo() {
const text = memoArea.value;
if (!text) {
alert("メモが空です。");
return;
}
const blob = new Blob([text], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
const now = new Date();
const filename = memo_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.txt;

a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
}

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

window.addEventListener('DOMContentLoaded', () => {
const saved = localStorage.getItem('recmemo_data');
if (saved) memoArea.value = saved;
});
