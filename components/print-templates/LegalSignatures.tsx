interface LegalSignaturesProps {
  accent?: string;
  soft?: string;
  border?: string;
  createdBy?: unknown;
}

export default function LegalSignatures({
  accent = "#111827",
  soft = "#f8fafc",
  border = "#334155",
  createdBy,
}: LegalSignaturesProps) {
  const line = `1px solid ${border}`;
  return (
    <footer className="avoid-break" style={{ marginTop: 24, borderTop: `2px solid ${border}`, paddingTop: 18, color: "#111827" }}>
      {createdBy && String(createdBy) !== "-" && <p style={{ margin: "0 0 14px", fontSize: 10, color: "#475569" }}>Document întocmit de: <b>{String(createdBy)}</b></p>}

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 38 }}>
        <Signature label="Executant" line={line} accent={accent} />
        <div>
          <Signature label="Semnătură client" line={line} accent={accent} />
          <p style={{ margin: "11px 0 0", fontSize: 9, lineHeight: 1.5 }}>
            Clientul confirmă prin semnătură că strângerea și echilibrarea roților au fost executate conform standardelor.
          </p>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 38, marginTop: 20, paddingTop: 17, borderTop: line }}>
        <div style={{ background: soft, border: line, padding: 11 }}>
          <h3 style={{ margin: "0 0 7px", color: accent, fontSize: 12, textTransform: "uppercase" }}>Certificat de garanție</h3>
          <p style={{ margin: 0, fontSize: 9, lineHeight: 1.55 }}>
            Se acordă garanție conform Legii nr. 449/2003 și Legii nr. 296/2004 pentru serviciile prestate și manopera executată, în baza convenției stabilite între părți.
          </p>
        </div>
        <div>
          <Signature label="Semnătură client" line={line} accent={accent} />
          <p style={{ margin: "11px 0 0", fontSize: 9, lineHeight: 1.5 }}>
            După parcurgerea a 50 km, este necesară verificarea strângerii roților.
          </p>
        </div>
      </section>
    </footer>
  );
}

function Signature({ label, line, accent }: { label: string; line: string; accent: string }) {
  return <div><b style={{ color: accent, fontSize: 11, textTransform: "uppercase" }}>{label}</b><div style={{ height: 40, borderBottom: line }} /></div>;
}
