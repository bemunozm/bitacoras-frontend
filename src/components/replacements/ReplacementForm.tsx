import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { useState } from "react"
import { validarIdentificacion } from "@/helpers"
import { createReplacement } from "@/api/UserAPI"

type ReplacementFormProps = {
  setIsOpen: (isOpen: boolean) => void
}

export function ReplacementForm({setIsOpen}: ReplacementFormProps) {
    const initialValues = {
        name: '',
        run: '',
        email: '',
        phone: ''
    }

    const {register, handleSubmit, reset, formState: {errors}} = useForm({defaultValues: initialValues})

    const queryClient = useQueryClient()

    const [isSaving, setIsSaving] = useState(false);

    const {mutate} = useMutation({
        mutationFn: createReplacement,
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
            title: '🎉 Reemplazo creado!',
            description: data,
          })
          setIsOpen(false)
          reset()
          queryClient.invalidateQueries({queryKey: ['replacements']})
        }
    })
    
    const handleCreate = (formData: any) => {
        setIsSaving(true);
        mutate(formData)
    }

    return (
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="run" className="text-right dark:text-sidebar-foreground">
                        RUN
                    </Label>
                    <Input
                        id="run"
                        placeholder="12.345.678-9" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('run', {
                            required: 'Este campo es requerido',
                            validate: (value) => {
                                if (value) {
                                    return validarIdentificacion(value) || 'Ingrese un RUN válido';
                                }
                            }
                        })}	
                    />
                    {errors.run && <ErrorMessage className="col-start-2 col-end-4">{errors.run.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
                        Nombre
                    </Label>
                    <Input
                        id="name"
                        placeholder="Juan Perez" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('name', {required: 'Este campo es requerido'})}
                    />
                    {errors.name && <ErrorMessage className="col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right dark:text-sidebar-foreground">
                        Correo
                    </Label>
                    <Input
                        id="email"
                        placeholder="juan.perez@example.com" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('email', {required: 'Este campo es requerido'})}
                    />
                    {errors.email && <ErrorMessage className="col-start-2 col-end-4">{errors.email.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right dark:text-sidebar-foreground">
                        Teléfono
                    </Label>
                    <Input
                        id="phone"
                        placeholder="+56912345678" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('phone')}
                    />
                    {errors.phone && <ErrorMessage className="col-start-2 col-end-4">{errors.phone.message}</ErrorMessage>}
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    )
}
