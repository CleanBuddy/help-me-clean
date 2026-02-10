import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Building2, Shield, User, ChevronDown } from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
      {initials || '?'}
    </div>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isClient = isAuthenticated && user?.role === 'CLIENT';
  const isCompany = isAuthenticated && user?.role === 'COMPANY_ADMIN';
  const isAdmin = isAuthenticated && user?.role === 'GLOBAL_ADMIN';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">HelpMeClean</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isClient ? (
              <>
                {/* Authenticated CLIENT nav — avatar dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary font-medium transition cursor-pointer"
                  >
                    <UserAvatar name={user.fullName || ''} />
                    <span className="max-w-[140px] truncate">{user.fullName || 'Contul meu'}</span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', dropdownOpen && 'rotate-180')} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                      <Link
                        to="/cont"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Contul meu
                      </Link>
                      <div className="h-px bg-gray-100 mx-2" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Deconectare
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : isCompany ? (
              <>
                {/* COMPANY_ADMIN nav */}
                <Link
                  to="/firma"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-secondary font-medium transition"
                >
                  <Building2 className="h-4 w-4" />
                  Panoul firmei
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <Link
                  to="/profil"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition"
                >
                  <UserAvatar name={user!.fullName || ''} />
                  <span className="max-w-[120px] truncate">{user!.fullName || 'Profil'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-danger font-medium transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : isAdmin ? (
              <>
                {/* GLOBAL_ADMIN nav */}
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-secondary font-medium transition"
                >
                  <Shield className="h-4 w-4" />
                  Panou admin
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <Link
                  to="/profil"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition"
                >
                  <UserAvatar name={user!.fullName || ''} />
                  <span className="max-w-[120px] truncate">{user!.fullName || 'Profil'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-danger font-medium transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                {/* Public / landing page nav */}
                <Link
                  to="/servicii"
                  className="text-gray-600 hover:text-primary font-medium transition"
                >
                  Servicii
                </Link>
                <a
                  href="#cum-functioneaza"
                  className="text-gray-600 hover:text-primary font-medium transition"
                >
                  Cum functioneaza
                </a>
                <Link
                  to="/autentificare"
                  className="text-gray-600 hover:text-primary font-medium transition"
                >
                  Autentificare
                </Link>
                <Link
                  to="/inregistrare-firma"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-secondary font-medium transition"
                >
                  <Building2 className="h-4 w-4" />
                  Pentru Firme
                </Link>
                <Button size="md" onClick={() => navigate('/rezervare')}>
                  Rezerva acum
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-[28rem] pb-4' : 'max-h-0',
          )}
        >
          <nav className="flex flex-col gap-1">
            {isClient ? (
              <>
                {/* Authenticated CLIENT mobile nav */}
                <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-gray-100">
                  <UserAvatar name={user.fullName || ''} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/cont"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Contul meu
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-danger hover:bg-red-50 font-medium cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Deconectare
                </button>
              </>
            ) : isCompany ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-gray-100">
                  <UserAvatar name={user!.fullName || ''} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user!.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user!.email}</p>
                  </div>
                </div>
                <Link
                  to="/firma"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-emerald-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building2 className="h-4 w-4" />
                  Panoul firmei
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-danger hover:bg-red-50 font-medium cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Deconectare
                </button>
              </>
            ) : isAdmin ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-gray-100">
                  <UserAvatar name={user!.fullName || ''} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user!.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user!.email}</p>
                  </div>
                </div>
                <Link
                  to="/admin"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-emerald-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Panou admin
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-danger hover:bg-red-50 font-medium cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Deconectare
                </button>
              </>
            ) : (
              <>
                {/* Public / landing page mobile nav */}
                <Link
                  to="/servicii"
                  className="px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Servicii
                </Link>
                <a
                  href="#cum-functioneaza"
                  className="px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cum functioneaza
                </a>
                <Link
                  to="/autentificare"
                  className="px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Autentificare
                </Link>
                <Link
                  to="/inregistrare-firma"
                  className="px-3 py-2.5 rounded-xl text-secondary hover:bg-emerald-50 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pentru Firme
                </Link>
                <div className="pt-2">
                  <Button
                    size="md"
                    className="w-full"
                    onClick={() => {
                      navigate('/rezervare');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Rezerva acum
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
