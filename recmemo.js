/**
 * Multi-X RecMemo Core Logic (Persistent Storage Version)
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
let db;

// 1. IndexedDBの初期化 (リロード対策の要)
const request = indexedDB.open("RecMemoDB", 1);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("recordings", { keyPath: "id", autoIncrement: true });
};
request.onsuccess = (e) => {
    db = e.target.result;
    loadSavedRecordings(); // 起動時に保存済みデータを読み込む
};

// 2. メモの自動保存 (localStorage)
memoField.value = localStorage.getItem('multi_x_memo_v2') || '';
memoField.addEventListener('input', () => {
    localStorage.setItem('multi_x_memo_v2', memoField.value);
});

// 3. センサーおよびシステムの初期化
async function initSystem() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== 'granted') throw new Error('センサー許可なし');
    }
    window.addEventListener('devicemotion', (e) => {
        if (!isRecording) return;
        const acc = e.accelerationIncludingGravity || e.acceleration;
        if (!acc) return;
        const force = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
        if (force > 18) handleStop();
    }, true);
    return await navigator.mediaDevices.getUserMedia({ audio: true });
}

// 4. 録音開始
recBtn.addEventListener('click', async () => {
    try {
        statusMsg.innerText = "INITIALIZING...";
        const stream = await initSystem();
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = saveRecording; // 停止時に保存処理へ
        mediaRecorder.start();
        isRecording = true;
        statusMsg.innerText = "🔴 RECORDING...";
        recBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        if (navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
        statusMsg.innerText = "ERROR: ACCESS DENIED";
        alert("権限が必要です。");
    }
});

// 5. 録音停止
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

// 6. 音声データの保存 (IndexedDB)
function saveRecording() {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const transaction = db.transaction(["recordings"], "readwrite");
    const store = transaction.objectStore("recordings");
    const data = {
        blob: blob,
        timestamp: new Date().toLocaleString()
    };
    store.add(data);
    transaction.oncomplete = () => {
        loadSavedRecordings(); // リストを更新
    };
}

// 7. 保存済みデータの読み込みと表示
function loadSavedRecordings() {
    audioList.innerHTML = ''; // 一旦クリア
    const objectStore = db.transaction("recordings").objectStore("recordings");
    objectStore.openCursor(null, 'prev').onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            addAudioUI(cursor.value.blob, cursor.value.timestamp, cursor.key);
            cursor.continue();
        }
    };
}

function addAudioUI(blob, timestamp, id) {
    const url = URL.createObjectURL(blob);
    const div = document.createElement('div');
    div.className = 'audio-item';
    div.innerHTML = `
        <div style="font-size:10px; color:#d4af37; margin-bottom:5px; display:flex; justify-content:space-between;">
            <span>LOG: ${timestamp}</span>
            <span style="color:#ef4444; cursor:pointer;" onclick="deleteRecord(${id})">DELETE</span>
        </div>
        <audio src="${url}" controls></audio>
    `;
    audioList.appendChild(div);
}

// 8. データの削除
window.deleteRecord = (id) => {
    if(!confirm("この録音を削除しますか？")) return;
    const transaction = db.transaction(["recordings"], "readwrite");
    transaction.objectStore("recordings").delete(id);
    transaction.oncomplete = () => loadSavedRecordings();
};
