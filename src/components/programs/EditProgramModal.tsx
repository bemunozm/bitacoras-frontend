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
import { ChevronsUpDown, Check } from 'lucide-react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { states } from '@/data/states';

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

  const handleResidenceChange = (value: number[]) => {
    setSelectedResidences(value);
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
              <Listbox value={selectedResidences} onChange={handleResidenceChange} multiple>
                <div className="relative">
                  <ListboxButton className="w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-sidebar-foreground shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-accent sm:text-sm sm:leading-6">
                    <span className="block truncate">
                      {selectedResidences.length > 0
                        ? selectedResidences
                            .map((id) => residences!.find((residence: Residence) => residence.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')
                        : 'Selecciona uno o más roles'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronsUpDown aria-hidden="true" className="h-5 w-5 text-gray-400" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black py-1 text-base shadow-lg ring-1 ring-black dark:ring-sidebar-border ring-opacity-5 focus:outline-none sm:text-sm">
                    {residences!.map((residence: Residence) => (
                      <ListboxOption
                        key={residence.id}
                        value={residence.id}
                        className={({ active, selected }) =>
                          `relative cursor-default select-none py-2 pl-8 pr-4 ${
                            active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-gray-900 dark:text-sidebar-foreground'
                          } ${selected ? 'font-semibold' : 'font-normal'}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                              {residence.name}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-sidebar-ring">
                                <Check aria-hidden="true" className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
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
