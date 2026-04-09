import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Tag, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import categoriesService from '@/services/categories.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import FormField, { Input, Textarea } from '@/components/common/FormField';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(searchParams.get('openForm') === 'true');
  const [editing, setEditing] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', search],
    queryFn: async () => {
      const res = await categoriesService.list({ search });
      return res.data.data as Category[];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });

  const createMutation = useMutation({
    mutationFn: categoriesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added');
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormValues> }) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setEditing(null);
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const onSubmit = (values: CategoryFormValues) => {
    if (editing) updateMutation.mutate({ id: editing.id, data: values });
    else createMutation.mutate(values);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    reset({ name: cat.name, description: cat.description ?? '' });
    setShowForm(true);
  };

  const handleDelete = async (cat: Category) => {
    const ok = await confirmDelete(cat.name);
    if (ok) deleteMutation.mutate(cat.id);
  };

  const handleCloseForm = () => { setShowForm(false); setEditing(null); reset(); };
  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="pb-24">
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
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

      <div className="px-4 pt-2 pb-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search categories..." />
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {editing ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={handleCloseForm} className="text-xs text-gray-500">Cancel</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <FormField label="Category Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Electronics" error={Boolean(errors.name)} />
              </FormField>
              <FormField label="Description" error={errors.description?.message}>
                <Textarea {...register('description')} placeholder="Optional description..." rows={2} />
              </FormField>
              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isMutating && <ButtonSpinner />}
                {editing ? 'Update' : 'Add Category'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <PageLoader />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<Tag size={32} />}
          title="No categories yet"
          description="Create categories to organize your products."
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl">
              Add Category
            </button>
          }
        />
      ) : (
        <div className="px-4 space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Tag size={16} className="text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cat.description}</p>
                  )}
                  {cat.products_count !== undefined && (
                    <p className="text-xs text-gray-400">{cat.products_count} products</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(cat)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
