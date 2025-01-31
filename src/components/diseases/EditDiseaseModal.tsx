import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDisease, updateDisease } from "@/api/DiseaseAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { Disease, DiseaseForm } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "../LoadingSpinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from '@headlessui/react';

type EditDiseaseProps = {
  id: Disease['id'];
  setIsOpen: (isOpen: boolean) => void;
};

export default function EditDiseaseModal({ id, setIsOpen }: EditDiseaseProps) {
  const { data: disease, isLoading } = useQuery({
    queryKey: ['disease', id],
    queryFn: () => getDisease(id),
    enabled: !!id
  });

  const initialValues = {
    name: disease?.name || '',
    description: disease?.description || '',
    type: disease?.type || '',
    treatment_required: disease?.treatment_required || false,
    contagious: disease?.contagious || false,
    notes: disease?.notes || '',
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({ defaultValues: initialValues });

  useEffect(() => {
    setValue('name', disease?.name || '');
    setValue('description', disease?.description || '');
    setValue('type', disease?.type || '');
    setValue('treatment_required', disease?.treatment_required || false);
    setValue('contagious', disease?.contagious || false);
    setValue('notes', disease?.notes || '');
  }, [disease, setValue]);

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (data: DiseaseForm) => updateDisease({ id: disease!.id, ...data }),
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Enfermedad actualizada!',
        description: data,
      });
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
    }
  });

  const handleEdit = (formData: DiseaseForm) => {
    console.log(formData);
    mutate(formData);
  };

  if (isLoading) return <LoadingSpinner className="h-10" />;

  return (
    <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleEdit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
            Nombre
          </Label>
          <Input
            id="name"
            placeholder="Nombre de la enfermedad"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('name', { required: 'Este campo es requerido' })}
          />
          {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
            Descripción
          </Label>
          <Input
            id="description"
            placeholder="Descripción de la enfermedad"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('description')}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right dark:text-sidebar-foreground">
            Tipo
          </Label>
          <Input
            id="type"
            placeholder="Tipo de enfermedad"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('type', { required: 'Este campo es requerido' })}
          />
          {errors.type && <ErrorMessage className=" col-start-2 col-end-4">{errors.type.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="treatment_required" className="text-right dark:text-sidebar-foreground">
            Requiere tratamiento
          </Label>
          <Checkbox
            id="treatment_required"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('treatment_required')}
            defaultChecked={disease?.treatment_required || false}
            onCheckedChange={(checked: boolean) => setValue('treatment_required', checked)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="contagious" className="text-right dark:text-sidebar-foreground">
            Contagiosa
          </Label>
          <Checkbox
            id="contagious"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('contagious')}
            defaultChecked={disease?.contagious || false}
            onCheckedChange={(checked: boolean) => setValue('contagious', checked)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="notes" className="text-right dark:text-sidebar-foreground">
            Notas
          </Label>
          <Textarea
            id="notes"
            placeholder="Notas adicionales"
            className="col-span-3 dark:text-sidebar-foreground h-40"
            {...register('notes')}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
