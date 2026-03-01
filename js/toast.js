/* ============================================
   InterviewIQ — Toast Notification System
   ============================================ */

const Toast = (() => {
    let container;

    function init() {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:88px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
        document.body.appendChild(container);
    }

    function show(message, type = 'info', duration = 3500) {
        if (!container) init();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toast.style.transform = 'translateX(120%)';
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Auto-remove
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function success(msg) { show(msg, 'success'); }
    function error(msg) { show(msg, 'error'); }
    function info(msg) { show(msg, 'info'); }

    return { show, success, error, info };
})();

window.Toast = Toast;
