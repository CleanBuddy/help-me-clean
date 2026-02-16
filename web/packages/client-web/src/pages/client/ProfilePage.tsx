import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import {
  User,
  MapPin,
  LogOut,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { UPDATE_PROFILE, MY_ADDRESSES, UPLOAD_AVATAR } from '@/graphql/operations';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SavedAddress {
  id: string;
  label?: string;
  streetAddress: string;
  city: string;
  county: string;
  floor?: string;
  apartment?: string;
  isDefault: boolean;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, 'Numele trebuie sa aiba cel putin 2 caractere'),
  phone: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

type ProfileFormValues = {
  fullName: string;
  phone?: string;
  preferredLanguage?: string;
};

// ─── Language options ────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { value: 'ro', label: 'Romana' },
  { value: 'en', label: 'English' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout, refetchUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      preferredLanguage: 'ro',
    },
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
        preferredLanguage: user.preferredLanguage || 'ro',
      });
    }
  }, [user, reset]);

  const [updateProfile, { loading: updating, data: updateData }] =
    useMutation(UPDATE_PROFILE);

  const [uploadAvatar, { loading: uploadingAvatar }] = useMutation(UPLOAD_AVATAR, {
    onCompleted: () => {
      refetchUser();
    },
  });

  const { data: addressesData, loading: addressesLoading } = useQuery<{
    myAddresses: SavedAddress[];
  }>(MY_ADDRESSES, {
    skip: !isAuthenticated,
  });

  const saved = !!updateData;

  // Auth guard
  if (authLoading) {
    return <LoadingSpinner text="Se verifica autentificarea..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/autentificare" state={{ from: '/cont/setari' }} replace />;
  }

  const onSubmit = async (values: ProfileFormValues) => {
    await updateProfile({
      variables: {
        input: {
          fullName: values.fullName,
          phone: values.phone || undefined,
          preferredLanguage: values.preferredLanguage || undefined,
        },
      },
    });
    refetchUser();
  };

  const handleAvatarUpload = async (file: File) => {
    await uploadAvatar({
      variables: { file },
    });
  };

  const addresses = addressesData?.myAddresses ?? [];

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profilul meu</h1>
          <p className="text-gray-500 mt-1">
            Gestioneaza informatiile contului tau.
          </p>
        </div>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <Card>
            <div className="flex items-center gap-8">
              <AvatarUpload
                currentUrl={user?.avatarUrl}
                onUpload={handleAvatarUpload}
                loading={uploadingAvatar}
                size="xl"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  Poza de profil
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Incarca o imagine pentru profilul tau. Recomandat: 400x400 pixeli.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Formate acceptate: JPG, PNG, WEBP. Marime maxima: 10MB
                </p>
              </div>
            </div>
          </Card>

          {/* Profile Form */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Informatii personale
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Nume complet"
                placeholder="Numele tau complet"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Numar de telefon"
                type="tel"
                placeholder="+40 7XX XXX XXX"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Select
                label="Limba preferata"
                options={LANGUAGE_OPTIONS}
                error={errors.preferredLanguage?.message}
                {...register('preferredLanguage')}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  loading={updating}
                  disabled={!isDirty && !updating}
                >
                  <Save className="h-4 w-4" />
                  Salveaza modificarile
                </Button>
                {saved && !isDirty && (
                  <span className="flex items-center gap-1.5 text-sm text-secondary font-medium">
                    <Check className="h-4 w-4" />
                    Salvat cu succes
                  </span>
                )}
              </div>
            </form>
          </Card>

          {/* Saved Addresses */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Adresele mele
                </h2>
                <p className="text-sm text-gray-500">
                  Adresele salvate pentru rezervari rapide.
                </p>
              </div>
            </div>

            {addressesLoading ? (
              <LoadingSpinner size="sm" text="Se incarca adresele..." />
            ) : addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      {addr.label && (
                        <div className="text-sm font-medium text-gray-900 mb-0.5">
                          {addr.label}
                          {addr.isDefault && (
                            <span className="ml-2 text-xs text-secondary font-semibold">
                              Implicita
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        {addr.streetAddress}
                        {addr.floor && `, Etaj ${addr.floor}`}
                        {addr.apartment && `, Ap. ${addr.apartment}`}
                      </div>
                      <div className="text-sm text-gray-400">
                        {addr.city}, {addr.county}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">
                Nu ai nicio adresa salvata. Adresele vor fi salvate automat la
                prima rezervare.
              </p>
            )}
          </Card>

          {/* Logout */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Deconectare
                </h2>
                <p className="text-sm text-gray-500">
                  Te vei deconecta din contul tau.
                </p>
              </div>
              <Button variant="danger" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Deconectare
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
