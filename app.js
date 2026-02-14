/* ======================================================
Multi-X Utility : Engine v2.2 (Sensor Optimized)
====================================================== */
"use strict";

let deferredPrompt = null;

const MultiX_UD = {
haptic: (ms) => {
if ("vibrate" in navigator) navigator.vibrate(ms);
},
setupLightSensor: () => {
if ('AmbientLightSensor' in window) {
try {
const sensor = new AmbientLightSensor();
sensor.addEventListener('reading', () => {
// v2.2: 10ルクス以上の明所のみライトモード。基本はダーク(黒)を維持。
const theme = sensor.illuminance > 10 ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', theme);
});
sensor.start();
} catch (err) { console.log("Sensor disabled"); }
}
},
initTheme: () => {
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const apply = (e) => {
if (!localStorage.getItem('calcTheme')) {
// v2.2: システム設定に関わらず、初期値としてダークモードを強制適用
document.documentElement.setAttribute('data-theme', 'dark');
}
};
mq.addEventListener('change', apply);
apply(mq);
},
initHaptics: () => {
document.addEventListener('click', (e) => {
if (e.target.classList.contains('vibrate-on') || e.target.closest('.vibrate-on')) {
MultiX_UD.haptic(15);
}
});
}
};

const setupPWA = () => {
const popup = document.getElementById('pwa-popup');
window.addEventListener('beforeinstallprompt', (e) => {
console.log("PWA: インストール準備が整いました（許可証受理）");
e.preventDefault();
deferredPrompt = e;
if (popup) popup.style.display = 'block';
});

setTimeout(() => {
    if (popup && popup.style.display !== 'block') {
        console.log("PWA: 許可証未着のため、案内モードで表示します");
        popup.style.display = 'block';
    }
}, 4000);
};

window.installPWA = async () => {
MultiX_UD.haptic(30);

if (deferredPrompt) {
    console.log("PWA: 標準インストールダイアログを起動します");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        const popup = document.getElementById('pwa-popup');
        if (popup) popup.style.display = 'none';
    }
    deferredPrompt = null;
} 
else {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    if (isiOS) {
        alert("【iPhoneでのダウンロード方法】\n\n1. ブラウザ下部の中央にある「共有ボタン（□に↑）」をタップします。\n2. メニューを下にスクロールし、「ホーム画面に追加」を選択します。\n3. 右上の「追加」を押すと、アプリアイコンがホーム画面に並びます。");
    } else if (isChrome) {
        alert("【Android/PCでのダウンロード方法】\n\n1. ブラウザ右上の「⋮（三点リーダー）」をタップします。\n2. 「アプリをインストール」または「ホーム画面に追加」を選択してください。");
    } else {
        alert("既にインストール済みか、お使いのブラウザが直接実行に対応していません。\n\nブラウザの設定メニューから「ホーム画面に追加」を行ってください。");
    }
}
};

document.addEventListener('DOMContentLoaded', () => {
MultiX_UD.initTheme();
MultiX_UD.initHaptics();
MultiX_UD.setupLightSensor();
setupPWA();
});
