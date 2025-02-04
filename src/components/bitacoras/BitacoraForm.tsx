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

type BitacoraFormProps = {
    setIsOpen: (isOpen: boolean) => void;
    user: User
};

export function BitacoraForm({ setIsOpen, user }: BitacoraFormProps) {
    const initialValues = {
        month: '',
        recipe: '',
        user_id: 0,
        program_id: 0,
    };

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({ defaultValues: initialValues });

    const queryClient = useQueryClient();

    const {data: programs, isLoading: isLoadingPrograms} = useQuery({
        queryKey: ['programs'],
        queryFn: getPrograms
    });

    const getLastThreeMonths = () => {
        const months = [];
        const date = new Date();
        for (let i = 0; i < 3; i++) {
            const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            months.push({
                display: monthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
                value: lastDayOfMonth.toISOString()
            });
        }
        return months;
    };

    const lastThreeMonths = getLastThreeMonths();

    const [isSaving, setIsSaving] = useState(false); // Nuevo estado

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
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {lastThreeMonths.map((month, index) => (
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
                            {programs?.map((program: Program) => (
                                <SelectItem key={program.id} value={program.id.toString()}>{program.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.program_id && <ErrorMessage className=" col-start-2 col-end-4">{errors.program_id.message}</ErrorMessage>}
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
