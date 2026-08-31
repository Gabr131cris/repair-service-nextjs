import { getTemplateData, money, TemplateProps } from "./template-data";
import LegalSignatures from "./LegalSignatures";

const border = "1px solid #1f2937";

export default function PrintTemplateYellow({ bill, company, copyType }: TemplateProps) {
  const data = getTemplateData(bill, company);
  return (
    <article className="print-document" style={{ minHeight: "100%", background: "#fff", color: "#111827", fontFamily: "Arial, sans-serif", padding: 28 }}>
      <header style={{ border: "3px solid #111827" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, background: "#f4c430", padding: "18px 20px", borderBottom: "3px solid #111827" }}>
          <div><p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Comandă de lucru</p><h1 style={{ margin: "5px 0 0", fontSize: 29 }}>{company?.name || "Service Auto"}</h1></div>
          <div style={{ minWidth: 185, background: "white", border: "2px solid #111827", padding: "10px 12px", fontSize: 12 }}><Meta label="Număr" value={data.invoiceNumber} /><Meta label="Data" value={data.date} />{copyType && <div style={{ marginTop: 7, paddingTop: 7, borderTop: border, fontSize: 9, fontWeight: 700, textAlign: "right", textTransform: "uppercase" }}>Copia {copyType === "client" ? "client" : "service"}</div>}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <Party title="Prestator" values={{ Denumire: company?.name, "Denumire legală": company?.legalName, Reprezentant: company?.representative, Sediu: [company?.address, company?.city, company?.county].filter(Boolean).join(", "), Telefon: company?.phone, Email: company?.email, Website: company?.website, "CIF / CUI": company?.cif, IBAN: company?.iban, Banca: company?.bankName }} />
          <Party title="Client / Beneficiar" values={Object.keys(data.client).length ? data.client : { Nume: "-" }} right />
        </div>
      </header>

      <section className="avoid-break" style={{ display: "flex", justifyContent: "space-between", gap: 20, margin: "18px 0 8px", alignItems: "end" }}><div><h2 style={{ margin: 0, fontSize: 17, textTransform: "uppercase" }}>Servicii și lucrări efectuate</h2><p style={{ margin: "4px 0 0", fontSize: 11, color: "#4b5563" }}>Executant: <b>{String(data.createdBy)}</b></p></div><div style={{ border: border, background: "#fff8cf", padding: "7px 10px", fontSize: 11 }}>Tip auto / dimensiune: <b>{data.vehicle}</b></div></section>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, border: border }}>
        <thead><tr style={{ background: "#f4c430", textAlign: "left", borderBottom: "2px solid #111827" }}><th style={{ padding: 9 }}>Descriere serviciu</th><th style={{ padding: 9, textAlign: "right" }}>Preț unitar</th><th style={{ padding: 9, textAlign: "center" }}>Cantitate</th><th style={{ padding: 9, textAlign: "right" }}>Valoare</th></tr></thead>
        <tbody>{data.rows.length ? data.rows.map((row, index) => <tr key={row.id} style={{ background: index % 2 ? "#fffbea" : "white", borderBottom: border }}><td style={{ padding: 9 }}>{row.name}</td><td style={{ padding: 9, textAlign: "right" }}>{money(row.price)}</td><td style={{ padding: 9, textAlign: "center" }}>{row.quantity}</td><td style={{ padding: 9, textAlign: "right", fontWeight: 700 }}>{money(row.total)}</td></tr>) : <tr><td colSpan={4} style={{ padding: 18, textAlign: "center", color: "#4b5563" }}>Nu există servicii selectate.</td></tr>}</tbody>
      </table>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20, marginTop: 18 }}>
        <div>
          {data.details.length > 0 && <InfoSection title="Detalii tehnice" values={Object.fromEntries(data.details.map((item) => [item.name, item.value]))} />}
          {data.additionalSections.map((section) => <InfoSection key={section.title} title={section.title} values={section.values} />)}
        </div>
        <div className="avoid-break" style={{ alignSelf: "start", border: "2px solid #111827" }}><div style={{ background: "#f4c430", borderBottom: "2px solid #111827", padding: 9, fontWeight: 700, textTransform: "uppercase", fontSize: 12 }}>Total document</div><div style={{ padding: 12 }}><Amount label="Subtotal fără TVA" value={money(data.subtotal)} /><Amount label="TVA 19%" value={money(data.vat)} /><div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10, paddingTop: 10, borderTop: "2px solid #111827", fontSize: 16 }}><b>Total</b><b>{money(data.total)}</b></div></div></div>
      </section>

      <LegalSignatures accent="#8a6500" soft="#fff8cf" border="#111827" createdBy={data.createdBy} />
    </article>
  );
}

function Meta({ label, value }: { label: string; value: unknown }) { return <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5 }}><span>{label}</span><b>{String(value || "-")}</b></div>; }
function Party({ title, values, right = false }: { title: string; values: Record<string, unknown>; right?: boolean }) { const entries = Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined); return <section style={{ padding: 14, borderLeft: right ? "2px solid #111827" : undefined }}><h2 style={{ margin: "0 0 9px", display: "inline-block", background: "#f4c430", border: border, padding: "4px 8px", fontSize: 12, textTransform: "uppercase" }}>{title}</h2>{entries.map(([label, value]) => <div key={label} style={{ display: "flex", gap: 8, marginBottom: 5, fontSize: 11, overflowWrap: "anywhere" }}><b style={{ minWidth: 86 }}>{label}:</b><span>{String(value || "-")}</span></div>)}</section>; }
function InfoSection({ title, values }: { title: string; values: Record<string, unknown> }) { return <section className="avoid-break" style={{ marginBottom: 12, border: border }}><h3 style={{ margin: 0, background: "#fff8cf", borderBottom: border, padding: "7px 9px", fontSize: 12 }}>{title}</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "5px 14px", padding: 9 }}>{Object.entries(values).map(([label, value]) => <div key={label} style={{ fontSize: 10, overflowWrap: "anywhere" }}><b>{label}:</b> {String(value)}</div>)}</div></section>; }
function Amount({ label, value }: { label: string; value: string }) { return <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7, fontSize: 11 }}><span>{label}</span><b>{value}</b></div>; }
