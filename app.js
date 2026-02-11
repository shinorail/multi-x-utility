/* ======================================================
   Multi-X Utility : UD & PWA Module
   ====================================================== */
"use strict";

const MultiX_UD = {
    // 振動
    haptic: (ms) => {
        if (navigator.vibrate) navigator.vibrate(ms);
    },

    // 自動テーマ
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
let deferredPrompt;
const setupPWA = () => {
    const installContainer = document.getElementById('pwa-install-container');
    const installBtn = document.getElementById('pwa-install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installContainer) installContainer.style.display = 'block';
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installContainer.style.display = 'none';
            }
            deferredPrompt = null;
        });
    }

    window.addEventListener('appinstalled', () => {
        if (installContainer) installContainer.style.display = 'none';
    });
};

document.addEventListener('DOMContentLoaded', () => {
    MultiX_UD.initTheme();
    MultiX_UD.initHaptics();
    setupPWA();
});
/* ======================================================
   Multi-X Utility : 環境光センサー適応モジュール
   ====================================================== */

const setupLightSensor = () => {
    // 1. 環境光センサーAPIが利用可能かチェック
    if ('AmbientLightSensor' in window) {
        try {
            const sensor = new AmbientLightSensor();
            sensor.addEventListener('reading', () => {
                // 明るさの単位は lux（ルクス）
                // 10ルクス以下（かなり暗い場所）ならダークモードへ
                if (sensor.illuminance < 10) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    console.log("[Sensor] 暗がりを検知：夜間モード起動");
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    console.log("[Sensor] 明るい環境を検知：通常モード起動");
                }
            });
            sensor.start();
        } catch (err) {
            console.log("センサーアクセスが拒否されました。PWAとして実行してください。");
        }
    } else {
        // 2. センサーが使えない場合は、OSのダークモード設定（時間連動）にフォールバック
        console.log("環境光センサー非対応。OS設定連動モードを継続します。");
    }
};

// 既存のDOMContentLoaded内に追加
document.addEventListener('DOMContentLoaded', () => {
    MultiX_UD.initTheme();
    MultiX_UD.initHaptics();
    setupPWA();
    setupLightSensor(); // これを追加
});
