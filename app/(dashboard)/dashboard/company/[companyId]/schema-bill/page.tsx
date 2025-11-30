"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc            // ✔️ NECESAR!
} from "firebase/firestore";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/* ----------------------------------------------------------------------------
    🔥 TIPURI EXISTENTE (NU LE-AM ȘTERS, DOAR AM ADĂUGAT TIPURI NOI)
-----------------------------------------------------------------------------*/

type FieldType = "text" | "number" | "list" | "icon-value" | "richtext";

// 🔹 ADĂUGĂM TIPURILE NOI (fără să le ștergem pe cele vechi)
type SectionType =
  | "custom"
  | "list"
  | "richtext"
  | "images"
  | "youtube"
  | "files"
  | "vehicle_categories" // 🆕 Tip auto + Mărimi
  | "services" // 🆕 Servicii
  | "details_values"; // 🆕 Detalii tehnice (cuplu, presiune, etc.)

interface Field {
  id?: string;
  name: string;
  type: FieldType;
  icon?: string;
  placeholder?: string;
  order?: number;
  required?: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  defaultWheels: number;
}

interface VehicleCategory {
  id: string;
  name: string;
  sizes: string[];
}

interface DetailField {
  id: string;
  name: string;
  type: "number";
}

interface ImageItem {
  id: string;
  src: string;
}

interface Section {
  id?: string;
  title: string;
  type: SectionType;
  order: number;
  fields: Field[];

  // 🔥 NOILE PROPRIETĂȚI (nu deranjează pe cele vechi)
  vehicleCategories?: VehicleCategory[];
  services?: ServiceItem[];
  detailFields?: DetailField[];

  images?: ImageItem[];
  items?: string[];
}

/* ============================================================================
    🔥 COMPONENTA PRINCIPALĂ
============================================================================ */
export default function SchemaBuilderPage() {
  const { companyId } = useParams();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // ====================================================================================
  //         LOAD SCHEMA from Firestore (correct: companyBillSchemas/{companyId})
  // ====================================================================================
  useEffect(() => {
    const fetchSections = async () => {
      if (!companyId) return;

      const schemaRef = doc(db, "companyBillSchemas", companyId as string);
      const snap = await getDoc(schemaRef);

      if (!snap.exists()) {
        console.warn("No schema found for company:", companyId);
        setSections([]);
        setLoading(false);
        return;
      }

      const data = snap.data();

      const sorted = (data.sections || [])
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((s: any) => ({
          ...s,
          fields: (s.fields || []).sort(
            (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
          ),
        }));

      setSections(sorted);
      setLoading(false);
    };

    fetchSections();
  }, [companyId]);

  // ====================================================================================
  // ADD NEW SECTION
  // ====================================================================================
  const addSection = () => {
    const newSection: Section = {
      title: "New Section",
      type: "custom",
      order: sections.length + 1,
      fields: [],

      // 🔥 inițializăm și cele noi (gol)
      vehicleCategories: [],
      services: [],
      detailFields: [],
    };
    setSections([...sections, newSection]);
  };

  // ====================================================================================
  // ADD FIELD (CUSTOM)
  // ====================================================================================
  const addField = (sIndex: number) => {
    const updated = [...sections];
    updated[sIndex].fields.push({
      id: crypto.randomUUID(),
      name: "New Field",
      type: "text",
      order: updated[sIndex].fields.length + 1,
    });
    setSections(updated);
  };

  // ====================================================================================
  // REMOVE FIELD
  // ====================================================================================
  const removeField = (sIndex: number, fIndex: number) => {
    const updated = [...sections];
    updated[sIndex].fields.splice(fIndex, 1);
    setSections(updated);
  };

  // ====================================================================================
  // REMOVE SECTION
  // ====================================================================================
  const removeSection = (index: number) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  // ====================================================================================
  // ADD IMAGE
  // ====================================================================================
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

  const removeImage = (sIndex: number, imgId: string) => {
    const updated = [...sections];
    updated[sIndex].images = updated[sIndex].images?.filter(
      (img) => img.id !== imgId
    );
    setSections(updated);
  };

  // ====================================================================================
  // SAVE SCHEMA
  // ====================================================================================
  const saveSchema = async () => {
    try {
      const ordered = sections.map((s, si) => ({
        ...s,
        order: si + 1,
        fields: s.fields.map((f, fi) => ({ ...f, order: fi + 1 })),
      }));

      await setDoc(
        doc(db, "companyBillSchemas", companyId as string),
        { sections: ordered },
        { merge: true }
      );

      alert("Schema salvată cu succes!");
    } catch (error) {
      console.error(error);
      alert("Eroare la salvarea schemei!");
    }
  };

  // ====================================================================================
  // DRAG & DROP
  // ====================================================================================
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
      setSections(updated);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading schema...</p>;

  /* ============================================================================
      🔥 UI RENDER
  ============================================================================ */
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Schema Builder</h1>
        <button
          onClick={addSection}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add Section
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {/* =======================================================================================
                  🔥 EACH SECTION
              =======================================================================================*/}
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
                      className="border p-4 rounded-lg mb-6 bg-gray-50"
                    >
                      {/* HEADER */}
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span {...provided.dragHandleProps}>
                            <GripVertical size={18} className="text-gray-400" />
                          </span>
                          <input
                            value={section.title}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[sIndex].title = e.target.value;
                              setSections(updated);
                            }}
                            className="border-b bg-transparent outline-none text-lg font-semibold"
                          />
                        </div>

                        <button
                          onClick={() => removeSection(sIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* TYPE SELECTOR */}
                      <select
                        value={section.type}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[sIndex].type = e.target.value as SectionType;
                          setSections(updated);
                        }}
                        className="border p-2 rounded mb-4"
                      >
                        <option value="custom">Custom</option>
                        <option value="list">List</option>
                        <option value="richtext">Rich Text</option>
                        <option value="images">Images</option>
                        <option value="youtube">YouTube</option>
                        <option value="files">Files</option>

                        {/* 🆕 ADD THE 3 NEW TYPES */}
                        <option value="vehicle_categories">
                          Vehicle Categories
                        </option>
                        <option value="services">Services</option>
                        <option value="details_values">Details Values</option>
                      </select>

                      {/* =======================================================================================
                          🔥 SECTION RENDER BASED ON TYPE
                      =======================================================================================*/}

                      {/* CUSTOM FIELDS */}
                      {section.type === "custom" && (
                        <Droppable droppableId={`${sIndex}`} type="field">
                          {(provided) => (
                            <div ref={provided.innerRef}>
                              {section.fields.map((field, fIndex) => (
                                <Draggable
                                  key={field.id}
                                  draggableId={field.id!}
                                  index={fIndex}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center gap-3 bg-white border p-2 rounded mb-2"
                                    >
                                      <GripVertical size={16} />

                                      <input
                                        value={field.name}
                                        onChange={(e) => {
                                          const updated = [...sections];
                                          updated[sIndex].fields[fIndex].name =
                                            e.target.value;
                                          setSections(updated);
                                        }}
                                        className="flex-1 border p-2 rounded"
                                      />

                                      <select
                                        value={field.type}
                                        onChange={(e) => {
                                          const updated = [...sections];
                                          updated[sIndex].fields[fIndex].type =
                                            e.target.value as FieldType;
                                          setSections(updated);
                                        }}
                                        className="border p-2 rounded"
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
                                        className="text-red-500"
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
                                className="text-blue-600 flex gap-1 mt-2"
                              >
                                <Plus size={16} /> Add Field
                              </button>
                            </div>
                          )}
                        </Droppable>
                      )}

                      {/* =======================================================================================
                          🆕 VEHICLE CATEGORIES SECTION
                      =======================================================================================*/}
                      {section.type === "vehicle_categories" && (
                        <VehicleCategoriesEditor
                          section={section}
                          onChange={(v) => {
                            const updated = [...sections];
                            updated[sIndex].vehicleCategories = v;
                            setSections(updated);
                          }}
                        />
                      )}

                      {/* =======================================================================================
                          🆕 SERVICES SECTION
                      =======================================================================================*/}
                      {section.type === "services" && (
                        <ServicesEditor
                          section={section}
                          onChange={(v) => {
                            const updated = [...sections];
                            updated[sIndex].services = v;
                            setSections(updated);
                          }}
                        />
                      )}

                      {/* =======================================================================================
                          🆕 DETAILS VALUES SECTION
                      =======================================================================================*/}
                      {section.type === "details_values" && (
                        <DetailsValuesEditor
                          section={section}
                          onChange={(v) => {
                            const updated = [...sections];
                            updated[sIndex].detailFields = v;
                            setSections(updated);
                          }}
                        />
                      )}

                      {/* IMAGES */}
                      {section.type === "images" && (
                        <div className="p-3 border bg-white rounded">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => addImage(sIndex, e.target.files)}
                          />
                          <div className="flex gap-3 mt-3">
                            {section.images?.map((img) => (
                              <div key={img.id} className="relative w-24 h-24">
                                <img
                                  src={img.src}
                                  className="object-cover w-full h-full rounded"
                                />
                                <button
                                  className="absolute top-1 right-1 bg-white rounded p-1"
                                  onClick={() => removeImage(sIndex, img.id)}
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
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

      <button
        onClick={saveSchema}
        className="mt-6 bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 ml-auto"
      >
        <Save size={16} /> Save Schema
      </button>
    </div>
  );
}

/* ================================================================================
      🆕 COMPONENTĂ PENTRU VEHICLE CATEGORIES
================================================================================ */
function VehicleCategoriesEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (data: VehicleCategory[]) => void;
}) {
  const categories = section.vehicleCategories || [];

  const addCategory = () => {
    onChange([
      ...categories,
      {
        id: crypto.randomUUID(),
        name: "New Category",
        sizes: [],
      },
    ]);
  };

  const addSize = (catIndex: number) => {
    const updated = [...categories];
    updated[catIndex].sizes.push("R16");
    onChange(updated);
  };

  return (
    <div className="p-2 bg-white rounded border">
      <h3 className="font-semibold mb-2">Vehicle Categories</h3>

      {categories.map((cat, i) => (
        <div key={cat.id} className="border p-3 mb-3 rounded">
          <div className="flex justify-between">
            <input
              value={cat.name}
              onChange={(e) => {
                const updated = [...categories];
                updated[i].name = e.target.value;
                onChange(updated);
              }}
              className="border p-1 rounded"
            />
            <button
              onClick={() => onChange(categories.filter((_, idx) => idx !== i))}
              className="text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Sizes */}
          <div className="mt-3">
            <label className="text-sm font-medium">Sizes:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {cat.sizes.map((sz, si) => (
                <div
                  key={si}
                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                >
                  <input
                    value={sz}
                    onChange={(e) => {
                      const updated = [...categories];
                      updated[i].sizes[si] = e.target.value;
                      onChange(updated);
                    }}
                    className="bg-transparent outline-none"
                  />
                  <button
                    onClick={() => {
                      const updated = [...categories];
                      updated[i].sizes = updated[i].sizes.filter(
                        (_, idx) => idx !== si
                      );
                      onChange(updated);
                    }}
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              ))}

              <button
                className="text-blue-600 flex items-center gap-1"
                onClick={() => addSize(i)}
              >
                <Plus size={14} /> Add Size
              </button>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addCategory} className="text-blue-600 flex gap-1 mt-2">
        <Plus size={16} /> Add Category
      </button>
    </div>
  );
}

/* ================================================================================
      🆕 COMPONENTĂ PENTRU SERVICES
================================================================================ */
function ServicesEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (data: ServiceItem[]) => void;
}) {
  const services = section.services || [];

  const addService = () => {
    onChange([
      ...services,
      {
        id: crypto.randomUUID(),
        name: "New Service",
        defaultWheels: 0,
      },
    ]);
  };

  return (
    <div className="p-2 bg-white rounded border">
      <h3 className="font-semibold mb-2">Services</h3>

      {services.map((srv, i) => (
        <div
          key={srv.id}
          className="border p-3 mb-3 rounded flex items-center gap-3"
        >
          <input
            value={srv.name}
            onChange={(e) => {
              const updated = [...services];
              updated[i].name = e.target.value;
              onChange(updated);
            }}
            className="border p-2 rounded flex-1"
          />

          <input
            type="number"
            value={srv.defaultWheels}
            onChange={(e) => {
              const updated = [...services];
              updated[i].defaultWheels = Number(e.target.value);
              onChange(updated);
            }}
            className="border p-2 w-20 rounded"
          />

          <button
            onClick={() => onChange(services.filter((_, idx) => idx !== i))}
            className="text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button onClick={addService} className="text-blue-600 flex gap-1 mt-2">
        <Plus size={16} /> Add Service
      </button>
    </div>
  );
}

/* ================================================================================
      🆕 COMPONENTĂ PENTRU DETAILS VALUES
================================================================================ */
function DetailsValuesEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (data: DetailField[]) => void;
}) {
  const fields = section.detailFields || [];

  const addDetail = () => {
    onChange([
      ...fields,
      {
        id: crypto.randomUUID(),
        name: "New Detail",
        type: "number",
      },
    ]);
  };

  return (
    <div className="p-2 bg-white rounded border">
      <h3 className="font-semibold mb-2">Detail Fields</h3>

      {fields.map((f, i) => (
        <div
          key={f.id}
          className="flex items-center gap-3 border p-2 rounded mb-2"
        >
          <input
            value={f.name}
            onChange={(e) => {
              const updated = [...fields];
              updated[i].name = e.target.value;
              onChange(updated);
            }}
            className="border p-2 rounded flex-1"
          />

          <button
            onClick={() => onChange(fields.filter((_, idx) => idx !== i))}
            className="text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button onClick={addDetail} className="text-blue-600 flex gap-1 mt-2">
        <Plus size={16} /> Add Detail Field
      </button>
    </div>
  );
}
