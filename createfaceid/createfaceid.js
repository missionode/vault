// createfaceid.js - UPDATED FOR FACE-API.JS

// Main initialization function for the createfaceid page
async function initializeFaceIDPage() { // Changed to async as model loading is asynchronous
    const videoFeed = document.getElementById('video-feed');
    const captureFaceBtn = document.getElementById('capture-face-btn'); // Renamed button ID
    const statusMessage = document.getElementById('status-message');

    const LOCAL_STORAGE_FACE_ID_FLAG_KEY = 'project_app_face_id_set';
    const LOCAL_STORAGE_FACE_DESCRIPTOR_KEY = 'project_app_face_descriptor'; // New key for the descriptor

    let mediaStream = null;
    let modelsLoaded = false; // Flag to track if models are loaded

    // Define the path to your models folder
    // Make sure you have downloaded the models and placed them in a 'models' folder at your project root.
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
            // Disable button if models fail to load
            captureFaceBtn.disabled = true;
            captureFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');
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
                statusMessage.textContent = 'Camera ready. Position your face and click "Capture Face ID".';
                captureFaceBtn.disabled = false;
                captureFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            };
        } catch (error) {
            console.error('Error accessing camera:', error);
            statusMessage.textContent = 'Error: Could not access camera. Please allow camera permissions.';
            captureFaceBtn.disabled = true;
            captureFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');
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
     * Captures a face descriptor from the video feed and stores it.
     */
    async function captureAndStoreFaceDescriptor() {
        if (!modelsLoaded) {
            alert('Models are not loaded yet. Please wait.');
            return;
        }

        statusMessage.textContent = 'Analyzing face...';
        captureFaceBtn.disabled = true;
        captureFaceBtn.classList.add('opacity-50', 'cursor-not-allowed');

        // Detect all faces in the video feed and compute their descriptors
        // We'll use TinyFaceDetectorOptions for faster detection, suitable for real-time
        const detections = await faceapi.detectSingleFace(videoFeed, new faceapi.TinyFaceDetectorOptions())
                                        .withFaceLandmarks()
                                        .withFaceDescriptor();

        if (detections && detections.descriptor) {
            // Store the descriptor (Float32Array) as a JSON string
            localStorage.setItem(LOCAL_STORAGE_FACE_DESCRIPTOR_KEY, JSON.stringify(Array.from(detections.descriptor)));
            localStorage.setItem(LOCAL_STORAGE_FACE_ID_FLAG_KEY, 'true'); // General flag for vault.js preflight

            statusMessage.textContent = 'Face ID captured successfully! Redirecting for verification...';
            alert('Face ID captured! Now verifying.');

            stopCamera();
            redirectToScanFacePage();
        } else {
            statusMessage.textContent = 'No face detected. Please ensure your face is clearly visible.';
            alert('Face not detected. Please try again.');
            captureFaceBtn.disabled = false;
            captureFaceBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    /**
     * Redirects the user to the scanface.html page for verification.
     */
    function redirectToScanFacePage() {
        window.location.href = '../scanface/scanface.html';
    }

    // --- allFunctionsCalledOnLoad ---
    /**
     * Initial preflight check and UI setup on page load.
     */
    async function preflightCheckAndSetup() {
        await loadModels(); // Load models first

        // If face descriptor data already exists, redirect to scanface.html for verification.
        if (localStorage.getItem(LOCAL_STORAGE_FACE_DESCRIPTOR_KEY)) {
            console.log('Face descriptor data already exists. Redirecting to scanface.html for verification.');
            redirectToScanFacePage();
            return;
        }

        startCamera(); // Start camera only if models are loaded and no redirect
    }

    // Event Listeners
    captureFaceBtn.addEventListener('click', captureAndStoreFaceDescriptor); // Updated button ID

    // Call the initial setup function
    preflightCheckAndSetup();

    // Ensure camera is stopped if the user navigates away or closes the tab
    window.addEventListener('beforeunload', stopCamera);
}

// Call the main initialization function
initializeFaceIDPage();