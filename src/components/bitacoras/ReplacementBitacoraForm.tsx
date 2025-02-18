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
import { useState, useEffect } from "react";

type ReplacementBitacoraFormProps = {
    setIsOpen: (isOpen: boolean) => void;
    user: User
};

export function ReplacementBitacoraForm({ setIsOpen, user }: ReplacementBitacoraFormProps) {
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

    const lastSixMonths = getLastSixMonths();

    const initialValues = {
        month: !user.roles?.some((role: any) => role?.name === 'Administrador') ? lastSixMonths[0].value : '',
        recipe: '',
        user_id: 0, // Este será el ID del reemplazo
        program_id: 0,
    };

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<BitacoraForm>({
        defaultValues: initialValues
    });
    const queryClient = useQueryClient();
    const { data: programs, isLoading: isLoadingPrograms } = useQuery({
        queryKey: ['programs'],
        queryFn: getPrograms
    });

    const filteredPrograms = user.roles?.some((role: any) => role?.name === 'Administrador') ? programs : programs?.filter((program: Program) => program.users?.find((programUser) => programUser.is_coordinator)?.user.id === user.id);

    const [isSaving, setIsSaving] = useState(false);

    const { mutate } = useMutation({
        mutationFn: createBitacora,
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
                title: '🎉Bitácora creada!',
                description: data,
            });
            setIsOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ['bitacoras'] });
        }
    });

    const handleCreate = (formData: BitacoraForm) => {
        setIsSaving(true);
        console.log(formData.month);
        // Aquí enviamos directamente el formData porque ya contiene el user_id del reemplazo
        mutate(formData);
    };

    const [availableReplacements, setAvailableReplacements] = useState<User[]>([]);

    // Actualizar la lista de reemplazos cuando cambie el programa
    useEffect(() => {
        const selectedProgram = programs?.find((p: Program) => p.id === watch('program_id'));
        if (selectedProgram) {
            const replacements = selectedProgram.users?.filter(u => u.user.is_replacement === true) || [];
            const replacementsUsers = replacements.map((replacement) => replacement.user);
            setAvailableReplacements(replacementsUsers);
        }
    }, [watch('program_id'), programs]);

    const isAdmin = user.roles?.some((role: any) => role?.name === 'Administrador');

    if (isLoadingPrograms) {
        return <LoadingSpinner className="h-10" />;
    }

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
                                <SelectItem 
                                    key={index} 
                                    value={month.value} 
                                    className="first-letter:uppercase"
                                >
                                    {month.display}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.month && <ErrorMessage className="col-start-2 col-end-4">{errors.month.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recipe" className="text-right dark:text-sidebar-foreground">
                        Boleta
                    </Label>
                    <Input
                        id="recipe"
                        type="text"
                        {...register('recipe', { required: 'Debe ingresar una receta' })}
                        placeholder="Número de boleta"
                        className="col-span-3 dark:text-sidebar-foreground"
                    />
                    {errors.recipe && <ErrorMessage className="col-start-2 col-end-4">{errors.recipe.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="program" className="text-right dark:text-sidebar-foreground">
                        Programa
                    </Label>
                    <Select
                        {...register('program_id', { required: 'Debe seleccionar un programa' })}
                        onValueChange={(value) => setValue('program_id', parseInt(value))}
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un programa" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredPrograms?.map((program) => (
                                <SelectItem key={program.id} value={program.id.toString()}>
                                    {program.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.program_id && <ErrorMessage className="col-start-2 col-end-4">{errors.program_id.message}</ErrorMessage>}
                </div>
                
                {/* Nuevo campo para el reemplazo */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user_id" className="text-right dark:text-sidebar-foreground">
                        Reemplazo
                    </Label>
                    <Select
                        {...register('user_id', { required: 'Debe seleccionar un reemplazo' })}
                        onValueChange={(value) => setValue('user_id', parseInt(value))}
                        disabled={!watch('program_id')}
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un reemplazo" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableReplacements.length ? (
                                availableReplacements.map((replacement) => (
                                    <SelectItem key={replacement.id} value={replacement.id.toString()}>
                                        {replacement.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-center text-muted-foreground text-sm">
                                    No hay reemplazos disponibles
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.user_id && <ErrorMessage className="col-start-2 col-end-4">{errors.user_id.message}</ErrorMessage>}
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button 
                    type="submit" 
                    disabled={isSaving || watch('program_id') === 0 || watch('user_id') === 0}
                    className="w-full md:w-auto"
                >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
