"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Upload } from "lucide-react";

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>({
    siteName: "",
    description: "",
    logoUrl: "",
    contactEmail: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    facebook: "",
    instagram: "",
    youtube: "",
  });

  // 🔹 Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const refDoc = doc(db, "settings", "site_info");
        const snap = await getDoc(refDoc);
        if (snap.exists()) setData(snap.data());
      } catch (err) {
        console.error("Error loading site info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Handle input change
  const handleChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // 🔹 Convert uploaded logo to webp
  const handleLogoUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const webpData = canvas.toDataURL("image/webp", 0.8);
        setData({ ...data, logoUrl: webpData });
      };
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Save all data
  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "site_info"), data);
      alert("✅ Site settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("❌ Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading settings...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Website Settings</h1>
      <p className="text-gray-600 mb-6">
        Manage general information, contact details, logo, and footer/topbar info.
      </p>

      {/* 🔹 Logo upload */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Logo</label>

        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt="Logo"
            className="w-32 h-32 object-contain mb-3 border rounded-lg bg-gray-50"
          />
        ) : (
          <div className="w-32 h-32 mb-3 border rounded-lg flex items-center justify-center text-gray-400 bg-gray-50">
            No logo
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Upload size={16} />
            Upload Logo (.jpg, .png)
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
          {data.logoUrl && (
            <button
              onClick={() => setData({ ...data, logoUrl: "" })}
              className="text-red-500 text-sm hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* 🔹 Basic site info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Site Name</label>
          <input
            type="text"
            name="siteName"
            value={data.siteName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Car Market"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={data.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Buy or sell cars easily."
          />
        </div>
      </div>

      {/* 🔹 Contact info (for TopBar & Footer) */}
      <h2 className="text-lg font-semibold mt-8 mb-4">Contact Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            name="contactEmail"
            value={data.contactEmail}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="info@carmarket.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="+1 (309) 219-9999"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">City</label>
          <input
            type="text"
            name="city"
            value={data.city}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Chicago"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Country</label>
          <input
            type="text"
            name="country"
            value={data.country}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="USA"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">Full Address</label>
          <input
            type="text"
            name="address"
            value={data.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="123 Main Street, Chicago, IL"
          />
        </div>
      </div>

      {/* 🔹 Social Media */}
      <h2 className="text-lg font-semibold mt-8 mb-4">Social Media Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {["facebook", "instagram", "youtube"].map((key) => (
          <div key={key}>
            <label className="block text-gray-700 font-medium mb-1 capitalize">
              {key}
            </label>
            <input
              type="text"
              name={key}
              value={data[key]}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder={`https://${key}.com/...`}
            />
          </div>
        ))}
      </div>

      {/* 🔹 Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
