import { Outlet } from 'react-router-dom';
import CleanerSidebar from './CleanerSidebar';

export default function CleanerLayout() {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <CleanerSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
