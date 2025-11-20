"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Save } from "lucide-react";

interface FieldState {
  name: string;
  type: string;
  active: boolean;
  order: number;
}

interface SectionState {
  id: string;
  title: string;
  fields: FieldState[];
}

export default function SchemaFieldOrder() {
  const [sections, setSections] = useState<SectionState[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Load schema (car_schemas)
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "car_schemas"));

      const data: SectionState[] = snap.docs.map((d) => ({
        id: d.id,
        title: d.data().title,
        fields: (d.data().fields || []).map((f: any) => ({
          name: f.name,
          type: f.type,
          active: f.active ?? true,
          order: f.order ?? 0,
        })),
      }));

      // sortăm secțiunile și câmpurile lor
      data.forEach((s) =>
        s.fields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );

      setSections(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading fields...</p>;

  // 🔄 Drag reorder
  const onDragEnd = (result: any, secIndex: number) => {
    if (!result.destination) return;

    const updated = [...sections];
    const fields = [...updated[secIndex].fields];

    const [moved] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, moved);

    // actualizăm ordine
    fields.forEach((f, i) => (f.order = i + 1));
    updated[secIndex].fields = fields;
    setSections(updated);
  };

  // 👁 Toggle visible
  const toggleField = (secIndex: number, fieldIndex: number) => {
    const updated = [...sections];
    updated[secIndex].fields[fieldIndex].active =
      !updated[secIndex].fields[fieldIndex].active;

    setSections(updated);
  };

  // 💾 Save
  const saveChanges = async () => {
    setSaving(true);
    try {
      for (const sec of sections) {
        await updateDoc(doc(db, "car_schemas", sec.id), {
          fields: sec.fields,
        });
      }
      alert("✅ Fields saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Save error");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6">
        Reorder & Toggle Section Fields
      </h1>

      {sections.map((section, secIndex) => (
        <div
          key={section.id}
          className="border border-gray-300 rounded-lg p-4 mb-6"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">{section.title}</h2>
          </div>

          <DragDropContext
            onDragEnd={(result) => onDragEnd(result, secIndex)}
          >
            <Droppable droppableId={`sec-${secIndex}`}>
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {section.fields.map((field, fieldIndex) => (
                    <Draggable
                      key={field.name}
                      draggableId={field.name}
                      index={fieldIndex}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center justify-between bg-gray-100 p-3 rounded border ${
                            field.active
                              ? "border-gray-300"
                              : "border-gray-300 opacity-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="text-gray-400" />
                            <span className="font-medium">
                              {field.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({field.type})
                            </span>
                          </div>

                          <button
                            onClick={() => toggleField(secIndex, fieldIndex)}
                            className={`px-3 py-1 rounded text-sm ${
                              field.active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {field.active ? "Visible" : "Hidden"}
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
      ))}

      <button
        onClick={saveChanges}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 flex items-center justify-center gap-2"
      >
        <Save size={18} />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
