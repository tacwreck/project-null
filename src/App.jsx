import React, { useEffect, useState } from "react";
import Menu from "./components/Menu";
import MobileModal from "./components/MobileModal";
import SignalOverlay from "./components/SignalOverlay";
import AudioEngine from "./components/AudioEngine";
import Terminal from "./components/Terminal";
import { FRAGMENTS, decodeFragment, revealId, getRevealed } from "./utils/lore";

export default function App() {
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [stage, setStage] = useState("menu");
  const [corruption, setCorruption] = useState(0);
  const [signalIntensity, setSignalIntensity] = useState(0);

  // Detect mobile users
  useEffect(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window && innerWidth < 900);
    if (isMobile) setMobileModalOpen(true);
  }, []);

  // Console startup hints and drip feed
  useEffect(() => {
    const lines = [
      "[PROJECT:NULL] Developer log initialized.",
      "Hint: decodeBase64('VUlTT05fTk9UX0RFQUQ=')",
      "Tip: run 'trace 2' in the terminal to unlock non-text payload hints.",
      "Easter: call `connect()` or `traceback()` in console."
    ];
    let i = 0;
    const t = setInterval(() => {
      if (i >= lines.length) { clearInterval(t); return; }
      console.log("%c" + lines[i], "color:#9b5de5;font-family:monospace;");
      i++;
    }, 1200);

    // Expose helpers
    window.pn_decodeBase64 = (s) => { try { return atob(s); } catch { return null; } };
    window.connect = () => console.log("%c[connect()] Connection pool: ARCHIVE:ALPHA open", "color:#10b981");
    window.traceback = () => console.log("%c[traceback()] Recent stack: core->archive->fragment_2", "color:#f59e0b");

    // Harder passphrase hints
    console.log("%c[LOG] Archival key needed to decrypt fragment B.", "color:#facc15");
    console.log("%c[HINT] Sometimes the past holds the key: A-R-C-H", "color:#10b981; font-family:monospace;");
    window.revealHint = () => console.log("Fragment B requires a 4-letter archive passphrase… start with 'A'…");

    return () => clearInterval(t);
  }, []);

  // Control audio overlay / corruption
  useEffect(() => {
    window.__pn_setCorruption = (v) => setCorruption(Math.max(0, Math.min(100, Number(v) || 0)));
    window.__pn_reveal = (id) => {
      const revealed = revealId(id);
      console.log(`pn: reveal ${id} => ${revealed}`);
    };
  }, []);

  useEffect(() => {
    setSignalIntensity(corruption / 100);
  }, [corruption]);

  return (
    <div className="min-h-screen relative">
      <SignalOverlay intensity={signalIntensity} />
      <AudioEngine corruption={corruption} />

      {stage === "menu" && <Menu onEnter={() => { setStage("terminal"); setMobileModalOpen(false); }} onArchive={() => window.location.assign("/logs")} />}

      {stage === "terminal" && <div className="p-6 max-w-5xl mx-auto"><Terminal onLock={() => setStage("menu")} /></div> }

      <MobileModal open={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
    </div>
  );
}
