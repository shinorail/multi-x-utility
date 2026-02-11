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
