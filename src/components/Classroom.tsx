import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Environment, PerspectiveCamera } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { AnimationMixer } from "three";
import * as THREE from "three";

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const Classroom = () => {
  const avatarRef = useRef<any>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [animationType, setAnimationType] = useState("idle");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [transcript, setTranscript] = useState("");
  const [spokenText, setSpokenText] = useState(""); // New state to track spoken text
  const mixerRef = useRef<AnimationMixer | null>(null);
  const avatar: any = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + "/models/old_teacher.glb"
  );

  // Use refs for movement control
  const movementRef = useRef({ x: 0 });
  const [isMoving, setIsMoving] = useState(false); // Track if movement is happening

  const [canvasWidth, setCanvasWidth] = useState(0); // Track canvas width dynamically
  const avatarWidth = 2; // Assume avatar width is 2 units (you can adjust this if needed)

  useEffect(() => {
    // Dynamically update canvas width on window resize
    const handleResize = () => {
      setCanvasWidth(window.innerWidth); // Update canvas width based on window size
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set the width

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Define boundaries for movement (left and right constraints)
  const minX = -(canvasWidth / 2 - avatarWidth); // Minimum X position (left boundary)
  const maxX = canvasWidth / 2 - avatarWidth; // Maximum X position (right boundary)

  const moveAvatar = (direction: string) => {
    if (isMoving) return; // Prevent moving if already moving

    setIsMoving(true); // Set moving state to true

    if (direction === "left") {
      movementRef.current.x = -2; // Move 2 units left
    } else if (direction === "right") {
      movementRef.current.x = 2; // Move 2 units right
    } else if (direction === "jump") {
      setAnimationType("Jump");
      setTimeout(() => setAnimationType("idle"), 2000);
    }

    // Stop the movement after a short delay to prevent continuous movement
    setTimeout(() => {
      movementRef.current.x = 0; // Reset movement direction after 2 seconds
      setIsMoving(false);
      setTranscript("");
    }, 3000); // Adjust delay as needed
  };

  const startSpeechRecognition = () => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        setTranscript(speechResult);

        if (speechResult.includes("introduce yourself")) {
          speakText(
            "Hello, I am your AI teacher. Let's learn something new today!"
          );
        } else if (speechResult.includes("hello teacher")) {
          setAnimationType("wave");
          speakText("Hello there!");
          setTimeout(() => setAnimationType("idle"), 5000);
        } else if (speechResult.includes("jump")) {
          moveAvatar("jump");
        } else if (speechResult.includes("move left")) {
          moveAvatar("left");
        } else if (speechResult.includes("move right")) {
          moveAvatar("right");
        }
      };
      recognition.start();
    } else {
      console.log("Speech recognition is not supported in this browser.");
    }
  };

  const speakText = (text: string) => {
    if (isSpeaking) return;
  
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[0] || null;
  
      const words = text.split(" ");
      const wordDurations = words.map((word) => 250 + word.length * 50); // Adjust durations based on word length
  
      utterance.onstart = () => {
        setIsSpeaking(true);
        setTranscript(text);
        setSpokenText("");
  
        // Schedule morph target changes for each word
        let cumulativeDelay = 0;
        words.forEach((word, index) => {
          const wordDelay = cumulativeDelay;
          cumulativeDelay += wordDurations[index];
  
          setTimeout(() => {
            if (avatar && avatar.nodes && avatar.nodes.Wolf3D_Head001) {
              avatar.nodes.Wolf3D_Head001.morphTargetInfluences[0] = 1.0; // Open mouth
              avatar.nodes.Wolf3D_Head001.morphTargetInfluences[1] = Math.random() * 0.4 + 0.3;
            }
  
            setTimeout(() => {
              if (avatar && avatar.nodes && avatar.nodes.Wolf3D_Head001) {
                avatar.nodes.Wolf3D_Head001.morphTargetInfluences[0] = 0;
                avatar.nodes.Wolf3D_Head001.morphTargetInfluences[1] = 0;
              }
            }, wordDurations[index] / 1.5);
          }, wordDelay);
        });
      };
  
      utterance.onend = () => {
        setIsSpeaking(false);
        setTranscript("");
        setSpokenText(text);
  
        // Reset morph targets after speech ends
        if (avatar && avatar.nodes && avatar.nodes.Wolf3D_Head001) {
          avatar.nodes.Wolf3D_Head001.morphTargetInfluences[0] = 0;
          avatar.nodes.Wolf3D_Head001.morphTargetInfluences[1] = 0;
        }
      };
  
      // Start speech synthesis
      window.speechSynthesis.speak(utterance);
    }
  };
  
  
  useEffect(() => {
    const loadVoices = () =>
      setVoices(window.speechSynthesis.getVoices() || []);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const AvatarScene = ({ animationType }: any) => {
    useEffect(() => {
      if (avatar && avatar.scene) {
        avatar.scene.scale.set(2, 2, 1);
        avatar.scene.position.set(0, -1.3, 0); // Ground level
        mixerRef.current = new AnimationMixer(avatar.scene);

        const animationClip = avatar.animations.find(
          (clip: THREE.AnimationClip) => clip.name === animationType
        );
        if (animationClip) {
          const action = mixerRef.current.clipAction(animationClip);
          action.reset().play().setLoop(THREE.LoopRepeat, Infinity);
        }
      }
    }, [avatar, animationType]);

    useFrame((state, delta) => {
      if (mixerRef.current) mixerRef.current.update(delta);
      if (avatarRef.current) {
        // Move left or right based on the state, but constrain the movement within the bounds
        avatarRef.current.position.x += movementRef.current.x;

        // Apply boundary constraints to ensure the avatar doesn't move off-screen
        avatarRef.current.position.x = Math.min(
          Math.max(avatarRef.current.position.x, minX),
          maxX
        );

        // Reset movement direction after applying it
        if (movementRef.current.x !== 0) {
          movementRef.current.x = 0; // Reset after applying movement
        }
      }
    });

    return <primitive object={avatar.scene} ref={avatarRef} />;
  };

  return (
    <>
      <Canvas>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <Environment preset="sunset" background />
        <PerspectiveCamera makeDefault position={[0, 1, 5]} fov={50} />
        <AvatarScene animationType={animationType} />
      </Canvas>

      {/* Transcript Display */}
      <div style={transcriptContainerStyles}>
        <div style={transcriptStyles}>
          <p>
            {transcript ||
              "Say 'Hello teacher', 'Introduce yourself', 'Please Jump', 'Move Left', or 'Move Right'"}
          </p>
        </div>
      </div>

      {/* Button Controls */}
      <div style={buttonContainerStyles}>
        <button
          onClick={() =>
            speakText(
              "Hello, I am your AI teacher. Let's learn something new today!"
            )
          }
          style={buttonStyles("blue")}
        >
          {isSpeaking ? "Speaking..." : "Speak Intro"}
        </button>
        <button onClick={startSpeechRecognition} style={buttonStyles("red")}>
          Start Listening
        </button>
        <button
          onClick={() => moveAvatar("jump")}
          style={buttonStyles("green")}
        >
          Jump
        </button>
        <button
          onClick={() => moveAvatar("left")}
          style={buttonStyles("green")}
        >
          Move Left
        </button>
        <button
          onClick={() => moveAvatar("right")}
          style={buttonStyles("green")}
        >
          Move Right
        </button>
      </div>
    </>
  );
};

const buttonContainerStyles: React.CSSProperties = {
  position: "absolute",
  right: "20px",
  top: "20%",
  display: "flex",
  flexDirection: "column",
};

const buttonStyles = (color: string): React.CSSProperties => ({
  backgroundColor:
    color === "blue" ? "#3498db" : color === "red" ? "#e74c3c" : "#2ecc71",
  border: "none",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  padding: "10px 20px",
  margin: "10px 0",
  cursor: "pointer",
});

const transcriptContainerStyles: React.CSSProperties = {
  position: "absolute",
  bottom: "20px",
  left: "20px",
};

const transcriptStyles: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "10px",
  fontSize: "16px",
  color: "#333",
  maxWidth: "400px",
  borderRadius: "8px",
};

export default Classroom;
