# vault

## Overview
This is a browser-based Vault application built using HTML, CSS (with Tailwind CSS), and Vanilla JavaScript. It includes a secure vault feature that leverages local storage for data persistence and a simulated biometric (face) authentication system for access control. The application is designed to be easily deployable and manageable, with each major page residing in its own dedicated folder.

## Features
This Vault application currently implements the following key functionalities:

Splash Page (index.html): A simple entry point that redirects users to the main landing page.

Landing Page (landing/landing.html):

Allows users to set an initial project password (master password).

Includes options for downloading a backup of local storage data and restoring data from a backup.

Redirects to the Face ID setup if a master password is already set.

Face ID Setup (createfaceid/createfaceid.html):

Captures and stores a unique face descriptor using face-api.js for biometric authentication.

Prompts the user to set a project master password (required for updating Face ID later).

Redirects to the Face Scan/Verification page upon successful setup.

Face Verification (scanface/scanface.html):

Compares the current user's face with the stored face descriptor using face-api.js.

Grants access to the secure vault and initiates a session countdown upon successful verification.

Redirects to the Face ID setup page if no face data is found or verification fails.

Secure Vault (vault/vault.html):

Session Management: Restricts access unless a valid, unexpired session is active (set by Face Verification).

Countdown Timer: Displays a real-time countdown to session expiration, automatically redirecting to Face Verification when the session ends.

Password Management: Allows users to:

Store new password entries (name and value).

Edit existing password entries.

Delete password entries.

Search passwords by name or value.

Update Face ID (updateface/updateface.html):

Provides an option to re-capture and update the stored face descriptor.

Requires the user to enter the project master password for authorization before allowing the update.

Backup Data (backup/backup.html):

Allows users to download a .json file containing all application-specific data stored in their browser's local storage.

**Restore Data (restore/restore.html):

Enables users to upload a previously downloaded .json backup file.

Overwrites existing application data in local storage with the content of the backup file.

Technology Stack
Frontend: HTML5, CSS3, Vanilla JavaScript

Styling Framework: Tailwind CSS (via CDN) for modern, minimalist, and responsive design.

Face Recognition: face-api.js (built on TensorFlow.js) for client-side face detection, landmark detection, and descriptor generation/comparison.

Data Storage: Browser's localStorage for all application data (passwords, face descriptors, session info).

Getting Started
Follow these steps to set up and run the project locally.

## Prerequisites
A web server (e.g., MAMP, XAMPP, Python's http.server, Node.js serve package). This is crucial because webcams and face-api.js models often require a server environment due to security restrictions (CORS, file access).

A modern web browser.

## Setup Steps
Clone or Download the Project:
(If you have a Git repository, use git clone <repo_url>)
Otherwise, download the project files and place them in your web server's document root (e.g., /Applications/MAMP/htdocs/ for MAMP).

Download face-api.js Models:
face-api.js requires pre-trained models.

Go to the face-api.js GitHub repository's weights folder (or a known CDN that hosts them).

Download the following model files (and their associated .bin shards):

tiny_face_detector_model-weights_manifest.json

face_landmark_68_model-weights_manifest.json

face_recognition_model-weights_manifest.json

Create a folder named models at the root of your project directory (e.g., vault_app/models/).

Place all the downloaded .json and .bin files into this models folder.

Start Your Web Server:
Ensure your web server (e.g., MAMP) is running.

Access the Application:
Open your web browser and navigate to the application's root URL.

If using MAMP, it might be something like: http://localhost:8888/your_project_folder_name/

The index.html will automatically redirect you to landing/landing.html.

## Project Structure
vault_app/
├── index.html                  (Splash page, redirects to landing)
├── models/                     (Contains face-api.js model weights)
│   ├── tiny_face_detector_model-weights_manifest.json
│   ├── tiny_face_detector_model-shard1
│   ├── face_landmark_68_model-weights_manifest.json
│   ├── face_landmark_68_model-shard1
│   ├── face_recognition_model-weights_manifest.json
│   └── face_recognition_model-shard1
├── landing/
│   ├── landing.html            (Initial password setup / backup-restore options)
│   ├── landing.js
│   └── landing.css
├── createfaceid/
│   ├── createfaceid.html       (Face ID & Master Password setup)
│   ├── createfaceid.js
│   └── createfaceid.css
├── scanface/
│   ├── scanface.html           (Face verification for login)
│   ├── scanface.js
│   └── scanface.css
├── vault/
│   ├── vault.html              (Secure password management)
│   ├── vault.js
│   └── vault.css
├── updateface/
│   ├── updateface.html         (Update Face ID with password verification)
│   ├── updateface.js
│   └── updateface.css
├── backup/
│   ├── backup.html             (Download Local Storage backup)
│   ├── backup.js
│   └── backup.css
└── restore/
    ├── restore.html            (Upload & restore Local Storage backup)
    ├── restore.js
    └── restore.css


## Usage / How it Works
First Visit: You'll be redirected to landing.html. If no password is set, you'll be prompted to create one. This is the master password for the application.

Face ID Setup: After setting the initial password (or if it's already set), you'll be guided to createfaceid.html to capture your unique face descriptor. This also involves setting a project_app_master_password if not already done.

## Authentication Flow:

To access the vault.html, you must go through scanface.html.

scanface.html will capture your current face and compare it against the stored descriptor.

Upon successful match, a session timer starts, and you are redirected to vault.html.

If verification fails or no face data is found, you'll be redirected back to createfaceid.html.

Vault Access: In vault.html, you can manage your passwords. The countdown timer indicates how much session time remains. When the timer expires, you'll be redirected back to scanface.html for re-authentication.

Updating Face ID: Navigate to updateface.html. You'll need to enter your project master password to authorize and then re-capture your face data.

Backup & Restore: Use backup/backup.html to download your data and restore/restore.html to upload and restore it.

Security Notes (IMPORTANT!)
Local Storage Vulnerabilities: This application uses localStorage for all data persistence, including simulated biometric data (face descriptors) and the master password.

localStorage is not encrypted and is easily accessible via browser developer tools.

It is vulnerable to Cross-Site Scripting (XSS) attacks.

This implementation is for demonstration purposes only and is NOT suitable for storing highly sensitive or production-level data.

Simulated Biometrics: The face recognition feature uses face-api.js for client-side comparison. While robust for a browser environment, it's a simulation of true biometric security.

It does not include liveness detection (preventing someone from holding up a photo).

The comparison is sensitive to environmental changes (lighting, angle) and minor pixel differences.

Master Password: The "project master password" is stored in localStorage in plain text. This is a significant security risk. In a real application, passwords must always be securely hashed and salted, and ideally, managed by a secure backend server.

For a production application, robust security measures, including server-side authentication, encryption, and proper biometric solutions, would be mandatory.

Future Enhancements
Server-Side Backend: Implement a backend server (e.g., Node.js, Python, PHP) to handle secure user authentication, password hashing, and encrypted data storage (e.g., using a database like MongoDB or PostgreSQL).

Enhanced Face Recognition: Integrate more advanced face-api.js features or external biometric APIs for better accuracy, liveness detection, and multiple face support.

## Improved UI/UX:

Add transitions and animations for smoother user experience.

Implement custom modal dialogs instead of alert() and confirm() for better control and aesthetics.

Dark mode toggle.

Data Encryption (Client-Side): For local data, implement client-side encryption (e.g., Web Crypto API) before storing sensitive information in Local Storage, though this still doesn't replace server-side security.

Multi-Factor Authentication (MFA): Add other authentication factors like email OTP or authenticator app codes.

Error Handling and User Feedback: More descriptive and user-friendly error messages and loading indicators.

Responsive Layout Refinements: Further optimize layouts for various screen sizes and orientations.

Core Vault Features: Focus on adding features central to a secure vault (e.g., password generation, breach monitoring integration, organization into categories/folders).