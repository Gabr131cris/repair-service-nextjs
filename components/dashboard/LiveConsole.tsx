"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal, Trash2, Activity, AlertTriangle } from "lucide-react";

interface Log {
  type: "info" | "warn" | "error" | "perf";
  message: string;
  time: string;
}

export default function LiveConsole() {
  const [logs, setLogs] = useState<Log[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  // 🔹 Scroll automat în jos
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  // 🔹 Adaugă un log nou
  const addLog = (type: Log["type"], message: string) => {
    setLogs((prev) => [
      ...prev,
      { type, message, time: new Date().toLocaleTimeString() },
    ]);
  };

  // 🔹 Interceptează console.log / warn / error
  useEffect(() => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    console.log = (...args) => {
      origLog(...args);
      addLog("info", args.join(" "));
    };
    console.warn = (...args) => {
      origWarn(...args);
      addLog("warn", args.join(" "));
    };
    console.error = (...args) => {
      origError(...args);
      addLog("error", args.join(" "));
    };

    addLog("info", "🟢 Console initialized and listening for logs...");

    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    };
  }, []);

  // 🔹 Performance metrics
  useEffect(() => {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            addLog(
              "perf",
              `⏱️ Page load: ${Math.round(entry.loadEventEnd)}ms | DOM ready: ${Math.round(
                entry.domContentLoadedEventEnd
              )}ms`
            );
          }
        }
      });
      observer.observe({ entryTypes: ["navigation", "paint"] });
    } catch (err) {
      addLog("warn", "PerformanceObserver not supported in this environment");
    }
  }, []);

  // 🔹 Simulare date runtime (ping, memorie etc.)
  useEffect(() => {
    const interval = setInterval(() => {
      const ping = Math.floor(Math.random() * 50) + 20;
      const mem = (performance.memory?.usedJSHeapSize || 0) / 1024 / 1024;
      addLog(
        "perf",
        `⚙️ Runtime status → ping: ${ping}ms | memory: ${mem.toFixed(1)} MB`
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 Clear logs
  const clearLogs = () => setLogs([]);

  return (
    <div className="bg-black text-green-400 rounded-xl p-4 font-mono text-sm shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-300">
          <Terminal size={16} />
          <span className="font-semibold text-gray-100">Developer Console</span>
        </div>
        <button
          onClick={clearLogs}
          className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition"
        >
          <Trash2 size={14} /> <span>Clear</span>
        </button>
      </div>

      <div
        ref={consoleRef}
        className="bg-gray-900 border border-gray-700 rounded-lg p-3 h-80 overflow-y-auto"
      >
        {logs.length > 0 ? (
          logs.map((log, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap leading-relaxed ${
                log.type === "error"
                  ? "text-red-400"
                  : log.type === "warn"
                  ? "text-yellow-400"
                  : log.type === "perf"
                  ? "text-cyan-400"
                  : "text-green-400"
              }`}
            >
              <span className="text-gray-500">[{log.time}]</span> {log.message}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No activity yet...</p>
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <Activity size={12} /> Live monitoring enabled
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle size={12} /> Warnings & errors auto-captured
        </span>
      </div>
    </div>
  );
}
