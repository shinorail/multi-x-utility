let startTime, elapsedTime = 0, timerInterval;
let laps = JSON.parse(localStorage.getItem('swLaps')) || [];

function updateDisplay() {
    const time = new Date(elapsedTime);
    const h = String(Math.floor(elapsedTime / 3600000)).padStart(2, '0');
    const m = String(time.getUTCMinutes()).padStart(2, '0');
    const s = String(time.getUTCSeconds()).padStart(2, '0');
    const ms = String(Math.floor(time.getUTCMilliseconds() / 10)).padStart(2, '0');
    document.getElementById('display').innerText = `${h}:${m}:${s}.${ms}`;
}

function startStop() {
    const btn = document.getElementById('startStopBtn');
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.innerText = 'START';
        btn.className = 'btn-start';
        localStorage.removeItem('swStartTime');
    } else {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
        btn.innerText = 'STOP';
        btn.className = 'btn-stop';
        localStorage.setItem('swStartTime', startTime);
    }
}

function reset() {
    if(!confirm("リセットしますか？")) return;
    clearInterval(timerInterval);
    timerInterval = null;
    elapsedTime = 0;
    laps = [];
    localStorage.removeItem('swStartTime');
    localStorage.removeItem('swLaps');
    updateDisplay();
    renderLaps();
    const btn = document.getElementById('startStopBtn');
    btn.innerText = 'START';
    btn.className = 'btn-start';
}

function lap() {
    if (elapsedTime > 0) {
        laps.unshift(document.getElementById('display').innerText);
        localStorage.setItem('swLaps', JSON.stringify(laps));
        renderLaps();
    }
}

function renderLaps() {
    const container = document.getElementById('laps');
    container.innerHTML = laps.map((l, i) => `
        <div class="lap-item">
            <span>Lap ${laps.length - i}</span>
            <span style="font-family:monospace">${l}</span>
        </div>
    `).join('');
}

// ページ読み込み時に状態を復元（リロード対策）
window.onload = () => {
    const savedStart = localStorage.getItem('swStartTime');
    if (savedStart) {
        startTime = parseInt(savedStart);
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
        const btn = document.getElementById('startStopBtn');
        btn.innerText = 'STOP';
        btn.className = 'btn-stop';
    } else {
        updateDisplay();
    }
    renderLaps();
};
