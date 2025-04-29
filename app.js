// DOM elements
const installButton = document.getElementById('installButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const weatherDescriptionElement = document.getElementById('weatherDescription');
const weatherIconElement = document.getElementById('weatherIcon');
const offlineStatusElement = document.getElementById('offlineStatus');

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.style.display = 'block';
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);
  installButton.style.display = 'none';
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installButton.style.display = 'none';
  deferredPrompt = null;
  console.log('PWA installed');
});

// Check if running in standalone mode
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

if (isStandalone()) {
  console.log('Running in standalone mode');
  document.body.classList.add('standalone');
}

// Network status
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  if (navigator.onLine) {
    offlineStatusElement.textContent = 'Online';
    offlineStatusElement.className = 'offline-status online';
    fetchWeather();
  } else {
    offlineStatusElement.textContent = 'Offline';
    offlineStatusElement.className = 'offline-status offline';
  }
}

// Mock weather data
function fetchWeather() {
  setTimeout(() => {
    locationElement.textContent = 'New York, NY';
    temperatureElement.textContent = '72°F';
    weatherDescriptionElement.textContent = 'Sunny';
    weatherIconElement.src = '/sunny.png';
  }, 1000);
}

// Initialize app
updateOnlineStatus();
fetchWeather();

// Service Worker Registration
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
