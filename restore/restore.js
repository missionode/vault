// restore.js - Logic for restoring local storage data from backup file

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('backup-file-input');
    const restoreBtn = document.getElementById('restore-btn');
    const statusMessage = document.getElementById('status-message');

    // List of specific Local Storage keys used by your application
    // This allows for targeted clearing instead of wiping ALL local storage for the origin.
    const APP_LOCAL_STORAGE_KEYS = [
        'project_app_passwords_vault',
        'project_app_face_descriptor',
        'project_app_face_id_set',
        'project_app_session_expiration',
        'project_app_master_password'
    ];

    // Enable/disable restore button based on file selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            restoreBtn.disabled = false;
            restoreBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            restoreBtn.disabled = true;
            restoreBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        statusMessage.textContent = ''; // Clear previous messages
    });

    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
            const file = fileInput.files[0];

            if (!file) {
                statusMessage.textContent = 'Please select a backup file first.';
                statusMessage.style.color = 'red';
                return;
            }

            if (file.type !== 'application/json') {
                statusMessage.textContent = 'Invalid file type. Please select a .json file.';
                statusMessage.style.color = 'red';
                return;
            }

            // Confirm with the user before proceeding, as this overwrites data
            if (!confirm('WARNING: Are you sure you want to restore? This will OVERWRITE your current application data with the data from the backup file.')) {
                statusMessage.textContent = 'Restore cancelled by user.';
                statusMessage.style.color = 'orange';
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);

                    // Clear existing relevant application data before restoring
                    APP_LOCAL_STORAGE_KEYS.forEach(key => {
                        localStorage.removeItem(key);
                        console.log(`Cleared key: ${key}`);
                    });

                    // Restore data from the backup file
                    let restoredCount = 0;
                    for (const key in backupData) {
                        if (Object.prototype.hasOwnProperty.call(backupData, key)) {
                            localStorage.setItem(key, backupData[key]);
                            restoredCount++;
                            console.log(`Restored: ${key} = ${backupData[key].substring(0, 50)}...`); // Log partial value
                        }
                    }

                    statusMessage.textContent = `Successfully restored ${restoredCount} items from backup!`;
                    statusMessage.style.color = 'green';
                    alert('Data restored successfully! You may need to re-authenticate or go to the vault.');

                    // Suggest next steps to the user
                    setTimeout(() => {
                        statusMessage.textContent += ' Redirecting to Face Scan page for re-authentication...';
                        window.location.href = '../scanface/scanface.html'; // Recommend re-authentication
                    }, 2000); // Redirect after a short delay

                } catch (e) {
                    console.error('Error parsing JSON or restoring data:', e);
                    statusMessage.textContent = 'Error: Invalid backup file format or data. Please ensure it\'s a valid JSON backup.';
                    statusMessage.style.color = 'red';
                }
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                statusMessage.textContent = 'Error reading file. Please try again.';
                statusMessage.style.color = 'red';
            };

            // Read the file as text
            reader.readAsText(file);
        });
    }
});