import { Shield, Mail, User, Calendar, Globe } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Setari Platforma</h1>
        <p className="text-gray-500 mt-1">Configuratii si informatii despre contul tau de administrator.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Info */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informatii administrator</h3>
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.fullName}</p>
                  <Badge variant="info">{user.role}</Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Telefon</p>
                      <p className="text-sm text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Limba preferata</p>
                    <p className="text-sm text-gray-900">{user.preferredLanguage ?? 'ro'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </div>
                </div>

                {user.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Cont creat</p>
                      <p className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Nu s-au putut incarca informatiile.</p>
          )}
        </Card>

        {/* Platform Config */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuratie platforma</h3>
          <div className="space-y-4">
            <div className="py-3 px-4 rounded-xl bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Comision platforma implicit</p>
              <p className="text-lg font-bold text-gray-900 mt-1">15%</p>
            </div>
            <div className="py-3 px-4 rounded-xl bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Moneda</p>
              <p className="text-lg font-bold text-gray-900 mt-1">RON</p>
            </div>
            <div className="py-3 px-4 rounded-xl bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Zona de acoperire</p>
              <p className="text-lg font-bold text-gray-900 mt-1">Romania</p>
            </div>
            <div className="py-3 px-4 rounded-xl bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Versiune API</p>
              <p className="text-lg font-bold text-gray-900 mt-1">v1.0</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Setarile avansate ale platformei vor fi disponibile in curand.
          </p>
        </Card>
      </div>
    </div>
  );
}
