import { getTemplateData, money, TemplateProps } from "./template-data";

const cell = { padding: "9px 10px", borderBottom: "1px solid #dbeafe" };

export default function PrintTemplateBlue({ bill, company, copyType }: TemplateProps) {
  const data = getTemplateData(bill, company);
  return (
    <article className="print-document" style={{ minHeight: "100%", background: "white", color: "#172033", fontFamily: "Arial, sans-serif", padding: "28px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 22, borderBottom: "4px solid #2563eb" }}>
        <div>
          <div style={{ color: "#2563eb", fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Comandă de lucru</div>
          <h1 style={{ margin: "8px 0 4px", color: "#0f2a5f", fontSize: 32 }}>{company?.name || "Service Auto"}</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{company?.legalName || company?.address || ""}</p>
        </div>
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "13px 16px", minWidth: 180 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 13 }}><span style={{ color: "#64748b" }}>Număr</span><b>{data.invoiceNumber}</b></div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginTop: 8, fontSize: 13 }}><span style={{ color: "#64748b" }}>Data</span><b>{data.date}</b></div>
          {copyType && <div style={{ marginTop: 9, color: "#2563eb", fontSize: 10, fontWeight: 700, textAlign: "right", textTransform: "uppercase" }}>Copia {copyType === "client" ? "client" : "service"}</div>}
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 22 }}>
        <InfoCard title="Prestator">
          <Line label="Denumire" value={company?.name} />
          <Line label="Denumire legală" value={company?.legalName} />
          <Line label="Reprezentant" value={company?.representative} />
          <Line label="Sediu" value={[company?.address, company?.city, company?.county].filter(Boolean).join(", ")} />
          <Line label="Telefon" value={company?.phone} />
          <Line label="Email" value={company?.email} />
          <Line label="Website" value={company?.website} />
          <Line label="CIF" value={company?.cif} />
          <Line label="IBAN" value={company?.iban} />
          <Line label="Banca" value={company?.bankName} />
        </InfoCard>
        <InfoCard title="Client">
          {Object.entries(data.client).length ? Object.entries(data.client).map(([key, value]) => <Line key={key} label={key} value={value} />) : <Line label="Client" value={bill.customer || "-"} />}
        </InfoCard>
      </section>

      <section style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
          <h2 style={{ margin: 0, color: "#0f2a5f", fontSize: 18 }}>Lucrări și servicii</h2>
          <span style={{ color: "#64748b", fontSize: 12 }}>Tip auto: <b style={{ color: "#172033" }}>{data.vehicle}</b></span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#2563eb", color: "white", textAlign: "left" }}><th style={{ padding: 10 }}>Serviciu</th><th style={{ padding: 10, textAlign: "right" }}>Preț unitar</th><th style={{ padding: 10, textAlign: "center" }}>Cant.</th><th style={{ padding: 10, textAlign: "right" }}>Valoare</th></tr></thead>
          <tbody>{data.rows.length ? data.rows.map((row, index) => <tr key={row.id} style={{ background: index % 2 ? "#f8fafc" : "white" }}><td style={cell}>{row.name}</td><td style={{ ...cell, textAlign: "right" }}>{money(row.price)}</td><td style={{ ...cell, textAlign: "center" }}>{row.quantity}</td><td style={{ ...cell, textAlign: "right", fontWeight: 700 }}>{money(row.total)}</td></tr>) : <tr><td colSpan={4} style={{ padding: 18, textAlign: "center", color: "#64748b" }}>Nu există servicii selectate.</td></tr>}</tbody>
        </table>
      </section>

      {data.details.length > 0 && <section style={{ marginTop: 18, background: "#f8fafc", borderRadius: 10, padding: 14 }}><h3 style={{ margin: "0 0 10px", color: "#0f2a5f", fontSize: 15 }}>Detalii anvelopă</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>{data.details.map((item) => <div key={item.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 7, padding: 9 }}><span style={{ display: "block", color: "#64748b", fontSize: 10 }}>{item.name}</span><b style={{ fontSize: 13 }}>{String(item.value)}</b></div>)}</div></section>}
      {data.additionalSections.map((section) => <section key={section.title} className="avoid-break" style={{ marginTop: 12, border: "1px solid #94a3b8", borderRadius: 8, padding: 12 }}><h3 style={{ margin: "0 0 8px", color: "#0f2a5f", fontSize: 13 }}>{section.title}</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>{Object.entries(section.values).map(([label, value]) => <div key={label} style={{ fontSize: 10 }}><b>{label}:</b> {String(value)}</div>)}</div></section>)}

      <section style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}><div style={{ width: 285, background: "#eff6ff", borderRadius: 12, padding: 16 }}><TotalLine label="Subtotal fără TVA" value={money(data.subtotal)} /><TotalLine label="TVA 19%" value={money(data.vat)} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "2px solid #2563eb", color: "#0f2a5f", fontSize: 17 }}><b>Total</b><b>{money(data.total)}</b></div></div></section>

      <footer className="avoid-break" style={{ marginTop: 28 }}><p style={{ fontSize: 10, color: "#64748b" }}>Executant document: <b>{String(data.createdBy)}</b></p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 45 }}><Signature label="Executant" /><Signature label="Semnătură client" /></div><div style={{ marginTop: 24, borderTop: "1px solid #64748b", paddingTop: 13, color: "#475569", fontSize: 10, lineHeight: 1.5 }}>Clientul confirmă că serviciile au fost executate conform solicitării. Pentru lucrările efectuate se acordă garanție conform legislației în vigoare. După 50 km se recomandă verificarea strângerii roților.</div></footer>
    </article>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) { return <div style={{ border: "1px solid #dbeafe", borderRadius: 12, overflow: "hidden" }}><h2 style={{ margin: 0, background: "#eff6ff", color: "#1d4ed8", padding: "9px 12px", fontSize: 14 }}>{title}</h2><div style={{ padding: 12 }}>{children}</div></div>; }
function Line({ label, value }: { label: string; value: unknown }) { return <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12 }}><b style={{ minWidth: 72, color: "#475569" }}>{label}:</b><span>{String(value || "-")}</span></div>; }
function TotalLine({ label, value }: { label: string; value: string }) { return <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12 }}><span style={{ color: "#64748b" }}>{label}</span><b>{value}</b></div>; }
function Signature({ label }: { label: string }) { return <div><b style={{ color: "#0f2a5f", fontSize: 13 }}>{label}</b><div style={{ height: 38, borderBottom: "1px solid #64748b" }} /></div>; }
