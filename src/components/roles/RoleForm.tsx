import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createRole } from "@/api/RoleAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import type { RoleForm } from "@/types"
import ErrorMessage from "@/components/ErrorMessage"

type RoleFormProps = {
  setIsOpen: (isOpen: boolean) => void
}

export function RoleForm({setIsOpen}: RoleFormProps) {

    const initialValues = {
        name: '',
        description: '',
    }

    const {register, handleSubmit, reset, formState: {errors}} = useForm({defaultValues: initialValues})

    const queryClient = useQueryClient()

    const {mutate} = useMutation({
        mutationFn: createRole,
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
          toast({
            title: '🎉Rol creado!',
            description: data,
          })
          setIsOpen(false)
            reset()
            queryClient.invalidateQueries({queryKey: ['roles']})
        }
    })
    
    const handleCreate = (formData: RoleForm) => {
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
                        placeholder="Personal Aseo" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('name', {required: 'Este campo es requerido'})}
                    />
                    {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
                    Descripción
                    </Label>
                    <Textarea
                        id="description" 
                        placeholder="Tiene acceso a todas las funcionalidades de aseo y bitacora." 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('description')} 
                    />
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit">Guardar cambios</Button>
            </div>
        </form>
  )
}
