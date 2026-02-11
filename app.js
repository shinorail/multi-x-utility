/* ======================================================
   Multi-X Utility : Universal Design & PWA Engine
   (c) 2026 篠ノ井乗務区
   ====================================================== */
"use strict";

const MultiX_UD = {
    // 振動機能
    haptic: (ms) => {
        if ("vibrate" in navigator) navigator.vibrate(ms);
    },

    // センサー連動（環境光）
    setupLightSensor: () => {
        if ('AmbientLightSensor' in window) {
            try {
                const sensor = new AmbientLightSensor();
                sensor.addEventListener('reading', () => {
                    if (sensor.illuminance < 10) {
                        document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                        document.documentElement.setAttribute('data-theme', 'light');
                    }
                });
                sensor.start();
            } catch (err) {
                console.log("Sensor access denied.");
            }
        }
    },

    // 自動テーマ初期化（センサーが動かない場合のフォールバック）
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

    // 振動イベントの一括登録
    initHaptics: () => {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('vibrate-on') || e.target.closest('.vibrate-on')) {
                MultiX_UD.haptic(15);
            }
        });
    }
};

// PWA インストールロジック
let deferredPrompt;
const setupPWA = () => {
    const popup = document.getElementById('pwa-popup');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(() => { if (popup) popup.style.display = 'block'; }, 2000);
    });
};

window.installPWA = async () => {
    if (!deferredPrompt) {
        alert("ブラウザのメニューから「ホーム画面に追加」を選択してください。");
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        document.getElementById('pwa-popup').style.display = 'none';
    }
    deferredPrompt = null;
};

// 起動
document.addEventListener('DOMContentLoaded', () => {
    MultiX_UD.initTheme();
    MultiX_UD.initHaptics();
    MultiX_UD.setupLightSensor();
    setupPWA();
});
