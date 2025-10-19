// src/components/Terminal.jsx  (overwrite/merge with existing)
import React, { useEffect, useRef, useState } from "react";
import { base64Decode, hexDecode, rot13, binToStr, xorDecrypt, sha256Hex, equalsSafe } from "../utils/puzzle";

// Example fragments: three different encodings
const FRAGMENTS = [
  {
    id: "A",
    public: "Archive fragment A — metadata present.",
    // base64 payload -> yields PART1
    payload: { type: "base64", data: "VUlTT04tREVQ" } // "UISON-DEP" as example
  },
  {
    id: "B",
    public: "Archive fragment B — encrypted sector.",
    // hex that has been XORed with short pass "KEY1" -> yields PART2 after xor-decrypt
    payload: { type: "xor-hex", data: "2f3a7e..." } // placeholder hex; replace with real hex encrypted data
  },
  {
    id: "C",
    public: "Archive fragment C — binary dump.",
    // binary string (space-separated) representing ascii -> yields PART3 after binToStr OR rot13
    payload: { type: "binary", data: "01001101 01011001 01010011" } // example
  }
];

// store final key hash here (sha256 hex) — compute off-line and paste here
const FINAL_KEY_HASH = "REPLACE_WITH_SHA256_HEX_OF_FINAL_KEY";

export default function TerminalHard({ onLock }) {
  const [lines, setLines] = useState(["PROJECT: NULL CORE >", "Type 'help' for commands."]);
  const [input, setInput] = useState("");
  const [state, setState] = useState({ revealed: {}, attempts: 0, lockedUntil: 0 });
  const ref = useRef(null);

  useEffect(() => {
    console.log("%c[HARD MODE] Puzzle chain active.", "color:#9b5de5");
    // hint only in console:
    console.log("%cHint: fragments must be decoded in order and assembled.", "color:#10b981");
  }, []);

  useEffect(()=>{ if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [lines]);

  function append(l){ setLines(prev=>[...prev, l].slice(-500)); }

  async function handle(cmdRaw) {
    const raw = (cmdRaw||"").trim();
    if (!raw) return;
    append(`> ${raw}`);
    const parts = raw.split(" ").filter(Boolean);
    const cmd = parts[0].toLowerCase();

    // lock check
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      append("Terminal is locked due to repeated failed attempts. Try later.");
      return;
    }

    if (cmd === "help") {
      append("Commands: help, logs, probe, decrypt <id>, xor-decrypt <id> <pass>, trace <id>, assemble, restore <key>, clear");
      return;
    }

    if (cmd === "logs") {
      FRAGMENTS.forEach(f => append(`[${f.id}] ${f.public} ${state.revealed[f.id] ? "[revealed]" : "[encoded]"}`));
      return;
    }

    if (cmd === "probe") {
      append("Probing sectors...");
      setTimeout(()=> append("Probe: anomalies clustered across fragments A→B→C."), 700);
      return;
    }

    if (cmd === "decrypt") {
      const id = (parts[1]||"").toUpperCase();
      const frag = FRAGMENTS.find(f=>f.id===id);
      if (!frag) { append("Fragment not found."); return; }
      // Only allow decrypt for base types (no xor)
      if (frag.payload.type === "base64") {
        const dec = base64Decode(frag.payload.data);
        if (dec) {
          append(`Decoded (${id}): ${dec}`);
          setState(s=>({ ...s, revealed: { ...s.revealed, [id]: dec } }));
        } else append("Failed to decode.");
      } else if (frag.payload.type === "binary") {
        const dec = binToStr(frag.payload.data);
        if (dec) {
          append(`Decoded (${id}): ${dec}`);
          setState(s=>({ ...s, revealed: { ...s.revealed, [id]: dec } }));
        } else append("Binary unreadable.");
      } else {
        append("Use xor-decrypt for this fragment (it is encrypted).");
      }
      return;
    }

    if (cmd === "xor-decrypt") {
      const id = (parts[1]||"").toUpperCase();
      const pass = parts.slice(2).join(" ");
      const frag = FRAGMENTS.find(f=>f.id===id);
      if (!frag) { append("Fragment not found."); return; }
      if (frag.payload.type !== "xor-hex") { append("This fragment is not xor-hex type."); return; }
      if (!pass) { append("Usage: xor-decrypt <id> <passphrase>"); return; }
      // attempt decryption
      const dec = xorDecrypt(frag.payload.data, pass);
      if (dec) {
        append(`XOR-Decoded (${id}): ${dec}`);
        setState(s=>({ ...s, revealed: { ...s.revealed, [id]: dec } }));
      } else {
        const attempts = (state.attempts||0) + 1;
        let lockedUntil = state.lockedUntil || 0;
        if (attempts >= 5) {
          lockedUntil = Date.now() + 60*1000; // 1 minute lock
          append("Too many wrong attempts. Terminal locked for 60s.");
        } else {
          append("Wrong passphrase.");
        }
        setState(s=>({ ...s, attempts, lockedUntil }));
      }
      return;
    }

    if (cmd === "trace") {
      const id = (parts[1]||"").toUpperCase();
      append(`Tracing ${id}...`);
      setTimeout(()=> {
        append(`Trace ${id}: origin ARCHIVE_SECTOR_${id}_X`);
        console.log(`[TRACE] signature=SIG-${id}-XYZ`);
      }, 900);
      return;
    }

    if (cmd === "assemble") {
      // require A,B,C revealed
      const a = state.revealed["A"];
      const b = state.revealed["B"];
      const c = state.revealed["C"];
      if (!a || !b || !c) {
        append("Missing fragments. You need to reveal A, B and C first.");
        return;
      }
      // assemble in order: A + B + C (trim)
      const assembled = `${a}${b}${c}`.trim();
      append("Assembled candidate: " + assembled.slice(0,80) + (assembled.length>80 ? "..." : ""));
      // validate using hash
      append("Validating candidate (SHA-256)...");
      const h = await sha256Hex(assembled);
      // compare to stored final hash
      if (equalsSafe(h, FINAL_KEY_HASH)) {
        append("Assembled key is VALID. Use 'restore <key>' to perform true reboot (use the assembled key exactly).");
        // optionally mark success in console
        console.log("%c[PUZZLE] Assembled key validated locally.", "color:#10b981");
      } else {
        append("Assembled key is INVALID.");
        // increment attempts & maybe lock
        const attempts = (state.attempts||0) + 1;
        let lockedUntil = state.lockedUntil || 0;
        if (attempts >= 7) {
          lockedUntil = Date.now() + 5*60*1000; // 5m lock
          append("Multiple invalid assembles. Terminal locked for 5 minutes.");
        } else {
          append(`Invalid attempts: ${attempts}`);
        }
        setState(s=>({ ...s, attempts, lockedUntil }));
      }
      return;
    }

    if (cmd === "restore") {
      const key = parts.slice(1).join(" ");
      if (!key) { append("Usage: restore <key>"); return; }
      // For safety we check hash to avoid storing plain key in code
      const h = await sha256Hex(key);
      if (equalsSafe(h, FINAL_KEY_HASH)) {
        append("Key accepted. Initiating true reboot...");
        setTimeout(()=> {
          append("[SYSTEM] True reboot complete. Memory chain restored.");
          console.log("%c[PROJECT:NULL] TRUE REBOOT ENGAGED", "color:#10b981;font-weight:bold;");
        }, 1200);
      } else {
        append("Key rejected. Corruption increased.");
        setState(s=>({ ...s, attempts: (state.attempts||0)+1 }));
      }
      return;
    }

    if (cmd === "clear") { setLines([]); return; }

    append("Unknown command. Type 'help'.");
  }

  return (
    <div className="bg-[#05050a] border border-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-purple-300 font-mono">PROJECT: NULL — HARD MODE</div>
        <div className="text-xs text-gray-500">Attempts: {state.attempts || 0}</div>
      </div>

      <div ref={ref} className="h-64 bg-black/80 rounded p-3 text-xs font-mono overflow-auto text-gray-300">
        {lines.map((l,i)=> <div key={i} className="whitespace-pre-wrap">{l}</div>)}
      </div>

      <form onSubmit={(e)=>{ e.preventDefault(); handle(input); setInput(""); }} className="mt-3 flex gap-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Enter command..." className="flex-1 bg-black/70 border border-gray-700 px-2 py-1 text-xs text-gray-200 rounded" />
        <button type="submit" className="px-3 py-1 bg-purple-600 rounded text-white text-xs">Run</button>
      </form>

      <div className="mt-2 text-[11px] text-gray-500">Tip: use 'logs' to see fragment IDs. Check DevTools console for hidden hints.</div>
    </div>
  );
}

