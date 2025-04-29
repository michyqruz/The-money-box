// Enhanced device detection
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
};

// DOM elements
const elements = {
    installPrompt: document.getElementById('installPrompt'),
    postInstall: document.getElementById('postInstall'),
    appContent: document.getElementById('appContent'),
    androidInstall: document.getElementById('androidInstall'),
    iosInstall: document.getElementById('iosInstall'),
    installButton: document.getElementById('installButton'),
    showSafariHelp: document.getElementById('showSafariHelp'),
    safariOverlay: document.getElementById('safariOverlay')
};

// Initialize the UI based on device and installation status
const initApp = () => {
    if (isStandalone()) {
        // Running as installed PWA - show content
        elements.installPrompt.classList.add('hidden');
        elements.appContent.classList.remove('hidden');
    } else if (new URLSearchParams(window.location.search).has('installed')) {
        // Just installed - show post-install message
        elements.installPrompt.classList.add('hidden');
        elements.postInstall.classList.remove('hidden');
    } else {
        // Not installed - show install prompt
        if (isIOS()) {
            elements.androidInstall.classList.add('hidden');
            elements.iosInstall.classList.remove('hidden');
            
            // Special handling for Safari
            if (isSafari()) {
                // Could add additional Safari-specific instructions
            }
        }
    }
};

// Android PWA installation
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    if (!isIOS()) {
        e.preventDefault();
        deferredPrompt = e;
        
        elements.installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    window.location.href = '/?installed=true';
                }
                deferredPrompt = null;
            }
        });
    }
});

// iOS Help Overlay
elements.showSafariHelp?.addEventListener('click', () => {
    elements.safariOverlay.classList.remove('hidden');
});

document.querySelector('.close-overlay')?.addEventListener('click', () => {
    elements.safariOverlay.classList.add('hidden');
});

// Check for PWA installation on iOS
window.addEventListener('DOMContentLoaded', initApp);

// Additional check when page is shown from back/forward cache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initApp();
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
