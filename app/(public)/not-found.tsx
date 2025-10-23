"use client";
export default function NotFound() {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold mb-4 text-blue-600">404</h1>
      <p className="text-gray-600 mb-6">Pagina căutată nu există sau a fost mutată.</p>
      <a
        href="/"
        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Înapoi la acasă
      </a>
    </div>
  );
}
