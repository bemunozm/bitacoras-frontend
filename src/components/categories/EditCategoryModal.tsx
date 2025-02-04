import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCategory, updateCategory } from "@/api/CategoryAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { Category, CategoryForm } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "../LoadingSpinner";

type EditCategoryProps = {
  id: Category['id'];
  setIsOpen: (isOpen: boolean) => void;
};

export default function EditCategoryModal({ id, setIsOpen }: EditCategoryProps) {
  const { data: category, isLoading } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id),
    enabled: !!id
  });

  const initialValues = {
    name: category?.name || '',
    description: category?.description || '',
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({ defaultValues: initialValues });

  useEffect(() => {
    setValue('name', category?.name || '');
    setValue('description', category?.description || '');
  }, [category, setValue]);

  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado

  const { mutate } = useMutation({
    mutationFn: (data: CategoryForm) => updateCategory({ id: category!.id, ...data }),
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
        title: '🎉Categoría actualizada!',
        description: data,
      });
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const handleEdit = (formData: CategoryForm) => {
    setIsSaving(true); // Activar estado de carga
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
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit" disabled={isSaving} className='w-full md:w-auto'>
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
