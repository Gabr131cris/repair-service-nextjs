import LegalSignatures from "./LegalSignatures";
import { getTemplateData, money, TemplateProps } from "./template-data";

interface PremiumTemplateProps extends TemplateProps {
  accent: string;
  soft: string;
  label: string;
}

export default function PremiumTemplate({ bill, company, copyType, accent, soft, label }: PremiumTemplateProps) {
  const data = getTemplateData(bill, company);
  const companyValues = {
    Denumire: company?.name,
    "Denumire legală": company?.legalName,
    Reprezentant: company?.representative,
    Sediu: [company?.address, company?.city, company?.county].filter(Boolean).join(", "),
    Telefon: company?.phone,
    Email: company?.email,
    Website: company?.website,
    "CIF / CUI": company?.cif,
    IBAN: company?.iban,
    Banca: company?.bankName,
  };
  return (
    <article className="print-document" style={{ background: "white", color: "#18212f", fontFamily: "Arial, sans-serif", padding: 30 }}>
      <header style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 25, alignItems: "center", borderBottom: `3px solid ${accent}`, paddingBottom: 18 }}>
        <div><p style={{ margin: 0, color: accent, fontSize: 9, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>{label}</p><h1 style={{ margin: "7px 0 2px", fontSize: 28 }}>{company?.name || "Service Auto"}</h1><p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Comandă de lucru și certificat de garanție</p></div>
        <div style={{ border: `2px solid ${accent}`, padding: "10px 14px", minWidth: 180, fontSize: 11 }}><Meta label="Document" value={data.invoiceNumber} /><Meta label="Data" value={data.date} />{copyType && <div style={{ marginTop: 7, paddingTop: 7, borderTop: `1px solid ${accent}`, textAlign: "right", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>Copia {copyType === "client" ? "client" : "service"}</div>}</div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}><Card title="Prestator" values={companyValues} accent={accent} soft={soft} /><Card title="Client / Beneficiar" values={Object.keys(data.client).length ? data.client : { Nume: "-" }} accent={accent} soft={soft} /></section>

      <section style={{ marginTop: 20 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 15, marginBottom: 8 }}><h2 style={{ margin: 0, fontSize: 15, textTransform: "uppercase", letterSpacing: ".8px" }}>Servicii efectuate</h2><span style={{ fontSize: 10 }}>Tip auto: <b>{data.vehicle}</b></span></div><table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #334155", fontSize: 11 }}><thead><tr style={{ background: soft, borderBottom: `2px solid ${accent}`, textAlign: "left" }}><th style={{ padding: 9 }}>Serviciu</th><th style={{ padding: 9, textAlign: "right" }}>Preț unitar</th><th style={{ padding: 9, textAlign: "center" }}>Cant.</th><th style={{ padding: 9, textAlign: "right" }}>Valoare</th></tr></thead><tbody>{data.rows.length ? data.rows.map((row) => <tr key={row.id} style={{ borderBottom: "1px solid #cbd5e1" }}><td style={{ padding: 9 }}>{row.name}</td><td style={{ padding: 9, textAlign: "right" }}>{money(row.price)}</td><td style={{ padding: 9, textAlign: "center" }}>{row.quantity}</td><td style={{ padding: 9, textAlign: "right", fontWeight: 700 }}>{money(row.total)}</td></tr>) : <tr><td colSpan={4} style={{ padding: 16, textAlign: "center" }}>Nu există servicii selectate.</td></tr>}</tbody></table></section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 285px", gap: 18, marginTop: 16 }}><div>{data.details.length > 0 && <SmallSection title="Detalii tehnice" values={Object.fromEntries(data.details.map((item) => [item.name, item.value]))} accent={accent} soft={soft} />}{data.additionalSections.map((section) => <SmallSection key={section.title} title={section.title} values={section.values} accent={accent} soft={soft} />)}</div><div className="avoid-break" style={{ alignSelf: "start", border: `2px solid ${accent}`, padding: 13 }}><Amount label="Subtotal fără TVA" value={money(data.subtotal)} /><Amount label="TVA 19%" value={money(data.vat)} /><div style={{ display: "flex", justifyContent: "space-between", margin: "11px -13px -13px", padding: 13, background: accent, color: "white", fontSize: 15 }}><b>Total</b><b>{money(data.total)}</b></div></div></section>

      <LegalSignatures accent={accent} soft={soft} border="#334155" createdBy={data.createdBy} />
    </article>
  );
}

function Meta({ label, value }: { label: string; value: unknown }) { return <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5 }}><span>{label}</span><b>{String(value || "-")}</b></div>; }
function Card({ title, values, accent, soft }: { title: string; values: Record<string, unknown>; accent: string; soft: string }) { return <div style={{ border: "1px solid #64748b" }}><h2 style={{ margin: 0, padding: "7px 10px", background: soft, color: accent, borderBottom: "1px solid #64748b", fontSize: 12, textTransform: "uppercase" }}>{title}</h2><div style={{ padding: 10 }}>{Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined).map(([key, value]) => <div key={key} style={{ display: "flex", gap: 7, marginBottom: 4, fontSize: 9.5, overflowWrap: "anywhere" }}><b style={{ minWidth: 80 }}>{key}:</b><span>{String(value || "-")}</span></div>)}</div></div>; }
function SmallSection({ title, values, accent, soft }: { title: string; values: Record<string, unknown>; accent: string; soft: string }) { return <div className="avoid-break" style={{ border: "1px solid #64748b", marginBottom: 10 }}><h3 style={{ margin: 0, padding: "6px 9px", background: soft, color: accent, borderBottom: "1px solid #64748b", fontSize: 11 }}>{title}</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, padding: 9 }}>{Object.entries(values).map(([key, value]) => <div key={key} style={{ fontSize: 9.5 }}><b>{key}:</b> {String(value)}</div>)}</div></div>; }
function Amount({ label, value }: { label: string; value: string }) { return <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 7, fontSize: 10 }}><span>{label}</span><b>{value}</b></div>; }
