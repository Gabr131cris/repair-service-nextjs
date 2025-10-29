"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { GripVertical, Save } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface SectionState {
  name: string;
  active: boolean;
}

export default function SchemaOrderPage() {
  const [sections, setSections] = useState<SectionState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 1. Fetch existing order (if any)
        const orderRef = doc(db, "settings", "schema_order");
        const orderSnap = await getDoc(orderRef);
        const savedSections: SectionState[] = orderSnap.exists()
          ? orderSnap.data().sections || []
          : [];

        // 🔹 2. Fetch all schema sections from car_schemas collection
        const querySnapshot = await getDocs(collection(db, "car_schemas"));
        const firestoreSections = querySnapshot.docs
          .map((doc) => doc.data()?.title)
          .filter((title): title is string => !!title);

        // 🔹 3. Combine Firestore sections with saved order (preserve order!)
        let combined: SectionState[] = [];

        // ✅ Începem cu ordinea salvată (cea din Firestore)
        savedSections.forEach((saved) => {
          if (firestoreSections.includes(saved.name)) {
            combined.push(saved);
          }
        });

        // ✅ Adaugăm orice secțiune nouă apărută între timp în car_schemas
        firestoreSections.forEach((name) => {
          if (!combined.some((s) => s.name === name)) {
            combined.push({ name, active: true });
          }
        });

        // ✅ (opțional) Adaugăm cele vechi care nu mai există în car_schemas, la final
        savedSections.forEach((old) => {
          if (!firestoreSections.includes(old.name)) {
            combined.push(old);
          }
        });

        setSections(combined);

        // 🔹 4. Add any old sections that no longer exist in car_schemas (optional)
        savedSections.forEach((old) => {
          if (!firestoreSections.includes(old.name)) {
            combined.push(old);
          }
        });

        setSections(combined);
      } catch (err) {
        console.error("Error loading schema order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Handle drag & drop reorder
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newOrder = Array.from(sections);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    setSections(newOrder);
  };

  // 🔹 Toggle section visibility
  const toggleActive = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, active: !s.active } : s))
    );
  };

  // 🔹 Save to Firestore
  const handleSave = async () => {
    try {
      setSaving(true);
      const ref = doc(db, "settings", "schema_order");
      await setDoc(ref, { sections });
      alert("✅ Order & visibility saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600">Loading sections...</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
      <h1 className="text-2xl font-semibold mb-4">
        Reorder & Toggle Schema Sections
      </h1>
      <p className="text-gray-600 mb-6">
        Drag to reorder sections or toggle their visibility. Sections come
        directly from your <b>car_schemas</b> collection.
      </p>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {sections.map((section, index) => (
                  <Draggable
                    key={section.name}
                    draggableId={section.name}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center justify-between gap-3 bg-white border rounded-md p-3 shadow-sm transition ${
                          section.active
                            ? "border-gray-200 hover:bg-gray-100"
                            : "border-gray-300 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="text-gray-400 cursor-grab" />
                          <span className="font-medium text-gray-800">
                            {section.name}
                          </span>
                        </div>

                        {/* Toggle active/inactive */}
                        <button
                          onClick={() => toggleActive(index)}
                          className={`px-3 py-1 text-sm rounded-md font-medium transition ${
                            section.active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {section.active ? "Active" : "Hidden"}
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
