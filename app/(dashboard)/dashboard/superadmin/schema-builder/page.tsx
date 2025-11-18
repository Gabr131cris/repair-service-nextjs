"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

type FieldType = "text" | "number" | "list" | "icon-value" | "richtext";

// 🔹 Adăugăm noul tip de secțiune "youtube"
type SectionType = "custom" | "list" | "richtext" | "images" | "youtube" | "files";

interface Field {
  id?: string;
  name: string;
  type: FieldType;
  icon?: string;
  placeholder?: string;
  order?: number;
  required?: boolean;
}

interface ImageItem {
  id: string;
  src: string;
}

interface Section {
  id?: string;
  title: string;
  type: SectionType;
  iconEnabled?: boolean;
  order: number;
  fields: Field[];
  images?: ImageItem[];
  items?: string[];
}

export default function SchemaBuilderPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load schema din Firestore
  useEffect(() => {
    const fetchSections = async () => {
      const querySnapshot = await getDocs(collection(db, "car_schemas"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Section[];

      const sorted = data
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((s) => ({
          ...s,
          fields: (s.fields || []).sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          ),
        }));

      setSections(sorted);
      setLoading(false);
    };
    fetchSections();
  }, []);

  // ➕ Add new section
  const addSection = () => {
    const newSection: Section = {
      title: "New Section",
      type: "custom",
      iconEnabled: true,
      order: sections.length + 1,
      fields: [],
      images: [],
    };
    setSections([...sections, newSection]);
  };

  // ➕ Add field
  const addField = (sIndex: number) => {
    const updated = [...sections];
    updated[sIndex].fields.push({
      name: "New Field",
      type: "text",
      placeholder: "",
      required: false,
      order: updated[sIndex].fields.length + 1,
    });
    setSections(updated);
  };

  // 🗑️ Remove field
  const removeField = (sIndex: number, fIndex: number) => {
    const updated = [...sections];
    updated[sIndex].fields.splice(fIndex, 1);
    setSections(updated);
  };

  // 🗑️ Remove section
  const removeSection = (index: number) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  // 🖼️ Add image (local)
  const addImage = (sIndex: number, files: FileList | null) => {
    if (!files) return;
    const updated = [...sections];
    const imgs = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      src: URL.createObjectURL(file),
    }));
    updated[sIndex].images = [...(updated[sIndex].images || []), ...imgs];
    setSections(updated);
  };

  // 🗑️ Remove image
  const removeImage = (sIndex: number, imgId: string) => {
    const updated = [...sections];
    updated[sIndex].images = updated[sIndex].images?.filter(
      (img) => img.id !== imgId
    );
    setSections(updated);
  };

  // 💾 Save schema
  const saveSchema = async () => {
    try {
      const snapshot = await getDocs(collection(db, "car_schemas"));
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "car_schemas", docSnap.id));
      }

      const ordered = sections.map((s, si) => ({
        ...s,
        order: si + 1,
        fields: s.fields.map((f, fi) => ({ ...f, order: fi + 1 })),
        items: s.items || [], // test empty array if undefined
      }));

      for (const s of ordered) {
        await addDoc(collection(db, "car_schemas"), s);
      }

      alert("✅ Schema saved successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ Error saving schema.");
    }
  };

  // 🔁 Drag & Drop logic
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { source, destination, type } = result;
    const updated = [...sections];

    if (type === "section") {
      const [moved] = updated.splice(source.index, 1);
      updated.splice(destination.index, 0, moved);
      updated.forEach((s, i) => (s.order = i + 1));
      setSections(updated);
      return;
    }

    if (type === "field") {
      const sectionIndex = parseInt(source.droppableId);
      const section = updated[sectionIndex];
      const [movedField] = section.fields.splice(source.index, 1);
      section.fields.splice(destination.index, 0, movedField);
      section.fields.forEach((f, i) => (f.order = i + 1));
      updated[sectionIndex] = section;
      setSections(updated);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading schema...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Car Schema Builder</h1>
        <button
          onClick={addSection}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} /> Add Section
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {sections.map((section, sIndex) => (
                <Draggable
                  key={`section-${sIndex}`}
                  draggableId={`section-${sIndex}`}
                  index={sIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            {...provided.dragHandleProps}
                            className="cursor-grab text-gray-400 hover:text-gray-600"
                          >
                            <GripVertical size={18} />
                          </span>
                          <input
                            value={section.title}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[sIndex].title = e.target.value;
                              setSections(updated);
                            }}
                            className="text-lg font-semibold border-b border-gray-300 bg-transparent outline-none flex-1"
                          />
                        </div>
                        <button
                          onClick={() => removeSection(sIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Type selector */}
                      <div className="flex items-center gap-3 mb-3">
                        <select
                          value={section.type}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[sIndex].type = e.target
                              .value as SectionType;
                            setSections(updated);
                          }}
                          className="border rounded p-2"
                        >
                          <option value="custom">Custom (Fields)</option>
                          <option value="list">List (Highlights)</option>
                          <option value="richtext">
                            Rich Text (Description)
                          </option>
                          <option value="images">Image Gallery</option>
                          {/* 🔹 Nou tip de secțiune */}
                          <option value="youtube">YouTube Links</option>
                          <option value="files">Files (PDF / DOC)</option>
                        </select>
                      </div>

                      {/* IMAGE GALLERY SECTION */}
                      {section.type === "images" && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <label className="block text-sm font-medium mb-2">
                            Upload images for this section
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => addImage(sIndex, e.target.files)}
                            className="mb-3"
                          />

                          <div className="flex flex-wrap gap-3">
                            {(section.images || []).map((img) => (
                              <div
                                key={img.id}
                                className="relative w-24 h-24 rounded border border-gray-300 overflow-hidden"
                              >
                                <img
                                  src={img.src}
                                  alt="preview"
                                  className="object-cover w-full h-full"
                                />
                                <button
                                  onClick={() => removeImage(sIndex, img.id)}
                                  className="absolute top-1 right-1 bg-white rounded-full text-red-500 shadow hover:bg-red-100"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CUSTOM FIELDS SECTION */}
                      {section.type === "custom" && (
                        <Droppable droppableId={`${sIndex}`} type="field">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {section.fields.map((field, fIndex) => (
                                <Draggable
                                  key={`field-${sIndex}-${fIndex}`}
                                  draggableId={`field-${sIndex}-${fIndex}`}
                                  index={fIndex}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center gap-3 bg-white p-2 rounded border border-gray-200 mb-2 cursor-grab"
                                    >
                                      <GripVertical
                                        size={14}
                                        className="text-gray-400"
                                      />
                                      <input
                                        value={field.name}
                                        onChange={(e) => {
                                          const updated = [...sections];
                                          updated[sIndex].fields[fIndex].name =
                                            e.target.value;
                                          setSections(updated);
                                        }}
                                        placeholder="Field name"
                                        className="flex-1 border rounded p-2"
                                      />
                                      <select
                                        value={field.type}
                                        onChange={(e) => {
                                          const updated = [...sections];
                                          updated[sIndex].fields[fIndex].type =
                                            e.target.value as FieldType;
                                          setSections(updated);
                                        }}
                                        className="border rounded p-2"
                                      >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="list">List</option>
                                        <option value="icon-value">
                                          Icon + Value
                                        </option>
                                        <option value="richtext">
                                          Rich Text
                                        </option>
                                      </select>
                                      <button
                                        onClick={() =>
                                          removeField(sIndex, fIndex)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              <button
                                onClick={() => addField(sIndex)}
                                className="mt-3 text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Plus size={14} /> Add Field
                              </button>
                            </div>
                          )}
                        </Droppable>
                      )}

                      {/* 🔹 YouTube section info */}
                      {section.type === "youtube" && (
                        <p className="text-sm text-gray-600 italic">
                          This section will allow adding YouTube links in the
                          car form.
                        </p>
                      )}

                      {/* LIST (HIGHLIGHTS) — textarea input */}
                      {section.type === "list" && (
  <div className="bg-white p-3 rounded-lg border border-gray-200">
    <label className="block text-sm font-medium mb-2">
      Paste equipment list (one item per line)
    </label>

    <p className="text-xs text-gray-500 mt-2">
      Total items: {section.items?.length || 0}
    </p>
  </div>
)}

                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {sections.length > 0 && (
        <div className="flex justify-end mt-6">
          <button
            onClick={saveSchema}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save size={16} /> Save Schema
          </button>
        </div>
      )}
    </div>
  );
}
