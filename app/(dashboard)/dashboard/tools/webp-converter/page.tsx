"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import path from "path";

export default function WebPConverterPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);

  const handleConvert = async () => {
    setConverting(true);
    setDone(false);
    setLogs(["🚀 Starting conversion of images in /uploads/pages..."]);

    try {
      const res = await fetch("/api/tools/convert-webp", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setLogs((prev) => [
          ...prev,
          ...data.logs,
          `✅ Done! Converted ${data.converted} images.`,
        ]);
        setDone(true);
      } else {
        setLogs((prev) => [...prev, `❌ Error: ${data.error}`]);
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `❌ Fatal error: ${err.message}`]);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">WebP Converter</h1>
      <p className="text-gray-600 mb-6">
        This tool scans <code>/public/uploads/pages/</code>, converts all images
        to <b>.webp</b>, deletes originals, and updates Firestore paths.
      </p>

      <button
        onClick={handleConvert}
        disabled={converting}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white transition ${
          converting ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <RefreshCw
          size={18}
          className={converting ? "animate-spin" : "opacity-80"}
        />
        {converting ? "Converting..." : "Start Conversion"}
      </button>

      <div className="bg-black text-green-400 font-mono text-sm rounded-lg p-4 mt-6 h-64 overflow-y-auto">
        {logs.length > 0 ? (
          logs.map((l, i) => <div key={i}>{l}</div>)
        ) : (
          <p className="text-gray-500 italic">No logs yet...</p>
        )}
      </div>

      {done && (
        <div className="flex items-center gap-2 text-green-600 mt-4">
          <CheckCircle size={18} /> <span>All done successfully!</span>
        </div>
      )}
    </div>
  );
}
