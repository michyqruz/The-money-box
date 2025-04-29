let installPrompt;

// Listen for the browser's "you can install this app" event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the automatic prompt
  e.preventDefault();
  // Save the event for later
  installPrompt = e;
  // Show our install button
  document.getElementById('installButton').style.display = 'block';
});

// When install button is clicked
document.getElementById('installButton').addEventListener('click', async () => {
  if (!installPrompt) return;
  
  // Show the installation prompt
  installPrompt.prompt();
  
  // Wait for user to respond
  const { outcome } = await installPrompt.userChoice;
  
  // Hide our button after install
  if (outcome === 'accepted') {
    document.getElementById('installButton').style.display = 'none';
  }
  
  // Clear the saved prompt
  installPrompt = null;
});

// Hide button if already installed
window.addEventListener('appinstalled', () => {
  document.getElementById('installButton').style.display = 'none';
});

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
