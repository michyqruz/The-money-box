// Check if the app is running as a PWA
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
}

// Check on page load
window.addEventListener('DOMContentLoaded', () => {
    const installContainer = document.getElementById('installContainer');
    const postInstallMessage = document.getElementById('postInstallMessage');
    const appContent = document.getElementById('appContent');
    
    // Check if the page was loaded as a PWA
    if (isRunningAsPWA()) {
        // Show the actual app content
        installContainer.style.display = 'none';
        postInstallMessage.style.display = 'none';
        appContent.style.display = 'block';
    } else if (new URLSearchParams(window.location.search).has('installed')) {
        // Show post-install message
        installContainer.style.display = 'none';
        postInstallMessage.style.display = 'block';
        appContent.style.display = 'none';
    } else {
        // Show install prompt
        installContainer.style.display = 'block';
        postInstallMessage.style.display = 'none';
        appContent.style.display = 'none';
    }
});

// Handle the install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'block';
        
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    // Redirect to a special URL after installation
                    window.location.href = '/?installed=true';
                }
                
                deferredPrompt = null;
            }
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // You could redirect here if needed
});
