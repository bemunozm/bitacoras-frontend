import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { createProvisionCategory } from "@/api/ProvisionCategoryAPI"

type ProvisionCategoryFormProps = {
  setIsOpen: (isOpen: boolean) => void
}

export default function ProvisionCategoryForm({ setIsOpen }: ProvisionCategoryFormProps) {

  const initialValues = {
    name: ''
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues })

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: createProvisionCategory,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Categoría creada!',
        description: data,
      })
      setIsOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['provisionCategories'] })
    }
  })

  const handleCreate = (formData: any) => {
    mutate(formData)
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
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
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}
