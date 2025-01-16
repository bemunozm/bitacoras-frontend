import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory } from "@/api/CategoryAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { CategoryForm } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";

type CategoryFormProps = {
  setIsOpen: (isOpen: boolean) => void;
};

export function CategoryForm({ setIsOpen }: CategoryFormProps) {
  const initialValues = {
    name: '',
    description: '',
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: createCategory,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Categoría creada!',
        description: data,
      });
      setIsOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const handleCreate = (formData: CategoryForm) => {
    mutate(formData);
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
            placeholder="Categoría Ejemplo"
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
            placeholder="Descripción de la categoría."
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('description', { required: 'Este campo es requerido' })}
          />
            {errors.description && <ErrorMessage className=" col-start-2 col-end-4">{errors.description.message}</ErrorMessage>}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  );
}
