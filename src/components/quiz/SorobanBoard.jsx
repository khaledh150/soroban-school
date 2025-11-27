// src/components/quiz/SorobanBoard.jsx

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "./soroban.css";

// --- IMPORT SOUNDS ---
import s1 from "../../assets/sounds/sound1.wav";
import s2 from "../../assets/sounds/sound2.wav";

const SorobanBoard = forwardRef((props, ref) => {
  const boardRef = useRef(null);
  const wrapperRef = useRef(null);
  
  // Keep references to audio to prevent re-creation on re-renders
  const audioContextRef = useRef({
    on: new Audio(s1),
    off: new Audio(s2)
  });

  const internalClearRef = useRef(null);
  const internalShakeRef = useRef(null);

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
    board.innerHTML = ""; 

    const DEAD_ZONE = 5; // Increased slightly for better touch tolerance
    const SHAKE_G = 20; 
    const HAPTIC_MS = 12;

    const { on: soundOn, off: soundOff } = audioContextRef.current;

    // Pre-load sounds
    soundOn.load();
    soundOff.load();

    const isMuted = () => false; // Or props.isMuted if you pass it later

    function playOn() {
      if (isMuted()) return;
      try { 
        // Clone for overlapping sounds if user moves beads extremely fast
        if (!soundOn.paused) {
           const clone = soundOn.cloneNode();
           clone.play();
        } else {
           soundOn.currentTime = 0; 
           soundOn.play(); 
        }
      } catch (e) { /* ignore autoplay errors */ }
    }

    function playOff() {
      if (isMuted()) return;
      try { 
        if (!soundOff.paused) {
            const clone = soundOff.cloneNode();
            clone.play();
        } else {
            soundOff.currentTime = 0; 
            soundOff.play(); 
        }
      } catch (e) { /* ignore autoplay errors */ }
    }

    // --- BEAD LOGIC ---
    function setBead(bead, active) {
      const isHeaven = bead.classList.contains("heaven");
      const wasActive = bead.classList.contains("active");

      if (isHeaven) {
        // Toggle only if state is changing
        if (active !== wasActive) {
            bead.classList.toggle("active", active);
        } else {
            return; // No change, no sound
        }
      } else {
        const siblings = Array.from(bead.parentElement.children);
        const idx = siblings.indexOf(bead);
        let changed = false;
        
        siblings.forEach((b, i) => {
          const shouldBeActive = active ? i <= idx : i < idx;
          if (b.classList.contains("active") !== shouldBeActive) {
            b.classList.toggle("active", shouldBeActive);
            changed = true;
          }
        });
        
        if (!changed) return; // No change, no sound
      }

      if ("vibrate" in navigator && HAPTIC_MS) {
        try { navigator.vibrate(HAPTIC_MS); } catch {}
      }

      // Logic: If we are activating, play 'on'. If deactivating, play 'off'
      if (active && !wasActive) playOn();
      else if (!active && wasActive) playOff();
    }

    // --- BUILD BOARD ---
    function createRod() {
      const rod = document.createElement("div");
      rod.className = "rod";
      // Added aria-hidden to decorative structural elements
      rod.innerHTML = `
        <div class="rod-line" aria-hidden="true"></div>
        <div class="heaven">
            <div class="bead heaven" role="button" aria-label="Heaven bead"></div>
        </div>
        <div class="gap-space" aria-hidden="true"></div>
        <div class="earth">
          <div class="bead earth" role="button" aria-label="Earth bead 1"></div>
          <div class="bead earth" role="button" aria-label="Earth bead 2"></div>
          <div class="bead earth" role="button" aria-label="Earth bead 3"></div>
          <div class="bead earth" role="button" aria-label="Earth bead 4"></div>
        </div>
        <div class="bar" aria-hidden="true"></div>
      `;
      return rod;
    }

    // Create 8 Rods
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 8; i++) {
      frag.appendChild(createRod());
    }
    board.appendChild(frag);

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

    internalClearRef.current = clearBoard;
    internalShakeRef.current = shakeEffect;

    // --- POINTER EVENTS ---
    const handlePointerDown = (e) => {
        const b = e.target;
        if (!b.classList.contains("bead")) return;

        // Prevent default browser dragging
        e.preventDefault();

        const region = b.classList.contains("heaven") ? "heaven" : "earth";
        const startY = e.clientY;
        
        try {
            b.setPointerCapture(e.pointerId);
        } catch (err) {
            // Fallback for older browsers
        }

        const handleMove = (ev) => {
          const dy = ev.clientY - startY;
          if (Math.abs(dy) > DEAD_ZONE) {
            setBead(b, region === "heaven" ? dy > 0 : dy < 0);
            cleanupPointer();
          }
        };

        const cleanupPointer = () => {
          b.removeEventListener("pointermove", handleMove);
          b.removeEventListener("pointerup", cleanupPointer);
          b.removeEventListener("pointercancel", cleanupPointer);
          try { 
              if (b.hasPointerCapture(e.pointerId)) {
                  b.releasePointerCapture(e.pointerId); 
              }
          } catch {}
        };

        b.addEventListener("pointermove", handleMove);
        b.addEventListener("pointerup", cleanupPointer);
        b.addEventListener("pointercancel", cleanupPointer);
    };

    // Attach single listener to board (Event Delegation) for better performance
    // instead of loop attaching to every bead
    beads.forEach(b => {
        b.addEventListener("pointerdown", handlePointerDown);
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
        if ("vibrate" in navigator) navigator.vibrate(50); // specific shake haptic
        lastShakeTime = now;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", motionHandler);
    }

    // --- CLEANUP ---
    return () => {
      if (window.DeviceMotionEvent) window.removeEventListener("devicemotion", motionHandler);
      
      // Clean up event listeners
      beads.forEach(b => {
          b.removeEventListener("pointerdown", handlePointerDown);
      });
      
      // Clear DOM to prevent duplicates on React.StrictMode double-mount
      board.innerHTML = "";
    };
  }, []);

  return (
    <div ref={wrapperRef} className="soroban-wrapper">
      <div 
        ref={boardRef} 
        className="soroban" 
        id="sorobanBoard" 
        role="application"
        aria-label="Interactive Soroban Board"
      />
    </div>
  );
});

export default SorobanBoard;