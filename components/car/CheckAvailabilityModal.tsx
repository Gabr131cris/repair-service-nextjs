"use client";

import { useState } from "react";

export default function CheckAvailabilityModal({
  isOpen,
  onClose,
  carTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  carTitle: string;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await fetch("/api/send-check-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        carTitle,
        pageUrl: window.location.href,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "" });

      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 2500);
    } else {
      setStatus("error");
      setTimeout(() => setStatus(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">

      {/* SUCCESS POPUP */}
      {status === "success" && (
        <div className="absolute bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm z-[60] animate-popIn text-center border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl">✓</span>
          </div>

          <h3 className="text-3xl font-bold mt-5 text-gray-900">Awesome!</h3>
          <p className="text-gray-600 mt-2">
            Your message has been sent.<br />Check your email for details.
          </p>

          <button
            className="mt-6 px-10 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
            onClick={() => onClose()}
          >
            OK
          </button>
        </div>
      )}

      {/* ERROR POPUP */}
      {status === "error" && (
        <div className="absolute bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm z-[60] animate-popIn text-center border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl">✕</span>
          </div>

          <h3 className="text-3xl font-bold mt-5 text-gray-900">Error</h3>
          <p className="text-gray-600 mt-2">
            Something went wrong. Please try again.
          </p>

          <button
            className="mt-6 px-10 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
            onClick={() => setStatus(null)}
          >
            Close
          </button>
        </div>
      )}

      {/* MAIN FORM POPUP */}
      {status === null && (
        <div
          className="
            bg-white/80 backdrop-blur-xl w-full max-w-lg rounded-3xl p-10 
            shadow-2xl border border-white/40 relative animate-slideUp
          "
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            onClick={onClose}
          >
            ×
          </button>

          <h2 className="text-4xl font-bold text-center mb-3 text-gray-900">
            Check availability
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Please fill in all the required fields
          </p>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="firstName"
              placeholder="First name"
              onChange={handleChange}
              className="p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none"
            />
            <input
              name="lastName"
              placeholder="Last name"
              onChange={handleChange}
              className="p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none"
            />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none"
            />
            <input
              name="phone"
              placeholder="Telephone"
              onChange={handleChange}
              className="p-4 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full mt-8 py-4 bg-black text-white rounded-xl 
              font-semibold hover:bg-gray-900 transition text-lg
              disabled:bg-gray-400
            "
          >
            {loading ? "Sending..." : "Send message"}
          </button>
        </div>
      )}
    </div>
  );
}
