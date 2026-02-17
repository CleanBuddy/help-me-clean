import { Link } from 'react-router-dom';
import { usePlatform } from '@/context/PlatformContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isPreRelease } = usePlatform();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
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
              {!isPreRelease && (
                <li>
                  <Link to="/rezervare" className="hover:text-white transition">
                    Rezerva o curatenie
                  </Link>
                </li>
              )}
              {!isPreRelease && (
                <li>
                  <Link to="/cont/comenzi" className="hover:text-white transition">
                    Comenzile mele
                  </Link>
                </li>
              )}
              <li>
                <Link to="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/despre-noi" className="hover:text-white transition">
                  Despre noi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Pentru Firme */}
          <div>
            <h4 className="text-white font-semibold mb-3">Pentru Firme</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pentru-firme" className="hover:text-white transition">
                  Devino partener
                </Link>
              </li>
              {!isPreRelease && (
                <li>
                  <Link to="/firma" className="hover:text-white transition">
                    Dashboard firma
                  </Link>
                </li>
              )}
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

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/termeni" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Termeni și condiții
                </Link>
              </li>
              <li>
                <Link to="/confidentialitate" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Politica de confidențialitate
                </Link>
              </li>
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
