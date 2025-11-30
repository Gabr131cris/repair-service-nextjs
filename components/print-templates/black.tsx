export default function PrintTemplateBlack({ bill, company }) {
  return (
    <div style={{ padding: "20px", background: "#000", color: "#fff", fontFamily: "Arial" }}>
      <h1 style={{ color: "#fff" }}>Comanda de lucru</h1>

      <p>Client: {bill.customer}</p>
      <p>Mașină: {bill.vehicle}</p>

      {/* restul layoutului */}
    </div>
  );
}
