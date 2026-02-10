import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
  ClipboardList,
  MessageCircle,
  MapPin,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MY_BOOKINGS, MY_CHAT_ROOMS, MY_ADDRESSES } from '@/graphql/operations';

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: bookingsData, loading: bookingsLoading } = useQuery(MY_BOOKINGS, {
    variables: { first: 100 },
  });

  const { data: chatData, loading: chatLoading } = useQuery(MY_CHAT_ROOMS);

  const { data: addressesData, loading: addressesLoading } = useQuery(MY_ADDRESSES);

  const totalBookings = bookingsData?.myBookings?.totalCount ?? 0;

  const activeBookings =
    bookingsData?.myBookings?.edges?.filter(
      (b: { status: string }) =>
        ['ASSIGNED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status),
    ).length ?? 0;

  const chatRooms = chatData?.myChatRooms?.length ?? 0;

  const savedAddresses = addressesData?.myAddresses?.length ?? 0;

  const isLoading = bookingsLoading || chatLoading || addressesLoading;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bun venit{user ? `, ${user.fullName}` : ''}!
        </h1>
        <p className="text-gray-500 mt-1">
          Iata o privire de ansamblu asupra contului tau.
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/cont/comenzi')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total rezervari</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/cont/comenzi')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rezervari active</p>
                <p className="text-2xl font-bold text-secondary">{activeBookings}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/cont/mesaje')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <MessageCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversatii</p>
                <p className="text-2xl font-bold text-accent">{chatRooms}</p>
              </div>
            </div>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/cont/adrese')}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Adrese salvate</p>
                <p className="text-2xl font-bold text-gray-900">{savedAddresses}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actiuni rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button onClick={() => navigate('/rezervare')} className="w-full">
            <Sparkles className="h-4 w-4" />
            Rezervare noua
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/cont/comenzi')}
            className="w-full"
          >
            <ClipboardList className="h-4 w-4" />
            Vezi comenzile
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/cont/mesaje')}
            className="w-full"
          >
            <MessageCircle className="h-4 w-4" />
            Mesaje
          </Button>
        </div>
      </Card>
    </div>
  );
}
