// Enhanced device detection
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
    androidError: document.getElementById('androidError'),
    androidHint: document.getElementById('androidHint'),
    showSafariHelp: document.getElementById('showSafariHelp'),
    safariOverlay: document.getElementById('safariOverlay')
};

// Initialize the UI
const initApp = () => {
    if (isStandalone()) {
        elements.installPrompt.classList.add('hidden');
        elements.appContent.classList.remove('hidden');
    } else if (new URLSearchParams(window.location.search).has('installed')) {
        elements.installPrompt.classList.add('hidden');
        elements.postInstall.classList.remove('hidden');
    } else {
        if (isIOS()) {
            elements.androidInstall.classList.add('hidden');
            elements.iosInstall.classList.remove('hidden');
        } else {
            elements.androidInstall.classList.remove('hidden');
            elements.iosInstall.classList.add('hidden');
            checkAndroidInstallability();
        }
    }
};

// Show error message
const showAndroidError = (message) => {
    elements.androidError.textContent = message;
    elements.androidError.style.display = 'block';
    elements.androidHint.style.display = 'block';
    console.error('PWA Installation Error:', message);
};

// Check if installation should be available
const checkAndroidInstallability = () => {
    // Check basic PWA requirements
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        showAndroidError('Install requires HTTPS (current connection is not secure)');
        return false;
    }
    
    if (!('serviceWorker' in navigator)) {
        showAndroidError('Your browser doesn\'t support PWA installation');
        return false;
    }
    
    return true;
};

// Handle installation process
let deferredPrompt = null;

const handleInstall = async () => {
    if (!deferredPrompt) {
        showAndroidError('Installation not available. Possible reasons:');
        if (isStandalone()) {
            showAndroidError('The app may already be installed');
        } else if (!checkAndroidInstallability()) {
            return; // Error already shown
        } else {
            showAndroidError('Try refreshing the page or check browser support');
        }
        return;
    }

    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted install');
            window.location.href = '/?installed=true';
        } else {
            showAndroidError('Installation canceled - you can try again later');
        }
    } catch (error) {
        showAndroidError(`Installation failed: ${error.message}`);
    }
};

// Event listeners
window.addEventListener('beforeinstallprompt', (e) => {
    if (!isIOS()) {
        e.preventDefault();
        deferredPrompt = e;
        elements.installButton.style.display = 'block';
        elements.installButton.addEventListener('click', handleInstall);
        
        // Set timeout to detect if prompt isn't working
        setTimeout(() => {
            if (!deferredPrompt && !isStandalone()) {
                showAndroidError('Automatic installation not working. Please use browser menu:');
                elements.androidHint.style.display = 'block';
            }
        }, 3000);
    }
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('PWA was installed');
});

// Initialize button click handler
elements.installButton?.addEventListener('click', handleInstall);

// Initialize app
window.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('pageshow', (event) => {
    if (event.persisted) initApp();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                showAndroidError('Failed to register service worker');
                console.error('ServiceWorker registration failed:', err);
            });
    });
}
