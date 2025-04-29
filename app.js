// 1. Environment Detection
const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
};

const isPwaCapable = () => {
    return 'serviceWorker' in navigator && 
           'BeforeInstallPromptEvent' in window &&
           (location.protocol === 'https:' || location.hostname === 'localhost');
};

// 2. DOM Elements
const elements = {
    installPrompt: document.getElementById('installPrompt'),
    postInstall: document.getElementById('postInstall'),
    appContent: document.getElementById('appContent'),
    androidInstall: document.getElementById('androidInstall'),
    iosInstall: document.getElementById('iosInstall'),
    installButton: document.getElementById('installButton'),
    androidError: document.getElementById('androidError'),
    androidManualHint: document.getElementById('androidManualHint'),
    showSafariHelp: document.getElementById('showSafariHelp'),
    safariOverlay: document.getElementById('safariOverlay')
};

// 3. Error Handling
const showAndroidError = (message, showManualHint = true) => {
    elements.androidError.innerHTML = message;
    elements.androidError.style.display = 'block';
    elements.androidManualHint.style.display = showManualHint ? 'block' : 'none';
    
    // Log detailed info to console for debugging
    console.group('PWA Installation Error');
    console.log('User Agent:', navigator.userAgent);
    console.log('HTTPS:', location.protocol === 'https:');
    console.log('Localhost:', location.hostname === 'localhost');
    console.log('Service Worker:', 'serviceWorker' in navigator);
    console.log('BeforeInstallPrompt:', 'BeforeInstallPromptEvent' in window);
    console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches);
    console.groupEnd();
};

// 4. Installation Logic
let deferredPrompt = null;

const handleInstall = async () => {
    if (!isPwaCapable()) {
        showAndroidError('Your browser/device doesn\'t support direct installation');
        return;
    }

    if (isStandalone()) {
        showAndroidError('The app is already installed!', false);
        return;
    }

    if (!deferredPrompt) {
        showAndroidError('Installation not ready yet. Please wait...');
        setTimeout(() => {
            if (!deferredPrompt) {
                showAndroidError('Still having trouble? Try manual installation:');
            }
        }, 2000);
        return;
    }

    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted install');
            // Track installation in localStorage
            localStorage.setItem('pwaInstalled', 'true');
            window.location.href = '/?installed=true';
        } else {
            showAndroidError('Installation canceled. You can try again later.');
        }
    } catch (error) {
        showAndroidError(`Installation failed: ${error.message}`);
    }
};

// 5. Event Listeners
window.addEventListener('beforeinstallprompt', (e) => {
    if (!isIOS()) {
        e.preventDefault();
        deferredPrompt = e;
        
        // Enable install button
        elements.installButton.style.display = 'block';
        elements.installButton.onclick = handleInstall;
        
        // Set timeout to check if installation is stuck
        setTimeout(() => {
            if (!deferredPrompt && !isStandalone()) {
                showAndroidError('Automatic installation not working. Try manual method:');
            }
        }, 4000);
    }
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    localStorage.setItem('pwaInstalled', 'true');
    console.log('PWA was successfully installed');
});

// 6. Initialization
const initApp = () => {
    if (isStandalone() || localStorage.getItem('pwaInstalled') === 'true') {
        elements.installPrompt.classList.add('hidden');
        elements.appContent.classList.remove('hidden');
    } else if (new URLSearchParams(window.location.search).has('installed')) {
        elements.installPrompt.classList.add('hidden');
        elements.postInstall.classList.remove('hidden');
        localStorage.setItem('pwaInstalled', 'true');
    } else {
        if (isIOS()) {
            elements.androidInstall.classList.add('hidden');
            elements.iosInstall.classList.remove('hidden');
        } else {
            elements.androidInstall.classList.remove('hidden');
            elements.iosInstall.classList.add('hidden');
            
            // Show manual hint for browsers that don't support beforeinstallprompt
            if (!('BeforeInstallPromptEvent' in window)) {
                elements.androidManualHint.style.display = 'block';
            }
        }
    }
};

// 7. Start the app
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
                registration.update(); // Check for updates
            })
            .catch(err => {
                showAndroidError('Service worker registration failed');
                console.error('ServiceWorker failed:', err);
            });
    });
}
