export default function FAQPage() {
  const faqs = [
    {
      q: "Cum pot posta un anunț?",
      a: "După ce îți creezi un cont, accesează Dashboard → Adaugă anunț.",
    },
    {
      q: "Cine aprobă anunțurile?",
      a: "Anunțurile sunt verificate de un admin înainte de publicare.",
    },
    {
      q: "Pot edita sau șterge un anunț?",
      a: "Da, din secțiunea Anunțurile mele poți edita sau șterge oricând.",
    },
  ];

  return (
    <section className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Întrebări frecvente</h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white shadow p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{f.q}</h3>
            <p className="text-gray-600">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
