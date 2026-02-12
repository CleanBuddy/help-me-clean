import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  User,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/worker', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/worker/comenzi', icon: ClipboardList, label: 'Comenzi' },
  { to: '/worker/program', icon: CalendarDays, label: 'Program' },
  { to: '/worker/mesaje', icon: MessageSquare, label: 'Mesaje' },
  { to: '/worker/profil', icon: User, label: 'Profil' },
];

export default function CleanerLayout() {
  return (
    <DashboardLayout
      navItems={navItems}
      logoIcon={Sparkles}
      logoIconColor="text-accent"
      subtitle="Worker Dashboard"
      homeRoute="/worker"
    />
  );
}
