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
  String(value || "").trim().replace(/\s+/g, " ").toLowerCase();

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

  const invoiceValues = getValues("Numar Factura");
  const client = getValues("Detalii Client");
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
  const invoiceNumber = invoiceValues.Numar || invoiceValues.Număr || bill.number || bill.id || "---";

  return {
    invoiceNumber,
    date: formatDate(bill.createdAt || bill.date),
    client,
    vehicle: `${category?.name || bill.vehicle || "-"}${vehicleValues.size ? ` — ${vehicleValues.size}` : ""}`,
    rows,
    details,
    total,
    subtotal: total / 1.19,
    vat: total - total / 1.19,
  };
}

export const money = (value: number) =>
  new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + " lei";
