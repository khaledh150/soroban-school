// src/components/quiz/SorobanBoard.jsx

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "./soroban.css";

const SorobanBoard = forwardRef((props, ref) => {
  const boardRef = useRef(null);
  const wrapperRef = useRef(null);
  
  // These refs hold our internal functions so we can expose them
  const internalClearRef = useRef(null);
  const internalShakeRef = useRef(null);

  // Expose the "reset" function to the parent (QuizPage)
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (internalClearRef.current) internalClearRef.current();
      if (internalShakeRef.current) internalShakeRef.current();
    }
  }));

  useEffect(() => {
    const board = boardRef.current;
    const wrapper = wrapperRef.current;
    if (!board || !wrapper) return;

    // --- SETUP ---
    board.innerHTML = ""; // Clean start

    const DEAD_ZONE = 2;
    const SHAKE_G = 20; 
    const HAPTIC_MS = 12;

    // Sounds
    const soundOn = new Audio("https://soroban-wonder-kids.b-cdn.net/sounds/sound1.wav");
    const soundOff = new Audio("https://soroban-wonder-kids.b-cdn.net/sounds/sound2.wav");

    // Mute Check
    const isMuted = () => {
      const el = document.getElementById("muteSound");
      return el && el.checked;
    };

    function playOn() {
      if (isMuted()) return;
      try { soundOn.currentTime = 0; soundOn.play(); } catch {}
    }

    function playOff() {
      if (isMuted()) return;
      try { soundOff.currentTime = 0; soundOff.play(); } catch {}
    }

    // --- BEAD LOGIC ---
    function setBead(bead, active) {
      const isHeaven = bead.classList.contains("heaven");
      const wasActive = bead.classList.contains("active");

      if (isHeaven) {
        bead.classList.toggle("active", active);
      } else {
        const siblings = Array.from(bead.parentElement.children);
        const idx = siblings.indexOf(bead);
        siblings.forEach((b, i) => {
          b.classList.toggle("active", active ? i <= idx : i < idx);
        });
      }

      if ("vibrate" in navigator && HAPTIC_MS) {
        try { navigator.vibrate(HAPTIC_MS); } catch {}
      }

      if (active && !wasActive) playOn();
      else if (!active && wasActive) playOff();
    }

    // --- BUILD BOARD ---
    function createRod() {
      const rod = document.createElement("div");
      rod.className = "rod";
      rod.innerHTML = `
        <div class="rod-line"></div>
        <div class="heaven"><div class="bead heaven"></div></div>
        <div class="gap-space"></div>
        <div class="earth">
          <div class="bead earth"></div><div class="bead earth"></div>
          <div class="bead earth"></div><div class="bead earth"></div>
        </div>
        <div class="bar"></div>
      `;
      return rod;
    }

    for (let i = 0; i < 8; i++) {
      board.appendChild(createRod());
    }

    const beads = board.querySelectorAll(".bead");

    // --- ACTIONS ---
    function clearBoard() {
      const allBeads = board.querySelectorAll(".bead");
      allBeads.forEach((b) => b.classList.remove("active"));
    }

    function shakeEffect() {
      if (!wrapper) return;
      wrapper.classList.remove("shake");
      void wrapper.offsetWidth; // force reflow
      wrapper.classList.add("shake");
      setTimeout(() => wrapper.classList.remove("shake"), 220);
    }

    // Assign to refs for useImperativeHandle
    internalClearRef.current = clearBoard;
    internalShakeRef.current = shakeEffect;

    // --- POINTER EVENTS ---
    beads.forEach((b) => {
      b.addEventListener("pointerdown", (e) => {
        const region = b.classList.contains("heaven") ? "heaven" : "earth";
        const startY = e.clientY;
        b.setPointerCapture(e.pointerId);

        const handleMove = (ev) => {
          const dy = ev.clientY - startY;
          if (Math.abs(dy) > DEAD_ZONE) {
            setBead(b, region === "heaven" ? dy > 0 : dy < 0);
            b.removeEventListener("pointermove", handleMove);
          }
        };

        const end = () => {
          b.removeEventListener("pointermove", handleMove);
          b.removeEventListener("pointerup", end);
          b.removeEventListener("pointercancel", end);
          try { b.releasePointerCapture(e.pointerId); } catch {}
        };

        b.addEventListener("pointermove", handleMove);
        b.addEventListener("pointerup", end);
        b.addEventListener("pointercancel", end);
      });
    });

    // --- SHAKE SENSOR ---
    let lastShakeTime = 0;
    const motionHandler = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.hypot(acc.x || 0, acc.y || 0, acc.z || 0);
      const now = performance.now();
      if (mag > SHAKE_G && now - lastShakeTime > 800) {
        clearBoard();
        shakeEffect();
        lastShakeTime = now;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", motionHandler);
    }

    // --- CLEANUP ---
    return () => {
      if (window.DeviceMotionEvent) window.removeEventListener("devicemotion", motionHandler);
      
      const allBeads = board.querySelectorAll(".bead");
      allBeads.forEach((b) => b.replaceWith(b.cloneNode(true))); // Remove listeners
      board.innerHTML = "";
    };
  }, []);

  return (
    <div ref={wrapperRef} className="soroban-wrapper">
      <div ref={boardRef} className="soroban" id="sorobanBoard" />
    </div>
  );
});

export default SorobanBoard;