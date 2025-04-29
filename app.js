// ==============================================
// PWA Installation Controller (iOS & Android)
// ==============================================

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    this.isAndroid = /Android/i.test(navigator.userAgent);
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://');
    
    this.init();
  }

  async init() {
    await this.registerServiceWorker();
    this.setupUI();
    this.setupEventListeners();
    
    if (this.isStandalone) {
      this.showAppContent();
    }
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('sw.js');
        console.log('ServiceWorker registered:', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          console.log('New service worker version found');
        });
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  // UI Setup
  setupUI() {
    if (this.isStandalone) return;
    
    if (this.isAndroid) {
      document.getElementById('androidInstall').style.display = 'block';
      document.getElementById('installButton').style.display = 'none'; // Hide until prompt
    } else if (this.isIOS) {
      document.getElementById('iosInstall').style.display = 'block';
      this.setupIOSHelpers();
    }
  }

  // iOS Specific Helpers
  setupIOSHelpers() {
    // Add visual cues for iOS installation
    const iosHelpBtn = document.getElementById('showSafariHelp');
    if (iosHelpBtn) {
      iosHelpBtn.addEventListener('click', () => {
        document.getElementById('safariOverlay').style.display = 'flex';
      });
    }
    
    document.querySelector('.close-overlay')?.addEventListener('click', () => {
      document.getElementById('safariOverlay').style.display = 'none';
    });
  }

  // Event Listeners
  setupEventListeners() {
    // Android Installation
    if (this.isAndroid) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        document.getElementById('installButton').style.display = 'block';
        
        document.getElementById('installButton').addEventListener('click', async () => {
          if (!this.deferredPrompt) return;
          
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          
          if (outcome === 'accepted') {
            window.location.href = 'index.html?installed=true';
          }
          
          this.deferredPrompt = null;
        });
      });
    }

    // Post-installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.showPostInstallMessage();
    });
  }

  // UI States
  showAppContent() {
    document.getElementById('installPrompt').style.display = 'none';
    document.getElementById('postInstall').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
  }

  showPostInstallMessage() {
    document.getElementById('installPrompt').style.display = 'none';
    document.getElementById('postInstall').style.display = 'block';
    document.getElementById('appContent').style.display = 'none';
  }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new PWAInstaller();
});
