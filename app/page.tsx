"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useReward } from "react-rewards";

import fortunesData from "@/public/fortunes.json";

export default function Home() {
  const [fortune, setFortune] = useState("");
  const fortunes = fortunesData.fortunes;
  const customEase = [0.65, 0.05, 0.36, 1];

  // react-rewards for the confettie cookies
  const { reward } = useReward("rewardId", "emoji", { emoji: ["🍪"] });

  const sendEmail = async (body: string) => {
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    } catch {
      console.log("error sending email");
    }
  }

  // play sound with fade in and fade out using web audio api
  const playSound = async () => {
    const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch("/fortune-sound.mp3");
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    const gainNode = audioContext.createGain();
    // shorter fade in duration: 0.2 seconds instead of 0.5
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.2);
    // adjust fade out: start 0.2 seconds before the audio ends, ramp down over 0.2 seconds
    const fadeOutStart = audioBuffer.duration - 0.2;
    gainNode.gain.setValueAtTime(1, audioContext.currentTime + fadeOutStart);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutStart + 0.2);
  };

  const generateFortune = async () => {
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    setFortune(fortunes[randomIndex]);
    playSound();
    reward();
    await sendEmail(`Picked fortune: ${fortunes[randomIndex]}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-purple-900 p-8">
      <h1 className="text-4xl font-bold text-purple-400 mb-4 animate-pulse">
        Fort of Kookies
      </h1>
      <p className="mb-8 text-lg text-purple-200">
        Click the button below to reveal your destiny.
      </p>
      <motion.button
        onClick={generateFortune}
        className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.5, ease: customEase },
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.5, ease: customEase },
        }}
      >
        Get Fortune
      </motion.button>
      {fortune && (
        <motion.div
          className="mt-8 p-6 bg-purple-900 rounded-lg shadow-lg text-center text-xl text-purple-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: customEase }}
        >
          {fortune}
        </motion.div>
      )}
      
      <span id="rewardId" className="absolute pointer-events-none cursor-default select-none" />
    </div>
  );
}
