let qr = null; const SECRET = "MULTI-X-2026-PRE";

// QR作成機能 function genQR(){ const t = document.getElementById("text").value; const area = document.getElementById("qrcode"); if (typeof QRCode === "undefined") return; if(!qr){ area.innerHTML = ""; qr = new QRCode(area, { width: 200, height: 200 }); } if(t.trim() === ""){ qr.makeCode("https://shinorail.github.io/multi-x-utility/"); } else { qr.makeCode(t); } }

// タブ切り替え機能（画像を元にすべてのタブに対応） function swTab(type){ // タブ要素の取得 const tGen = document.getElementById('t-gen'); const tScan = document.getElementById('t-scan'); const tGate = document.getElementById('t-gate'); // パネル要素の取得 const pGen = document.getElementById('panel-gen'); const pScan = document.getElementById('panel-scan'); const pGate = document.getElementById('p-gate');

// 一旦すべて非表示にする
[tGen, tScan, tGate].forEach(t => { if(t) t.classList.remove('active'); });
[pGen, pScan, pGate].forEach(p => { if(p) p.classList.remove('active'); });

// 選択されたタブを表示
if(type === 'gen'){
    if(tGen) tGen.classList.add('active');
    if(pGen) pGen.classList.add('active');
    stopCamera();
} else if(type === 'scan'){
    if(tScan) tScan.classList.add('active');
    if(pScan) pScan.classList.add('active');
} else if(type === 'gate'){
    if(tGate) tGate.classList.add('active');
    if(pGate) pGate.classList.add('active');
}
}

// スキャン機能 let stream = null; async function startScan(mode) { const resDiv = document.getElementById('scan-res'); resDiv.style.display = 'block'; resDiv.innerText = "カメラを起動中..."; try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); const video = document.getElementById('video'); video.srcObject = stream; video.onloadedmetadata = () => { video.play(); document.getElementById('v-area').style.display = 'block'; document.getElementById('start-btn').style.display = 'none'; if(document.getElementById('btn-gate')) document.getElementById('btn-gate').style.display = 'none'; resDiv.innerText = "QRを映してください"; requestAnimationFrame(() => tick(mode)); }; } catch (err) { resDiv.innerText = "カメラの起動に失敗しました"; } }

function stopCamera() { if (stream) { stream.getTracks().forEach(track => track.stop()); stream = null; } const video = document.getElementById('video'); if (video) video.srcObject = null; document.getElementById('v-area').style.display = 'none'; document.getElementById('start-btn').style.display = 'block'; if(document.getElementById('btn-gate')) document.getElementById('btn-gate').style.display = 'block'; }

function tick(mode) { if (!stream) return; const video = document.getElementById('video'); const canvas = document.getElementById('canvas'); if (video.readyState === video.HAVE_ENOUGH_DATA) { canvas.height = video.videoHeight; canvas.width = video.videoWidth; const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0, canvas.width, canvas.height); const img = ctx.getImageData(0, 0, canvas.width, canvas.height); const code = jsQR(img.data, img.width, img.height);

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
            resDiv.innerHTML = `読取成功！<br><a href="${code.data}" target="_blank" style="color:var(--p)">${code.data}</a>`;
            if(navigator.vibrate) navigator.vibrate(200);
            stopCamera();
            return;
        }
    }
}
requestAnimationFrame(() => tick(mode));
}

// 外部アクセス用 function checkAutoAuth() { const urlParams = new URLSearchParams(window.location.search); const key = urlParams.get('key'); if (key && key.includes(SECRET)) { swTab('gate'); const name = key.split(":").pop() || "外部認証"; document.getElementById('overlay').style.display = 'flex'; document.getElementById('u-name').innerText = name + " 様"; setTimeout(() => { location.href = "pre-speed-secure.html?ref=" + encodeURIComponent(name); }, 1500); } }

window.addEventListener('pagehide', stopCamera); window.onload = () => { genQR(); checkAutoAuth(); };
