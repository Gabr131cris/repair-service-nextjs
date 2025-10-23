import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="container mx-auto px-4 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">CarMarket</h3>
            <p className="text-sm text-gray-400">
              Cumpără sau vinde mașina ta ușor, rapid și în siguranță.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Link-uri utile</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/about" className="hover:underline">Despre noi</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              <li><Link href="/listings" className="hover:underline">Anunțuri</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Contact</h4>
            <p className="text-sm text-gray-400">contact@carmarket.ro</p>
            <p className="text-sm text-gray-400">+40 723 456 789</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 pt-4 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} CarMarket. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
