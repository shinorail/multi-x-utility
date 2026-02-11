/* ======================================================
   Multi-X Utility : Engine v2.0
   ====================================================== */
"use strict";

let deferredPrompt = null;

const MultiX_UD = {
    // 振動
    haptic: (ms) => {
        if ("vibrate" in navigator) navigator.vibrate(ms);
    },
    // センサー
    setupLightSensor: () => {
        if ('AmbientLightSensor' in window) {
            try {
                const sensor = new AmbientLightSensor();
                sensor.addEventListener('reading', () => {
                    document.documentElement.setAttribute('data-theme', sensor.illuminance < 10 ? 'dark' : 'light');
                });
                sensor.start();
            } catch (err) { console.log("Sensor disabled"); }
        }
    },
    // テーマ
    initTheme: () => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const apply = (e) => {
            if (!localStorage.getItem('calcTheme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        };
        mq.addEventListener('change', apply);
        apply(mq);
    },
    // 振動一括登録
    initHaptics: () => {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('vibrate-on') || e.target.closest('.vibrate-on')) {
                MultiX_UD.haptic(15);
            }
        });
    }
};

// PWA インストールロジック
const setupPWA = () => {
    const popup = document.getElementById('pwa-popup');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (popup) popup.style.display = 'block';
    });
    // 強制表示
    setTimeout(() => {
        if (popup && popup.style.display !== 'block') { popup.style.display = 'block'; }
    }, 4000);
};

// ダウンロード実行
window.installPWA = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('pwa-popup').style.display = 'none';
        }
        deferredPrompt = null;
    } else {
        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isiOS) {
            alert("【iPhoneの方へ】\nブラウザ下部の「共有ボタン」から「ホーム画面に追加」を選択してダウンロードしてください。");
        } else {
            alert("既にインストール済みか、ブラウザのメニューから「ホーム画面に追加」を選択してください。");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MultiX_UD.initTheme();
    MultiX_UD.initHaptics();
    MultiX_UD.setupLightSensor();
    setupPWA();
});
