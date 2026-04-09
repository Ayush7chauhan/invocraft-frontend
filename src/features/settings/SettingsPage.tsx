import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Store, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import settingsService from '@/services/settings.service';
import PageHeader from '@/components/common/PageHeader';
import FormField, { Input, Select, Textarea } from '@/components/common/FormField';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import { parseApiError } from '@/lib/api';
import { clearAuthStorage } from '@/lib/utils';
import { confirmAction } from '@/components/common/ConfirmDialog';
import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/hooks/useTheme';
import type { Shop } from '@/types';

const BUSINESS_TYPES = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'medical', label: 'Medical / Pharmacy' },
  { value: 'general', label: 'General Store' },
  { value: 'other', label: 'Other' },
];

const settingsSchema = z.object({
  shop_name: z.string().min(1, 'Shop name is required'),
  owner_name: z.string().min(2, 'Owner name is required'),
  shop_address: z.string().optional(),
  business_type: z.string().optional(),
  gst_number: z.string().optional(),
  invoice_prefix: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      shop_name: settings?.shop_name ?? '',
      owner_name: settings?.owner_name ?? '',
      shop_address: settings?.shop_address ?? '',
      business_type: settings?.business_type ?? '',
      gst_number: settings?.gst_number ?? '',
      invoice_prefix: settings?.invoice_prefix ?? '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSubmit = (values: SettingsFormValues) => updateMutation.mutate(values);

  const handleLogout = async () => {
    const ok = await confirmAction({
      title: 'Logout?',
      text: 'You will be logged out of Invocraft.',
      confirmText: 'Logout',
      variant: 'danger',
    });
    if (ok) {
      clearAuthStorage();
      toast.success('Logged out successfully');
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  if (isLoading) return <PageLoader label="Loading settings..." />;

  return (
    <div className="pb-24">
      <PageHeader title="Settings" backPath={ROUTES.DASHBOARD} />

      <div className="px-4 pt-4 space-y-5">
        {/* Shop Info Form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <Store size={18} className="text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Shop Information
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Shop Name" required error={errors.shop_name?.message} className="col-span-2">
                <Input {...register('shop_name')} placeholder="Your Shop Name" error={Boolean(errors.shop_name)} />
              </FormField>

              <FormField label="Owner Name" required error={errors.owner_name?.message} className="col-span-2">
                <Input {...register('owner_name')} placeholder="Owner Name" error={Boolean(errors.owner_name)} />
              </FormField>

              <FormField label="Business Type" error={errors.business_type?.message} className="col-span-2">
                <Select
                  {...register('business_type')}
                  options={BUSINESS_TYPES}
                  placeholder="Select business type..."
                />
              </FormField>

              <FormField label="GST Number" error={errors.gst_number?.message} className="col-span-2">
                <Input {...register('gst_number')} placeholder="22AAAAA0000A1Z5 (optional)" />
              </FormField>

              <FormField label="Invoice Prefix" error={errors.invoice_prefix?.message}>
                <Input {...register('invoice_prefix')} placeholder="INV" />
              </FormField>
            </div>

            <FormField label="Shop Address" error={errors.shop_address?.message}>
              <Textarea {...register('shop_address')} placeholder="Full shop address..." rows={3} />
            </FormField>

            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {updateMutation.isPending && <ButtonSpinner />}
              Save Settings
            </button>
          </form>
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle dark/light theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isDarkMode ? 'bg-green-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-4 space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">App:</span> Invocraft
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Version:</span>{' '}
              {import.meta.env.VITE_APP_VERSION ?? '1.0.0'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Stack:</span> React 19 + Laravel
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
