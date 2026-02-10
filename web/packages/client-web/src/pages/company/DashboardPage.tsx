import { useQuery } from '@apollo/client';
import { ClipboardList, Users, Star, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { MY_COMPANY } from '@/graphql/operations';

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, loading } = useQuery(MY_COMPANY);
  const company = data?.myCompany;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bun venit{company ? `, ${company.companyName}` : ''}!
        </h1>
        <p className="text-gray-500 mt-1">
          Iata o privire de ansamblu asupra activitatii tale.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Comenzi finalizate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company?.totalJobsCompleted ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Venit saptamana</p>
                <p className="text-2xl font-bold text-secondary">0 RON</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating mediu</p>
                <p className="text-2xl font-bold text-accent">
                  {company?.ratingAvg ? Number(company.ratingAvg).toFixed(1) : '--'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Raza serviciu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company?.maxServiceRadiusKm ?? '--'} km
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
