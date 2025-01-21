import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import ErrorMessage from "@/components/ErrorMessage";
import { createActivity } from "@/api/ActivityAPI";
import DropZone, { FileWithPreview } from "../DropZone";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { getCategories } from "@/api/CategoryAPI";
import type { Category } from "@/types";
import LoadingSpinner from "../LoadingSpinner";
import { Textarea } from "@/components/ui/textarea";

type ActivityFormProps = {
  setIsOpen: (isOpen: boolean) => void;
  id: number;
};

export function ActivityForm({ setIsOpen, id }: ActivityFormProps) {
  const initialValues = {
    description: '',
    date: new Date().toISOString().split('T')[0], // Fecha actual
    bitacora_id: 0,
    category_id: 0,
    attachments: []
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: createActivity,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Actividad creada!',
        description: data,
      });
      setIsOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  const handleCreate = (formData: any) => {
    const date = new Date(formData.date);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajustar la fecha para evitar el desfase de un día

    mutate({ ...formData, date, attachments: selectedAttachments, bitacora_id: id, category_id: selectedCategory });
  };

  const handleFilesAdded = (files: FileWithPreview[]) => {
    setSelectedAttachments(files);
  };

  const [selectedAttachments, setSelectedAttachments] = useState<FileWithPreview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleCategoryChange = (selected: string) => {
    setSelectedCategory(parseInt(selected));
  };

  if (isLoadingCategories) return <LoadingSpinner className="h-10" />;

  return (
    <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right dark:text-sidebar-foreground">
            Fecha
          </Label>
          <Input
            id="date"
            type="date"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('date', { required: 'Este campo es requerido' })}
          />
          {errors.date && <ErrorMessage className="col-start-2 col-end-4">{errors.date.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category_id" className="text-right dark:text-sidebar-foreground">
            Categoría
          </Label>
          <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
            {isLoadingCategories ? (
              <p>Cargando Categorías</p>
            ) : (
              <Select value={selectedCategory?.toString() || ''} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories!.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {errors.category_id && <ErrorMessage className="col-start-2 col-end-4">{errors.category_id.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
            Descripción
          </Label>
          <Textarea
            id="description"
            placeholder="Descripción de la actividad"
            className="col-span-3 dark:text-sidebar-foreground min-h-[120px]"
            {...register('description', { required: 'Este campo es requerido' })}
          />
          {errors.description && <ErrorMessage className="col-start-2 col-end-4">{errors.description.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="attachments" className="text-right dark:text-sidebar-foreground">
            Adjuntos
          </Label>
        </div>
          <DropZone
            onFilesAdded={handleFilesAdded}
            maxFiles={5}
            maxSize={5 * 1024 * 1024} // 5MB
            accept="image/*,application/pdf"
          />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  );
}
