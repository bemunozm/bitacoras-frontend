import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { updateProvisionCategory, getProvisionCategory } from "@/api/ProvisionCategoryAPI"
import { useEffect, useState } from "react"
import LoadingSpinner from "../LoadingSpinner"

type EditProvisionCategoryModalProps = {
  id: number
  setIsOpen: (isOpen: boolean) => void
}

export default function EditProvisionCategoryModal({ id, setIsOpen }: EditProvisionCategoryModalProps) {
  const { data: category, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['provisionCategory', id],
    queryFn: () => getProvisionCategory(id),
    enabled: !!id
  })

  const initialValues = {
    name: ''
  }

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: initialValues })

  useEffect(() => {
    if (category) {
      setValue('name', category.name)
    }
  }, [category, setValue])

  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const { mutate } = useMutation({
    mutationFn: updateProvisionCategory,
    onError: (error) => {
      setIsSaving(false)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    },
    onSuccess: (data) => {
      setIsSaving(false)
      toast({
        title: '🎉Categoría actualizada!',
        description: data,
      })
      setIsOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['provisionCategories'] })
    }
  })

  const handleUpdate = (formData: any) => {
    setIsSaving(true)
    mutate({ ...formData, id: id })
  }

  if (isLoadingCategory) return <LoadingSpinner className="h-10" />

  return (
    <form noValidate onSubmit={handleSubmit(handleUpdate)} className="space-y-6 px-4">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
            Nombre
          </Label>
          <Input
            id="name"
            placeholder="Nombre de la categoría"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('name', { required: 'Este campo es requerido' })}
          />
          {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
