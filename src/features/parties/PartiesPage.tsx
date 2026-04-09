import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Phone, MapPin, Edit2, Trash2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import partiesService from '@/services/parties.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import FormField, { Input, Select, Textarea } from '@/components/common/FormField';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { Party, PartyType } from '@/types';

// ── Schema — field names must match backend StorePartyRequest ─────────────────
const partySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().optional().refine(       // backend: mobile (not mobile_number)
    (v) => !v || /^\d{10}$/.test(v),
    'Enter a valid 10-digit mobile number',
  ),
  email: z.string().optional().refine(
    (v) => !v || z.string().email().safeParse(v).success,
    'Enter a valid email address',
  ),
  address: z.string().optional(),
  type: z.enum(['customer', 'supplier', 'both'] as const),
  gst_number: z.string().optional(),
  opening_balance: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive'] as const).optional(),
});

type PartyFormValues = z.infer<typeof partySchema>;

const PARTY_TYPE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'both', label: 'Customer & Supplier' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface PartiesPageProps {
  partyType?: PartyType;
}

export default function PartiesPage({ partyType }: PartiesPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(searchParams.get('openForm') === 'true');
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────────

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ['parties', partyType, search],
    queryFn: async () => {
      const res = await partiesService.list({ type: partyType, search });
      return res.data.data as Party[];
    },
  });

  // ── Form ──────────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: { type: partyType ?? 'customer', status: 'active' },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: partiesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parties'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Party added successfully');
      reset({ type: partyType ?? 'customer', status: 'active' });
      setShowForm(false);
    },
    onError: (err) => {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message);
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          setError(field as keyof PartyFormValues, { message: msgs[0] });
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PartyFormValues> }) =>
      partiesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parties'] });
      toast.success('Party updated successfully');
      setEditingParty(null);
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: partiesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parties'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Party deleted');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const onSubmit = (values: PartyFormValues) => {
    if (editingParty) {
      updateMutation.mutate({ id: editingParty.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    reset({
      name: party.name,
      mobile: party.mobile ?? '',
      email: party.email ?? '',
      address: party.address ?? '',
      type: party.type,
      gst_number: party.gst_number ?? '',
      opening_balance: party.opening_balance,
      status: party.status ?? 'active',
    });
    setShowForm(true);
  };

  const handleDelete = async (party: Party) => {
    const ok = await confirmDelete(party.name);
    if (ok) deleteMutation.mutate(party.id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingParty(null);
    reset();
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const title = partyType === 'customer' ? 'Customers'
    : partyType === 'supplier' ? 'Suppliers'
    : 'Parties';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="pb-24">
      <PageHeader
        title={title}
        subtitle={`${parties.length} ${title.toLowerCase()}`}
        backPath={ROUTES.DASHBOARD}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors active:scale-95"
          >
            <Plus size={16} />
            Add
          </button>
        }
      />

      <div className="px-4 pt-2 pb-3">
        <SearchInput value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {editingParty ? 'Edit Party' : 'Add New Party'}
              </h3>
              <button onClick={handleCloseForm} className="text-xs text-gray-500 hover:text-gray-700">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <FormField label="Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="Customer / Supplier name" error={Boolean(errors.name)} />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Mobile" error={errors.mobile?.message}>
                  <Input
                    {...register('mobile')}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit number"
                    error={Boolean(errors.mobile)}
                  />
                </FormField>

                <FormField label="Type" required error={errors.type?.message}>
                  <Select {...register('type')} options={PARTY_TYPE_OPTIONS} error={Boolean(errors.type)} />
                </FormField>
              </div>

              <FormField label="Email" error={errors.email?.message}>
                <Input {...register('email')} type="email" placeholder="email@example.com" error={Boolean(errors.email)} />
              </FormField>

              <FormField label="Address" error={errors.address?.message}>
                <Textarea {...register('address')} placeholder="Full address..." rows={2} />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="GST Number" error={errors.gst_number?.message}>
                  <Input {...register('gst_number')} placeholder="22AAAAA0000A1Z5" />
                </FormField>

                <FormField label="Opening Balance" error={errors.opening_balance?.message}>
                  <Input
                    {...register('opening_balance', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </FormField>
              </div>

              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isMutating && <ButtonSpinner />}
                {editingParty ? 'Update Party' : 'Add Party'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <PageLoader />
      ) : parties.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title={`No ${title.toLowerCase()} yet`}
          description={`Add your first ${partyType ?? 'party'} to get started.`}
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700"
            >
              Add {partyType ?? 'Party'}
            </button>
          }
        />
      ) : (
        <div className="px-4 space-y-2">
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              party={party}
              onEdit={() => handleEdit(party)}
              onDelete={() => handleDelete(party)}
              onViewLedger={() =>
                navigate(ROUTES.LEDGER('business', party.id), { state: { name: party.name } })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Party Card ────────────────────────────────────────────────────────────────

function PartyCard({
  party,
  onEdit,
  onDelete,
  onViewLedger,
}: {
  party: Party;
  onEdit: () => void;
  onDelete: () => void;
  onViewLedger: () => void;
}) {
  const balance = party.balance ?? 0;

  return (
    <div
      onClick={onViewLedger}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm shrink-0">
            {party.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{party.name}</p>
            {party.mobile && (
              <div className="flex items-center gap-1 mt-0.5">
                <Phone size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{party.mobile}</span>
              </div>
            )}
            {party.address && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{party.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant={party.type === 'supplier' ? 'warning' : 'success'}>
            {party.type}
          </Badge>
          {balance !== 0 && (
            <span className={cn(
              'text-xs font-semibold',
              balance > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            )}>
              ₹{Math.abs(balance).toLocaleString('en-IN')}
            </span>
          )}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" aria-label="Edit">
              <Edit2 size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
