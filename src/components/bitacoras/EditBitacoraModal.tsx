import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBitacora, updateBitacora } from "@/api/BitacoraAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { Bitacora, BitacoraForm, Program } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "../LoadingSpinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getPrograms } from "@/api/ProgramAPI";

type EditBitacoraProps = {
  id: Bitacora['id'];
  setIsOpen: (isOpen: boolean) => void;
};

const getLastThreeMonths = (referenceDate: string) => {
  const months = [];
  const date = new Date(referenceDate);
  for (let i = 2; i >= 0; i--) {
    const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    months.push({
      display: monthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
      value: lastDayOfMonth.toISOString()
    });
  }
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const startMonth = date.getMonth();
  const startYear = date.getFullYear();

  for (let year = startYear; year <= currentYear; year++) {
    const monthStart = year === startYear ? startMonth + 1 : 0;
    const monthEnd = year === currentYear ? currentMonth : 11;

    for (let month = monthStart; month <= monthEnd; month++) {
      const monthDate = new Date(year, month, 1);
      const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      months.push({
        display: monthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
        value: lastDayOfMonth.toISOString()
      });
    }
  }
  return months;
};

export default function EditBitacoraModal({ id, setIsOpen }: EditBitacoraProps) {
  const { data: bitacora, isLoading } = useQuery({
    queryKey: ['bitacora', id],
    queryFn: () => getBitacora(id),
    enabled: !!id
  });

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      month: '',
      recipe: '',
      completed: false,
      approved: false,
      user_id: 0,
      program_id: 0,
    }
  });

  const { data: programs, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms
  });

  useEffect(() => {
    if (bitacora) reset(bitacora);
  }, [bitacora, reset]);

  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado

  const { mutate } = useMutation({
    mutationFn: (data: BitacoraForm) => updateBitacora({ id: bitacora!.id, ...data }),
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
        title: '🎉Bitácora actualizada!',
        description: data,
      });
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['bitacoras'] });
      queryClient.invalidateQueries({ queryKey: ['bitacora', id] });  
    }
  });

  const handleEdit = (formData: BitacoraForm) => {
    setIsSaving(true); // Activar estado de carga
    mutate(formData);
  };

  const lastThreeMonths = bitacora ? getLastThreeMonths(bitacora.month) : [];

  if (isLoading || isLoadingPrograms) return <LoadingSpinner className="h-10" />;

  return (
    <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleEdit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="month" className="text-right dark:text-sidebar-foreground">
            Mes
          </Label>
          <Select
            value={watch('month')}
            onValueChange={(value) => setValue('month', value)}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione un mes">
                {lastThreeMonths.find(month => month.value === watch('month'))?.display}
              </SelectValue>
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
          <Label htmlFor="program_id" className="text-right dark:text-sidebar-foreground">
            Programa
          </Label>
          <Select
            value={watch('program_id').toString()}
            onValueChange={(value) => setValue('program_id', parseInt(value))}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione un programa">
                {programs?.find(program => program.id === watch('program_id'))?.name}
              </SelectValue>
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
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
