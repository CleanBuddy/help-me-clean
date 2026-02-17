import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-2xl font-bold text-white">HelpMeClean</span>
            <p className="mt-3 text-sm leading-relaxed max-w-md">
              Prima platforma de tip marketplace din Romania care conecteaza
              clientii cu firme de curatenie verificate. Plati digitale,
              facturare automata, transparenta totala.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Navigare</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#servicii" className="hover:text-white transition">
                  Servicii
                </a>
              </li>
              <li>
                <Link to="/rezervare" className="hover:text-white transition">
                  Rezerva o curatenie
                </Link>
              </li>
              <li>
                <Link to="/cont/comenzi" className="hover:text-white transition">
                  Comenzile mele
                </Link>
              </li>
            </ul>
          </div>

          {/* Pentru Firme */}
          <div>
            <h4 className="text-white font-semibold mb-3">Pentru Firme</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/inregistrare-firma" className="hover:text-white transition">
                  Devino partener
                </Link>
              </li>
              <li>
                <Link to="/firma" className="hover:text-white transition">
                  Dashboard firma
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>contact@helpmeclean.ro</li>
              <li>+40 700 000 000</li>
              <li>Bucuresti, Romania</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-sm text-center">
          &copy; {currentYear} HelpMeClean. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
