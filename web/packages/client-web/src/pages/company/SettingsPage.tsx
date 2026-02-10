import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Building2, Save } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { MY_COMPANY, UPDATE_COMPANY_PROFILE } from '@/graphql/operations';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const companyStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  ACTIVE: 'success',
  PENDING_REVIEW: 'warning',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
};

const companyStatusLabel: Record<string, string> = {
  ACTIVE: 'Activa',
  PENDING_REVIEW: 'In curs de verificare',
  REJECTED: 'Respinsa',
  SUSPENDED: 'Suspendata',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data, loading } = useQuery(MY_COMPANY);
  const [updateCompany, { loading: saving }] = useMutation(UPDATE_COMPANY_PROFILE);

  const company = data?.myCompany;

  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [maxRadius, setMaxRadius] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (company) {
      setDescription(company.description || '');
      setContactPhone(company.contactPhone || '');
      setMaxRadius(company.maxServiceRadiusKm?.toString() || '');
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    try {
      await updateCompany({
        variables: {
          input: {
            description,
            contactPhone,
            maxServiceRadiusKm: maxRadius ? parseInt(maxRadius, 10) : undefined,
          },
        },
      });
      setSuccessMessage('Setarile au fost salvate cu succes.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      // Error handled by Apollo
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Setari</h1>
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Setari</h1>
        <Card>
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nicio firma inregistrata</h3>
            <p className="text-gray-500">
              Nu ai o firma inregistrata inca. Inregistreaza-ti firma pentru a incepe.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Setari</h1>

      {/* Company Info (read-only) */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{company.companyName}</h2>
            <p className="text-sm text-gray-500 mt-1">CUI: {company.cui}</p>
          </div>
          <Badge variant={companyStatusVariant[company.status] || 'default'}>
            {companyStatusLabel[company.status] || company.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tip firma</p>
            <p className="font-medium">{company.companyType || '--'}</p>
          </div>
          <div>
            <p className="text-gray-500">Reprezentant legal</p>
            <p className="font-medium">{company.legalRepresentative || '--'}</p>
          </div>
          <div>
            <p className="text-gray-500">Email contact</p>
            <p className="font-medium">{company.contactEmail || '--'}</p>
          </div>
          <div>
            <p className="text-gray-500">Adresa</p>
            <p className="font-medium">
              {[company.address, company.city, company.county].filter(Boolean).join(', ') || '--'}
            </p>
          </div>
        </div>

        {company.rejectionReason && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-sm text-red-700">
            <p className="font-medium mb-1">Motiv respingere:</p>
            <p>{company.rejectionReason}</p>
          </div>
        )}
      </Card>

      {/* Editable settings */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Setari editabile</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descriere firma
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Descrierea firmei tale..."
            />
          </div>

          <Input
            label="Telefon contact"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+40 7XX XXX XXX"
          />

          <Input
            label="Raza maxima de serviciu (km)"
            type="number"
            value={maxRadius}
            onChange={(e) => setMaxRadius(e.target.value)}
            placeholder="50"
          />

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            Salveaza modificarile
          </Button>
        </form>
      </Card>
    </div>
  );
}
