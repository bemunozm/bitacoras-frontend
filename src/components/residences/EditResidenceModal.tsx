import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getResidence, updateResidence } from "@/api/ResidenceAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { Residence, ResidenceForm } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "../LoadingSpinner";

type EditResidenceProps = {
  id: Residence['id'];
  setIsOpen: (isOpen: boolean) => void;
};

export default function EditResidenceModal({ id, setIsOpen }: EditResidenceProps) {
  const { data: residence, isLoading } = useQuery({
    queryKey: ['residence', id],
    queryFn: () => getResidence(id),
    enabled: !!id
  });

  const initialValues = {
    name: residence?.name || '',
    address: residence?.address || '',
    capacity: residence?.capacity || 0,
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({ defaultValues: initialValues });

  useEffect(() => {
    setValue('name', residence?.name || '');
    setValue('address', residence?.address || '');
    setValue('capacity', residence?.capacity || 0);
  }, [residence, setValue]);

  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { mutate } = useMutation({
    mutationFn: (data: ResidenceForm) => updateResidence({ id: residence!.id, ...data }),
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
        title: '🎉Residencia actualizada!',
        description: data,
      });
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });

  const handleEdit = (formData: ResidenceForm) => {
    setIsSaving(true);
    mutate({ ...formData, capacity: parseInt(formData.capacity.toString()) });
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
            placeholder="Residencia Ejemplo"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('name', { required: 'Este campo es requerido' })}
          />
          {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right dark:text-sidebar-foreground">
            Direccion
          </Label>
          <Input
            id="address"
            placeholder="Direccion de la residencia."
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('address', { required: 'Este campo es requerido' })}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="capacity" className="text-right dark:text-sidebar-foreground">
            Capacidad
          </Label>
          <Input
            id="capacity"
            type='number'
            placeholder="Capacidad de la residencia."
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('capacity', { required: 'Este campo es requerido' })}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
