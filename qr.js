let qr = null; const SECRET = "MULTI-X-2026-PRE"; // 認証用キーワード

// QR作成機能 function genQR(){ const t = document.getElementById("text").value; const area = document.getElementById("qrcode"); if (typeof QRCode === "undefined") return; if(!qr){ area.innerHTML = ""; qr = new QRCode(area, { width: 200, height: 200 }); } if(t.trim() === ""){ qr.makeCode("https://shinorail.github.io/multi-x-utility/"); } else { qr.makeCode(t); } }

// タブ切り替え機能 function swTab(type){ const tGen = document.getElementById('t-gen'); const tScan = document.getElementById('t-scan'); const tGate = document.getElementById('t-gate'); const pGen = document.getElementById('panel-gen'); const pScan = document.getElementById('panel-scan'); const pGate = document.getElementById('p-gate');

// すべて非表示
[tGen, tScan, tGate].forEach(t => t?.classList.remove('active'));
[pGen, pScan, pGate].forEach(p => p?.classList.remove('active'));

// 選択されたものだけ表示
if(type === 'gen'){
    tGen.classList.add('active'); pGen.classList.add('active');
    stopCamera();
} else if(type === 'scan'){
    tScan.classList.add('active'); pScan.classList.add('active');
} else if(type === 'gate'){
    tGate.classList.add('active'); pGate.classList.add('active');
}
}

// スキャン機能（共通） let stream = null; let currentMode = '';

async function startScan(mode) { currentMode = mode; const resDiv = document.getElementById('scan-res'); resDiv.style.display = 'block'; resDiv.innerText = "カメラを起動中..."; try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); const video = document.getElementById('video'); video.srcObject = stream; video.play(); document.getElementById('v-area').style.display = 'block'; document.getElementById('start-btn').style.display = 'none'; // ゲートモードなら専用ボタンも隠す if(document.getElementById('btn-gate')) document.getElementById('btn-gate').style.display = 'none';

    resDiv.innerText = "QRを映してください";
    requestAnimationFrame(tick);
} catch (err) {
    resDiv.innerText = "カメラの起動に失敗しました";
}
}

function stopCamera() { if (stream) { stream.getTracks().forEach(track => track.stop()); stream = null; } const video = document.getElementById('video'); if (video) video.srcObject = null;

document.getElementById('v-area').style.display = 'none';
document.getElementById('start-btn').style.display = 'block';
if(document.getElementById('btn-gate')) document.getElementById('btn-gate').style.display = 'block';
}

function tick() { if (!stream) return; const video = document.getElementById('video'); const canvas = document.getElementById('canvas'); if (video.readyState === video.HAVE_ENOUGH_DATA) { canvas.height = video.videoHeight; canvas.width = video.videoWidth; const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0, canvas.width, canvas.height); const img = ctx.getImageData(0, 0, canvas.width, canvas.height); const code = jsQR(img.data, img.width, img.height);

    if (code) {
        const resDiv = document.getElementById('scan-res');
        // ゲート認証モードの場合
        if (currentMode === 'gate' || code.data.includes(SECRET)) {
            if (code.data.includes(SECRET)) {
                const name = code.data.split(":").pop() || "公式";
                document.getElementById('overlay').style.display = 'flex';
                document.getElementById('u-name').innerText = name + " 様";
                stopCamera();
                setTimeout(() => { location.href = "pre-speed-secure.html?ref=" + encodeURIComponent(name); }, 1500);
                return;
            }
        }
        // 通常スキャンモードの場合
        resDiv.innerHTML = `読取成功！<br><a href="${code.data}" target="_blank" style="color:var(--p);font-weight:bold;">${code.data}</a>`;
        if(navigator.vibrate) navigator.vibrate(200);
        stopCamera();
        return;
    }
}
requestAnimationFrame(tick);
}

// URLパラメータによる自動認証チェック function checkAutoAuth() { const urlParams = new URLSearchParams(window.location.search); const key = urlParams.get('key'); if (key) { swTab('gate'); const resDiv = document.getElementById('scan-res'); resDiv.style.display = 'block'; resDiv.innerText = "認証キーを確認中..."; setTimeout(() => { if (key.includes(SECRET)) { const name = key.split(":").pop() || "外部認証"; document.getElementById('overlay').style.display = 'flex'; document.getElementById('u-name').innerText = name + " 様"; setTimeout(() => { location.href = "pre-speed-secure.html?ref=" + encodeURIComponent(name); }, 1500); } else { resDiv.innerText = "エラー: 無効なキーです"; } }, 800); } }

window.addEventListener('pagehide', stopCamera); window.addEventListener('unload', stopCamera);

window.onload = () => { genQR(); checkAutoAuth(); };
