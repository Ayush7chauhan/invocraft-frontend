import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Package, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import productsService from '@/services/products.service';
import categoriesService from '@/services/categories.service';
import unitsService from '@/services/units.service';
import { confirmDelete } from '@/components/common/ConfirmDialog';
import SearchInput from '@/components/common/SearchInput';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { PageLoader, ButtonSpinner } from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import FormField, { Input, Select } from '@/components/common/FormField';
import { parseApiError } from '@/lib/api';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

// ── Schema — must match backend StoreProductRequest ───────────────────────────
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category_id: z.number().optional(),
  unit_id: z.number().optional(),
  purchase_price: z.number().min(0, 'Purchase price required'),  // required by backend
  selling_price: z.number().min(0, 'Selling price required'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  low_stock_threshold: z.number().int().min(0).optional(),       // backend: low_stock_threshold
  tax_rate: z.number().min(0).max(100).optional(),
  status: z.enum(['active', 'inactive'] as const).optional(),    // backend: status not is_active
});

type ProductFormValues = z.infer<typeof productSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(searchParams.get('lowStock') === 'true');
  const [showForm, setShowForm] = useState(searchParams.get('openForm') === 'true');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────────

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', search, showLowStock],
    queryFn: async () => {
      const res = await productsService.list({ search, low_stock: showLowStock || undefined });
      return res.data.data as Product[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesService.list();
      return res.data.data;
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await unitsService.list();
      return res.data.data;
    },
  });

  // ── Form ──────────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { status: 'active', stock_quantity: 0, purchase_price: 0 },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product added successfully');
      reset({ status: 'active', stock_quantity: 0, purchase_price: 0 });
      setShowForm(false);
    },
    onError: (err) => {
      const apiErr = parseApiError(err);
      toast.error(apiErr.message);
      if (apiErr.errors) {
        Object.entries(apiErr.errors).forEach(([field, msgs]) => {
          setError(field as keyof ProductFormValues, { message: msgs[0] });
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormValues> }) =>
      productsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
      setEditingProduct(null);
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product deleted');
    },
    onError: (err) => toast.error(parseApiError(err).message),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const onSubmit = (values: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku ?? '',
      barcode: product.barcode ?? '',
      category_id: product.category_id,
      unit_id: product.unit_id,
      purchase_price: Number(product.purchase_price ?? 0),
      selling_price: Number(product.selling_price),
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      tax_rate: Number(product.tax_rate ?? 0),
      status: product.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    const ok = await confirmDelete(product.name);
    if (ok) deleteMutation.mutate(product.id);
  };

  const handleCloseForm = () => { setShowForm(false); setEditingProduct(null); reset(); };
  const isMutating = createMutation.isPending || updateMutation.isPending;

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const unitOptions = units.map((u) => ({ value: u.id, label: `${u.name} (${u.short_name})` }));

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="pb-24">
      <PageHeader
        title="Products"
        subtitle={`${products.length} items`}
        backPath={ROUTES.DASHBOARD}
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

      <div className="px-4 pt-2 pb-3 space-y-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products..." />
        <div className="flex gap-2">
          <FilterChip active={!showLowStock} onClick={() => setShowLowStock(false)} label="All" />
          <FilterChip
            active={showLowStock}
            onClick={() => setShowLowStock(true)}
            label="Low Stock"
            icon={<AlertTriangle size={12} />}
          />
        </div>
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
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={handleCloseForm} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <FormField label="Product Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="Product name" error={Boolean(errors.name)} />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Category" error={errors.category_id?.message}>
                  <Select
                    {...register('category_id', { valueAsNumber: true })}
                    options={categoryOptions}
                    placeholder="Select..."
                  />
                </FormField>

                <FormField label="Unit" error={errors.unit_id?.message}>
                  <Select
                    {...register('unit_id', { valueAsNumber: true })}
                    options={unitOptions}
                    placeholder="Select..."
                  />
                </FormField>

                <FormField label="Purchase Price (₹)" required error={errors.purchase_price?.message}>
                  <Input
                    {...register('purchase_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={Boolean(errors.purchase_price)}
                  />
                </FormField>

                <FormField label="Selling Price (₹)" required error={errors.selling_price?.message}>
                  <Input
                    {...register('selling_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={Boolean(errors.selling_price)}
                  />
                </FormField>

                <FormField label="Stock Qty" required error={errors.stock_quantity?.message}>
                  <Input
                    {...register('stock_quantity', { valueAsNumber: true })}
                    type="number"
                    step="1"
                    placeholder="0"
                    error={Boolean(errors.stock_quantity)}
                  />
                </FormField>

                <FormField label="Low Stock Alert" error={errors.low_stock_threshold?.message}>
                  <Input
                    {...register('low_stock_threshold', { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 10"
                  />
                </FormField>

                <FormField label="SKU" error={errors.sku?.message}>
                  <Input {...register('sku')} placeholder="SKU code" />
                </FormField>

                <FormField label="Tax Rate (%)" error={errors.tax_rate?.message}>
                  <Input
                    {...register('tax_rate', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    placeholder="0"
                  />
                </FormField>
              </div>

              <button
                type="submit"
                disabled={isMutating}
                className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isMutating && <ButtonSpinner />}
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package size={32} />}
          title="No products found"
          description="Add your first product to manage inventory."
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl">
              Add Product
            </button>
          }
        />
      ) : (
        <div className="px-4 space-y-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDelete(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterChip({ active, onClick, label, icon }: {
  active: boolean; onClick: () => void; label: string; icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      }`}
    >
      {icon}{label}
    </button>
  );
}

function ProductCard({ product, onEdit, onDelete }: {
  product: Product; onEdit: () => void; onDelete: () => void;
}) {
  const isLowStock =
    product.low_stock_threshold !== undefined &&
    product.stock_quantity <= product.low_stock_threshold;

  // Backend returns productCategory via product_category key (snake_case of relation)
  const categoryName = product.product_category?.name;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Package size={18} className="text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {categoryName && <span className="text-xs text-gray-400">{categoryName}</span>}
              {product.sku && <span className="text-xs text-gray-400 font-mono">#{product.sku}</span>}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatCurrency(product.selling_price)}
              </span>
              <span className={`text-xs font-medium ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                Stock: {product.stock_quantity}
                {product.unit && ` ${product.unit.short_name}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {product.status === 'inactive' && <Badge variant="outline">Inactive</Badge>}
          {isLowStock && <Badge variant="danger">Low Stock</Badge>}
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" aria-label="Edit">
              <Edit2 size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" aria-label="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
