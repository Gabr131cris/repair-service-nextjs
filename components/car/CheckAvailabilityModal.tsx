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
      alert("Message sent successfully!");
      onClose();
    } else {
      alert("Failed to send email. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl p-8 shadow-xl relative">

        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-center mb-2">
          Check availability
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Please fill in all the required fields
        </p>

        {/* Form grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First name"
            onChange={handleChange}
            className="p-3 border rounded-lg bg-gray-50"
          />
          <input
            name="lastName"
            placeholder="Last name"
            onChange={handleChange}
            className="p-3 border rounded-lg bg-gray-50"
          />
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="p-3 border rounded-lg bg-gray-50"
          />
          <input
            name="phone"
            placeholder="Telephone"
            onChange={handleChange}
            className="p-3 border rounded-lg bg-gray-50"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition"
        >
          {loading ? "Sending..." : "Send message"}
        </button>
      </div>
    </div>
  );
}
