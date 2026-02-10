let qr = null;

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
    const tGen = document.getElementById('t-gen');
    const tScan = document.getElementById('t-scan');
    const pGen = document.getElementById('panel-gen');
    const pScan = document.getElementById('panel-scan');
    if(type === 'gen'){
        tGen.classList.add('active'); tScan.classList.remove('active');
        pGen.classList.add('active'); pScan.classList.remove('active');
        stopCamera();
    } else {
        tScan.classList.add('active'); tGen.classList.remove('active');
        pScan.classList.add('active'); pGen.classList.remove('active');
    }
}

// スキャン機能
let stream = null;
async function startScan() {
    const resDiv = document.getElementById('scan-res');
    resDiv.style.display = 'block';
    resDiv.innerText = "カメラを起動中...";
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
        document.getElementById('v-area').style.display = 'block';
        document.getElementById('start-btn').style.display = 'none';
        resDiv.innerText = "QRを映してください";
        requestAnimationFrame(tick);
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
    document.getElementById('start-btn').style.display = 'block';
    document.getElementById('scan-res').style.display = 'none';
}

function tick() {
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
            resDiv.innerHTML = `読取成功！<br><a href="${code.data}" target="_blank" style="color:var(--p)">${code.data}</a>`;
            if(navigator.vibrate) navigator.vibrate(200);
            return;
        }
    }
    if (stream) requestAnimationFrame(tick);
}

// 初期実行
window.onload = () => { genQR(); };
