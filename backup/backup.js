// backup.js - Logic for backing up local storage data

document.addEventListener('DOMContentLoaded', () => {
    const backupBtn = document.getElementById('backup-btn');
    const statusMessage = document.getElementById('status-message');

    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            try {
                // 1. Collect all local storage data
                const localStorageData = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    localStorageData[key] = localStorage.getItem(key);
                }

                // 2. Convert to JSON string
                // Using 2-space indentation for human readability in the backup file
                const jsonString = JSON.stringify(localStorageData, null, 2);

                // 3. Create a Blob from the JSON string
                const blob = new Blob([jsonString], { type: 'application/json' });

                // 4. Create a download link
                const url = URL.createObjectURL(blob);

                // 5. Generate a filename with a timestamp
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const filename = `vault_${year}-${month}-${day}_${hours}${minutes}${seconds}.json`;

                // 6. Create a temporary anchor element and trigger download
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a); // Append to body is good practice for some browsers
                a.click(); // Programmatically click the link to trigger download
                document.body.removeChild(a); // Clean up the temporary element

                // 7. Revoke the object URL to free up memory
                URL.revokeObjectURL(url);

                statusMessage.textContent = `Backup "${filename}" downloaded successfully!`;
                statusMessage.style.color = 'green';
                console.log('Local Storage backup initiated and downloaded.');

            } catch (error) {
                console.error('Error creating local storage backup:', error);
                statusMessage.textContent = 'Error creating backup. Check console for details.';
                statusMessage.style.color = 'red';
                alert('Failed to create backup. See console for details.');
            }
        });
    }
});