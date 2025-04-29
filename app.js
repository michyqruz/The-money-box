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
        } else {
            elements.androidInstall.classList.remove('hidden');
            elements.iosInstall.classList.add('hidden');
        }
    }
};

// Android PWA installation handling
let deferredPrompt = null;

const setupAndroidInstall = () => {
    // Only proceed if we're not on iOS
    if (isIOS()) return;

    elements.installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.log('No deferred prompt available');
            return;
        }

        try {
            // Show the install prompt
            deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                // Store installation status in localStorage
                localStorage.setItem('pwaInstalled', 'true');
                // Redirect to post-install message
                window.location.href = '/?installed=true';
            } else {
                console.log('User dismissed the install prompt');
            }
        } catch (err) {
            console.error('Error during installation:', err);
        } finally {
            // Clear the deferredPrompt so it can be garbage collected
            deferredPrompt = null;
        }
    });
};

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Update UI to show install is available
    if (!isIOS() && elements.installButton) {
        elements.installButton.style.display = 'block';
    }
});

// Listen for app installation
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // Store installation status
    localStorage.setItem('pwaInstalled', 'true');
    // Redirect to post-install message if not already there
    if (!window.location.href.includes('installed=true')) {
        window.location.href = '/?installed=true';
    }
});

// Check for existing installation
const checkExistingInstallation = () => {
    if (localStorage.getItem('pwaInstalled') {
        window.location.href = '/?installed=true';
    }
};

// iOS Help Overlay functionality
if (elements.showSafariHelp) {
    elements.showSafariHelp.addEventListener('click', () => {
        elements.safariOverlay.classList.remove('hidden');
    });
}

if (document.querySelector('.close-overlay')) {
    document.querySelector('.close-overlay').addEventListener('click', () => {
        elements.safariOverlay.classList.add('hidden');
    });
}

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    checkExistingInstallation();
    initApp();
    setupAndroidInstall();
});

// Additional check when page is shown from back/forward cache
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        initApp();
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered with scope:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update().then(() => {
                        console.log('Checked for service worker update');
                    });
                }, 60 * 60 * 1000); // Check every hour
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}
