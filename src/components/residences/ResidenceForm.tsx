import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createResidence } from "@/api/ResidenceAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { ResidenceForm } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";

type ResidenceFormProps = {
  setIsOpen: (isOpen: boolean) => void;
};

export function ResidenceForm({ setIsOpen }: ResidenceFormProps) {
  const initialValues = {
    name: '',
    address: '',
    capacity: 0,
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: createResidence,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Residencia creada!',
        description: data,
      });
      setIsOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['residences'] });
    }
  });

  const handleCreate = (formData: ResidenceForm) => {
    mutate({ ...formData, capacity: parseInt(formData.capacity.toString()) });
  };

  return (
    <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
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
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  );
}
