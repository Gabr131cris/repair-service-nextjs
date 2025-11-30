export default function PrintTemplateYellow({ bill, company }) {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div style={{ background: "#f2c200", padding: "10px", fontSize: "32px", fontWeight: "bold" }}>
        Comanda de lucru
      </div>

      <p>Client: {bill.customer}</p>
      <p>Mașină: {bill.vehicle}</p>

      {/* restul layoutului */}
    </div>
  );
}
