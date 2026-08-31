/* Firestore schemas are administrator-defined, so their nested fields are intentionally dynamic. */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TemplateProps {
  bill: Record<string, any>;
  company: Record<string, any>;
  copyType?: "client" | "service";
}

interface TemplateRow {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

const normalize = (value: unknown) =>
  String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();

const hasAny = (title: unknown, words: string[]) => {
  const value = normalize(title);
  return words.some((word) => value.includes(normalize(word)));
};

const compactEntries = (values: Record<string, any>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined));

const asNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatDate = (value: any) => {
  try {
    if (value?.toDate) return value.toDate().toLocaleDateString("ro-RO");
    if (value) return new Date(value).toLocaleDateString("ro-RO");
  } catch {}
  return new Date().toLocaleDateString("ro-RO");
};

export function getTemplateData(bill: Record<string, any>, company: Record<string, any>) {
  const sections: any[] = company?.schema?.sections || [];
  const form = bill?.form || {};
  const getSection = (title: string, type?: string) =>
    sections.find((section) => normalize(section.title) === normalize(title)) ||
    (type ? sections.find((section) => section.type === type) : undefined);

  const getValues = (title: string, type?: string) => {
    const section = getSection(title, type);
    const raw = form[section?.id] || {};
    if (section?.type === "custom") {
      return Object.fromEntries((section.fields || []).map((field: any) => [field.name, raw[field.id]]));
    }
    return raw;
  };

  const mapCustomSection = (section: any, removeEmpty = true) => {
    const raw = form[section?.id] || {};
    const values = Object.fromEntries((section?.fields || []).map((field: any) => [field.name, raw[field.id]]));
    return removeEmpty ? compactEntries(values) : values;
  };

  const invoiceSection = sections.find((section) => section.type === "custom" && hasAny(section.title, ["numar factura", "numar document", "numar comanda", "factura number"]));
  const clientSection = sections.find((section) => section.type === "custom" && hasAny(section.title, ["client", "customer", "beneficiar", "cumparator"]));
  const invoiceValues = invoiceSection ? mapCustomSection(invoiceSection, false) : getValues("Numar Factura");
  const client = clientSection ? mapCustomSection(clientSection, false) : getValues("Detalii Client");
  const vehicleSection = getSection("Tip Auto", "vehicle_categories");
  const vehicleValues = form[vehicleSection?.id] || {};
  const category = vehicleSection?.vehicleCategories?.find((item: any) => item.id === vehicleValues.category);
  const servicesSection = getSection("Servicii", "services");
  const serviceValues = form[servicesSection?.id] || {};
  const detailsSection = getSection("Detalii Anvelopa", "details_values");
  const detailValues = form[detailsSection?.id] || {};

  const rows: TemplateRow[] = Object.entries(serviceValues)
    .filter(([, quantity]) => asNumber(quantity) > 0)
    .map(([id, quantity]) => {
      const service = servicesSection?.services?.find((item: any) => item.id === id);
      const price = asNumber(company?.servicePrices?.[vehicleValues.category]?.[vehicleValues.size]?.[id]);
      const count = asNumber(quantity);
      return { id, name: service?.name || id, quantity: count, price, total: price * count };
    });

  const details = Object.entries(detailValues).map(([id, value]) => ({
    id,
    name: detailsSection?.detailFields?.find((field: any) => field.id === id)?.name || id,
    value,
  }));
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const invoiceNumber = invoiceValues.Numar || invoiceValues.Număr || Object.values(invoiceValues)[0] || bill.number || bill.id || "---";
  const additionalSections = sections
    .filter((section) => section.type === "custom" && section.id !== invoiceSection?.id && section.id !== clientSection?.id)
    .map((section) => ({ title: section.title, values: mapCustomSection(section) }))
    .filter((section) => Object.keys(section.values).length > 0);

  const directClient = compactEntries({
    Nume: bill.customer || bill.customerName || bill.clientName,
    Telefon: bill.customerPhone || bill.phone,
    Email: bill.customerEmail || bill.email,
    "Număr auto": bill.registrationNumber || bill.plate,
  });
  const clientFallback = (label: string) => {
    if (hasAny(label, ["nume", "name"])) return directClient.Nume;
    if (hasAny(label, ["telefon", "phone", "mobil"])) return directClient.Telefon;
    if (hasAny(label, ["email", "e-mail"])) return directClient.Email;
    if (hasAny(label, ["numar auto", "inmatriculare", "registration", "plate"])) return directClient["Număr auto"];
    return undefined;
  };
  const completedClient = Object.fromEntries(Object.entries(client).map(([label, value]) => [label, value || clientFallback(label) || "-"]));
  const finalClient = Object.keys(completedClient).length ? completedClient : directClient;
  const calculatedTotal = asNumber(form.calculatedTotal || bill.calculatedTotal);
  const finalTotal = total || calculatedTotal;

  return {
    invoiceNumber,
    date: formatDate(bill.createdAt || bill.date),
    client: finalClient,
    vehicle: `${category?.name || bill.vehicle || "-"}${vehicleValues.size ? ` — ${vehicleValues.size}` : ""}`,
    rows,
    details,
    additionalSections,
    createdBy: bill.createdBy || bill.employeeName || bill.createdByName || "-",
    total: finalTotal,
    subtotal: finalTotal / 1.19,
    vat: finalTotal - finalTotal / 1.19,
  };
}

export const money = (value: number) =>
  new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + " lei";
