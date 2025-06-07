// vault.js - UPDATED FOR SESSION MANAGEMENT AND COUNTDOWN TIMER

// Function to generate a simple unique ID (kept from your original file)
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Main initialization function for the vault page
function initializeVaultPage() {
    // DOM Elements (kept from your original file)
    const newPasswordNameInput = document.getElementById('new-password-name');
    const newPasswordValueInput = document.getElementById('new-password-value');
    const addPasswordBtn = document.getElementById('add-password-btn');
    const searchInput = document.getElementById('search-input');
    const passwordList = document.getElementById('password-list');
    const editModal = document.getElementById('edit-modal');
    const editPasswordIdInput = document.getElementById('edit-password-id');
    const editPasswordNameInput = document.getElementById('edit-password-name');
    const editPasswordValueInput = document.getElementById('edit-password-value');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // New/Updated DOM Elements for session message and logout
    const vaultMessageElement = document.getElementById('vault-content-message');
    const countdownTimerElement = document.getElementById('countdown-timer'); // NEW: Get the countdown span
    const logoutBtn = document.getElementById('logout-btn');

    console.log("Vault Message Element:", vaultMessageElement);
    console.log("Countdown Timer Element:", countdownTimerElement);


    const LOCAL_STORAGE_VAULT_KEY = 'project_app_passwords_vault';
    // NEW: Key for storing the session expiration timestamp
    const LOCAL_STORAGE_SESSION_EXPIRATION_KEY = 'project_app_session_expiration'; 
    
    // OLD: This flag is no longer directly used for authentication gatekeeping by vault.js
    // as we now use the session expiration timestamp.
    // const LOCAL_STORAGE_FACE_ID_KEY = 'project_app_face_id_set'; 

    let passwords = []; // Array to hold all password objects
    let countdownInterval; // To store the interval ID for clearing

    /**
     * Redirects the user to the scanface.html page.
     */
    function redirectToScanFacePage() {
        // Adjust path based on relative location: from vault/ to scanface/
        window.location.href = '../scanface/scanface.html';
    }

    /**
     * Starts the countdown timer and updates the display.
     */
    function startCountdownTimer(expirationTimestamp) {
        clearInterval(countdownInterval); // Clear any existing timer

        const updateTimer = () => {
            const currentTime = Date.now();
            const timeRemaining = expirationTimestamp - currentTime;

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                vaultMessageElement.textContent = 'Session expired. Redirecting...';
                localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRATION_KEY); // Clean up expired session
                redirectToScanFacePage();
                return;
            }

            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            countdownTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        countdownInterval = setInterval(updateTimer, 1000); // Update every second
        updateTimer(); // Call immediately to avoid 1-second delay on first display
    }

    /**
     * Checks if the session is valid and redirects if not.
     * This replaces the old preflightCheckForFaceID.
     * @returns {boolean} True if redirection happened, false otherwise.
     */
    function preflightCheckForSession() {
        const sessionExpiration = localStorage.getItem(LOCAL_STORAGE_SESSION_EXPIRATION_KEY);
        const currentTime = Date.now(); // Current time in milliseconds

        if (!sessionExpiration || currentTime >= parseInt(sessionExpiration, 10)) {
            console.log('Session expired or not found. Redirecting to Face Scan for re-authentication.');
            localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRATION_KEY); // Clean up expired/invalid session
            
            // Redirect to scanface.html (assuming relative path from vault/ to scanface/)
            redirectToScanFacePage();
            return true; // Indicate that redirection happened
        }
        
        // Session is valid, start the countdown
        console.log('Session valid. Displaying vault content and starting timer.');
        if (vaultMessageElement && countdownTimerElement) {
            // // REMOVE OR COMMENT OUT THIS LINE:
            // vaultMessageElement.innerHTML = `Welcome to your secure vault! Session expires in: <span id="countdown-timer" class="font-bold text-red-600"></span>`;
            // // No need to get a fresh reference; the original countdownTimerElement is valid
            // // if you don't re-set the parent's innerHTML.
            // const currentCountdownElement = document.getElementById('countdown-timer'); 
            // if (currentCountdownElement) {
            //     countdownTimerElement.textContent = `...`; // Placeholder
            //     startCountdownTimer(parseInt(sessionExpiration, 10)); // Start the timer
            // }

            // CORRECTED LOGIC: Only update the countdownTimerElement's text and start timer
            countdownTimerElement.textContent = '...'; // Initial placeholder, will be immediately updated by startCountdownTimer
            startCountdownTimer(parseInt(sessionExpiration, 10)); 
        }
        return false; // Indicate no redirection
    }

    /**
     * Loads passwords from Local Storage.
     * @returns {Array} An array of password objects.
     */
    function loadPasswordsFromLocalStorage() {
        const storedPasswords = localStorage.getItem(LOCAL_STORAGE_VAULT_KEY);
        try {
            return storedPasswords ? JSON.parse(storedPasswords) : [];
        } catch (e) {
            console.error("Error parsing passwords from Local Storage:", e);
            return []; // Return empty array on error
        }
    }

    /**
     * Saves the current passwords array to Local Storage.
     */
    function savePasswordsToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_VAULT_KEY, JSON.stringify(passwords));
    }

    /**
     * Renders the list of passwords to the UI.
     * @param {Array} [passwordsToRender=passwords] - The array of passwords to display. Defaults to all passwords.
     */
    function renderPasswordList(passwordsToRender = passwords) {
        passwordList.innerHTML = ''; // Clear existing list

        if (passwordsToRender.length === 0) {
            const noPasswordsMessage = document.createElement('li');
            noPasswordsMessage.className = 'text-center text-gray-500 py-4';
            noPasswordsMessage.textContent = 'No passwords stored yet. Add one above!';
            passwordList.appendChild(noPasswordsMessage);
            return;
        }

        passwordsToRender.forEach(pwd => {
            const listItem = document.createElement('li');
            listItem.id = `pwd-${pwd.id}`; // Unique ID for the list item
            listItem.className = 'flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-400';

            listItem.innerHTML = `
                <div class="flex-grow mb-2 md:mb-0 md:mr-4">
                    <p class="font-semibold text-lg text-gray-800">${pwd.name}</p>
                    <p class="text-gray-600 truncate">${pwd.password}</p>
                </div>
                <div class="flex space-x-2">
                    <button data-id="${pwd.id}" class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">
                        Edit
                    </button>
                    <button data-id="${pwd.id}" class="delete-btn bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline">
                        Delete
                    </button>
                </div>
            `;
            passwordList.appendChild(listItem);
        });

        // Attach event listeners to newly created buttons
        attachPasswordButtonListeners();
    }

    /**
     * Attaches event listeners to edit and delete buttons after rendering.
     */
    function attachPasswordButtonListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = (e) => openEditModal(e.target.dataset.id);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.onclick = (e) => deletePassword(e.target.dataset.id);
        });
    }

    /**
     * Adds a new password entry to the vault.
     */
    function addPassword() {
        const name = newPasswordNameInput.value.trim();
        const value = newPasswordValueInput.value.trim();

        if (!name || !value) {
            alert('Password name and value cannot be empty!');
            return;
        }

        const newPassword = {
            id: generateUniqueId(),
            name: name,
            password: value
        };

        passwords.push(newPassword);
        savePasswordsToLocalStorage();
        renderPasswordList(); // Re-render the full list to show the new entry
        newPasswordNameInput.value = ''; // Clear inputs
        newPasswordValueInput.value = '';
        alert('Password added successfully!');
    }

    /**
     * Opens the edit modal and populates it with data of the selected password.
     * @param {string} id - The ID of the password to edit.
     */
    function openEditModal(id) {
        const pwd = passwords.find(p => p.id === id);
        if (pwd) {
            editPasswordIdInput.value = pwd.id;
            editPasswordNameInput.value = pwd.name;
            editPasswordValueInput.value = pwd.password;
            editModal.classList.remove('hidden');
        }
    }

    /**
     * Saves the changes made in the edit modal to the corresponding password entry.
     */
    function saveEditedPassword() {
        const id = editPasswordIdInput.value;
        const newName = editPasswordNameInput.value.trim();
        const newValue = editPasswordValueInput.value.trim();

        if (!newName || !newValue) {
            alert('Password name and value cannot be empty!');
            return;
        }

        const index = passwords.findIndex(p => p.id === id);
        if (index !== -1) {
            passwords[index].name = newName;
            passwords[index].password = newValue;
            savePasswordsToLocalStorage();
            renderPasswordList(); // Re-render the list with updated data
            closeEditModal();
            alert('Password updated successfully!');
        }
    }

    /**
     * Closes the edit modal.
     */
    function closeEditModal() {
        editModal.classList.add('hidden');
    }

    /**
     * Deletes a password entry after user confirmation.
     * @param {string} id - The ID of the password to delete.
     */
    function deletePassword(id) {
        if (confirm('Are you sure you want to delete this password?')) {
            passwords = passwords.filter(p => p.id !== id);
            savePasswordsToLocalStorage();
            renderPasswordList(); // Re-render the list without the deleted entry
            alert('Password deleted successfully!');
        }
    }

    /**
     * Filters and displays passwords based on the search input.
     */
    function searchPasswords() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            renderPasswordList(); // Show all passwords if search box is empty
            return;
        }

        const filteredPasswords = passwords.filter(pwd =>
            pwd.name.toLowerCase().includes(searchTerm) ||
            pwd.password.toLowerCase().includes(searchTerm)
        );
        renderPasswordList(filteredPasswords);
    }

    //# allFunctionsCalledOnLoad
    /**
     * Initial setup and checks performed when the vault page loads.
     */
    function preflightCheckAndSetup() {
        // IMPORTANT: Perform session check BEFORE attempting to load or display vault data
        if (preflightCheckForSession()) {
            return; // Stop further execution if a redirection occurred
        }

        // Only load and render passwords if the session is valid
        passwords = loadPasswordsFromLocalStorage();
        renderPasswordList();
    }

    // Event Listeners
    addPasswordBtn.addEventListener('click', addPassword);
    saveEditBtn.addEventListener('click', saveEditedPassword);
    cancelEditBtn.addEventListener('click', closeEditModal);
    searchInput.addEventListener('input', searchPasswords); 
    
    // Event listener for the new logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearInterval(countdownInterval); // NEW: Clear the timer on manual logout
            localStorage.removeItem(LOCAL_STORAGE_SESSION_EXPIRATION_KEY); // Clear the session
            alert('You have been logged out.');
            redirectToScanFacePage();
        });
    }

    // Call the initial setup function to kickstart the page
    preflightCheckAndSetup();
}

// Call the main initialization function when the script loads
// This ensures that the page starts processing its logic immediately.
initializeVaultPage();