import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import LogoutModal from '@/components/LogoutModal';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  LogOut, Moon, Sun, Phone, Receipt,
  FileText, Shield, ChevronRight, User, Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import settingsService from '@/services/settings.service';
import PageHeader from '@/components/common/PageHeader';
import FormField, { Input, Select, Textarea } from '@/components/common/FormField';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import { parseApiError } from '@/lib/api';
import { clearAuthStorage } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/hooks/useTheme';
import type { Shop } from '@/types';

// ── Validation ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'medical', label: 'Medical / Pharmacy' },
  { value: 'general', label: 'General Store' },
  { value: 'other',   label: 'Other' },
];

const profileSchema = z.object({
  shop_name:     z.string().min(1, 'Shop name is required').max(150),
  owner_name:    z.string().min(2, 'Owner name is required').max(150),
  shop_address:  z.string().max(500).optional(),
  business_type: z.string().optional(),
  gst_number:    z.string().max(20).optional(),
});

const billingSchema = z.object({
  invoice_prefix:       z.string().max(20).optional(),
  invoice_start_number: z.number().int().min(1).optional(),
  default_tax_rate:     z.number().min(0).max(100).optional(),
  show_tax_on_invoice:  z.boolean().optional(),
  invoice_footer_note:  z.string().max(1000).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type BillingFormValues = z.infer<typeof billingSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isDarkMode, toggleTheme } = useTheme();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await settingsService.get();
      return res.data.data as Shop;
    },
  });

  // ── Profile form ───────────────────────────────────────────────────────────

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      shop_name:     settings?.shop_name     ?? '',
      owner_name:    settings?.owner_name    ?? '',
      shop_address:  settings?.shop_address  ?? '',
      business_type: settings?.business_type ?? '',
      gst_number:    settings?.gst_number    ?? '',
    },
  });

  // ── Billing form ───────────────────────────────────────────────────────────

  const {
    register: regBilling,
    handleSubmit: handleBilling,
    formState: { errors: billingErrors, isDirty: billingDirty },
  } = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    values: {
      invoice_prefix:       settings?.invoice_prefix       ?? 'INV',
      invoice_start_number: settings?.invoice_start_number ?? 1,
      default_tax_rate:     settings?.default_tax_rate     ?? 0,
      show_tax_on_invoice:  settings?.show_tax_on_invoice  ?? false,
      invoice_footer_note:  settings?.invoice_footer_note  ?? '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSaveProfile = (values: ProfileFormValues) => updateMutation.mutate(values);
  const onSaveBilling = (values: BillingFormValues) =>
    updateMutation.mutate({
      ...values,
      invoice_start_number: Number(values.invoice_start_number),
      default_tax_rate:     Number(values.default_tax_rate),
    });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    clearAuthStorage(qc);
    toast.success('Logged out');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  if (isLoading) return <PageLoader label="Loading settings…" />;

  return (
    <div className="pb-24">
      <PageHeader title="Settings" backPath={ROUTES.DASHBOARD} />

      <div className="px-4 pt-4 space-y-5">

        {/* ── Account info banner ──────────────────────────────────────────── */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {(settings?.owner_name ?? settings?.shop_name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {settings?.shop_name ?? 'Your Shop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {settings?.owner_name ?? ''} · +91 {settings?.mobile_number ?? ''}
            </p>
          </div>
          <Phone size={16} className="text-green-600 dark:text-green-400 shrink-0 ml-auto" />
        </div>

        {/* ── Shop Profile ─────────────────────────────────────────────────── */}
        <Section icon={<User size={16} />} title="Shop Profile">
          <form onSubmit={handleProfile(onSaveProfile)} className="p-4 space-y-4">
            <FormField label="Shop Name" required error={profileErrors.shop_name?.message}>
              <Input {...regProfile('shop_name')} placeholder="My Shop" error={Boolean(profileErrors.shop_name)} />
            </FormField>

            <FormField label="Owner Name" required error={profileErrors.owner_name?.message}>
              <Input {...regProfile('owner_name')} placeholder="Owner Name" error={Boolean(profileErrors.owner_name)} />
            </FormField>

            <FormField label="Business Type" error={profileErrors.business_type?.message}>
              <Select {...regProfile('business_type')} options={BUSINESS_TYPES} placeholder="Select type…" />
            </FormField>

            <FormField label="GST Number" error={profileErrors.gst_number?.message}>
              <Input {...regProfile('gst_number')} placeholder="22AAAAA0000A1Z5 (optional)" />
            </FormField>

            <FormField label="Shop Address" error={profileErrors.shop_address?.message}>
              <Textarea {...regProfile('shop_address')} placeholder="Full shop address…" rows={2} />
            </FormField>

            <SaveButton disabled={!profileDirty || updateMutation.isPending} pending={updateMutation.isPending} />
          </form>
        </Section>

        {/* ── Invoice & Billing ────────────────────────────────────────────── */}
        <Section icon={<Receipt size={16} />} title="Invoice & Billing">
          <form onSubmit={handleBilling(onSaveBilling)} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Invoice Prefix" error={billingErrors.invoice_prefix?.message}>
                <Input {...regBilling('invoice_prefix')} placeholder="INV" />
              </FormField>
              <FormField label="Start Number" error={billingErrors.invoice_start_number?.message}>
                <Input
                  {...regBilling('invoice_start_number', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="1"
                  error={Boolean(billingErrors.invoice_start_number)}
                />
              </FormField>
            </div>

            <FormField label="Default Tax Rate (%)" error={billingErrors.default_tax_rate?.message}>
              <Input
                {...regBilling('default_tax_rate', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min={0}
                max={100}
                placeholder="0"
                error={Boolean(billingErrors.default_tax_rate)}
              />
            </FormField>

            {/* Show tax toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Show Tax on Invoice</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Display tax breakdown on printed invoices</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" {...regBilling('show_tax_on_invoice')} />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            <FormField label="Invoice Footer Note" error={billingErrors.invoice_footer_note?.message}>
              <Textarea
                {...regBilling('invoice_footer_note')}
                placeholder="Thank you for your business!"
                rows={2}
              />
            </FormField>

            <SaveButton disabled={!billingDirty || updateMutation.isPending} pending={updateMutation.isPending} />
          </form>
        </Section>

        {/* ── Appearance ───────────────────────────────────────────────────── */}
        <Section icon={isDarkMode ? <Moon size={16} /> : <Sun size={16} />} title="Appearance">
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle dark / light theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-green-600' : 'bg-gray-300'}`}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </Section>

        {/* ── Legal links ──────────────────────────────────────────────────── */}
        <Section icon={<Info size={16} />} title="About & Legal">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <LinkRow icon={<FileText size={16} />} label="Terms of Service" onClick={() => navigate(ROUTES.TERMS)} />
            <LinkRow icon={<Shield size={16} />}   label="Privacy Policy"   onClick={() => navigate(ROUTES.PRIVACY)} />
            <div className="px-4 py-3 space-y-1">
              <p className="text-xs text-gray-400">App: Invocraft &nbsp;·&nbsp; Version {import.meta.env.VITE_APP_VERSION ?? '1.0.0'}</p>
              <p className="text-xs text-gray-400">Built with React 19 + Laravel</p>
            </div>
          </div>
        </Section>

        {/* ── Logout ───────────────────────────────────────────────────────── */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors active:scale-95"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <span className="text-green-600 dark:text-green-400">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SaveButton({ disabled, pending }: { disabled: boolean; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
    >
      {pending && <ButtonSpinner />}
      Save Changes
    </button>
  );
}

function LinkRow({
  icon, label, onClick,
}: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        {label}
      </div>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}
