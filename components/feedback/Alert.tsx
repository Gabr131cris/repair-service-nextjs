export default function Alert({
  type = "info",
  message,
}: {
  type?: "info" | "success" | "error";
  message: string;
}) {
  const colors = {
    info: "bg-blue-100 text-blue-700 border-blue-300",
    success: "bg-green-100 text-green-700 border-green-300",
    error: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className={`border rounded-md p-3 ${colors[type]}`}>
      {message}
    </div>
  );
}
