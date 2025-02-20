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
import { useAuth } from '@/hooks/useAuth';

/**
 * Props para el modal de edición de bitácoras
 * @param id ID de la bitácora a editar
 * @param setIsOpen Función para controlar la visibilidad del modal
 */
type EditBitacoraProps = {
  id: Bitacora['id'];
  setIsOpen: (isOpen: boolean) => void;
};

/**
 * Obtiene los últimos seis meses desde una fecha de referencia
 * @param referenceDate Fecha de referencia
 * @returns Array de objetos con display y value para cada mes
 */
const getLastSixMonths = () => {
  const months = [];
  const date = new Date();  // Usamos la fecha actual en lugar de referenceDate
  
  for (let i = 0; i < 6; i++) {  // Cambiamos el orden del loop (0 a 5 en vez de 5 a 0)
    const monthDate = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999); // Establecemos al último momento del día

    months.push({
      display: monthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
      value: lastDayOfMonth.toISOString()
    });
  }
  return months;
};

/**
 * Determina el período correspondiente a una fecha dada
 * @param date Fecha a evaluar
 * @param periods Array de períodos disponibles
 * @returns El valor del período correspondiente
 */
const findPeriodForDate = (date: string, periods: Array<{value: string}>) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  // Encontrar el período que corresponde a la fecha
  return periods.find(period => {
    const periodDate = new Date(period.value);
    const periodMonth = periodDate.getMonth();
    const periodYear = periodDate.getFullYear();
    
    return targetDate.getMonth() === periodMonth && 
           targetDate.getFullYear() === periodYear;
  })?.value || periods[0].value;
};

/**
 * Modal para editar bitácoras existentes
 * Permite modificar mes, boleta y programa asociado
 */
export default function EditBitacoraModal({ id, setIsOpen }: EditBitacoraProps) {
  // Consulta de datos iniciales
  const { data: bitacora, isLoading } = useQuery({
    queryKey: ['bitacora', id],
    queryFn: () => getBitacora(id),
    enabled: !!id
  });

  const user = useAuth();

  // Control de formulario con React Hook Form
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

  const filteredPrograms = user.data?.roles?.some((role) => role?.name === 'Administrador')
    ? programs
    : programs?.filter((program: Program) =>
        program.users?.some((programUser) => programUser.user_id === user.data?.id)
      );

  /**
   * Efecto para cargar datos iniciales
   */
  useEffect(() => {
    if (bitacora) {
      const periods = getLastSixMonths();
      const correctPeriod = findPeriodForDate(bitacora.month, periods);
      reset({
        ...bitacora,
        month: correctPeriod
      });
    }
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
      queryClient.invalidateQueries({ queryKey: ['bitacora'] });
      queryClient.invalidateQueries({ queryKey: ['bitacora', id] });  
    }
  });

  const handleEdit = (formData: BitacoraForm) => {
    setIsSaving(true); // Activar estado de carga
    mutate(formData);
  };

  const lastSixMonths = bitacora ? getLastSixMonths() : [];

  const isAdmin = user.data?.roles?.some(role => role?.name === 'Administrador');

  if (isLoading || isLoadingPrograms) return <LoadingSpinner className="h-10" />;

  return (
    <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleEdit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="month" className="text-right dark:text-sidebar-foreground">
            Mes
          </Label>
          <Select
            {...register('month', { required: 'Este campo es requerido' })}
            value={watch('month')}
            onValueChange={(value) => setValue('month', value)}
            disabled={!isAdmin}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione un mes">
                {lastSixMonths.find(month => month.value === watch('month'))?.display}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {lastSixMonths.map((month, index) => (
                <SelectItem key={index} value={month.value} className="first-letter:uppercase">
                  {month.display}
                </SelectItem>
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
            {...register('program_id', { required: 'Este campo es requerido' })}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione un programa">
                {filteredPrograms?.find(program => program.id === watch('program_id'))?.name}
              </SelectValue>
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
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || watch('program_id') === 0} className="w-full md:w-auto">
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
