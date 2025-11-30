export default function PrintTemplateBlue({ bill, company }) {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial", background: "#e8f1ff" }}>
      <h1 style={{ color: "#0057d8" }}>Comanda de lucru</h1>

      <p>Client: {bill.customer}</p>
      <p>Mașină: {bill.vehicle}</p>

      {/* restul layoutului */}

    </div>
  );
}
