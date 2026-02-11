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

/* ======================================================
   PWA 強制表示対応版ロジック
   ====================================================== */
const setupPWA = () => {
    const popup = document.getElementById('pwa-popup');
    
    // A: ブラウザが「インストール可能」と判断した時に発火
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log("PWA: インストール準備完了");
        if (popup) popup.style.display = 'block';
    });

    // B: 【重要】イベントが来なくても5秒後に強制表示（誘致を優先）
    setTimeout(() => {
        if (popup && popup.style.display !== 'block') {
            console.log("PWA: 強制表示モード起動");
            popup.style.display = 'block';
        }
    }, 5000); 
};

// 起動
document.addEventListener('DOMContentLoaded', () => {
    MultiX_UD.initTheme();
    MultiX_UD.initHaptics();
    MultiX_UD.setupLightSensor();
    setupPWA();
});
