let qr = null;
const SECRET = "MULTI-X-2026-PRE";

// QR作成機能
function genQR(){
    const t = document.getElementById("text").value;
    const area = document.getElementById("qrcode");
    if (typeof QRCode === "undefined") return;
    if(!qr){
        area.innerHTML = ""; 
        qr = new QRCode(area, { width: 200, height: 200 });
    }
    if(t.trim() === ""){
        qr.makeCode("https://shinorail.github.io/multi-x-utility/");
    } else {
        qr.makeCode(t);
    }
}

// タブ切り替え機能
function swTab(type){
    stopCamera();
    const tabs = ['t-gate', 't-gen', 't-scan'];
    const panels = ['panel-gate', 'panel-gen', 'panel-scan'];

    tabs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.remove('active');
    });
    panels.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.remove('active');
    });

    document.getElementById('t-' + type).classList.add('active');
    document.getElementById('panel-' + type).classList.add('active');

    if(type === 'gen') genQR();
}

// スキャン機能
let stream = null;
async function startScan(mode) {
    const resDiv = document.getElementById('scan-res');
    resDiv.style.display = 'block';
    resDiv.innerText = "カメラを起動中...";
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
        document.getElementById('v-area').style.display = 'block';
        resDiv.innerText = "QRを映してください";
        requestAnimationFrame(() => tick(mode));
    } catch (err) {
        resDiv.innerText = "カメラの起動に失敗しました";
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    document.getElementById('v-area').style.display = 'none';
    document.getElementById('scan-res').style.display = 'none';
}

function tick(mode) {
    if (!stream) return;
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height);
        
        if (code) {
            const resDiv = document.getElementById('scan-res');
            if (mode === 'gate' && code.data.includes(SECRET)) {
                const name = code.data.split(":").pop() || "公式";
                document.getElementById('overlay').style.display = 'flex';
                document.getElementById('u-name').innerText = name + " 様";
                stopCamera();
                setTimeout(() => { location.href = "pre-speed-secure.html?ref=" + encodeURIComponent(name); }, 1500);
                return;
            } else {
                resDiv.innerHTML = `読取成功！<br><a href="${code.data}" target="_blank" style="color:var(--p);font-weight:bold;">${code.data}</a>`;
                if(navigator.vibrate) navigator.vibrate(200);
                stopCamera();
                return;
            }
        }
    }
    requestAnimationFrame(() => tick(mode));
}

// 自動認証
function checkAutoAuth() {
    const key = new URLSearchParams(window.location.search).get('key');
    if (key && key.includes(SECRET)) {
        swTab('gate');
        const name = key.split(":").pop() || "外部認証";
        document.getElementById('overlay').style.display = 'flex';
        document.getElementById('u-name').innerText = name + " 様";
        setTimeout(() => { location.href = "pre-speed-secure.html?ref=" + encodeURIComponent(name); }, 1500);
    }
}

window.onload = () => { genQR(); checkAutoAuth(); };
