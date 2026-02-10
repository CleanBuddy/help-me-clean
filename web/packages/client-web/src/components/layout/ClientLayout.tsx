import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';

export default function ClientLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
