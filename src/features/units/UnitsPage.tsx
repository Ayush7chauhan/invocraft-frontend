import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus, Ruler, Edit2, Trash2, Wand2,
  Scale, Droplets, Hash, Maximize2, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import unitsService from '@/services/units.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import FormField, { Input, Select } from '@/components/common/FormField';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import type { Unit, UnitType } from '@/types';
import type { Control } from 'react-hook-form';

// ── Constants ─────────────────────────────────────────────────────────────────

const UNIT_TYPES = [
  { value: 'mass',   label: 'Mass   — kg, g, Quintal, Mann…' },
  { value: 'volume', label: 'Volume — l, ml, Pav, Adhha…' },
  { value: 'count',  label: 'Count  — pcs, Dozen, Gross…' },
  { value: 'length', label: 'Length — m, cm, Gaj, Hath…' },
  { value: 'other',  label: 'Other' },
];

/** Suggested base unit short_name per type */
const BASE_UNIT_HINT: Record<UnitType, string> = {
  mass:   'kg',
  volume: 'l',
  count:  'pcs',
  length: 'm',
  other:  '',
};

const TYPE_META: Record<UnitType, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  mass:   { label: 'Mass',   bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', icon: <Scale    size={14} /> },
  volume: { label: 'Volume', bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800',     icon: <Droplets size={14} /> },
  count:  { label: 'Count',  bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-600 dark:text-green-400',   border: 'border-green-200 dark:border-green-800',   icon: <Hash     size={14} /> },
  length: { label: 'Length', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', icon: <Maximize2 size={14}/> },
  other:  { label: 'Other',  bg: 'bg-gray-50 dark:bg-gray-800',        text: 'text-gray-500 dark:text-gray-400',     border: 'border-gray-200 dark:border-gray-700',     icon: <Ruler    size={14} /> },
};

const TYPE_ORDER: UnitType[] = ['mass', 'volume', 'count', 'length', 'other'];

// ── Validation schema ─────────────────────────────────────────────────────────

const unitSchema = z.object({
  name: z
    .string()
    .min(1, 'Unit name is required')
    .max(100, 'Max 100 characters'),

  short_name: z
    .string()
    .min(1, 'Short name is required')
    .max(20, 'Max 20 characters')
    .regex(/^\S+$/, 'No spaces allowed in short name'),

  type: z
    .enum(['mass', 'volume', 'count', 'length', 'other'] as const)
    .optional(),

  base_unit: z
    .string()
    .max(20, 'Max 20 characters')
    .regex(/^\S*$/, 'No spaces allowed')
    .optional()
    .or(z.literal('')),

  conversion_factor: z
    .number()
    .positive('Must be greater than 0')
    .optional(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByType(units: Unit[]) {
  const grouped: Partial<Record<UnitType, Unit[]>> = {};
  for (const unit of units) {
    const key: UnitType = (unit.type as UnitType) ?? 'other';
    (grouped[key] ??= []).push(unit);
  }
  return grouped;
}

/** Format conversion_factor nicely (removes trailing zeros) */
function fmtFactor(n: number): string {
  if (n >= 1) return n % 1 === 0 ? String(n) : n.toFixed(4).replace(/\.?0+$/, '');
  return n.toFixed(6).replace(/\.?0+$/, '');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function UnitsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await unitsService.list();
      return res.data.data as Unit[];
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: '', short_name: '', type: undefined, base_unit: '', conversion_factor: undefined },
  });

  // Watch type so we can auto-suggest base_unit
  const watchedType = useWatch({ control, name: 'type' });

  const createMutation = useMutation({
    mutationFn: unitsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['units'] }); toast.success('Unit added'); closeForm(); },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UnitFormValues> }) => unitsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['units'] }); toast.success('Unit updated'); closeForm(); },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: unitsService.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['units'] }); toast.success('Unit deleted'); },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const seedMutation = useMutation({
    mutationFn: unitsService.seedDefaults,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['units'] });
      const n = res.data.data.created.length;
      toast.success(n > 0 ? `${n} Indian units added!` : 'All defaults already added');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSubmit = (values: UnitFormValues) => {
    const payload = {
      ...values,
      base_unit: values.base_unit || undefined,
      conversion_factor: values.conversion_factor || undefined,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  const openEdit = (unit: Unit) => {
    setEditing(unit);
    reset({
      name: unit.name,
      short_name: unit.short_name,
      type: unit.type,
      base_unit: unit.base_unit ?? '',
      conversion_factor: unit.conversion_factor ?? undefined,
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };

  const handleDelete = async (unit: Unit) => {
    if (await confirmDelete(unit.name)) deleteMutation.mutate(unit.id);
  };

  // When type changes, auto-fill base_unit hint if field is empty
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const t = e.target.value as UnitType;
    const hint = BASE_UNIT_HINT[t];
    if (hint) setValue('base_unit', hint);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const grouped = groupByType(units);

  return (
    <div className="pb-24">
      <PageHeader
        title="Units"
        subtitle={`${units.length} units`}
        backPath={ROUTES.PRODUCTS}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              title="Load all Indian standard units"
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 active:scale-95 transition-colors disabled:opacity-60"
            >
              {seedMutation.isPending ? <ButtonSpinner /> : <Wand2 size={15} />}
              Defaults
            </button>
            <button
              onClick={() => { setEditing(null); reset(); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 active:scale-95 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        }
      />

      {/* ── Add / Edit Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-4 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {editing ? `Edit — ${editing.name}` : 'Add Unit'}
              </h3>
              <button onClick={closeForm} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

              {/* Row 1: Name + Short Name */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Unit Name" required error={errors.name?.message}>
                  <Input
                    {...register('name')}
                    placeholder="e.g. Kilogram"
                    error={Boolean(errors.name)}
                    autoComplete="off"
                  />
                </FormField>

                <FormField label="Short Name" required error={errors.short_name?.message}>
                  <Input
                    {...register('short_name')}
                    placeholder="e.g. kg"
                    error={Boolean(errors.short_name)}
                    autoComplete="off"
                    maxLength={20}
                  />
                </FormField>
              </div>

              {/* Row 2: Type */}
              <FormField label="Unit Type" error={errors.type?.message}>
                <Select
                  {...register('type', { onChange: handleTypeChange })}
                  options={UNIT_TYPES}
                  placeholder="Select type…"
                  error={Boolean(errors.type)}
                />
              </FormField>

              {/* Row 3: Conversion */}
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3 space-y-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Conversion (optional)
                </p>

                {/* Live preview */}
                <ConversionPreview control={control} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Conversion Factor" error={errors.conversion_factor?.message}>
                    <Input
                      {...register('conversion_factor', { valueAsNumber: true })}
                      type="number"
                      step="any"
                      min="0.000001"
                      placeholder="e.g. 0.001"
                      error={Boolean(errors.conversion_factor)}
                    />
                  </FormField>

                  <FormField label="Base Unit" error={errors.base_unit?.message}>
                    <Input
                      {...register('base_unit')}
                      placeholder={watchedType ? BASE_UNIT_HINT[watchedType as UnitType] || 'e.g. kg' : 'e.g. kg'}
                      error={Boolean(errors.base_unit)}
                      autoComplete="off"
                      maxLength={20}
                    />
                  </FormField>
                </div>

                <p className="text-xs text-gray-400">
                  Formula: <span className="font-mono">1 [unit] = [factor] [base]</span>
                  &nbsp;·&nbsp;e.g. 1 g = 0.001 kg &nbsp;|&nbsp; 1 Dozen = 12 pcs &nbsp;|&nbsp; 1 Quintal = 100 kg
                </p>
              </div>

              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isMutating && <ButtonSpinner />}
                {editing ? 'Update Unit' : 'Add Unit'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── List ── */}
      {isLoading ? (
        <PageLoader />
      ) : units.length === 0 ? (
        <EmptyState
          icon={<Scale size={32} />}
          title="No units yet"
          description='Tap "Defaults" to load all Indian standard units instantly.'
          action={
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl flex items-center gap-2"
              >
                {seedMutation.isPending ? <ButtonSpinner /> : <Wand2 size={15} />}
                Load Indian Defaults
              </button>
              <button
                onClick={() => { setEditing(null); reset(); setShowForm(true); }}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl flex items-center gap-2"
              >
                <Plus size={15} />
                Add Custom
              </button>
            </div>
          }
        />
      ) : (
        <div className="px-4 pt-4 space-y-6">
          {TYPE_ORDER.filter((t) => grouped[t]?.length).map((type) => {
            const meta = TYPE_META[type];
            return (
              <div key={type}>
                {/* Type header badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                  <span className="text-xs text-gray-400">({grouped[type]!.length})</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {grouped[type]!.map((unit) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      meta={meta}
                      onEdit={() => openEdit(unit)}
                      onDelete={() => handleDelete(unit)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Units with no type at all */}
          {units.filter((u) => !u.type).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-gray-400 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                  Uncategorised
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {units.filter((u) => !u.type).map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    meta={TYPE_META.other}
                    onEdit={() => openEdit(unit)}
                    onDelete={() => handleDelete(unit)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Live Conversion Preview ───────────────────────────────────────────────────

function ConversionPreview({ control }: { control: Control<UnitFormValues> }) {
  const shortName  = useWatch({ control, name: 'short_name' });
  const baseUnit   = useWatch({ control, name: 'base_unit' });
  const factor     = useWatch({ control, name: 'conversion_factor' });

  if (!shortName || !baseUnit || !factor || factor <= 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        Fill short name, factor &amp; base unit to see preview
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
      <span className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg font-mono text-xs">
        1 {shortName}
      </span>
      <ArrowRight size={14} className="text-gray-400 shrink-0" />
      <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg font-mono text-xs text-green-700 dark:text-green-300">
        {fmtFactor(factor)} {baseUnit}
      </span>
    </div>
  );
}

// ── Unit Card ─────────────────────────────────────────────────────────────────

function UnitCard({
  unit, meta, onEdit, onDelete,
}: {
  unit: Unit;
  meta: (typeof TYPE_META)[UnitType];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasConversion = unit.conversion_factor != null && unit.base_unit;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
      {/* Top row: icon + name + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.text}`}>
            {meta.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
              {unit.name}
            </p>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{unit.short_name}</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit}   className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <Edit2  size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Conversion formula */}
      {hasConversion && (
        <div className={`flex items-center gap-1 text-xs rounded-lg px-2 py-1 ${meta.bg} ${meta.text} font-mono`}>
          <span>1 {unit.short_name}</span>
          <ArrowRight size={10} className="shrink-0" />
          <span className="font-semibold">
            {fmtFactor(unit.conversion_factor!)} {unit.base_unit}
          </span>
        </div>
      )}
    </div>
  );
}
