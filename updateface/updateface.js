// updateface.js - Logic for updating face descriptor with password protection

async function initializeUpdateFacePage() {
    const videoFeed = document.getElementById('video-feed');
    const masterPasswordInput = document.getElementById('master-password-input');
    const updateFaceBtn = document.getElementById('update-face-btn');
    const statusMessage = document.getElementById('status-message');

    const LOCAL_STORAGE_FACE_DESCRIPTOR_KEY = 'project_app_face_descriptor';
    // This is the key we'll assume your master password is stored under.
    // If you haven't set this up yet, we'll need to do it in createfaceid.js.
    const LOCAL_STORAGE_MASTER_PASSWORD_KEY = 'project_app_password'; 
    
    let mediaStream = null;
    let modelsLoaded = false;

    // Define the path to your models folder (must be at the project root)
    const MODEL_URL = '/models'; 

    /**
     * Loads face-api.js models.
     */
    async function loadModels() {
        statusMessage.textContent = 'Loading face detection models...';
        try {
            await faceapi.nets.tinyFaceDetector.load(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.load(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.load(MODEL_URL);
            modelsLoaded = true;
            statusMessage.textContent = 'Models loaded. Accessing camera...';
            console.log('face-api.js models loaded successfully.');
            // Enable button only after models are loaded and camera is ready
            updateFaceBtn.disabled = false;
            updateFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } catch (error) {
            console.error('Error loading models:', error);
            statusMessage.textContent = 'Error loading models. Please check console.';
            alert('Failed to load face detection models. See console for details.');
            updateFaceBtn.disabled = true;
            updateFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Initializes the camera feed.
     */
    async function startCamera() {
        if (!modelsLoaded) { // Ensure models are loaded before starting camera
            statusMessage.textContent = 'Waiting for models to load before starting camera...';
            return;
        }
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoFeed.srcObject = mediaStream;
            videoFeed.onloadedmetadata = () => {
                videoFeed.play();
                statusMessage.textContent = 'Camera ready. Enter password and click button to update.';
                // Button was already enabled by loadModels, this ensures it stays enabled
                updateFaceBtn.disabled = false; 
                updateFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            statusMessage.textContent = 'Error: Could not access camera. Please allow camera permissions.';
            updateFaceBtn.disabled = true;
            updateFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Stops the camera feed.
     */
    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            videoFeed.srcObject = null;
        }
    }

    /**
     * Handles the update face descriptor process, including password verification.
     */
    async function handleFaceUpdate() {
        if (!modelsLoaded) {
            alert('Models are not loaded yet. Please wait.');
            return;
        }

        const enteredPassword = masterPasswordInput.value.trim();
        const storedMasterPassword = localStorage.getItem(LOCAL_STORAGE_MASTER_PASSWORD_KEY);

        if (!storedMasterPassword) {
            statusMessage.textContent = 'No master password set. Please set it up first.';
            alert('Error: No master password found. Cannot update Face ID.');
            return;
        }

        if (enteredPassword !== storedMasterPassword) {
            statusMessage.textContent = 'Incorrect password. Please try again.';
            alert('Incorrect password. Face ID update failed.');
            masterPasswordInput.value = ''; // Clear password input
            return;
        }

        // If password is correct, proceed to capture face
        statusMessage.textContent = 'Password correct. Analyzing face for update...';
        updateFaceBtn.disabled = true;
        updateFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');

        try {
            const detections = await faceapi.detectSingleFace(videoFeed, new faceapi.TinyFaceDetectorOptions())
                                            .withFaceLandmarks()
                                            .withFaceDescriptor();

            if (detections && detections.descriptor) {
                const newDescriptor = detections.descriptor;
                localStorage.setItem(LOCAL_STORAGE_FACE_DESCRIPTOR_KEY, JSON.stringify(Array.from(newDescriptor)));
                
                // Set the Face ID flag to true (if not already set by createfaceid.js)
                // This ensures that the system knows Face ID has been configured.
                localStorage.setItem('project_app_face_id_set', 'true'); 

                statusMessage.textContent = 'Face ID updated successfully!';
                alert('Face ID has been successfully updated. Redirecting to vault.');
                stopCamera();
                redirectToVaultPage();
            } else {
                statusMessage.textContent = 'No face detected. Please ensure your face is clearly visible.';
                alert('Face not detected. Please try again.');
                updateFaceBtn.disabled = false;
                updateFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } catch (error) {
            console.error('Error during face detection/update:', error);
            statusMessage.textContent = 'An error occurred during face update. Check console.';
            alert('An error occurred during face update. See console for details.');
            updateFaceBtn.disabled = false;
            updateFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Redirects the user to the vault.html page.
     */
    function redirectToVaultPage() {
        window.location.href = '../vault/vault.html';
    }

    // --- Initial Setup ---
    async function preflightCheckAndSetup() {
        await loadModels(); // Load models first
        startCamera(); // Then start camera
    }

    // Event Listeners
    updateFaceBtn.addEventListener('click', handleFaceUpdate);

    // Call the initial setup function
    preflightCheckAndSetup();

    // Ensure camera is stopped if the user navigates away or closes the tab
    window.addEventListener('beforeunload', stopCamera);
}

// Call the main initialization function
initializeUpdateFacePage();