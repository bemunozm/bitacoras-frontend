import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBitacora } from "@/api/BitacoraAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { BitacoraForm, Program, User } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import { getPrograms } from "@/api/ProgramAPI";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LoadingSpinner from "../LoadingSpinner";
import { useState } from "react";

/**
 * Props para el formulario de creación de bitácoras
 * @param setIsOpen Función para controlar la visibilidad del formulario
 * @param user Usuario actual con sus roles y permisos
 */
type BitacoraFormProps = {
    setIsOpen: (isOpen: boolean) => void;
    user: User
};

/**
 * Formulario para crear nuevas bitácoras
 * Incluye selección de mes, número de boleta y programa
 * Con validaciones según el rol del usuario
 */
export function BitacoraForm({ setIsOpen, user }: BitacoraFormProps) {
    /**
     * Obtiene los últimos 6 meses para la selección
     * @returns Array de objetos con display y value para cada mes
     */
    const getLastSixMonths = () => {
        const months = [];
        const date = new Date();
        for (let i = 0; i < 6; i++) {
            const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            months.push({
                display: monthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
                value: lastDayOfMonth.toISOString()
            });
        }
        return months;
    };

    // Variable que almacena los últimos 6 meses
    const lastSixMonths = getLastSixMonths();
    
    const initialValues = {
        month: !user.roles?.some((role: any) => role?.name === 'Administrador') ? lastSixMonths[0].value : '',
        recipe: '',
        user_id: 0,
        program_id: 0,
    };

    // Control de formulario con React Hook Form
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ defaultValues: initialValues });
    const queryClient = useQueryClient();
    const isAdmin = user.roles?.some((role: any) => role?.name === 'Administrador');

    /**
     * Consulta para obtener programas disponibles
     * Filtra según el rol del usuario
     */
    const {data: programs, isLoading: isLoadingPrograms} = useQuery({
        queryKey: ['programs'],
        queryFn: getPrograms,
    });

    const filteredPrograms = user.roles?.some((role) => role?.name === 'Administrador')
    ? programs
    : programs?.filter((program: Program) =>
        program.users?.some((programUser) => programUser.user_id === user.id)
      );

    const [isSaving, setIsSaving] = useState(false); // Nuevo estado

    /**
     * Mutación para crear nueva bitácora
     * Maneja estados de éxito y error
     */
    const { mutate } = useMutation({
        mutationFn: createBitacora,
        onError: (error) => {
            setIsSaving(false); // Desactivar estado de carga en caso de error
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        },
        onSuccess: (data) => {
            setIsSaving(false); // Desactivar estado de carga en caso de éxito
            toast({
                title: '🎉Bitácora creada!',
                description: data,
            });
            setIsOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ['bitacoras'] });
        }
    });

    /**
     * Maneja el envío del formulario
     */
    const handleCreate = (formData: BitacoraForm) => {
        setIsSaving(true); // Activar estado de carga
        console.log(formData.month);
        mutate({ ...formData, user_id: user.id });
    };

    if (isLoadingPrograms) return <LoadingSpinner className="h-10"/>

    return (
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="month" className="text-right dark:text-sidebar-foreground">
                        Mes
                    </Label>
                    <Select
                        {...register('month', { required: 'Este campo es requerido' })}
                        onValueChange={(value) => setValue('month', value)}
                        disabled={!isAdmin}
                        defaultValue={initialValues.month}
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {lastSixMonths.map((month, index) => (
                                <SelectItem key={index} value={month.value} className=" first-letter:uppercase">{month.display}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.month && <ErrorMessage className=" col-start-2 col-end-4">{errors.month.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recipe" className="text-right dark:text-sidebar-foreground">
                        Boleta
                    </Label>
                    <Input
                        id="recipe"
                        placeholder="Número de boleta"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('recipe', { required: 'Este campo es requerido' })}
                    />
                    {errors.recipe && <ErrorMessage className=" col-start-2 col-end-4">{errors.recipe.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="program" className="text-right dark:text-sidebar-foreground">
                        Programa
                    </Label>
                    <Select
                        {...register('program_id', { required: 'Este campo es requerido' })}
                        onValueChange={(value) => setValue('program_id', parseInt(value))}
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un programa" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredPrograms?.length ? (
                                filteredPrograms.map((program: Program) => (
                                    <SelectItem key={program.id} value={program.id.toString()}>{program.name}</SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-center text-muted-foreground text-sm">
                                    No hay programas disponibles
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.program_id && <ErrorMessage className=" col-start-2 col-end-4">{errors.program_id.message}</ErrorMessage>}
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSaving || watch('program_id') === 0} className="w-full md:w-auto">
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
