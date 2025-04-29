// Check if running as PWA
function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// Install PWA functionality
let deferredPrompt;
const installButton = document.getElementById('installButton');
const pwaWarning = document.getElementById('pwaWarning');
const appFunctionality = document.getElementById('appFunctionality');

// Check on load
window.addEventListener('load', () => {
  if (isRunningAsPWA()) {
    // Running as PWA - show app content
    pwaWarning.style.display = 'none';
    appFunctionality.innerHTML = `
      <h2>App Content</h2>
      <p>Welcome to the installed PWA version!</p>
      <p>This content only appears when installed.</p>
    `;
  } else {
    // Not installed - show warning
    pwaWarning.style.display = 'block';
  }
});

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install button
  installButton.style.display = 'inline-block';
});

// Install button click handler
installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
  }
  
  // We've used the prompt, and can't use it again, throw it away
  deferredPrompt = null;
});

// Track when PWA is successfully installed
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  // Hide the install button
  installButton.style.display = 'none';
  // Show the app content
  pwaWarning.style.display = 'none';
  appFunctionality.innerHTML = `
    <h2>App Content</h2>
    <p>Thank you for installing!</p>
    <p>This content only appears when installed.</p>
  `;
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}
