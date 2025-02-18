import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBitacora, updateBitacora } from "@/api/BitacoraAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { Bitacora, BitacoraForm, Program, User } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "../LoadingSpinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getPrograms } from "@/api/ProgramAPI";

type EditReplacementBitacoraProps = {
  id: Bitacora['id'];
  setIsOpen: (isOpen: boolean) => void;
};

export default function EditReplacementBitacoraModal({ id, setIsOpen }: EditReplacementBitacoraProps) {
  const { data: bitacora, isLoading } = useQuery({
    queryKey: ['bitacora', id],
    queryFn: () => getBitacora(id),
    enabled: !!id
  });

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

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      month: '',
      recipe: '',
      user_id: 0,
      program_id: 0,
    }
  });

  const { data: programs, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['programs'],
    queryFn: getPrograms
  });

  const [availableReplacements, setAvailableReplacements] = useState<User[]>([]);

  useEffect(() => {
    const selectedProgram = programs?.find((p: Program) => p.id === watch('program_id'));
    if (selectedProgram) {
      const replacements = selectedProgram.users?.filter(u => u.user.is_replacement === true) || [];
      const replacementsUsers = replacements.map((replacement) => replacement.user);
      setAvailableReplacements(replacementsUsers);
    }
  }, [watch('program_id'), programs]);

  useEffect(() => {
    if (bitacora) reset(bitacora);
  }, [bitacora, reset]);

  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { mutate } = useMutation({
    mutationFn: (data: BitacoraForm) => updateBitacora({ id: bitacora!.id, ...data }),
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
    setIsSaving(true);
    mutate(formData);
  };

  if (isLoading || isLoadingPrograms) return <LoadingSpinner className='h-10' />;

  return (
    <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleEdit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="month" className="text-right dark:text-sidebar-foreground">
            Mes
          </Label>
          <Select
            {...register('month', { required: 'Este campo es requerido' })}
            onValueChange={(value) => setValue('month', value)}
            value={watch('month')}
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
            placeholder="Número de boleta"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('recipe', { required: 'Este campo es requerido' })}
          />
          {errors.recipe && <ErrorMessage className="col-start-2 col-end-4">{errors.recipe.message}</ErrorMessage>}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="program" className="text-right dark:text-sidebar-foreground">
            Programa
          </Label>
          <Select
            {...register('program_id', { required: 'Este campo es requerido' })}
            onValueChange={(value) => setValue('program_id', parseInt(value))}
            value={watch('program_id').toString()}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione un programa" />
            </SelectTrigger>
            <SelectContent>
              {programs?.map((program) => (
                <SelectItem key={program.id} value={program.id.toString()}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.program_id && <ErrorMessage className="col-start-2 col-end-4">{errors.program_id.message}</ErrorMessage>}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="user_id" className="text-right dark:text-sidebar-foreground">
            Reemplazo
          </Label>
          <Select
            {...register('user_id', { required: 'Este campo es requerido' })}
            onValueChange={(value) => setValue('user_id', parseInt(value))}
            value={watch('user_id').toString()}
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

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving || watch('program_id') === 0 || watch('user_id') === 0}
          className="w-full md:w-auto"
        >
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
