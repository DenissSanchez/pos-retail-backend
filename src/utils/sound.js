// src/utils/sound.js

export const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine"; 
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Tono agudo limpio
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime); // Volumen sutil
    gainNode.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // Duración de 100ms
  } catch (e) {
    console.log("El navegador bloqueó el audio temporalmente", e);
  }
};