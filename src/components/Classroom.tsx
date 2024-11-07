import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import { AnimationMixer } from "three";
import * as THREE from "three";

// Check if window has SpeechRecognition support
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const Classroom = () => {
  const avatarRef = useRef<any>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [animationType, setAnimationType] = useState("idle");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [transcript, setTranscript] = useState("");
  const mixerRef = useRef<AnimationMixer | null>(null);
  const avatar = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + "/models/teacher.glb"
  );

  const startSpeechRecognition = () => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => console.log("Speech recognition started...");
      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        console.log("Recognized speech:", speechResult);
        setTranscript(speechResult);

        // Check for commands
        if (speechResult.toLowerCase().includes("introduce yourself")) {
          speakText(); // Trigger introduction
        } else if (speechResult.toLowerCase().includes("hello teacher")) {
          setAnimationType("wave");
          setTimeout(() => {
            setAnimationType("idle");
          }, 5000);
        } else if (speechResult.toLowerCase().includes("please jump")) {
          setAnimationType("Jump");
          setTimeout(() => {
            setAnimationType("idle");
          }, 5000);
        }
      };
      recognition.onerror = (event: any) =>
        console.error("Speech recognition error:", event);
      recognition.onend = () => console.log("Speech recognition ended.");
      recognition.start();
    } else {
      console.log("Speech recognition is not supported in this browser.");
    }
  };

  const speakText = () => {
    if (isSpeaking) return;

    console.log("Attempting to speak...");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        "Hello, I am your AI teacher. Let's learn something new today!"
      );
      utterance.lang = "en-US";

      const selectedVoice = voices[0] || null;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        console.log("No voice found, cannot speak.");
        return;
      }

      utterance.onstart = () => {
        console.log("Speech started.");
        setIsSpeaking(true);
        animateLipSync(true);
      };
      utterance.onend = () => {
        console.log("Speech ended.");
        setIsSpeaking(false);
        animateLipSync(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Speech synthesis not available.");
    }
  };

  const animateLipSync = (isSpeaking: boolean) => {
    if (avatarRef.current) {
      const mouth = avatarRef.current.getObjectByName("Wolf3D_Teeth");
      if (mouth) {
        const scaleFactor = isSpeaking ? 1.5 : 1;
        mouth.scale.set(scaleFactor, 1, scaleFactor);
        avatarRef.current.updateMatrixWorld();
      }
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      const voicesList = window.speechSynthesis.getVoices();
      if (voicesList.length > 0) {
        setVoices(voicesList);
      } else {
        setTimeout(loadVoices, 1000);
      }
    };

    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const AvatarScene = ({ animationType }: any) => {
    useEffect(() => {
      if (avatar && avatar.scene) {
        avatar.scene.scale.set(2, 2, 2);
        avatar.scene.position.set(0, -2, 0);
        mixerRef.current = new AnimationMixer(avatar.scene);

        console.log(avatar.animations.map((clip: any) => clip.name));

        const idleAnimationClip = avatar.animations.find(
          (clip: THREE.AnimationClip) => clip.name === animationType
        );
        if (idleAnimationClip) {
          const idleAction = mixerRef.current.clipAction(idleAnimationClip);
          idleAction.reset().play();
          idleAction.loop = THREE.LoopRepeat;
          console.log("Playing idle animation");
        } else {
          console.error("Idle animation clip not found.");
        }
      }
    }, [avatar]);

    useFrame((state, delta) => {
      if (mixerRef.current) {
        mixerRef.current.update(delta);
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
        <OrbitControls />
      </Canvas>

      <div style={overlayStyles}>
        <div style={{ display: "flex" }}>
          <button onClick={speakText} style={buttonStyles("blue")}>
            {isSpeaking ? "Speaking..." : "Speak Intro"}
          </button>
          <button onClick={startSpeechRecognition} style={buttonStyles("red")}>
            Start Listening
          </button>
        </div>

        <div style={transcriptStyles}>
          <p>{transcript || "Say 'Hello teacher' or 'Introduce yourself' or 'Please jump'"}</p>
        </div>
      </div>
    </>
  );
};

const buttonStyles = (color: string) => ({
  padding: "10px 20px",
  backgroundColor: color === "blue" ? "#3498db" : "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  margin: "10px",
});

const overlayStyles: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  left: "230px",
  transform: "translateX(-50%)",
  zIndex: 10,
  color: "white",
};

const transcriptStyles: React.CSSProperties = {
  color: "white",
  fontSize: "18px",
  marginTop: "20px",
  backgroundColor: "black",
  padding: '5px',
  borderRadius: '10px'
};

export default Classroom;
