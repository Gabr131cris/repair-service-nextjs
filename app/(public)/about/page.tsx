"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";

interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
  image: string;
}

interface AboutData {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroText: string;
  heroButtons: { text: string; link: string }[];
  section2Title: string;
  section2Text: string;
  section2Quote: string;
  section2Image: string;
  teamTitle: string;
  team: TeamMember[];
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutData>({
    heroTitle: "BUILT ON TWENTY FIVE YEARS OF AUTO RACING PASSION",
    heroSubtitle: "Dariella Motors",
    heroImage: "/images/hero-about.jpg",
    heroText:
      "Dariella Motors has become the premier exotic car dealer located in the heart of Florida’s beautiful Sunny Isles Beach.",
    heroButtons: [
      { text: "CONTACT US", link: "https://wa.me/1234567890" },
      { text: "VIEW OUR INVENTORY", link: "/listings" },
    ],
    section2Title: "WE BUY, SELL AND CONSIGN EXOTIC CARS NATIONWIDE",
    section2Text:
      "Dariella Motors Cars is located in Sunny Isles Beach, Florida, and serves customers throughout the country and the world.",
    section2Quote:
      "We work hard every day to build a reputation as the most trusted exotic car dealer. I personally inspect and handle each and every car sale.",
    section2Image: "/images/about-team.jpg",
    teamTitle: "OUR TEAM",
    team: [
      {
        name: "ERIC CURRAN",
        role: "CEO / Founder",
        phone: "(844) 488-9323 ext. 103",
        email: "eric@westcoastexoticcars.com",
        image: "/images/team1.jpg",
      },
      {
        name: "BLAKE WARREN",
        role: "Director of Marketing / Business Development",
        phone: "(844) 488-9323 ext. 104",
        email: "blake@westcoastexoticcars.com",
        image: "/images/team2.jpg",
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  // 🔹 Load Firestore content
  useEffect(() => {
    const fetchData = async () => {
      const role = await getUserRole();
      setRole(role);

      const docRef = doc(db, "pages", "about");
      const snap = await getDoc(docRef, { source: "server" });

      if (snap.exists()) setContent(snap.data() as AboutData);
      else await setDoc(docRef, content);
    };
    fetchData();
  }, []);

  // 🔹 Save or create Firestore doc
  const handleSave = async () => {
    const docRef = doc(db, "pages", "about");
    try {
      await updateDoc(docRef, content);
    } catch (err: any) {
      if (err.message.includes("No document to update")) {
        await setDoc(docRef, content);
      } else throw err;
    }
    setIsEditing(false);
    setStatus("✅ About page updated successfully!");
    setTimeout(() => setStatus(""), 3000);
  };

  // 🔹 Image upload helper
  const handleImageUpload = async (key: string, file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-page", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.url) return;

    if (key.startsWith("team[")) {
      const match = key.match(/team\[(\d+)\]\.image/);
      if (match) {
        const index = parseInt(match[1]);
        setContent((prev) => {
          const updatedTeam = [...prev.team];
          updatedTeam[index].image = data.url;
          return { ...prev, team: updatedTeam };
        });
      }
    } else {
      setContent((prev) => ({ ...prev, [key]: data.url }));
    }
  };

  return (
    <section className="bg-white text-gray-800 py-12 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* 🏎️ Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            {isEditing ? (
              <textarea
                value={content.heroTitle}
                onChange={(e) =>
                  setContent({ ...content, heroTitle: e.target.value })
                }
                className="w-full text-3xl font-bold border border-gray-300 p-2 mb-2 rounded"
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-extrabold uppercase leading-tight mb-4 text-gray-900">
                {content.heroTitle}
              </h1>
            )}

            {isEditing ? (
              <textarea
                value={content.heroText}
                onChange={(e) =>
                  setContent({ ...content, heroText: e.target.value })
                }
                className="w-full border border-gray-300 p-3 text-gray-700 rounded"
              />
            ) : (
              <p className="text-gray-700 mb-6 leading-relaxed">
                {content.heroText}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {content.heroButtons.map((btn, i) =>
                isEditing ? (
                  <input
                    key={i}
                    type="text"
                    value={btn.text}
                    onChange={(e) => {
                      const buttons = [...content.heroButtons];
                      buttons[i].text = e.target.value;
                      setContent({ ...content, heroButtons: buttons });
                    }}
                    className="border border-gray-300 px-3 py-2 rounded text-sm text-gray-700"
                  />
                ) : (
                  <a
                    key={i}
                    href={btn.link}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold text-sm transition"
                  >
                    {btn.text}
                  </a>
                )
              )}
            </div>
          </div>

          <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-md">
            <Image
              src={content.heroImage}
              alt="Hero"
              fill
              className="object-cover"
            />
            {isEditing && (
              <input
                type="file"
                onChange={(e) =>
                  handleImageUpload("heroImage", e.target.files?.[0] || null)
                }
                className="absolute bottom-2 left-2 text-xs bg-white/80 p-1 rounded"
              />
            )}
          </div>
        </div>

        {/* 🏁 Section 2 */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-md">
            <Image
              src={content.section2Image}
              alt="About image"
              fill
              className="object-cover"
            />
            {isEditing && (
              <input
                type="file"
                onChange={(e) =>
                  handleImageUpload("section2Image", e.target.files?.[0] || null)
                }
                className="absolute bottom-2 left-2 text-xs bg-white/80 p-1 rounded"
              />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {content.section2Title}
            </h2>
            {isEditing ? (
              <textarea
                value={content.section2Text}
                onChange={(e) =>
                  setContent({ ...content, section2Text: e.target.value })
                }
                className="w-full border border-gray-300 p-3 text-gray-700 rounded mb-4"
              />
            ) : (
              <p className="text-gray-700 mb-6 leading-relaxed">
                {content.section2Text}
              </p>
            )}

            {isEditing ? (
              <textarea
                value={content.section2Quote}
                onChange={(e) =>
                  setContent({ ...content, section2Quote: e.target.value })
                }
                className="w-full border border-gray-300 p-3 italic text-gray-600 rounded"
              />
            ) : (
              <blockquote className="text-gray-600 italic border-l-4 border-blue-500 pl-4 bg-blue-50/40 py-2 px-3 rounded">
                “{content.section2Quote}”
              </blockquote>
            )}
          </div>
        </div>

        {/* 👥 Team Section */}
<div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-3xl font-bold text-gray-900">
      {content.teamTitle}
    </h2>

    {isEditing && (
      <button
        onClick={() => {
          setContent((prev) => ({
            ...prev,
            team: [
              ...prev.team,
              {
                name: "New Member",
                role: "Role",
                phone: "",
                email: "",
                image: "/images/placeholder-avatar.jpg",
              },
            ],
          }));
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
      >
        ➕ Add Member
      </button>
    )}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {content.team.map((member, i) => (
      <div
        key={i}
        className="text-center bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
      >
        <div className="relative w-full h-[260px] mb-4 rounded-lg overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover"
          />
          {isEditing && (
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(`team[${i}].image`, file);
                }
              }}
              className="absolute bottom-2 left-2 text-xs bg-white/80 p-1 rounded"
            />
          )}
        </div>

        {isEditing ? (
          <>
            <input
              value={member.name}
              onChange={(e) => {
                const team = [...content.team];
                team[i].name = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-1 rounded"
            />
            <input
              value={member.role}
              onChange={(e) => {
                const team = [...content.team];
                team[i].role = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-1 rounded"
            />
            <input
              value={member.phone}
              onChange={(e) => {
                const team = [...content.team];
                team[i].phone = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-1 rounded text-sm"
            />
            <input
              value={member.email}
              onChange={(e) => {
                const team = [...content.team];
                team[i].email = e.target.value;
                setContent({ ...content, team });
              }}
              className="w-full border border-gray-300 p-2 mb-3 rounded text-sm"
            />

            <button
              onClick={() => {
                const updated = [...content.team];
                updated.splice(i, 1);
                setContent({ ...content, team: updated });
              }}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
            >
              🗑 Remove
            </button>
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg text-gray-900">
              {member.name}
            </h3>
            <p className="text-gray-500 text-sm mb-2">{member.role}</p>
            <p className="text-gray-700 text-sm">{member.phone}</p>
            <p className="text-blue-600 text-sm">{member.email}</p>
          </>
        )}
      </div>
    ))}
  </div>
</div>


        {/* Admin Controls */}
        {role === "superadmin" && (
          <div className="text-center mt-8">
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
      </div>
    </section>
  );
}
