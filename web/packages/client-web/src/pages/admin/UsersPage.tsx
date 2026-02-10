import { useQuery } from '@apollo/client';
import { Users, Building2, UserCheck, ClipboardList } from 'lucide-react';
import Card from '@/components/ui/Card';
import { PLATFORM_STATS } from '@/graphql/operations';

export default function UsersPage() {
  const { data, loading } = useQuery(PLATFORM_STATS);
  const stats = data?.platformStats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Utilizatori</h1>
        <p className="text-gray-500 mt-1">
          Statistici despre utilizatorii platformei.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Clienti</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalClients ?? 0}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Building2 className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Companii</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCompanies ?? 0}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <UserCheck className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Curatatori</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalCleaners ?? 0}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clienti noi luna aceasta</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.newClientsThisMonth ?? 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gestionare utilizatori
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Utilizatorii pot fi gestionati prin intermediul sectiunilor de companii si comenzi.
                Functionalitatea completa de management al utilizatorilor va fi disponibila in curand.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
