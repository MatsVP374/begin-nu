/**
 * Geluid, trillen en het scherm aan houden. Faalt overal stil: deze app
 * moet blijven werken op apparaten of browsers die iets hiervan missen.
 */

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

let audioCtx: AudioContext | null = null;
let wakeLock: WakeLockSentinel | null = null;

/** Ontgrendelt de AudioContext. Moet aangeroepen worden vanuit een tik (iOS-eis). */
export function unlockAudio(): void {
  try {
    if (!audioCtx) {
      const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
      if (AudioContextCtor) audioCtx = new AudioContextCtor();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
  } catch {
    // Geluid niet beschikbaar; de app werkt door zonder geluid.
  }
}

/** Zacht tweetonig belletje (660 Hz, 880 Hz) plus een kort trilpatroon. */
export function chime(): void {
  try {
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
  } catch {
    // Trillen niet ondersteund.
  }
  try {
    if (!audioCtx) return;
    const ctx = audioCtx;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + i * 0.18;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  } catch {
    // Geluid mislukt; stil negeren.
  }
}

export async function requestWakeLock(): Promise<void> {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch {
    // Wake lock niet beschikbaar of geweigerd; de app werkt gewoon door.
  }
}

export function releaseWakeLock(): void {
  try {
    void wakeLock?.release();
  } catch {
    // Negeren.
  } finally {
    wakeLock = null;
  }
}
