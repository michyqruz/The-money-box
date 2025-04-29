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
    showSafariHelp: document.getElementById('showSafariHelp'),
    safariOverlay: document.getElementById('safariOverlay'),
    errorMessage: document.createElement('div') // For displaying errors
};

// Create error message element
elements.errorMessage.style.color = '#d32f2f';
elements.errorMessage.style.marginTop = '10px';
elements.errorMessage.style.display = 'none';
elements.androidInstall.appendChild(elements.errorMessage);

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
        } else {
            // For Android/desktop, ensure install button is visible
            elements.androidInstall.classList.remove('hidden');
            elements.iosInstall.classList.add('hidden');
        }
    }
};

// Android PWA installation with error handling
let deferredPrompt;

const showError = (message) => {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
    setTimeout(() => {
        elements.errorMessage.style.display = 'none';
    }, 5000);
};

const installPWA = async () => {
    if (!deferredPrompt) {
        showError('Installation not available. Try refreshing the page.');
        return;
    }

    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            // Track installation success if needed
            window.location.href = '/?installed=true';
        } else {
            showError('Installation was canceled. Please try again.');
        }
    } catch (error) {
        console.error('Installation failed:', error);
        showError(`Installation failed: ${error.message}`);
    } finally {
        deferredPrompt = null;
    }
};

window.addEventListener('beforeinstallprompt', (e) => {
    if (!isIOS()) {
        e.preventDefault();
        deferredPrompt = e;
        
        // Enable install button
        elements.installButton.style.display = 'block';
        elements.installButton.addEventListener('click', installPWA);
        
        // Show why install might be unavailable
        setTimeout(() => {
            if (!deferredPrompt) {
                showError('Installation may be unavailable because: ' + 
                         '1. The app is already installed, or ' +
                         '2. Your browser doesn\'t support PWA installation');
            }
        }, 3000);
    }
});

// Handle cases where installation isn't available
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
});

// Check for common installation blockers
const checkInstallRequirements = () => {
    if (!window.matchMedia('(display-mode: standalone)').matches && 
        !isIOS() && 
        !deferredPrompt) {
        
        const issues = [];
        
        // Check for HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            issues.push('not using HTTPS');
        }
        
        // Check for service worker support
        if (!('serviceWorker' in navigator)) {
            issues.push('no service worker support');
        }
        
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            issues.push('app may already be installed');
        }
        
        if (issues.length > 0) {
            showError(`Installation issues detected: ${issues.join(', ')}`);
        }
    }
};

// iOS Help Overlay (unchanged)
elements.showSafariHelp?.addEventListener('click', () => {
    elements.safariOverlay.classList.remove('hidden');
});

document.querySelector('.close-overlay')?.addEventListener('click', () => {
    elements.safariOverlay.classList.add('hidden');
});

// Initialize app and check requirements
window.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkInstallRequirements();
});

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initApp();
    }
});

// Service Worker Registration with error handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
                // Optional: Check for updates
                registration.update();
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
                if (!isIOS()) {
                    showError('Service worker registration failed. Installation may not work properly.');
                }
            });
    });
}
