"use client";

import { useState } from "react";

export default function VehicleInquiryForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const [form, setForm] = useState({
    vin: "",
    make: "",
    model: "",
    year: "",
    miles: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErr: any = {};
    let valid = true;

    if (!form.firstName.trim()) {
      newErr.firstName = "Required";
      valid = false;
    }
    if (!form.lastName.trim()) {
      newErr.lastName = "Required";
      valid = false;
    }
    if (!form.phone.trim()) {
      newErr.phone = "Required";
      valid = false;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      newErr.email = "Invalid email";
      valid = false;
    }

    setErrors(newErr);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const res = await fetch("/api/send-vehicle-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setStatus("success");
      setForm({
        vin: "",
        make: "",
        model: "",
        year: "",
        miles: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      });

      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gray-200">

      {/* SUCCESS */}
      {status === "success" && (
        <p className="text-center mb-6 text-green-600 font-semibold text-lg">
          🎉 Your request has been submitted!
        </p>
      )}

      {/* ERROR */}
      {status === "error" && (
        <p className="text-center mb-6 text-red-600 font-semibold text-lg">
          ❌ Something went wrong. Try again!
        </p>
      )}

      {/* VEHICLE DETAILS */}
      <h2 className="text-center text-xl font-semibold mb-4">Your Vehicle Details</h2>

      <div className="grid grid-cols-1 gap-5">
        <input
          name="vin"
          placeholder="VIN"
          value={form.vin}
          onChange={handleChange}
          className="bg-gray-100 border border-gray-200 rounded-full px-5 py-4 outline-none focus:bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
        <input
          name="make"
          placeholder="Make"
          value={form.make}
          onChange={handleChange}
          className="bg-gray-100 border border-gray-200 rounded-full px-5 py-4 outline-none focus:bg-white"
        />
        <input
          name="model"
          placeholder="Model"
          value={form.model}
          onChange={handleChange}
          className="bg-gray-100 border border-gray-200 rounded-full px-5 py-4 outline-none focus:bg-white"
        />
        <input
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
          className="bg-gray-100 border border-gray-200 rounded-full px-5 py-4 outline-none focus:bg-white"
        />
        <input
          name="miles"
          placeholder="Miles"
          value={form.miles}
          onChange={handleChange}
          className="bg-gray-100 border border-gray-200 rounded-full px-5 py-4 outline-none focus:bg-white"
        />
      </div>

      {/* PERSONAL DETAILS */}
      <h2 className="text-center text-xl font-semibold mt-10 mb-4">
        Personal Details
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <input
            name="firstName"
            placeholder="First Name *"
            value={form.firstName}
            onChange={handleChange}
            className={`bg-gray-100 border rounded-full px-5 py-4 w-full outline-none ${
              errors.firstName ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <input
            name="lastName"
            placeholder="Last Name *"
            value={form.lastName}
            onChange={handleChange}
            className={`bg-gray-100 border rounded-full px-5 py-4 w-full outline-none ${
              errors.lastName ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>

        <div>
          <input
            name="phone"
            placeholder="Phone *"
            value={form.phone}
            onChange={handleChange}
            className={`bg-gray-100 border rounded-full px-5 py-4 w-full outline-none ${
              errors.phone ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <input
            name="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            className={`bg-gray-100 border rounded-full px-5 py-4 w-full outline-none ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-center mt-10">
        <button
  onClick={handleSubmit}
  disabled={loading}
  className="
    bg-blue-600 
    hover:bg-blue-700 
    text-white 
    px-10 
    py-3 
    rounded-full 
    font-semibold 
    transition-all 
    duration-200 
    hover:shadow-lg 
    hover:shadow-blue-300/50 
    disabled:opacity-50
  "
>
  {loading ? "Submitting..." : "SUBMIT"}
</button>

      </div>
    </div>
  );
}
