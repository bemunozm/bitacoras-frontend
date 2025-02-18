import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { useState } from "react"
import LoadingSpinner from "../LoadingSpinner"
import { validarIdentificacion } from "@/helpers"
import { getReplacement, updateReplacement } from "@/api/UserAPI"

type EditReplacementModalProps = {
  id: number;
  setIsOpen: (isOpen: boolean) => void;
}


export function EditReplacementModal({ id, setIsOpen }: EditReplacementModalProps) {
    const { data: replacement, isLoading } = useQuery({
        queryKey: ['replacement', id],
        queryFn: () => getReplacement(id)
    })

    const {register, handleSubmit, formState: {errors}} = useForm()
    const queryClient = useQueryClient()
    const [isSaving, setIsSaving] = useState(false)

    const {mutate} = useMutation({
        mutationFn: updateReplacement,
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
                title: '🎉 Reemplazo actualizado!',
                description: data,
            })
            setIsOpen(false)
            queryClient.invalidateQueries({queryKey: ['replacements']})
        }
    })

    const handleEdit = (formData: any) => {
        setIsSaving(true)
        mutate({id, ...formData})
    }

    if(isLoading) return <LoadingSpinner className="h-10" />

    return (
        <form noValidate onSubmit={handleSubmit(handleEdit)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="run" className="text-right">RUN</Label>
                    <Input
                        id="run"
                        defaultValue={replacement?.run}
                        placeholder="12.345.678-9"
                        className="col-span-3"
                        {...register('run', {
                            required: 'Este campo es requerido',
                            validate: (value) => validarIdentificacion(value) || 'Ingrese un RUN válido'
                        })}
                    />
                    {errors.run && <ErrorMessage className="col-start-2 col-end-4">{errors.run.message?.toString()}</ErrorMessage>}
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nombre</Label>
                    <Input
                        id="name"
                        defaultValue={replacement?.name}
                        placeholder="Juan Pérez"
                        className="col-span-3"
                        {...register('name', { required: 'Este campo es requerido' })}
                    />
                    {errors.name && <ErrorMessage className="col-start-2 col-end-4">{errors.name.message?.toString()}</ErrorMessage>}
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                        id="email"
                        defaultValue={replacement?.email}
                        placeholder="juan.perez@example.com"
                        className="col-span-3"
                        {...register('email', { required: 'Este campo es requerido' })}
                    />
                    {errors.email && <ErrorMessage className="col-start-2 col-end-4">{errors.email.message?.toString()}</ErrorMessage>}
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Teléfono</Label>
                    <Input
                        id="phone"
                        defaultValue={replacement?.phone ?? ''}
                        placeholder="+56912345678"
                        className="col-span-3"
                        {...register('phone')}
                    />
                    {errors.phone && <ErrorMessage className="col-start-2 col-end-4">{errors.phone.message?.toString()}</ErrorMessage>}
                </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>
        </form>
    )
}
