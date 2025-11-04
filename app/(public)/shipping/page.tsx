"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";
import { Truck, ShieldCheck, Clock3 } from "lucide-react";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface ShippingData {
  heroImage: string;
  title: string;
  description: string[];
  highlights: string[];
  gallery: GalleryImage[];
}

export default function ShippingPage() {
  const defaultData: ShippingData = {
    heroImage: "/images/shipping-hero.jpg",
    title: "Classic Car Shipping",
    description: [
      "Garage Kept Motors offers classic car shipping and transport services for all makes, models, and years of classic cars. Our experienced staff is dedicated to safely transporting your vehicle from one location to another with the utmost care and attention to detail.",
      "We understand that classic cars are valuable investments, which is why we use only the most advanced auto transport equipment and practices to ensure your vehicle is properly and securely transported.",
      "From our enclosed shipping trailers that protect your car from the elements to our open trailer options which allow for direct loading and unloading, Garage Kept Motors has you covered when it comes to classic car transport.",
      "We also offer express delivery services on select vehicles, so you can rest assured that your classic car is arriving on-time and in perfect condition.",
      "Contact us today to learn more about our classic car transport services and how we can help you safely move your vehicle.",
    ],
    highlights: [
      "Enclosed & open transport options available",
      "Nationwide & international delivery service",
      "Fast, insured, and secure transport for classic vehicles",
    ],
    gallery: [
      { url: "/images/shipping1.jpg", caption: "Enclosed Trailer Transport" },
      { url: "/images/shipping2.jpg", caption: "Safe Vehicle Loading" },
      { url: "/images/shipping3.jpg", caption: "Delivered Nationwide" },
    ],
  };

  const [content, setContent] = useState<ShippingData>(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  /* 🔹 Load from Firestore */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRole = await getUserRole();
        setRole(userRole);

        const docRef = doc(db, "pages", "shipping");
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data() as Partial<ShippingData>;
          setContent({
            heroImage: data.heroImage || defaultData.heroImage,
            title: data.title || defaultData.title,
            description: data.description || defaultData.description,
            highlights: data.highlights || defaultData.highlights,
            gallery: data.gallery || defaultData.gallery,
          });
        } else {
          await setDoc(docRef, defaultData);
        }
      } catch (err) {
        console.error("Error loading shipping page:", err);
        setContent(defaultData);
      }
    };
    fetchData();
  }, []);

  /* 🔹 Save to Firestore */
  const handleSave = async () => {
    const docRef = doc(db, "pages", "shipping");
    try {
      await updateDoc(docRef, content);
    } catch {
      await setDoc(docRef, content);
    }
    setIsEditing(false);
    setStatus("✅ Shipping page updated!");
    setTimeout(() => setStatus(""), 3000);
  };

  /* 🔹 Upload helper */
  const uploadImage = async (file: File | null): Promise<string | null> => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-page", { method: "POST", body: formData });
    const data = await res.json();
    return data.url || null;
  };

  const handleHeroUpload = async (file: File | null) => {
    const url = await uploadImage(file);
    if (url) setContent((prev) => ({ ...prev, heroImage: url }));
  };

  const handleGalleryUpload = async (file: File | null) => {
    const url = await uploadImage(file);
    if (!url) return;
    setContent((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), { url, caption: "New Image" }],
    }));
  };

  const removeGalleryItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  return (
    <section className="bg-white text-gray-900 min-h-screen">
      {/* 🏁 Hero Section */}
      <div className="relative w-full h-[45vh] min-h-[420px] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={content.heroImage || "/images/placeholder-hero.jpg"}
          alt="Shipping Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

        <div className="relative z-10 max-w-3xl px-6">
          {isEditing ? (
            <>
              <input
                type="file"
                onChange={(e) => handleHeroUpload(e.target.files?.[0] || null)}
                className="text-xs bg-white/80 p-1 rounded mb-2"
              />
              <input
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="text-4xl md:text-5xl font-bold text-center border-b border-blue-400 focus:outline-none bg-transparent text-white w-full"
              />
            </>
          ) : (
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">
              {content.title}
            </h1>
          )}
        </div>
      </div>

      {/* 📜 Description */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-6">
        {isEditing ? (
          content.description.map((para, i) => (
            <textarea
              key={i}
              value={para}
              onChange={(e) => {
                const updated = [...content.description];
                updated[i] = e.target.value;
                setContent({ ...content, description: updated });
              }}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700"
            />
          ))
        ) : (
          content.description.map((para, i) => (
            <p key={i} className="text-gray-600 text-lg leading-relaxed">
              {para}
            </p>
          ))
        )}
      </div>

      {/* 🚚 Highlights Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          {content.highlights.map((text, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-6 flex flex-col items-center"
            >
              <div className="text-blue-600 mb-3">
                {i === 0 ? <Truck size={30} /> : i === 1 ? <ShieldCheck size={30} /> : <Clock3 size={30} />}
              </div>
              {isEditing ? (
                <textarea
                  value={text}
                  onChange={(e) => {
                    const updated = [...content.highlights];
                    updated[i] = e.target.value;
                    setContent({ ...content, highlights: updated });
                  }}
                  className="w-full border p-2 rounded text-center text-sm"
                />
              ) : (
                <p className="text-gray-700 text-base">{text}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🖼️ Gallery */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          Transport Gallery
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {(content.gallery || []).map((img, index) => (
            <div
              key={index}
              className="relative bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="aspect-[4/3] relative w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
  <Image
    src={img.url}
    alt={img.caption || `Gallery image ${index + 1}`}
    fill
    className="object-cover object-center"
  />
</div>

              {isEditing && (
                <>
                  <button
                    onClick={() => removeGalleryItem(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                  <input
                    type="text"
                    value={img.caption || ""}
                    onChange={(e) => {
                      const updated = [...content.gallery];
                      updated[index].caption = e.target.value;
                      setContent({ ...content, gallery: updated });
                    }}
                    className="absolute bottom-2 left-2 bg-white/80 text-xs p-1 rounded w-[90%]"
                  />
                </>
              )}
              {!isEditing && img.caption && (
                <p className="text-center text-gray-600 text-sm py-2 bg-white">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="text-center mt-8">
            <input
              type="file"
              onChange={(e) => handleGalleryUpload(e.target.files?.[0] || null)}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 🧭 Admin Controls */}
      {role === "superadmin" && (
        <div className="text-center mt-12 pb-16">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
              isEditing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
          </button>
          {status && (
            <p className="mt-3 text-green-600 text-sm font-medium">{status}</p>
          )}
        </div>
      )}
    </section>
  );
}
