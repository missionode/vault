// landing.js

// Using a function for all initialization to ensure clear execution flow
function initializeLandingPage() {
    const passwordSetupSection = document.getElementById('password-setup-section');
    const dataManagementSection = document.getElementById('data-management-section');
    const setPasswordBtn = document.getElementById('set-password-btn');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordError = document.getElementById('password-error');
    const downloadBackupBtn = document.getElementById('download-backup-btn');
    const restoreDataBtn = document.getElementById('restore-data-btn');

    const LOCAL_STORAGE_PASSWORD_KEY = 'project_app_password'; // Key for local storage

    /**
     * Checks if a password is already set in local storage.
     * @returns {boolean} True if a password exists, false otherwise.
     */
    function hasPasswordSet() {
        return localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY) !== null;
    }

    /**
     * Handles setting the user's password.
     */
    function setPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password.length < 6) { // Simple validation: password must be at least 6 characters
            passwordError.textContent = 'Password must be at least 6 characters long.';
            passwordError.classList.remove('hidden');
            return;
        }

        if (password !== confirmPassword) {
            passwordError.textContent = 'Passwords do not match!';
            passwordError.classList.remove('hidden');
            return;
        }

        // Store the password securely (in a real app, this would be hashed on a server)
        // For local storage, we'll store it directly as per requirement.
        localStorage.setItem(LOCAL_STORAGE_PASSWORD_KEY, password);
        passwordError.classList.add('hidden');
        alert('Password set successfully!');
        redirectToFaceIDPage();
    }

    /**
     * Redirects the user to the createfaceid.html page.
     */
    function redirectToFaceIDPage() {
        window.location.href = '../createfaceid/createfaceid.html'; // Assuming createfaceid.html is in the root as discussed
    }

    /**
     * Handles the download backup functionality.
     */
    function downloadBackup() {
        alert('Download Backup functionality will be implemented later.');
        // In a real app, this would serialize local storage data and initiate a download.
    }

    /**
     * Handles the restore data functionality.
     */
    function restoreData() {
        alert('Restore Data functionality will be implemented later.');
        // In a real app, this would parse an uploaded file and populate local storage.
    }

    //# allFunctionsCalledOnLoad
    /**
     * Initial preflight check and UI setup on page load.
     */
    function preflightCheckAndSetup() {
        if (hasPasswordSet()) {
            console.log('Password already set. Redirecting...');
            redirectToFaceIDPage();
        } else {
            console.log('No password set. Displaying password setup.');
            passwordSetupSection.classList.remove('hidden');
            dataManagementSection.classList.add('hidden'); // Ensure data management is hidden
        }
    }

    // Event Listeners
    setPasswordBtn.addEventListener('click', setPassword);
    downloadBackupBtn.addEventListener('click', downloadBackup);
    restoreDataBtn.addEventListener('click', restoreData);

    // Call the initial setup function when the script loads
    preflightCheckAndSetup();
}

// Call the main initialization function
initializeLandingPage();