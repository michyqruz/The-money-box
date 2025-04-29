// Enhanced environment detection
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
    showSafariHelp: document.getElementById('showSafariHelp'),
    safariOverlay: document.getElementById('safariOverlay')
};

// Initialize the UI
const initUI = () => {
    if (isStandalone()) {
        // Running as PWA - show app content
        elements.installPrompt.classList.add('hidden');
        elements.postInstall.classList.add('hidden');
        elements.appContent.classList.remove('hidden');
    } else if (new URLSearchParams(window.location.search).has('installed')) {
        // Show post-install message
        elements.installPrompt.classList.add('hidden');
        elements.postInstall.classList.remove('hidden');
        elements.appContent.classList.add('hidden');
    } else {
        // Show install prompt
        elements.installPrompt.classList.remove('hidden');
        elements.postInstall.classList.add('hidden');
        elements.appContent.classList.add('hidden');
        
        if (isIOS()) {
            elements.androidInstall.classList.add('hidden');
            elements.iosInstall.classList.remove('hidden');
        } else {
            elements.androidInstall.classList.remove('hidden');
            elements.iosInstall.classList.add('hidden');
        }
    }
};

// Android PWA installation
let deferredPrompt = null;

const setupAndroidInstall = () => {
    if (isIOS()) return;

    elements.installButton?.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.warn('Install prompt not available');
            return;
        }

        try {
            // Show the install prompt
            deferredPrompt.prompt();
            
            // Wait for user decision
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA installation accepted');
                // Store installation state
                localStorage.setItem('pwaInstalled', 'true');
                // Redirect to post-install view
                window.location.href = '/?installed=true';
            } else {
                console.log('PWA installation declined');
            }
        } catch (error) {
            console.error('Error during installation:', error);
        }
    });
};

// Handle beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Update UI for Android
    if (!isIOS() && elements.installButton) {
        elements.installButton.style.display = 'block';
        console.log('PWA installation available');
    }
});

// Handle successful installation
window.addEventListener('appinstalled', () => {
    console.log('PWA successfully installed');
    localStorage.setItem('pwaInstalled', 'true');
    
    if (!window.location.href.includes('installed=true')) {
        window.location.href = '/?installed=true';
    }
});

// Check for existing installation
const checkInstallationStatus = () => {
    if (localStorage.getItem('pwaInstalled') === 'true' && 
        !window.location.href.includes('installed=true')) {
        window.location.href = '/?installed=true';
    }
};

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    checkInstallationStatus();
    initUI();
    setupAndroidInstall();
    
    // iOS Help Overlay
    elements.showSafariHelp?.addEventListener('click', () => {
        elements.safariOverlay.classList.remove('hidden');
    });
    
    document.querySelector('.close-overlay')?.addEventListener('click', () => {
        elements.safariOverlay.classList.add('hidden');
    });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
                
                // Check for updates hourly
                setInterval(() => registration.update(), 60 * 60 * 1000);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
