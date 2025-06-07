// scanface.js - UPDATED TO SET SESSION EXPIRATION

// Main initialization function for the scanface page
async function initializeScanFacePage() {
    const videoFeed = document.getElementById('video-feed');
    const verifyFaceBtn = document.getElementById('verify-face-btn');
    const statusMessage = document.getElementById('status-message');

    const LOCAL_STORAGE_FACE_DESCRIPTOR_KEY = 'project_app_face_descriptor';
    // NEW: Key for storing the session expiration timestamp
    const LOCAL_STORAGE_SESSION_EXPIRATION_KEY = 'project_app_session_expiration'; 
    const FACE_MATCH_THRESHOLD = 0.6; // Lower value = stricter match (0.0 to 1.0)
    // NEW: Session duration (e.g., 5 minutes) in milliseconds
    const SESSION_DURATION_MS = 5 * 60 * 1000; 

    let mediaStream = null;
    let modelsLoaded = false;

    // Define the path to your models folder
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
        } catch (error) {
            console.error('Error loading models:', error);
            statusMessage.textContent = 'Error loading models. Please check console.';
            alert('Failed to load face detection models. See console for details.');
            verifyFaceBtn.disabled = true;
            verifyFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Initializes the camera feed.
     */
    async function startCamera() {
        if (!modelsLoaded) {
            statusMessage.textContent = 'Waiting for models to load...';
            return;
        }

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoFeed.srcObject = mediaStream;
            videoFeed.onloadedmetadata = () => {
                videoFeed.play();
                statusMessage.textContent = 'Camera ready. Position your face and click "Verify Face".';
                verifyFaceBtn.disabled = false;
                verifyFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            statusMessage.textContent = 'Error: Could not access camera. Please allow camera permissions.';
            verifyFaceBtn.disabled = true;
            verifyFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');
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
     * Captures current face data and compares its descriptor to the stored one.
     * Redirects based on comparison result.
     */
    async function captureAndCompareFaceDescriptor() {
        if (!modelsLoaded) {
            alert('Models are not loaded yet. Please wait.');
            return;
        }

        statusMessage.textContent = 'Analyzing face for verification...';
        verifyFaceBtn.disabled = true;
        verifyFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');

        const storedDescriptorString = localStorage.getItem(LOCAL_STORAGE_FACE_DESCRIPTOR_KEY);

        if (!storedDescriptorString) {
            statusMessage.textContent = 'No Face ID found. Please create one first.';
            alert('No Face ID detected. Redirecting to setup.');
            stopCamera();
            redirectToCreateFaceIDPage();
            return;
        }

        let storedDescriptor;
        try {
            storedDescriptor = new Float32Array(JSON.parse(storedDescriptorString));
        } catch (e) {
            console.error("Error parsing stored face descriptor:", e);
            statusMessage.textContent = 'Error with stored Face ID data. Please create a new one.';
            alert('Corrupted Face ID data. Redirecting to setup.');
            stopCamera();
            redirectToCreateFaceIDPage();
            return;
        }

        const detections = await faceapi.detectSingleFace(videoFeed, new faceapi.TinyFaceDetectorOptions())
                                        .withFaceLandmarks()
                                        .withFaceDescriptor();

        if (detections && detections.descriptor) {
            const currentDescriptor = detections.descriptor;
            const distance = faceapi.euclideanDistance(storedDescriptor, currentDescriptor);

            setTimeout(() => {
                if (distance < FACE_MATCH_THRESHOLD) {
                    // Match successful
                    statusMessage.textContent = `Face ID verified! Distance: ${distance.toFixed(2)}`;
                    alert('Verification successful! Redirecting to Vault.');

                    // ***** NEW CODE HERE: SET SESSION EXPIRATION *****
                    const expirationTime = Date.now() + SESSION_DURATION_MS;
                    localStorage.setItem(LOCAL_STORAGE_SESSION_EXPIRATION_KEY, expirationTime.toString());
                    console.log(`Session set to expire at: ${new Date(expirationTime).toLocaleTimeString()}`);
                    // *************************************************

                    stopCamera();
                    redirectToVaultPage();
                } else {
                    // No match
                    statusMessage.textContent = `Verification failed. Distance: ${distance.toFixed(2)}. Please try again.`;
                    alert('Verification failed. Try again or set a new Face ID.');
                    verifyFaceBtn.disabled = false;
                    verifyFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }, 1000); // Short delay for user to see message
        } else {
            statusMessage.textContent = 'No face detected for verification. Please ensure your face is clearly visible.';
            alert('Face not detected. Please try again.');
            verifyFaceBtn.disabled = false;
            verifyFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Redirects the user to the vault.html page.
     */
    function redirectToVaultPage() {
        window.location.href = '../vault/vault.html';
    }

    /**
     * Redirects the user to the createfaceid.html page.
     */
    function redirectToCreateFaceIDPage() {
        window.location.href = '../createfaceid/createfaceid.html';
    }

    // --- allFunctionsCalledOnLoad ---
    /**
     * Initial setup for the scanface page.
     */
    async function preflightCheckAndSetup() {
        await loadModels(); // Load models first
        startCamera();
    }

    // Event Listener
    verifyFaceBtn.addEventListener('click', captureAndCompareFaceDescriptor);

    // Call the initial setup function
    preflightCheckAndSetup();

    // Ensure camera is stopped if the user navigates away or closes the tab
    window.addEventListener('beforeunload', stopCamera);
}

// Call the main initialization function
initializeScanFacePage();