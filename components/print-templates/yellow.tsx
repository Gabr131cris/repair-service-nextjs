/* ------------------------ DEBUG FUNCTION ------------------------ */
const log = (label, value) => {
  console.log(
    `%c[YELLOW DEBUG] ${label}:`,
    "background: #222; color: #ffd700; font-weight: bold; padding: 3px;",
    value
  );
};

export default function PrintTemplateYellow({ bill, company }) {
  /* ---------------------------------------------
      LOGĂM TOT LA ÎNCEPUT
  --------------------------------------------- */
  log("BILL primit", bill);
  log("COMPANY primit", company);

  const form = bill?.form || {};
  const sections = company?.schema?.sections || [];

  log("SECTIUNI schema", sections);
  log("FORM SAVED", form);

  /* ---------------------------------------------
      HELPER: găsește secțiunea după titlu
  --------------------------------------------- */
  const normalize = (str) =>
    (str || "").trim().replace(/\s+/g, " ").toLowerCase();

  const getSection = (title) => {
    const t = normalize(title);

    const sec = sections.find((s) => normalize(s.title) === t);

    log(`Secțiune găsită '${title}'`, sec);
    return sec;
  };

  /*Helper---- detalii anvelopa
  --------------------------------------------- */

  const getDetailFieldName = (section, id) => {
    const f = section?.detailFields?.find((df) => df.id === id);
    return f?.name || id; // fallback la ID dacă nu găsește numele
  };

  /* ---------------------------------------------
      HELPER: ia valorile secțiunii din bill.form
  --------------------------------------------- */
  const getSectionValues = (title) => {
    const sec = getSection(title);
    if (!sec) return {};

    const sid = sec.id;
    const raw = form[sid] || {};

    let mapped = {};

    // CUSTOM FIELDS
    if (sec.type === "custom" && sec.fields) {
      for (const f of sec.fields) {
        mapped[f.name] = raw[f.id];
      }
    }

    // VEHICLE CATEGORY
    if (sec.type === "vehicle_categories") {
      mapped.categoryId = raw.category;
      mapped.size = raw.size;
    }

    // SERVICES (count)
    if (sec.type === "services") {
      mapped = raw; // aici ai count-urile
    }

    // DETAILS
    if (sec.type === "details_values") {
      mapped = raw; // valorile numerice
    }

    log(`Mapped values pentru '${title}'`, mapped);
    return mapped;
  };

  /* ---------------------------------------------
      EXTRAGEM DATELE
  --------------------------------------------- */
  const nrFactura = getSectionValues("Numar Factura");
  const client = getSectionValues("Detalii Client");
  const tipAuto = getSectionValues("Tip Auto");
  const servicii = getSectionValues("Servicii");
  const detaliiAnvelopa = getSectionValues("Detalii Anvelopa");

  /* ---------------------------------------------
      TIP AUTO CATEGORY NAME
  --------------------------------------------- */
  const secTipAuto = getSection("Tip Auto");
  const autoCategory = secTipAuto?.vehicleCategories?.find(
    (c) => c.id === tipAuto?.categoryId
  );

  log("Categoria auto găsită", autoCategory);
  log("TipAuto.size", tipAuto.size);

  /* ---------------------------------------------
      DATA FACTURII
  --------------------------------------------- */
  let date = "---";
  try {
    date =
      bill?.createdAt?.toDate?.() instanceof Date
        ? bill.createdAt.toDate().toLocaleDateString("ro-RO")
        : new Date().toLocaleDateString("ro-RO");
  } catch (err) {
    log("Eroare data", err);
  }

  log("DATA FINALĂ", date);

  /* ---------------------------------------------
      SERVICII — nume + preț
  --------------------------------------------- */
  const secServicii = getSection("Servicii");

  const getServiceName = (id) => {
    const found = secServicii?.services?.find((s) => s.id === id);
    return found?.name || id;
  };

  const getServicePrice = (serviceId) => {
    try {
      const cat = tipAuto?.categoryId;
      const size = tipAuto?.size;

      return company?.servicePrices?.[cat]?.[size]?.[serviceId] ?? "-";
    } catch (e) {
      return "-";
    }
  };

  /* ---------------- CALCUL TOTAL ---------------- */
  const calculateTotal = () => {
    try {
      const cat = tipAuto?.categoryId;
      const size = tipAuto?.size;

      if (!cat || !size) return 0;

      let total = 0;

      Object.entries(servicii).forEach(([serviceId, count]) => {
        if (!count) return;

        const price = company?.servicePrices?.[cat]?.[size]?.[serviceId] ?? 0;

        total += price * count;
      });

      return total;
    } catch (e) {
      return 0;
    }
  };

  /* TOTAL CU TVA */
  const totalCuTVA = calculateTotal();

  /* PREȚ FĂRĂ TVA */
  const pretFaraTVA = totalCuTVA ? (totalCuTVA / 1.19).toFixed(2) : 0;

  /* ================================================================================== */
  /* ================================   TEMPLATE HTML   ================================ */
  /* ================================================================================== */

  return (
    <div style={{ fontFamily: "Arial", padding: 0, margin: 0 }}>
      {/* HEADER */}
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

      {/* NUMAR + DATA */}
      <div style={{ display: "flex", padding: 20, gap: 20 }}>
        <div style={{ flex: 1 }}>
          <b style={{ background: "#f2c200", padding: "4px 10px" }}>Numar</b>
          <div
            style={{
              marginTop: 5,
              borderBottom: "2px solid black",
              width: 160,
            }}
          >
            {nrFactura?.Numar || "---"}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <b style={{ background: "#f2c200", padding: "4px 10px" }}>Data</b>
          <div
            style={{
              marginTop: 5,
              borderBottom: "2px solid black",
              width: 160,
            }}
          >
            {date}
          </div>
        </div>
      </div>

      {/* FIRMA + CLIENT */}
      <div style={{ display: "flex", padding: 20, gap: 30 }}>
        {/* Firma */}
        <div
          style={{
            flex: 1,
            background: "#ededed",
            padding: 10,
            border: "1px solid #ccc",
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
            {company?.name}
          </div>

          <p>
            <b>Sediu:</b> {company?.address}
          </p>
          <p>
            <b>Telefon:</b> {company?.phone}
          </p>
          <p>
            <b>CIF:</b> {company?.cif}
          </p>
        </div>

        {/* Client */}
        <div
          style={{
            flex: 1,
            background: "#ededed",
            padding: 10,
            border: "1px solid #ccc",
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

          {Object.entries(client).map(([key, value]) => (
            <p key={key}>
              <b>{key}:</b> {value}
            </p>
          ))}
        </div>
      </div>

      {/* SERVICII */}
      <div style={{ padding: "0 20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#2d79ff", color: "white" }}>
              <th style={{ padding: 6 }}>Lucrare</th>
              <th style={{ padding: 6 }}>Pret</th>
              <th style={{ padding: 6 }}>Nr. roți</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(servicii).map(([id, count]) => (
              <tr key={id} style={{ background: "#f7f7f7" }}>
                <td style={{ padding: 6 }}>{getServiceName(id)}</td>
                <td style={{ padding: 6 }}>{getServicePrice(id)}</td>
                <td style={{ padding: 6 }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TIP AUTO + DETALII */}
      <div style={{ display: "flex", padding: 20, gap: 40 }}>
        {/* Tip Auto */}
        <div>
          <div
            style={{
              background: "#f2c200",
              padding: "8px 12px",
              fontWeight: "bold",
            }}
          >
            Tip Auto
          </div>

          <div style={{ paddingTop: 10 }}>
            {autoCategory?.name || "-"} — {tipAuto.size || "-"}
          </div>
        </div>

        {/* Detalii Anvelopa */}
        {Object.keys(detaliiAnvelopa).length > 0 && (
          <table style={{ width: 260 }}>
            <thead>
              <tr style={{ background: "#2d79ff", color: "white" }}>
                <th style={{ padding: 6 }}>Detaliu</th>
                <th style={{ padding: 6 }}>Valoare</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(detaliiAnvelopa).map(([k, v]) => (
                <tr key={k} style={{ background: "#eef5ff" }}>
                  <td style={{ padding: 6 }}>
                    {getDetailFieldName(getSection("Detalii Anvelopa"), k)}
                  </td>
                  <td style={{ padding: 6 }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      

      

      {/* TOTAL – aliniat dreapta */}
      <div style={{ padding: "0 20px 20px", textAlign: "right", fontSize: 16 }}>
        <p><b>Pret fara TVA:</b> {pretFaraTVA} lei</p>
        <p><b>Total manopera (cu TVA 19%):</b> {totalCuTVA} lei</p>
      </div>

      {/* SEMNATURI */}
      <div style={{ display: "flex", padding: 20 }}>
        <div style={{ flex: 1 }}>
          <b>Executant</b>
          <div style={{ width: 250, borderBottom: "1px solid black", height: 40, marginTop: 20 }} />
        </div>

        <div style={{ flex: 1, textAlign: "right" }}>
          <p>
            După parcurgerea a 50 km, este necesară verificarea strângerii roților.
          </p>
          <b>Semnatura client</b>
          <div style={{ width: 250, borderBottom: "1px solid black", height: 40, marginTop: 20, marginLeft: "auto" }} />
        </div>
      </div>

      {/* CERTIFICAT DE GARANTIE — 2 coloane */}
      <div style={{ display: "flex", padding: 20, gap: 40 }}>
        <div style={{ flex: 1 }}>
          <b><h3>Certificat de garantie</h3></b>
          <p>
            Se acordă garanție conform Legii nr. 449/2003 și Legii nr. 296/2004<br></br>
            pentru serviciile prestate și manopera executată, în baza convenției<br></br>
            stabilite între părți.
          </p>
        </div>

        
      </div>
    </div>
  );
}
