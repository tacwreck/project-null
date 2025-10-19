// src/utils/puzzle.js
// Helper decoders + secure hash compare (client-side)
// NOTE: For highest integrity, move hash checking to server-side later.

export function base64Decode(s){
  try { return decodeURIComponent(atob(s).split('').map(c => '%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')); } catch { return null; }
}
export function hexDecode(s){
  try { const hex=s.replace(/[^0-9a-f]/gi,''); return hex.match(/.{1,2}/g).map(h=>String.fromCharCode(parseInt(h,16))).join(''); } catch { return null; }
}
export function rot13(s){
  try { return s.replace(/[A-Za-z]/g,c=>String.fromCharCode((c<='Z'?90:122) >= (c=c.charCodeAt(0)+13) ? c : c-26)); } catch { return null; }
}
export function binToStr(b){
  try { return b.trim().split(/\s+/).map(x=>String.fromCharCode(parseInt(x,2))).join(''); } catch { return null; }
}

// simple xor using passphrase (text)
export function xorDecrypt(hexPayload, passphrase){
  // hexPayload = 'af34...' (hex)
  try {
    const bytes = hexPayload.replace(/[^0-9a-f]/gi,'').match(/.{1,2}/g).map(h => parseInt(h,16));
    const keyBytes = Array.from(new TextEncoder().encode(passphrase));
    const out = bytes.map((b,i) => b ^ keyBytes[i % keyBytes.length]);
    return String.fromCharCode(...out);
  } catch { return null; }
}

// webcrypto SHA-256 digest -> hex
export async function sha256Hex(input){
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// constant-time-ish compare (for client usage)
export function equalsSafe(a,b){
  if (!a || !b || a.length !== b.length) return false;
  let res = 0;
  for (let i=0;i<a.length;i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return res === 0;
}
