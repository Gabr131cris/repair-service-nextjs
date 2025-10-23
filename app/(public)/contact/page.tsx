"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";

interface ContactData {
  title: string;
  intro: string;
  address: string;
  phone: string;
  email: string;
  hours: { [key: string]: string };
  mapEmbed: string;
}

export default function ContactPage() {
  const [content, setContent] = useState<ContactData>({
    title: "Contact Us",
    intro:
      "We’d love to hear from you! Reach out to discuss your next vehicle purchase, schedule a visit, or just say hello.",
    address: "418 North Main Street, Roanoke, IL 61561",
    phone: "+1 309-219-9999",
    email: "info@classiccars.com",
    hours: {
      "Monday - Friday": "9 AM - 5 PM",
      Saturday: "9 AM - 12 PM",
      Sunday: "By Appointment Only",
    },
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.503161324587!2d-89.20474632348264!3d40.72392817138439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880a776d6a3bfb6d%3A0x420c70309d1a1433!2sMidwest%20Classic%20Cars!5e0!3m2!1sen!2sus!4v1705000000000",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  // 🔹 Load Firestore data
  useEffect(() => {
    const fetchData = async () => {
      const role = await getUserRole();
      setRole(role);

      const docRef = doc(db, "pages", "contact");
      const snap = await getDoc(docRef);

      if (snap.exists()) setContent(snap.data() as ContactData);
      else await setDoc(docRef, content); // ✅ Create if missing
    };
    fetchData();
  }, []);

  // 🔹 Save or create
  const handleSave = async () => {
    const docRef = doc(db, "pages", "contact");
    try {
      await updateDoc(docRef, content);
    } catch (err: any) {
      if (err.message.includes("No document to update")) {
        await setDoc(docRef, content);
      } else throw err;
    }
    setIsEditing(false);
    setStatus("✅ Content updated successfully!");
    setTimeout(() => setStatus(""), 3000);
  };

  // 🔹 WhatsApp link
  const openWhatsApp = () => {
    const phoneClean = content.phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${phoneClean}`, "_blank");
  };

  return (
    <section className="bg-[#111] text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {isEditing ? (
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="text-4xl font-bold bg-transparent border-b border-gray-500 focus:outline-none"
            />
          ) : (
            <h1 className="text-4xl font-extrabold uppercase tracking-wide">
              {content.title}
            </h1>
          )}

          {role === "superadmin" && (
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                isEditing
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
            </button>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left column */}
          <div>
            {isEditing ? (
              <textarea
                value={content.intro}
                onChange={(e) => setContent({ ...content, intro: e.target.value })}
                className="w-full bg-transparent border border-gray-500 rounded-lg p-3 text-gray-200 mb-8 h-40 resize-none"
              />
            ) : (
              <p className="text-gray-300 mb-8 leading-relaxed">{content.intro}</p>
            )}

            {/* Address */}
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-bold text-white uppercase mb-1">Location</h3>
                {isEditing ? (
                  <input
                    value={content.address}
                    onChange={(e) =>
                      setContent({ ...content, address: e.target.value })
                    }
                    className="w-full bg-transparent border border-gray-600 rounded p-2 text-gray-200"
                  />
                ) : (
                  <p>{content.address}</p>
                )}
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-bold uppercase mb-1">How to Reach Us</h3>
                {isEditing ? (
                  <>
                    <input
                      value={content.phone}
                      onChange={(e) =>
                        setContent({ ...content, phone: e.target.value })
                      }
                      className="w-full bg-transparent border border-gray-600 rounded p-2 mb-2 text-gray-200"
                    />
                    <input
                      value={content.email}
                      onChange={(e) =>
                        setContent({ ...content, email: e.target.value })
                      }
                      className="w-full bg-transparent border border-gray-600 rounded p-2 text-gray-200"
                    />
                  </>
                ) : (
                  <>
                    <p>{content.phone}</p>
                    <p>{content.email}</p>
                  </>
                )}
              </div>

              {/* Hours */}
              <div>
                <h3 className="font-bold uppercase mb-2">Hours</h3>
                <div className="border-t border-gray-700 divide-y divide-gray-700">
                  {Object.entries(content.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between py-2">
                      <span className="font-semibold">{day}:</span>
                      {isEditing ? (
                        <input
                          value={hours}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              hours: { ...content.hours, [day]: e.target.value },
                            })
                          }
                          className="bg-transparent border border-gray-600 rounded px-2 text-gray-200"
                        />
                      ) : (
                        <span>{hours}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            {!isEditing && (
              <button
                onClick={openWhatsApp}
                className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full font-semibold transition"
              >
                CONTACT US
              </button>
            )}
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border-4 border-red-600">
            {isEditing ? (
              <textarea
                value={content.mapEmbed}
                onChange={(e) =>
                  setContent({ ...content, mapEmbed: e.target.value })
                }
                className="w-full h-64 bg-black text-gray-300 p-2 border border-gray-600 rounded-lg"
              />
            ) : (
              <iframe
                src={content.mapEmbed}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            )}
          </div>
        </div>

        {status && (
          <p className="mt-6 text-green-400 font-medium text-center">{status}</p>
        )}
      </div>
    </section>
  );
}
