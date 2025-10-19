// src/components/AudioEngine.jsx
import { useEffect, useRef } from "react";

/*
Very small WebAudio engine:
- base sine hum
- noise buffer periodically mixed in for crackle/interference
Controls via 'setCorruption' function (exposed on window)
*/

export default function AudioEngine({ corruption = 0 }) {
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const noiseRef = useRef(null);

  useEffect(() => {
    if (!window.AudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 100;
    const gain = ctx.createGain();
    gain.gain.value = 0.0025;

    // noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.0;

    osc.connect(gain).connect(ctx.destination);
    noise.connect(noiseGain).connect(ctx.destination);

    osc.start();
    noise.start();

    oscRef.current = osc;
    gainRef.current = gain;
    noiseRef.current = noiseGain;

    // expose a quick resume (for browsers that block autoplay)
    window.__pn_audio_resume = () => { if (ctx.state === 'suspended') ctx.resume(); };

    return () => {
      try { osc.stop(); noise.stop(); } catch {}
      try { ctx.close(); } catch {}
    };
  }, []);

  // match corruption changes -> audio changes
  useEffect(() => {
    const c = Math.min(100, Math.max(0, corruption));
    if (oscRef.current && gainRef.current && noiseRef.current) {
      const baseFreq = 90 + c * 0.7; // raise frequency a bit
      try { oscRef.current.frequency.setTargetAtTime(baseFreq, 0, 0.05); } catch {}
      gainRef.current.gain.setTargetAtTime(0.0025 + c * 0.00004, 0, 0.05);
      noiseRef.current.gain.setTargetAtTime(0.0005 + (c / 100) * 0.01, 0, 0.05);
    }
  }, [corruption]);

  return null;
}
