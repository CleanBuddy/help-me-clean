import { Outlet } from 'react-router-dom';
import CompanySidebar from './CompanySidebar';
import CompanyStatusGate from '@/components/company/CompanyStatusGate';

export default function CompanyLayout() {
  return (
    <CompanyStatusGate>
      <div className="flex min-h-screen bg-[#FAFBFC]">
        <CompanySidebar />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </CompanyStatusGate>
  );
}
