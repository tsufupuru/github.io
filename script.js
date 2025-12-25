// 完全匿名目安箱 - JavaScript
// このスクリプトは完全匿名性を保証します。個人情報は一切収集・保存しません。

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('suggestionForm');
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const successMessage = document.getElementById('successMessage');
    const suggestionsList = document.getElementById('suggestionsList');
    const totalCount = document.getElementById('totalCount');

    // 文字数カウンター
    messageInput.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;

        // 文字数が上限に近づいたら色を変える
        if (count > 450) {
            charCount.style.color = '#e74c3c';
        } else if (count > 400) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '#666';
        }
    });

    // フォーム送信処理
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const category = document.getElementById('category').value;
        const message = document.getElementById('message').value;

        // 投稿データの作成（完全匿名 - タイムスタンプのみ）
        const suggestion = {
            id: generateAnonymousId(),
            category: category,
            message: message,
            timestamp: new Date().toISOString(),
            // 匿名性を保証するため、以下の情報は一切保存しない:
            // - IPアドレス
            // - ユーザーエージェント
            // - Cookieやセッション情報
            // - 位置情報
            // - その他の識別可能な情報
        };

        // 投稿を保存
        saveSuggestion(suggestion);

        // フォームをリセット
        form.reset();
        charCount.textContent = '0';

        // 成功メッセージを表示
        successMessage.style.display = 'block';
        setTimeout(function() {
            successMessage.style.display = 'none';
        }, 5000);

        // 投稿リストを更新
        displaySuggestions();
        updateStats();

        // ページトップにスクロール
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 完全匿名のIDを生成（ランダムな文字列のみ、追跡不可能）
    function generateAnonymousId() {
        return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    // 投稿を保存（localStorageを使用）
    // 注: 本番環境では、サーバーサイドで匿名性を保証する仕組みが必要です
    function saveSuggestion(suggestion) {
        let suggestions = getSuggestions();
        suggestions.unshift(suggestion); // 新しい投稿を先頭に追加

        // 最大100件まで保存
        if (suggestions.length > 100) {
            suggestions = suggestions.slice(0, 100);
        }

        localStorage.setItem('anonymousSuggestions', JSON.stringify(suggestions));
    }

    // 保存された投稿を取得
    function getSuggestions() {
        const data = localStorage.getItem('anonymousSuggestions');
        return data ? JSON.parse(data) : [];
    }

    // 投稿を表示
    function displaySuggestions() {
        const suggestions = getSuggestions();

        if (suggestions.length === 0) {
            suggestionsList.innerHTML = '<p class="no-suggestions">まだ投稿がありません。最初の投稿をお待ちしています。</p>';
            return;
        }

        let html = '';
        suggestions.forEach(function(suggestion) {
            const date = new Date(suggestion.timestamp);
            const formattedDate = formatDate(date);

            html += `
                <div class="suggestion-card">
                    <div class="suggestion-header">
                        <span class="category-badge category-${sanitizeClassName(suggestion.category)}">${escapeHtml(suggestion.category)}</span>
                        <span class="suggestion-date">${formattedDate}</span>
                    </div>
                    <div class="suggestion-message">
                        ${escapeHtml(suggestion.message)}
                    </div>
                </div>
            `;
        });

        suggestionsList.innerHTML = html;
    }

    // 統計情報を更新
    function updateStats() {
        const suggestions = getSuggestions();
        totalCount.textContent = suggestions.length;
    }

    // 日付をフォーマット
    function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return days + '日前';
        } else if (hours > 0) {
            return hours + '時間前';
        } else if (minutes > 0) {
            return minutes + '分前';
        } else {
            return '今';
        }
    }

    // HTMLエスケープ（XSS対策）
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // クラス名をサニタイズ
    function sanitizeClassName(text) {
        return text.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '');
    }

    // 管理者用: すべての投稿をクリア（デバッグ用）
    // 本番環境では削除してください
    window.clearAllSuggestions = function() {
        if (confirm('すべての投稿を削除してもよろしいですか？')) {
            localStorage.removeItem('anonymousSuggestions');
            displaySuggestions();
            updateStats();
            alert('すべての投稿が削除されました。');
        }
    };

    // 初期表示
    displaySuggestions();
    updateStats();
});
