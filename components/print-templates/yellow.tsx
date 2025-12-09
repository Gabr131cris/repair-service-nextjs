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

      {/* SERVICII – TABEL 4 COLOANE */}
      <div style={{ padding: "0 20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#2d79ff",
                color: "white",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "8px" }}>Lucrări solicitate</th>
              <th
                style={{ padding: "8px", width: "120px", textAlign: "center" }}
              >
                Preț / roată
              </th>
              <th
                style={{ padding: "8px", width: "90px", textAlign: "center" }}
              >
                Nr. roți
              </th>
              <th
                style={{ padding: "8px", width: "120px", textAlign: "right" }}
              >
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(servicii).map(([id, count], index) => {
              const nume = getServiceName(id);
              const pret = getServicePrice(id) || 0;
              const total = pret * count;

              return (
                <tr
                  key={id}
                  style={{
                    background: index % 2 === 0 ? "#f9f9f9" : "#efefef",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {/* Lucrare */}
                  <td style={{ padding: "8px" }}>{nume}</td>

                  {/* Preț / roată */}
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    {pret.toFixed(2)} lei
                  </td>

                  {/* Nr. roți */}
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    {count}
                  </td>

                  {/* TOTAL */}
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {total.toFixed(2)} lei
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* TIP AUTO + DETALII */}
<div style={{ display: "flex", padding: 20, gap: 40 }}>
  {/* Tip Auto */}
  <div style={{ flex: 1 }}>
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

  {/* DETALII ANVELOPA – TABEL ALINIAT DREAPTA */}
{Object.keys(detaliiAnvelopa).length > 0 && (
  <table
    style={{
      flex: 1,
      borderCollapse: "collapse",
      width: "100%",
      maxWidth: "350px",
      marginLeft: "auto",
      fontSize: "14px",
    }}
  >
    <thead>
      <tr
        style={{
          background: "#2d79ff",
          color: "white",
          textAlign: "left",
          borderBottom: "1px solid #ddd",
        }}
      >
        <th style={{ padding: "8px" }}>Detaliu</th>
        <th style={{ padding: "8px", textAlign: "left" }}>Valoare</th>
      </tr>
    </thead>

    <tbody>
      {Object.entries(detaliiAnvelopa).map(([k, v], index) => (
        <tr
          key={k}
          style={{
            background: index % 2 === 0 ? "#f9f9f9" : "#efefef",
            borderBottom: "1px solid #ddd",
          }}
        >
          <td style={{ padding: "8px" }}>
            {getDetailFieldName(getSection("Detalii Anvelopa"), k)}
          </td>
          <td style={{ padding: "8px" }}>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

</div>

{/* TOTAL */}
<div
  style={{
    padding: "0 20px 20px",
    textAlign: "right",
    fontSize: 16,
  }}
>
  <p>
    <b>Pret fara TVA:</b> {pretFaraTVA} lei
  </p>
  <p>
    <b>Total manopera (cu TVA 19%):</b> {totalCuTVA} lei
  </p>
</div>

{/* SEMNATURI 1 — Executant + Semnatura client */}
<div
  style={{
    display: "flex",
    padding: "20px",
    gap: "40px",
    borderTop: "1px solid black",
    paddingTop: "30px",
  }}
>
  {/* Executant */}
  <div style={{ flex: 1 }}>
    <b style={{ fontSize: "20px" }}>Executant</b>
    <div
      style={{
        width: "250px",
        borderBottom: "2px solid black",
        height: "40px",
        marginTop: "10px",
      }}
    />
  </div>

  {/* Semnatura client — text sub semnătura */}
  <div style={{ flex: 1, textAlign: "right" }}>
    <b style={{ fontSize: "20px" }}>Semnatura client</b>
    <div
      style={{
        width: "250px",
        borderBottom: "2px solid black",
        height: "40px",
        marginTop: "10px",
        marginLeft: "auto",
      }}
    />
    <p style={{ marginTop: "15px" }}>
      Clientul confirmă prin semnătură că strângerea 
      și echilibrarea roților au
      fost executate conform standardelor
    </p>
  </div>
</div>

{/* CERTIFICAT DE GARANTIE + A DOUA SEMNATURA CLIENT */}
<div
  style={{
    display: "flex",
    padding: "20px",
    gap: "40px",
    borderTop: "1px solid black",
    paddingTop: "30px",
  }}
>
  {/* Certificat de garantie */}
  <div style={{ flex: 1 }}>
    <h3 style={{ margin: 0, fontSize: "20px" }}>
      <b>Certificat de garantie</b>
    </h3>

    <p style={{ lineHeight: "1.4", marginTop: "10px" }}>
      Se acordă garanție conform Legii nr. 449/2003 și Legii nr. 296/2004 pentru
      serviciile prestate și manopera executată, în baza convenției stabilite
      între părți.
    </p>
  </div>

  {/* Semnatura client 2 — text sub semnatura */}
  <div style={{ flex: 1, textAlign: "right" }}>
    <b style={{ fontSize: "20px" }}>Semnatura client</b>
    <div
      style={{
        width: "250px",
        borderBottom: "2px solid black",
        height: "40px",
        marginTop: "10px",
        marginLeft: "auto",
      }}
    />
    <p style={{ marginTop: "15px" }}>
      După parcurgerea a 50 km, este necesară verificarea strângerii roților.
    </p>
  </div>
</div>
    </div>
  );
}
