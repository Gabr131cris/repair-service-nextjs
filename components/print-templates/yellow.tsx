export default function PrintTemplateYellow({ bill, company }) {
  // SAFE FALLBACKS
  const client = bill.client || {};
  const car = bill.car || {};
  const details = bill.details || {};
  const services = bill.services || {};

  // Data
  const date =
    bill.createdAt?.toDate
      ? bill.createdAt.toDate().toLocaleDateString("ro-RO")
      : new Date(bill.createdAt || Date.now()).toLocaleDateString("ro-RO");

  // Returnează numele serviciului după ID
  const serviceName = (id) => {
    const found = company.services?.find((s) => s.id === id);
    return found?.name || id;
  };

  const servicePrice = (id) => {
    return company.servicePrices?.[id] ?? "-";
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 0, margin: 0 }}>

      {/* ------------------------------------------------ HEADER ------------------------------------------------ */}
      <div
        style={{
          background: "#f2c200",
          padding: "25px 0",
          textAlign: "center",
          fontSize: "42px",
          fontWeight: "bold",
        }}
      >
        Comanda de lucru
      </div>

      {/* -------------------------------------------- NUMAR + DATA --------------------------------------------- */}
      <div style={{ display: "flex", padding: "20px 20px 0", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <b style={{ background: "#f2c200", padding: "4px 10px" }}>Numar</b>
          <div style={{ marginTop: 5, borderBottom: "2px solid black", width: 160 }}>
            {bill.id || "---"}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <b style={{ background: "#f2c200", padding: "4px 10px" }}>Data</b>
          <div style={{ marginTop: 5, borderBottom: "2px solid black", width: 160 }}>
            {date}
          </div>
        </div>
      </div>

      {/* ----------------------------------------- BOX FIRMA + CLIENT ------------------------------------------ */}
      <div style={{ display: "flex", padding: "20px", gap: 30 }}>

        {/* ------------ FIRMA ------------- */}
        <div
          style={{
            flex: 1,
            background: "#ededed",
            padding: 10,
            border: "1px solid #cfcfcf",
            minHeight: 150,
          }}
        >
          <div
            style={{
              background: "#f2c200",
              padding: 6,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            {company.name}
          </div>

          <p><b>Sediu:</b> {company.address}</p>
          <p><b>Telefon:</b> {company.phone}</p>
          <p><b>CIF:</b> {company.cif || "---"}</p>
        </div>

        {/* ------------ CLIENT ------------- */}
        <div
          style={{
            flex: 1,
            background: "#ededed",
            padding: 10,
            border: "1px solid #cfcfcf",
            minHeight: 150,
          }}
        >
          <div
            style={{
              background: "#f2c200",
              padding: 6,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Client
          </div>

          {Object.entries(client).map(([key, val]) => (
            <p key={key}>
              <b>{key}:</b> {val}
            </p>
          ))}
        </div>
      </div>

      {/* -------------------------------------- TABEL SERVICII (MARE) ------------------------------------------ */}
      <div style={{ padding: "0 20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#2d79ff", color: "white" }}>
              <th style={{ padding: 6, textAlign: "left" }}>Lucrari Solicitante</th>
              <th style={{ padding: 6 }}>Pret</th>
              <th style={{ padding: 6 }}>Nr. Roti</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(services).map(([id, count]) => (
              <tr key={id} style={{ background: "#f7f7f7", borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: 6 }}>{serviceName(id)}</td>
                <td style={{ padding: 6 }}>{servicePrice(id)}</td>
                <td style={{ padding: 6 }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------- TIP AUTO + DETALII --------------------------------------------- */}
      <div style={{ display: "flex", padding: "20px", gap: 40 }}>

        {/* Tip Auto */}
        <div>
          <div
            style={{
              background: "#f2c200",
              padding: "8px 12px",
              fontWeight: "bold",
              width: 120,
            }}
          >
            Tip Auto
          </div>
          <div style={{ padding: "10px 0" }}>
            {car.category} — {car.size}
          </div>
        </div>

        {/* Tabel mic detalii */}
        {Object.keys(details).length > 0 && (
          <table style={{ width: "260px" }}>
            <thead>
              <tr style={{ background: "#2d79ff", color: "white" }}>
                <th style={{ padding: 6, textAlign: "left" }}>Detalii</th>
                <th style={{ padding: 6 }}>Valoare</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(details).map(([key, val]) => (
                <tr key={key} style={{ background: "#eef5ff" }}>
                  <td style={{ padding: 6 }}>{key}</td>
                  <td style={{ padding: 6 }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ------------------------------------------- TOTALURI -------------------------------------------- */}
      <div style={{ padding: "0 20px", fontSize: 16, marginTop: 20 }}>
        <p><b>Pret fara TVA:</b> {bill.totalNoVat || "---"} lei</p>
        <p><b>Total manopera (cu TVA):</b> {bill.total || "---"} lei</p>
      </div>

      {/* ----------------------------------------- SEMNATURI ------------------------------------------ */}
      <div style={{ padding: "20px", marginTop: 30, display: "flex", justifyContent: "space-between" }}>
        <div>
          <b>Executant</b>
          <div style={{ width: 250, borderBottom: "1px solid black", height: 40 }} />
        </div>

        <div>
          <b>Semnatura client</b>
          <div style={{ width: 250, borderBottom: "1px solid black", height: 40 }} />
        </div>
      </div>

      {/* -------------------------------------- CERTIFICAT GARANTIE -------------------------------------- */}
      <div style={{ padding: 20, marginTop: 10 }}>
        <h3>Certificat de garantie</h3>
        <p>
          Se acordă garanție conform Legii nr. 449/2003 și Legii nr. 296/2004
          pentru serviciile prestate și manopera executată.
        </p>
      </div>
    </div>
  );
}
