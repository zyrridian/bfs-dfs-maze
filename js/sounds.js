// Pixel-style sound effects using Web Audio API
let audioContext;

function initSoundContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Create a simple beep sound (like retro game UI)
export function playClickSound() {
  const ctx = initSoundContext();
  const now = ctx.currentTime;

  // Create oscillator for the beep
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Square wave for pixel sound
  osc.type = "square";

  // Quick beep: 800Hz
  osc.frequency.setValueAtTime(800, now);

  // Quick attack and decay
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

// Slightly different sound for different button types
export function playHoverSound() {
  const ctx = initSoundContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(600, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

// Success sound (when maze is solved)
export function playSuccessSound() {
  const ctx = initSoundContext();
  const now = ctx.currentTime;

  // Three ascending notes
  const notes = [
    { freq: 523.25, time: 0, duration: 0.1 }, // C
    { freq: 659.25, time: 0.1, duration: 0.1 }, // E
    { freq: 783.99, time: 0.2, duration: 0.15 }, // G
  ];

  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(note.freq, now + note.time);

    gain.gain.setValueAtTime(0, now + note.time);
    gain.gain.linearRampToValueAtTime(0.12, now + note.time + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + note.time + note.duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.time);
    osc.stop(now + note.time + note.duration);
  });
}
