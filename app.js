/* ======================================================
   Multi-X Utility : UD Core System
   (c) 2026 篠ノ井乗務区
   機能：自動カラーセット切り替え・触覚フィードバック
   ====================================================== */

"use strict";

const MultiXApp = {
    // 1. 触覚フィードバック（バイブレーション）設定
    haptics: {
        enabled: true,
        play: (type = 'light') => {
            if (!navigator.vibrate || !MultiXApp.haptics.enabled) return;
            
            const patterns = {
                light: 10,       // 標準ボタン入力用
                medium: 30,      // 決定・計算完了用
                error: [50, 50, 50] // エラー警告用
            };
            navigator.vibrate(patterns[type] || patterns.light);
        }
    },

    // 2. カラーセット（ダークモード）自動適応設定
    theme: {
        init: () => {
            const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const apply = (e) => {
                const mode = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', mode);
                console.log(`[Multi-X] Theme adaptive: ${mode}`);
            };

            // 初期実行と監視開始
            darkMediaQuery.addEventListener('change', apply);
            apply(darkMediaQuery);
        }
    },

    // 3. UIイベントの紐付け
    ui: {
        setupEventListeners: () => {
            // "vibrate-on" クラスを持つ全ての要素に振動を付与
            document.body.addEventListener('click', (e) => {
                if (e.target.classList.contains('vibrate-on') || e.target.closest('.vibrate-on')) {
                    MultiXApp.haptics.play('light');
                }
            });
        }
    },

    // アプリの起動処理
    start: () => {
        MultiXApp.theme.init();
        MultiXApp.ui.setupEventListeners();
        console.log("Multi-X Utility: UD Engine started.");
    }
};

// DOM構築完了後に起動
document.addEventListener('DOMContentLoaded', MultiXApp.start);
