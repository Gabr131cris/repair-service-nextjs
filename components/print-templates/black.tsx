import { getTemplateData, money, TemplateProps } from "./template-data";
import LegalSignatures from "./LegalSignatures";

export default function PrintTemplateBlack({ bill, company, copyType }: TemplateProps) {
  const data = getTemplateData(bill, company);
  return (
    <article className="print-document" style={{ minHeight: "100%", background: "#fff", color: "#111", fontFamily: "Arial, sans-serif", padding: 30 }}>
      <header style={{ background: "#111", color: "white", padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><p style={{ margin: 0, fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", color: "#d4d4d4" }}>Comandă de lucru</p><h1 style={{ margin: "7px 0 0", fontSize: 29 }}>{company?.name || "Service Auto"}</h1></div>
        <div style={{ textAlign: "right", fontSize: 12 }}><div><span style={{ color: "#aaa" }}>Nr. </span><b>{data.invoiceNumber}</b></div><div style={{ marginTop: 7 }}><span style={{ color: "#aaa" }}>Data </span><b>{data.date}</b></div>{copyType && <div style={{ marginTop: 8, border: "1px solid #555", padding: "3px 7px", fontSize: 9, textTransform: "uppercase" }}>Copia {copyType === "client" ? "client" : "service"}</div>}</div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, padding: "24px 0", borderBottom: "2px solid #111" }}>
        <Party title="Prestator" values={{ Denumire: company?.name, "Denumire legală": company?.legalName, Reprezentant: company?.representative, Sediu: [company?.address, company?.city, company?.county].filter(Boolean).join(", "), Telefon: company?.phone, Email: company?.email, Website: company?.website, CIF: company?.cif, IBAN: company?.iban, Banca: company?.bankName }} />
        <Party title="Client" values={Object.keys(data.client).length ? data.client : { Client: bill.customer || "-" }} />
      </section>

      {data.additionalSections.map((section) => <section key={section.title} className="avoid-break" style={{ marginTop: 12, border: "1px solid #111", padding: 11 }}><h3 style={{ margin: "0 0 8px", fontSize: 12, textTransform: "uppercase" }}>{section.title}</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>{Object.entries(section.values).map(([label, value]) => <div key={label} style={{ fontSize: 10 }}><b>{label}:</b> {String(value)}</div>)}</div></section>)}

      <div style={{ display: "flex", justifyContent: "space-between", margin: "22px 0 10px", alignItems: "end" }}><h2 style={{ margin: 0, fontSize: 17, textTransform: "uppercase", letterSpacing: "1px" }}>Servicii efectuate</h2><span style={{ fontSize: 11, color: "#555" }}>Tip auto: <b>{data.vehicle}</b></span></div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}><thead><tr style={{ borderTop: "2px solid #111", borderBottom: "2px solid #111", textAlign: "left" }}><th style={{ padding: "9px 6px" }}>Descriere</th><th style={{ padding: "9px 6px", textAlign: "right" }}>Preț</th><th style={{ padding: "9px 6px", textAlign: "center" }}>Cantitate</th><th style={{ padding: "9px 6px", textAlign: "right" }}>Total</th></tr></thead><tbody>{data.rows.length ? data.rows.map((row) => <tr key={row.id} style={{ borderBottom: "1px solid #bbb" }}><td style={{ padding: "10px 6px" }}>{row.name}</td><td style={{ padding: "10px 6px", textAlign: "right" }}>{money(row.price)}</td><td style={{ padding: "10px 6px", textAlign: "center" }}>{row.quantity}</td><td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 700 }}>{money(row.total)}</td></tr>) : <tr><td colSpan={4} style={{ padding: 18, textAlign: "center", color: "#666" }}>Nu există servicii selectate.</td></tr>}</tbody></table>

      <section style={{ display: "grid", gridTemplateColumns: data.details.length ? "1fr 310px" : "1fr", gap: 30, marginTop: 22 }}>
        <div>{data.details.length > 0 && <><h3 style={{ margin: "0 0 10px", fontSize: 13, textTransform: "uppercase" }}>Detalii anvelopă</h3><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{data.details.map((item) => <div key={item.id} style={{ border: "1px solid #111", padding: "7px 10px", fontSize: 11 }}><span style={{ color: "#555" }}>{item.name}: </span><b>{String(item.value)}</b></div>)}</div></>}</div>
        <div style={{ border: "2px solid #111", padding: 15 }}><Amount label="Subtotal fără TVA" value={money(data.subtotal)} /><Amount label="TVA 19%" value={money(data.vat)} /><div style={{ display: "flex", justifyContent: "space-between", background: "#111", color: "white", margin: "12px -15px -15px", padding: 15, fontSize: 16 }}><b>TOTAL</b><b>{money(data.total)}</b></div></div>
      </section>

      <LegalSignatures accent="#111111" soft="#f3f4f6" border="#111111" createdBy={data.createdBy} />
    </article>
  );
}

function Party({ title, values }: { title: string; values: Record<string, unknown> }) { return <div><h2 style={{ margin: "0 0 12px", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px" }}>{title}</h2>{Object.entries(values).map(([label, value]) => <div key={label} style={{ display: "flex", marginBottom: 6, fontSize: 11 }}><b style={{ width: 80 }}>{label}</b><span>{String(value || "-")}</span></div>)}</div>; }
function Amount({ label, value }: { label: string; value: string }) { return <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11 }}><span>{label}</span><b>{value}</b></div>; }
