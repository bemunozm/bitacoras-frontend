import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import ErrorMessage from "@/components/ErrorMessage";
import { updateActivity, getActivity } from "@/api/ActivityAPI";
import DropZone, { FileWithPreview } from "../DropZone";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getCategories } from "@/api/CategoryAPI";
import type { Attachment, Category } from "@/types";
import LoadingSpinner from "../LoadingSpinner";
import { Textarea } from "@/components/ui/textarea";

type EditActivityModalProps = {
  id: number;
  setIsOpen: (isOpen: boolean) => void;
};

export default function EditActivityModal({ id, setIsOpen }: EditActivityModalProps) {
  const { data: activity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivity(id),
    enabled: !!id
  });

  const initialValues = {
    description: '',
    date: '', // Inicializar la fecha como una cadena vacía
    bitacora_id: 0,
    category_id: 0,
    attachments: []
  };

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: initialValues });

  useEffect(() => {
    if (activity) {
      setValue('description', activity.description);
      const date = new Date(activity.date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Ajustar la fecha para evitar el desfase de un día
      setValue('date', date.toISOString().split('T')[0]);
      setValue('bitacora_id', activity.bitacora_id);
      setValue('category_id', activity.category_id);
      setExistingAttachments(activity.attachments); // Guardar los adjuntos existentes
      setSelectedCategory(activity.category_id); // Preseleccionar la categoría
      setAttachmentsLoaded(true); // Marcar como cargados
    }
  }, [activity, setValue]);

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: updateActivity,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Actividad actualizada!',
        description: data,
      });
      setIsOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
    }
  });

  const handleUpdate = (formData: any) => {
    const date = new Date(formData.date);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajustar la fecha para evitar el desfase de un día

    mutate({ ...formData, id: id, date: date, newAttachments: selectedAttachments, existingAttachments: existingAttachments });
  };

  const [selectedAttachments, setSelectedAttachments] = useState<FileWithPreview[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]); // Nuevo estado
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false); // Nuevo estado

  const handleFilesAdded = (files: FileWithPreview[]) => {
    setSelectedAttachments(files);
  };

  const handleExistingFilesRemoved = (files: Attachment[]) => {
    setExistingAttachments(files);
  };

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleCategoryChange = (selected: string) => {
    setSelectedCategory(parseInt(selected));
  };

  if (isLoadingActivity || isLoadingCategories || !attachmentsLoaded) return <LoadingSpinner className="h-10" />;

  return (
    <form noValidate onSubmit={handleSubmit(handleUpdate)} className="space-y-6 px-4">
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
              <Select
                value={selectedCategory?.toString() || ''}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una categoría">
                    {categories?.find(category => category.id === selectedCategory)?.name}
                  </SelectValue>
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
            onExistingFilesRemoved={handleExistingFilesRemoved}
            maxFiles={5}
            maxSize={5 * 1024 * 1024} // 5MB
            accept="image/*,application/pdf"
            initialFiles={selectedAttachments}
            existingFiles={existingAttachments}
          />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  );
}
