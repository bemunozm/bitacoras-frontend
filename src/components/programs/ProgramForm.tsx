import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProgram } from "@/api/ProgramAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { ProgramForm } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import { getCoordinators } from "@/api/UserAPI";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // Assuming you have a Select component
import { states } from "@/data/states";
import { useState } from "react";
import LoadingSpinner from "../LoadingSpinner";

type ProgramFormProps = {
    setIsOpen: (isOpen: boolean) => void;
};

/**
 * Formulario para crear un nuevo programa
 * Incluye campos para información básica y selección de coordinador
 */
export function ProgramForm({ setIsOpen }: ProgramFormProps) {
    // Estado para control de guardado
    const [isSaving, setIsSaving] = useState(false);

    // Valores iniciales del formulario
    const initialValues = {
        name: '',
        company: '',
        address: '',
        state: '',
        coordinator_id: 0,
        residences: [],
    };

    // Configuración del formulario y consultas
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ defaultValues: initialValues });

    const queryClient = useQueryClient();

    // Consulta de coordinadores disponibles
    const {data: coordinators, isLoading: isLoadingCoordinators} = useQuery({
        queryKey: ['coordinators'],
        queryFn: getCoordinators
    });

    // Mutación para crear programa
    const { mutate } = useMutation({
        mutationFn: createProgram,
        onError: (error) => {
            setIsSaving(false);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        },
        onSuccess: (data) => {
            setIsSaving(false);
            toast({
                title: '🎉Programa creado!',
                description: data,
            });
            setIsOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        }
    });

    const handleCreate = (formData: ProgramForm) => {
        setIsSaving(true);
        console.log('creando')
        mutate(formData);
    };

    if (isLoadingCoordinators) return <LoadingSpinner className="h-10"/>

    return (
        // Formulario con campos para nombre, compañía, dirección,
        // región (select) y coordinador (select)
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
                        Nombre
                    </Label>
                    <Input
                        id="name"
                        placeholder="Porroga Residencia Familiar 2024"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('name', { required: 'Este campo es requerido' })}
                    />
                    {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right dark:text-sidebar-foreground">
                        Mandante
                    </Label>
                    <Input
                        id="company"
                        placeholder="Ministerio de Desarrollo Social y Familia"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('company')}
                    />
                    {errors.company && <ErrorMessage className=" col-start-2 col-end-4">{errors.company.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right dark:text-sidebar-foreground">
                        Dirección
                    </Label>
                    <Input
                        id="address"
                        placeholder="Pedro Lagos 1027"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('address')}
                    />
                    {errors.address && <ErrorMessage className=" col-start-2 col-end-4">{errors.address.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="state" className="text-right dark:text-sidebar-foreground">
                        Región
                    </Label>
                    <Select
                        {...register('state', { required: 'Este campo es requerido' })}
                        onValueChange={(value) => setValue('state',value)} // Opcional: maneja el cambio de valor
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione una región" />
                        </SelectTrigger>
                        <SelectContent>
                            {states.map((state) => (
                                <SelectItem key={state.region} value={state.region}>{state.region}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.state && <ErrorMessage className=" col-start-2 col-end-4">{errors.state.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="coordinator" className="text-right dark:text-sidebar-foreground">
                        Coordinador
                    </Label>
                    <Select
                        {...register('coordinator_id', { required: 'Este campo es requerido' })}
                        onValueChange={(value) => setValue('coordinator_id', parseInt(value))} // Opcional: maneja el cambio de valor
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un coordinador">
                                {coordinators?.find(coordinator => coordinator.id === watch('coordinator_id'))?.name}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {coordinators?.map((coordinator: any) => (
                                <SelectItem key={coordinator.id} value={coordinator.id}>{coordinator.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.coordinator_id && <ErrorMessage className=" col-start-2 col-end-4">{errors.coordinator_id.message}</ErrorMessage>}
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
