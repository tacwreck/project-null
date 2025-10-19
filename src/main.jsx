import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.clear();

const secretLogs = [
  "Initializing Project: Null terminal...",
  "Accessing secure logs...",
  "Warning: Memory sector 09A-C is corrupted.",
  "Recovered fragment: 'You were not supposed to see this.'",
  "Hidden directive: decode('VUlTT05fTk9UX0RFQUQ=')",
];

let i = 0;
const revealSecrets = setInterval(() => {
  if (i < secretLogs.length) {
    console.log(`%c${secretLogs[i]}`, "color:#9b5de5;font-family:monospace;");
    i++;
  } else {
    clearInterval(revealSecrets);
    console.log("%cEnd of transmission.", "color:gray;");
  }
}, 1500);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


