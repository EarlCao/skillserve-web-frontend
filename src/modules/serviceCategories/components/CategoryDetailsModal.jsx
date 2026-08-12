import { useState } from 'react'
import { format } from 'date-fns'
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Skeleton from '../../../components/ui/Skeleton'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import { useDisclosure } from '../../../hooks/useDisclosure'
import CategoryStatusBadge from './CategoryStatusBadge'
import SubcategoryFormModal from './SubcategoryFormModal'
import { useServiceCategory, useDeleteSubcategory } from '../hooks/useServiceCategories'

/**
 * Category details — category information plus the nested subcategory
 * management (view / add / edit / delete). Subcategories are always created
 * and edited under this category.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {number|null} props.categoryId
 */
export default function CategoryDetailsModal({ open, onClose, categoryId }) {
  const [subcategoryFormOpen, setSubcategoryFormOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const deleteDisclosure = useDisclosure()

  const { data, isLoading, isError, error, refetch } = useServiceCategory(categoryId)
  const deleteMutation = useDeleteSubcategory()

  const category = data?.data

  const confirmDelete = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(
      { categoryId, subcategoryId: deleteTarget.id },
      { onSettled: () => deleteDisclosure.close() },
    )
  }

  const subcategories = category?.subcategories ?? []

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={category?.name ?? 'Category details'}
        description="Category information and its subcategories."
        footer={
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="mt-2 h-24 w-full" />
          </div>
        ) : isError ? (
          <ErrorState title="Could not load category" message={error?.message} onRetry={refetch} />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Category information */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryStatusBadge status={category?.status} />
                <Badge variant="outline">{subcategories.length} subcategor{subcategories.length === 1 ? 'y' : 'ies'}</Badge>
              </div>
              {category?.description && <p className="text-sm text-base-content/70">{category.description}</p>}
              <p className="text-xs text-base-content/50">
                Created {category?.created_at ? format(new Date(category.created_at), 'MMM d, yyyy HH:mm') : '—'}
                {category?.created_by?.name ? ` by ${category.created_by.name}` : ''}
              </p>
            </div>

            {/* Subcategories */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Layers className="size-4 text-base-content/60" />
                  Subcategories
                </h4>
                <Button size="sm" onClick={() => setSubcategoryFormOpen(true)}>
                  <Plus className="size-4" />
                  Add subcategory
                </Button>
              </div>

              {subcategories.length === 0 ? (
                <EmptyState
                  title="No subcategories yet"
                  description="Add a subcategory to organize the services under this category."
                  className="py-10"
                />
              ) : (
                <ul className="divide-y divide-base-200 rounded-box border border-base-200">
                  {subcategories.map((subcategory) => (
                    <li key={subcategory.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium">{subcategory.name}</span>
                          <CategoryStatusBadge status={subcategory.status} />
                        </div>
                        {subcategory.description && (
                          <p className="mt-0.5 truncate text-xs text-base-content/60">{subcategory.description}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSubcategory(subcategory)
                            setSubcategoryFormOpen(true)
                          }}
                          aria-label={`Edit ${subcategory.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget(subcategory)
                            deleteDisclosure.open()
                          }}
                          aria-label={`Delete ${subcategory.name}`}
                        >
                          <Trash2 className="size-4 text-error" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      <SubcategoryFormModal
        open={subcategoryFormOpen}
        onClose={() => {
          setSubcategoryFormOpen(false)
          setEditingSubcategory(null)
        }}
        categoryId={categoryId}
        subcategory={editingSubcategory}
      />

      <ConfirmDialog
        open={deleteDisclosure.isOpen}
        onCancel={deleteDisclosure.close}
        onConfirm={confirmDelete}
        loading={deleteMutation.isPending}
        title="Delete subcategory?"
        description={
          deleteTarget
            ? `This will delete "${deleteTarget.name}" from ${category?.name ?? 'this category'}. The action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="error"
      />
    </>
  )
}
