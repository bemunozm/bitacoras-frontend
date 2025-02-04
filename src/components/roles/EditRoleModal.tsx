import { Button } from "@/components/ui/button"
import { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getRole, updateRole } from "@/api/RoleAPI"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import type { Role, RoleForm } from "@/types"
import ErrorMessage from "@/components/ErrorMessage"
import LoadingSpinner from "../LoadingSpinner"
import { useEffect } from "react"

type EditRoleProps = {
    id: Role['id']
    setIsOpen: (isOpen: boolean) => void
}

export function EditRoleModal({id, setIsOpen}: EditRoleProps) {

    const {data: role, isLoading} = useQuery({
        queryKey: ['role', id],
        queryFn: () => getRole(id),
        enabled: !!id
    })

    const initialValues = {
        name: role?.name || '',
        description: role?.description || '',
    }

    const {register, handleSubmit, reset, formState: {errors}, setValue} = useForm({defaultValues: initialValues})

    useEffect(() => {
        setValue('name', role?.name || '')
        setValue('description', role?.description || '')
    }, [role, setValue])

    const queryClient = useQueryClient()
    
    const [isSaving, setIsSaving] = useState(false);

    const {mutate} = useMutation({
        mutationFn: (data: RoleForm) => updateRole({id: role!.id, ...data}),
        onError: (error) => {
            setIsSaving(false);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            setIsSaving(false);
            toast({
                title: '🎉Rol creado!',
                description: data,
            })
            reset()
            setIsOpen(false)
            queryClient.invalidateQueries({queryKey: ['roles']})
        }
    })
    
    const handleEdit = (formData: RoleForm) => {
        setIsSaving(true);
        mutate(formData)
    }

    if(isLoading) return <LoadingSpinner className="h-10"/>

  return (
        <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleEdit)}>
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
                        className="col-span-3 dark:text-sidebar-foreground h-32"
                        {...register('description')} 
                    />
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>
        </form>
  )
}
