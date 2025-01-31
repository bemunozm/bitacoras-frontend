import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { updateProvision, getProvision } from "@/api/ProvisionAPI"
import { getProvisionCategories } from "@/api/ProvisionCategoryAPI"
import { useEffect } from "react"
import LoadingSpinner from "../LoadingSpinner"

type EditProvisionFormProps = {
  id: number
  setIsOpen: (isOpen: boolean) => void
}

export function EditProvisionModal({ id, setIsOpen }: EditProvisionFormProps) {
  const { data: provision, isLoading: isLoadingProvision } = useQuery({
    queryKey: ['provision', id],
    queryFn: () => getProvision(id),
    enabled: !!id
  })

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['provisionCategories'],
    queryFn: getProvisionCategories,
  })

  const initialValues = {
    name: '',
    description: '',
    provision_category_id: 0
  }

  const { register, handleSubmit, reset, setValue, formState: { errors }, watch } = useForm({ defaultValues: initialValues })

  useEffect(() => {
    if (provision) {
      setValue('name', provision.name)
      setValue('description', provision.description || '')
      setValue('provision_category_id', provision.provision_category_id || 0)
    }
  }, [provision, setValue])

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: updateProvision,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Prestación actualizada!',
        description: data,
      })
      setIsOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['provisions'] })
    }
  })

  const handleUpdate = (formData: any) => {
    mutate({ ...formData, id: id })
  }

  if (isLoadingProvision || isLoadingCategories) return <LoadingSpinner className="h-10" />

  return (
    <form noValidate onSubmit={handleSubmit(handleUpdate)} className="space-y-6 px-4">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
            Nombre
          </Label>
          <Input
            id="name"
            placeholder="Nombre de la prestación"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('name', { required: 'Este campo es requerido' })}
          />
          {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
            Descripción
          </Label>
          <Input
            id="description"
            placeholder="Descripción de la prestación"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('description')}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category_id" className="text-right dark:text-sidebar-foreground">
            Categoría
          </Label>
          <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
            {isLoadingCategories ? (
              <p>Cargando Categorías</p>
            ) : (
              <Select
                {...register('provision_category_id', { required: 'Este campo es requerido' })}
                onValueChange={(value) => setValue('provision_category_id', parseInt(value))}
                value={provision?.category?.name}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una categoría">
                    {categories?.find(category => category.id === watch('provision_category_id'))?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories!.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {errors.provision_category_id && <ErrorMessage className="col-start-2 col-end-4">{errors.provision_category_id.message}</ErrorMessage>}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}
