import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  MessageCircle,
  MapPin,
  Settings,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';
import { cn } from '@helpmeclean/shared';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const navItems = [
  { to: '/cont', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cont/comenzi', icon: ClipboardList, label: 'Comenzile mele' },
  { to: '/cont/mesaje', icon: MessageCircle, label: 'Mesaje' },
  { to: '/cont/adrese', icon: MapPin, label: 'Adresele mele' },
  { to: '/cont/setari', icon: Settings, label: 'Profil & Setari' },
];

export default function ClientSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/autentificare');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6">
        <NavLink to="/cont" className="flex items-center gap-2">
          <User className="h-7 w-7 text-primary" />
          <div>
            <span className="text-lg font-bold text-primary block leading-tight">HelpMeClean</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Contul meu</span>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/cont'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}

        {/* New Booking Button */}
        <div className="pt-3">
          <Button
            onClick={() => navigate('/rezervare')}
            className="w-full"
            size="md"
          >
            <Sparkles className="h-4 w-4" />
            Rezervare noua
          </Button>
        </div>
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-danger transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          Deconectare
        </button>
      </div>
    </aside>
  );
}
