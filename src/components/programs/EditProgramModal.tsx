import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProgram, updateProgram } from "@/api/ProgramAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { Program, ProgramForm, Residence } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "../LoadingSpinner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getCoordinators } from "@/api/UserAPI";
import { getResidences } from "@/api/ResidenceAPI";
import { states } from '@/data/states';
import { MultiSelect } from "@/components/ui/multi-select";

type EditProgramProps = {
  id: Program['id'];
  setIsOpen: (isOpen: boolean) => void;
};

export default function EditProgramModal({ id, setIsOpen }: EditProgramProps) {
  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => getProgram(id),
    enabled: !!id
  });

  const initialValues = {
    name: program?.name || '',
    company: program?.company || '',
    address: program?.address || '',
    state: program?.state || '',
    coordinator_id: program?.coordinator_id || 0,
    residences: [],
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ defaultValues: initialValues });

  const { data: coordinators, isLoading: isLoadingCoordinators } = useQuery({
    queryKey: ['coordinators'],
    queryFn: getCoordinators
  });

  const { data: residences, isLoading: isLoadingResidences } = useQuery({
    queryKey: ['residences'],
    queryFn: getResidences
  });

  const [selectedResidences, setSelectedResidences] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue('name', program?.name || '');
    setValue('company', program?.company || '');
    setValue('address', program?.address || '');
    setValue('state', program?.state || '');
    setValue('coordinator_id', program?.coordinator_id || 0);
    const residencesId = program?.residences?.map((residence: Residence) => residence.id) || [];
    setSelectedResidences(residencesId);
  }, [program, setValue]);

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (data: ProgramForm) => updateProgram({ id: program!.id, ...data }),
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
        title: '🎉Programa actualizado!',
        description: data,
      });
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    }
  });

  const handleEdit = (formData: ProgramForm) => {
    setIsSaving(true);
    mutate({ ...formData, residences: selectedResidences });
  };
  
  if (isLoading || isLoadingResidences || isLoadingCoordinators) return <LoadingSpinner className="h-10" />;

  return (
    <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleEdit)}>
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
            onValueChange={(value) => setValue('state', value)}
            defaultValue={program?.state}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione una región" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.region} value={state.region} defaultValue={program?.state}>{state.region}</SelectItem>
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
            onValueChange={(value) => setValue('coordinator_id', parseInt(value))}
            defaultValue={program?.coordinator.name}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione un coordinador" defaultValue={program?.coordinator.id} >
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
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="residences" className="text-right dark:text-sidebar-foreground">
            Residencias
          </Label>
          <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
            {residences && (
              <MultiSelect
                options={residences!.map((residence: Residence) => ({
                  label: residence.name,
                  value: residence.id.toString(),
                }))}
                selected={selectedResidences.map(String)}
                onChange={(selected) => setSelectedResidences(selected.map(Number))}
                placeholder="Selecciona una o más residencias"
              />
            )}
          </div>
          {errors.residences && <ErrorMessage className=" col-start-2 col-end-4">{errors.residences.message}</ErrorMessage>}
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
