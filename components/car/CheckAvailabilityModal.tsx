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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      {/* SUCCESS STATE */}
      {status === "success" && (
        <div className="absolute bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center z-[60] border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl">✓</span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">Awesome!</h3>
          <p className="text-gray-600 mt-2">
            Your message has been sent successfully.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600"
          >
            OK
          </button>
        </div>
      )}

      {/* ERROR STATE */}
      {status === "error" && (
        <div className="absolute bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center z-[60] border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl">✕</span>
          </div>
          <h3 className="text-2xl font-semibold mt-4">Error</h3>
          <p className="text-gray-600 mt-2">
            Something went wrong. Please try again.
          </p>
          <button
            onClick={() => setStatus(null)}
            className="mt-6 w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
          >
            Close
          </button>
        </div>
      )}

      {/* BASE FORM */}
      {status === null && (
        <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl p-10 border border-gray-200 relative">


          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-black text-2xl"
          >
            ✕
          </button>

          {/* Title */}
          <h2 className="text-3xl font-semibold text-center text-gray-900">
            Check availability
          </h2>
          <p className="text-center text-gray-500 mt-1 mb-8">
            Please fill in all the required fields
          </p>

          {/* INPUT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2">

            <input
              name="firstName"
              placeholder="First name"
              onChange={handleChange}
              className="p-4 rounded-xl bg-gray-100 border border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition"
            />

            <input
              name="lastName"
              placeholder="Last name"
              onChange={handleChange}
              className="p-4 rounded-xl bg-gray-100 border border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition"
            />

            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="p-4 rounded-xl bg-gray-100 border border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition"
            />

            <input
              name="phone"
              placeholder="Telephone"
              onChange={handleChange}
              className="p-4 rounded-xl bg-gray-100 border border-gray-200 focus:border-gray-400 focus:bg-white outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-10 py-4 bg-black text-white rounded-xl text-lg font-semibold hover:bg-gray-900 disabled:bg-gray-300"
          >
            {loading ? "Sending..." : "Send message"}
          </button>

        </div>
      )}
    </div>
  );
}
