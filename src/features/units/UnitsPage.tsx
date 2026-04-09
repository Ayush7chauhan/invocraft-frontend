import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Ruler, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import unitsService from '@/services/units.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import FormField, { Input } from '@/components/common/FormField';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import type { Unit } from '@/types';

const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  short_name: z.string().min(1, 'Short name is required').max(6, 'Max 6 characters'),
});

type UnitFormValues = z.infer<typeof unitSchema>;

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
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormValues>({ resolver: zodResolver(unitSchema) });

  const createMutation = useMutation({
    mutationFn: unitsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit added');
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UnitFormValues> }) =>
      unitsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit updated');
      setEditing(null);
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: unitsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] });
      toast.success('Unit deleted');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSubmit = (values: UnitFormValues) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: values });
    else createMutation.mutate(values);
  };

  const handleEdit = (unit: Unit) => {
    setEditing(unit);
    reset({ name: unit.name, short_name: unit.short_name });
    setShowForm(true);
  };

  const handleDelete = async (unit: Unit) => {
    const ok = await confirmDelete(unit.name);
    if (ok) deleteMutation.mutate(unit.id);
  };

  const handleCloseForm = () => { setShowForm(false); setEditing(null); reset(); };
  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="pb-24">
      <PageHeader
        title="Units"
        subtitle={`${units.length} units`}
        backPath={ROUTES.PRODUCTS}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 active:scale-95 transition-colors"
          >
            <Plus size={16} />
            Add
          </button>
        }
      />

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mt-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {editing ? 'Edit Unit' : 'Add Unit'}
              </h3>
              <button onClick={handleCloseForm} className="text-xs text-gray-500">Cancel</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Unit Name" required error={errors.name?.message} className="col-span-1">
                  <Input {...register('name')} placeholder="e.g. Kilogram" error={Boolean(errors.name)} />
                </FormField>
                <FormField label="Short Name" required error={errors.short_name?.message}>
                  <Input {...register('short_name')} placeholder="e.g. kg" error={Boolean(errors.short_name)} />
                </FormField>
              </div>
              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isMutating && <ButtonSpinner />}
                {editing ? 'Update' : 'Add Unit'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <PageLoader />
      ) : units.length === 0 ? (
        <EmptyState
          icon={<Ruler size={32} />}
          title="No units yet"
          description="Add measurement units for your products."
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl">
              Add Unit
            </button>
          }
        />
      ) : (
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2">
                    <Ruler size={16} className="text-indigo-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{unit.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{unit.short_name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleEdit(unit)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(unit)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
