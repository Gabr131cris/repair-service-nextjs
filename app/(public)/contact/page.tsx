"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";
import Image from "next/image";

interface ContactData {
  title: string;
  intro: string;
  address: string;
  phone: string;
  email: string;
  hours: { [key: string]: string };
  mapEmbed: string;
}

const translateDay = (day: string) => ({
  "Monday - Friday": "Luni - Vineri",
  Saturday: "Sâmbătă",
  Sunday: "Duminică",
} as Record<string, string>)[day] || day;

const translateHours = (hours: string) => ({
  "9 AM - 5 PM": "09:00 - 17:00",
  "9 AM - 12 PM": "09:00 - 12:00",
  "By Appointment Only": "Doar cu programare",
} as Record<string, string>)[hours] || hours;

export default function ContactPage() {
  const [content, setContent] = useState<ContactData>({
    title: "Contactează-ne",
    intro: "Spune-ne cum lucrează service-ul tău, iar noi îți arătăm cum poate fi configurată aplicația pentru echipa ta.",
    address: "",
    phone: "",
    email: "",
    hours: {
      "Luni - Vineri": "09:00 - 17:00",
      Sâmbătă: "09:00 - 12:00",
      Duminică: "Doar cu programare",
    },
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.503161324587!2d-89.20474632348264!3d40.72392817138439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880a776d6a3bfb6d%3A0x420c70309d1a1433!2sMidwest%20Classic%20Cars!5e0!3m2!1sen!2sus!4v1705000000000",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const role = await getUserRole();
      setRole(role);

      const docRef = doc(db, "pages", "contact");
      const snap = await getDoc(docRef, { source: "server" });

      if (snap.exists()) {
        const saved = snap.data() as ContactData;
        setContent((current) => ({
          ...current,
          ...saved,
          title: saved.title === "Contact Us" ? current.title : saved.title,
          intro: saved.intro || current.intro,
        }));
      }
      else await setDoc(docRef, content);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    const docRef = doc(db, "pages", "contact");
    try {
      await updateDoc(docRef, content);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("No document to update")) {
        await setDoc(docRef, content);
      } else throw err;
    }
    setIsEditing(false);
    setStatus("Conținutul a fost actualizat cu succes.");
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <main className="bg-white text-gray-800 min-h-screen">
      {/* ---------- HERO SECTION ---------- */}
      <section className="relative w-full h-[45vh] min-h-[420px]">
        <Image
          src="/images/hero-contact.jpg" // 👉 pune aici imaginea ta (ex: assets/hero-contact.jpg)
          alt="Contact Repair Service"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-md">
            Hai să discutăm
          </h1>
          <p className="mt-3 text-gray-700 max-w-2xl mx-auto">
            Solicită o demonstrație și află cum poți administra mai simplu clienții, serviciile și facturile.
          </p>
        </div>
      </section>

      {/* ---------- CONTACT CONTENT ---------- */}
      <section className="py-16 px-6 md:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          {isEditing ? (
            <input
              type="text"
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
              className="text-4xl font-bold border-b border-gray-300 focus:outline-none"
            />
          ) : (
            <h2 className="text-4xl font-extrabold text-gray-900">
              {content.title}
            </h2>
          )}

          {role === "superadmin" && (
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                isEditing
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isEditing ? "Salvează modificările" : "Editează pagina"}
            </button>
          )}
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* LEFT column */}
          <div>
            {isEditing ? (
              <textarea
                value={content.intro}
                onChange={(e) =>
                  setContent({ ...content, intro: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-3 mb-6 h-40 resize-none"
              />
            ) : (
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {content.intro}
              </p>
            )}

            {/* INFO blocks */}
            <div className="space-y-6">
              {/* Address */}
              <div>
                <h3 className="font-semibold text-gray-900 uppercase text-sm mb-1">
                  Adresă
                </h3>
                {isEditing ? (
                  <input
                    value={content.address}
                    onChange={(e) =>
                      setContent({ ...content, address: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded p-2"
                  />
                ) : (
                  <p>{content.address}</p>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-gray-900 uppercase text-sm mb-1">
                  Date de contact
                </h3>
                {isEditing ? (
                  <>
                    <input
                      value={content.phone}
                      onChange={(e) =>
                        setContent({ ...content, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded p-2 mb-2"
                    />
                    <input
                      value={content.email}
                      onChange={(e) =>
                        setContent({ ...content, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded p-2"
                    />
                  </>
                ) : (
                  <>
                    <a href={`tel:${content.phone.replace(/\s/g, "")}`} className="block font-medium hover:text-blue-600">{content.phone}</a>
                    <a href={`mailto:${content.email.trim()}`} className="block text-blue-600 hover:underline">{content.email.trim()}</a>
                  </>
                )}
              </div>

              {/* Hours */}
              <div>
                <h3 className="font-semibold text-gray-900 uppercase text-sm mb-2">
                  Program
                </h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {Object.entries(content.hours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between py-2 px-3 text-sm"
                    >
                      <span className="font-medium">{translateDay(day)}</span>
                      {isEditing ? (
                        <input
                          value={hours}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              hours: {
                                ...content.hours,
                                [day]: e.target.value,
                              },
                            })
                          }
                          className="border border-gray-300 rounded px-2"
                        />
                      ) : (
                        <span>{translateHours(hours)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
           {/* {!isEditing && (
              <button
                onClick={openWhatsApp}
                className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white font-semibold transition"
              >
                Contact Us
              </button>
            )} */}
          </div>

          {/* RIGHT column: Map */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {isEditing ? (
              <textarea
                value={content.mapEmbed}
                onChange={(e) =>
                  setContent({ ...content, mapEmbed: e.target.value })
                }
                className="w-full h-64 border border-gray-300 p-2 rounded-lg"
              />
            ) : (
              <iframe
                src={content.mapEmbed}
                title="Harta locației Repair Service"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            )}
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <p className="mt-6 text-green-600 font-medium text-center">
            {status}
          </p>
        )}
      </section>
    </main>
  );
}
