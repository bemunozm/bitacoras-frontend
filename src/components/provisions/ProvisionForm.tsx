import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import type { ProvisionForm } from "@/types"
import ErrorMessage from "@/components/ErrorMessage"
import { createProvision } from "@/api/ProvisionAPI"
import { getProvisionCategories } from "@/api/ProvisionCategoryAPI"
import LoadingSpinner from "../LoadingSpinner"
import { useState } from 'react'

type ProvisionFormProps = {
  setIsOpen: (isOpen: boolean) => void
}

export function ProvisionForm({setIsOpen}: ProvisionFormProps) {

    const initialValues = {
        name: '',
        description: '',
        provision_category_id: 0
    }

    const {register, handleSubmit, reset, formState: {errors}, setValue, watch} = useForm({defaultValues: initialValues})

    const queryClient = useQueryClient()

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['provisionCategories'],
        queryFn: getProvisionCategories,
    })

    const {mutate} = useMutation({
        mutationFn: createProvision,
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
            title: '🎉Prestación creada!',
            description: data,
          })
          setIsOpen(false)
            reset()
            queryClient.invalidateQueries({queryKey: ['provisions']})
        }
    })
    
    const handleCreate = (formData: any) => {
        setIsSaving(true);
        mutate(formData)
    }

    const [isSaving, setIsSaving] = useState(false);

    if (isLoadingCategories) return <LoadingSpinner className="h-10"/>

  return (
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
                    Nombre
                    </Label>
                    <Input
                        id="name"
                        placeholder="Nombre de la prestación" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('name', {required: 'Este campo es requerido'})}
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
                    <Label htmlFor="provison_category_i" className="text-right dark:text-sidebar-foreground">
                    Categoría
                    </Label>
                    <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
                        <Select
                            {...register('provision_category_id', { required: 'Este campo es requerido' })}
                            onValueChange={(value) => setValue('provision_category_id', parseInt(value))}
                        >
                            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                                <SelectValue placeholder="Selecciona una categoría">
                                    {categories?.find(category => category.id === watch('provision_category_id'))?.name || 'Selecciona una categoría'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {errors.provision_category_id && <ErrorMessage className="col-start-2 col-end-4">{errors.provision_category_id.message}</ErrorMessage>}
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
