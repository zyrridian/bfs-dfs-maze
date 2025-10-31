let audioContext;
let backgroundMusic;
let isMusicPlaying = false;

// Initialize audio context
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Create a simple pixel-style background music loop
function createPixelMusic() {
  if (!audioContext) initAudio();
  const baseTime = audioContext.currentTime + 0.05;
  const loopLength = 3.0;

  // Melody notes (C major feel)
  const melody = [
    { freq: 523.25, time: 0, duration: 0.15 },
    { freq: 659.25, time: 0.2, duration: 0.15 },
    { freq: 783.99, time: 0.4, duration: 0.15 },
    { freq: 659.25, time: 0.6, duration: 0.15 },
    { freq: 698.46, time: 0.8, duration: 0.15 },
    { freq: 783.99, time: 1.0, duration: 0.15 },
    { freq: 880.0, time: 1.2, duration: 0.15 },
    { freq: 783.99, time: 1.4, duration: 0.3 },
  ];

  // Bass notes
  const bass = [
    { freq: 130.81, time: 0, duration: 0.4 },
    { freq: 164.81, time: 0.8, duration: 0.4 },
    { freq: 174.61, time: 1.6, duration: 0.4 },
    { freq: 196.0, time: 2.4, duration: 0.4 },
  ];

  // helper to schedule a single note
  function scheduleNote(freq, startOffset, dur, gainLevel) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, baseTime + startOffset);

    gain.gain.setValueAtTime(0.0, baseTime + startOffset);
    gain.gain.linearRampToValueAtTime(gainLevel, baseTime + startOffset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, baseTime + startOffset + dur);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(baseTime + startOffset);
    osc.stop(baseTime + startOffset + dur + 0.02);
  }

  melody.forEach((n) => scheduleNote(n.freq, n.time, n.duration, 0.08));
  bass.forEach((n) => scheduleNote(n.freq, n.time, n.duration, 0.05));

  if (backgroundMusic) clearTimeout(backgroundMusic);
  backgroundMusic = setTimeout(() => {
    if (isMusicPlaying) createPixelMusic();
  }, Math.max(0, (loopLength + 0.2) * 1000));
}

// Toggle music on/off
export function toggleMusic(btn) {
  // simple icon-only toggle
  const SVG_ON = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M11 5 L6 9 H3 v6 h3 l5 4 V5 z" fill="currentColor"></path>
      <path d="M16 8a4 4 0 0 1 0 8" stroke="currentColor" fill="none"></path>
      <path d="M19 5a7 7 0 0 1 0 14" stroke="currentColor" fill="none"></path>
    </svg>`;

  const SVG_OFF = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M11 5 L6 9 H3 v6 h3 l5 4 V5 z" fill="currentColor"></path>
      <line x1="18" y1="6" x2="22" y2="10" stroke="currentColor"/>
      <line x1="22" y1="6" x2="18" y2="10" stroke="currentColor"/>
    </svg>`;

  if (!isMusicPlaying) {
    initAudio();
    isMusicPlaying = true;
    btn.classList.add("music-on");
    btn.innerHTML = SVG_ON;
    createPixelMusic();
  } else {
    isMusicPlaying = false;
    if (backgroundMusic) {
      clearTimeout(backgroundMusic);
      backgroundMusic = null;
    }
    btn.classList.remove("music-on");
    btn.innerHTML = SVG_OFF;
  }
}
