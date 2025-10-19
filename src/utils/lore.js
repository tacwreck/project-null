// src/utils/lore.js

export const FINAL_KEY_HASH = "1aff9a2c51fa00e554e877de1a0b62925f273c2ad39b4106b39188d5eb2998bc";

export const FRAGMENTS = [
  {
    id: "A",
    public: "Archive fragment A — metadata present.",
    payload: { type: "base64", data: "VUlTT04t" } // decodes to "UISON-"
  },
  {
    id: "B",
    public: "Archive fragment B — encrypted sector.",
    payload: { type: "xor-hex", data: "1500160d" } // requires XOR passphrase
  },
  {
    id: "C",
    public: "Archive fragment C — binary dump.",
    payload: { type: "binary", data: "00101101 00110010 00110000 00110010 00110101" } // decodes to "-2025"
  }
];

// Optional helper functions
export function decodeFragment(fragment, passphrase) {
  switch (fragment.payload.type) {
    case "base64":
      return atob(fragment.payload.data);
    case "binary":
      return fragment.payload.data.split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join("");
    case "xor-hex":
      if (!passphrase) return null;
      const hex = fragment.payload.data;
      const result = [];
      for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        const passChar = passphrase.charCodeAt((i/2) % passphrase.length);
        result.push(String.fromCharCode(byte ^ passChar));
      }
      return result.join("");
    default:
      return null;
  }
}

export function revealId(id) {
  const f = FRAGMENTS.find(f => f.id === id);
  if (!f) return null;
  return decodeFragment(f, "ARCH"); // default XOR passphrase
}

export function getRevealed() {
  return FRAGMENTS.map(f => ({ id: f.id, content: revealId(f.id) }));
}
