# AI Teacher Classroom

A 3D interactive AI-powered teacher simulation that uses speech recognition and speech synthesis to communicate with users. The AI teacher can respond to voice commands like "Introduce yourself," "Hello teacher," and "Please jump." Built using React, @react-three/fiber for 3D rendering, and speech recognition/synthesis APIs for interaction.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
  - [Commands](#commands)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [License](#license)

---

## Project Overview

The **AI Teacher Classroom** project provides an interactive AI teacher that responds to user commands and performs animations accordingly. Using 3D models and animations, this simulation allows the AI teacher to speak, recognize speech, and perform actions like waving or jumping based on commands.

## Features

- 3D avatar rendered with Three.js using the @react-three/fiber library.
- Voice commands powered by Web Speech API for speech recognition.
- AI teacher can speak with customizable voices using Web Speech Synthesis API.
- Animations for different commands (waving, jumping, idle).
- Real-time transcript display of recognized speech.

## Technologies Used

- **React** with TypeScript for building the UI.
- **@react-three/fiber** and **drei** for 3D rendering and environment.
- **SpeechRecognition API** for recognizing user commands.
- **SpeechSynthesis API** for AI speech output.
- **GLTFLoader** from three.js for loading 3D avatar models.

## Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-teacher-classroom.git
   cd ai-teacher-classroom

2. **Install dependencies:**
    ```bash
    npm install


### Running the Application

1. **Start the development server:**
    ```bash
    npm start

2. **Open your browser and go to http://localhost:3000.**

### Usage Guide
    ```bash
    Commands
    1. Speak Intro: Click "Speak Intro" to have the AI introduce itself.
    2. Start Listening: Click "Start Listening" to activate voice commands.
    
    Available Commands:
    1. Say "Introduce yourself" - The AI teacher will introduce itself.
    2. Say "Hello teacher" - The AI teacher will wave.
    3. Say "Please jump" - The AI teacher will jump.

### Transcript
The recognized speech will be displayed on the screen. You can prompt different commands as listed above to see how the AI responds.

### Project Structure

    ```bash
    📁 ai-teacher-classroom
    ├── 📁 public
    │   ├── 📁 models
    │   │   └── teacher.glb        # GLTF model for AI teacher
    │   └── index.html
    ├── 📁 src
    │   ├── 📁 components
    │   │   └── Classroom.tsx      # Classroom component for 3D rendering and interaction
    │   ├── App.tsx                # Main application file
    │   └── index.tsx              # React entry point
    ├── .gitignore
    ├── README.md
    └── package.json

### Customization
    Change the Avatar Model: Replace teacher.glb in the public/models directory with another GLTF model and update the model path in Classroom.tsx.

    Modify Speech Text: Customize the speakText function in Classroom.tsx to change the text the AI speaks.
    
    Adjust Commands: Add more commands in the startSpeechRecognition function with corresponding animations.

### License
    This project is licensed under the MIT License. See the LICENSE file for more information.

    
    This `README.md` gives a clear overview, setup instructions, and usage details for your project, making it easier for others to understand and use it effectively. Let me know if you'd like to add or modify any section!

