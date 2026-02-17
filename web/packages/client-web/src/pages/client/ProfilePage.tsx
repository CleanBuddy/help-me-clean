import { useState, useEffect, useCallback } from 'react';
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
  Plus,
  X,
  Star,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AvatarUpload from '@/components/ui/AvatarUpload';
import AddressAutocomplete, { type ParsedAddress } from '@/components/ui/AddressAutocomplete';
import {
  UPDATE_PROFILE,
  MY_ADDRESSES,
  UPLOAD_AVATAR,
  ADD_ADDRESS,
  DELETE_ADDRESS,
  SET_DEFAULT_ADDRESS,
} from '@/graphql/operations';

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

interface AddressFormData {
  label: string;
  streetAddress: string;
  city: string;
  county: string;
  floor: string;
  apartment: string;
  latitude: number | null;
  longitude: number | null;
}

const EMPTY_ADDRESS: AddressFormData = {
  label: '',
  streetAddress: '',
  city: '',
  county: '',
  floor: '',
  apartment: '',
  latitude: null,
  longitude: null,
};

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

  const { data: addressesData, loading: addressesLoading, refetch: refetchAddresses } = useQuery<{
    myAddresses: SavedAddress[];
  }>(MY_ADDRESSES, {
    skip: !isAuthenticated,
  });

  // ─── Address management ────────────────────────────────────────────────────

  const [showAddForm, setShowAddForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormData>(EMPTY_ADDRESS);
  const [addressError, setAddressError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [addAddress, { loading: addingAddress }] = useMutation(ADD_ADDRESS, {
    onCompleted: () => {
      setShowAddForm(false);
      setAddressForm(EMPTY_ADDRESS);
      setAddressError('');
      refetchAddresses();
    },
    onError: () => setAddressError('Nu am putut salva adresa. Te rugam sa incerci din nou.'),
  });

  const [deleteAddress, { loading: deleting }] = useMutation(DELETE_ADDRESS, {
    onCompleted: () => {
      setDeleteConfirmId(null);
      refetchAddresses();
    },
  });

  const [setDefaultAddress] = useMutation(SET_DEFAULT_ADDRESS, {
    onCompleted: () => refetchAddresses(),
  });

  const handleAutocompleteSelect = useCallback((parsed: ParsedAddress) => {
    setAddressForm((prev) => ({
      ...prev,
      streetAddress: parsed.streetAddress,
      city: parsed.city,
      county: parsed.county,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
    }));
  }, []);

  const handleAddAddress = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAddressError('');
      if (!addressForm.streetAddress.trim() || !addressForm.city.trim() || !addressForm.county.trim()) {
        setAddressError('Adresa, orasul si judetul sunt obligatorii.');
        return;
      }
      await addAddress({
        variables: {
          input: {
            label: addressForm.label.trim() || undefined,
            streetAddress: addressForm.streetAddress.trim(),
            city: addressForm.city.trim(),
            county: addressForm.county.trim(),
            floor: addressForm.floor.trim() || undefined,
            apartment: addressForm.apartment.trim() || undefined,
            latitude: addressForm.latitude,
            longitude: addressForm.longitude,
          },
        },
      });
    },
    [addAddress, addressForm],
  );

  // ─── Profile submit ────────────────────────────────────────────────────────

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
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
              {!showAddForm && (
                <Button size="sm" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4" />
                  Adauga adresa
                </Button>
              )}
            </div>

            {/* Add address form */}
            {showAddForm && (
              <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Adresa noua</h3>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setAddressForm(EMPTY_ADDRESS); setAddressError(''); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleAddAddress} className="space-y-3">
                  <Input
                    label="Eticheta (optional)"
                    placeholder="Acasa, Birou, etc."
                    value={addressForm.label}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
                  />
                  <AddressAutocomplete
                    label="Adresa *"
                    placeholder="Cauta adresa sau scrie manual (orice oras din Romania)..."
                    value={addressForm.streetAddress}
                    onChange={(val) => setAddressForm((prev) => ({ ...prev, streetAddress: val }))}
                    onAddressSelect={handleAutocompleteSelect}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Oras *"
                      placeholder="Cluj-Napoca"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                    />
                    <Input
                      label="Judet *"
                      placeholder="Cluj"
                      value={addressForm.county}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, county: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Etaj (optional)"
                      placeholder="2"
                      value={addressForm.floor}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, floor: e.target.value }))}
                    />
                    <Input
                      label="Apartament (optional)"
                      placeholder="12A"
                      value={addressForm.apartment}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, apartment: e.target.value }))}
                    />
                  </div>
                  {addressError && (
                    <p className="text-sm text-red-600">{addressError}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm" loading={addingAddress}>
                      <Check className="h-4 w-4" />
                      Salveaza adresa
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => { setShowAddForm(false); setAddressForm(EMPTY_ADDRESS); setAddressError(''); }}
                    >
                      Anuleaza
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {addressesLoading ? (
              <LoadingSpinner size="sm" text="Se incarca adresele..." />
            ) : addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="relative flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    {/* Delete confirmation overlay */}
                    {deleteConfirmId === addr.id && (
                      <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center z-10">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 mb-3">
                            Stergi aceasta adresa?
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" onClick={() => setDeleteConfirmId(null)}>
                              Anuleaza
                            </Button>
                            <Button
                              size="sm"
                              className="bg-danger hover:bg-danger/90 text-white"
                              loading={deleting}
                              onClick={() => deleteAddress({ variables: { id: addr.id } })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Sterge
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

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
                    <div className="flex items-center gap-1 shrink-0">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress({ variables: { id: addr.id } })}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-500 transition cursor-pointer"
                          title="Seteaza ca implicita"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(addr.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-danger transition cursor-pointer"
                        title="Sterge"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !showAddForm ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Nu ai nicio adresa salvata
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Salveaza adresa ta pentru a face rezervari mai rapid. Poti adauga orice oras din Romania!
                </p>
                <Button size="sm" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4" />
                  Adauga prima adresa
                </Button>
              </div>
            ) : null}
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
