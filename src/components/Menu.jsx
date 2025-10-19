// src/components/Menu.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Menu({ onEnter, onArchive }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="w-full max-w-2xl p-10 rounded-xl bg-black/50 border border-purple-900 shadow-lg">
        <h1 className="text-center text-6xl font-extrabold text-purple-400 mb-4 select-none glitch">PROJECT: NULL</h1>
        <p className="text-center text-sm text-gray-400 mb-8">CLASSIFIED — Core Access Required</p>

        <div className="flex justify-center gap-4">
          <button onClick={onEnter} className="px-6 py-3 rounded-md bg-gradient-to-br from-purple-700 to-purple-500 text-white hover:scale-[1.02] transition">ENTER TERMINAL</button>
          <button onClick={onArchive} className="px-6 py-3 rounded-md border border-purple-700 text-purple-200 hover:bg-white/3 transition">ARCHIVE</button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">Hint: the browser console occasionally leaks classified directives.</p>
      </motion.div>
    </div>
  );
}
