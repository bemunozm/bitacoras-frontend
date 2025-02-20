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
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props para el componente EditActivityModal
 * @param id ID de la actividad a editar
 * @param setIsOpen Función para controlar la visibilidad del modal
 */
type EditActivityModalProps = {
  id: number;
  setIsOpen: (isOpen: boolean) => void;
};

/**
 * Modal para editar actividades existentes
 * Permite modificar descripción, fecha, categoría y archivos adjuntos
 */
export default function EditActivityModal({ id, setIsOpen }: EditActivityModalProps) {
  /**
   * Consulta para obtener los datos de la actividad
   */
  const { data: activity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivity(id),
    enabled: !!id
  });

  // Valores iniciales del formulario
  const initialValues = {
    description: '',
    date: '', // Inicializar la fecha como una cadena vacía
    bitacora_id: 0,
    category_id: 0,
    attachments: []
  };

  // Configuración del formulario con React Hook Form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: initialValues });
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<FileWithPreview[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /**
   * Efecto para cargar los datos de la actividad en el formulario
   * Ajusta la fecha para manejar la zona horaria
   */
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

  /**
   * Mutación para actualizar la actividad
   * Maneja estados de éxito y error
   */
  const { mutate } = useMutation({
    mutationFn: updateActivity,
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
        title: '🎉Actividad actualizada!',
        description: data,
      });
      setIsOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
    }
  });

  /**
   * Manejadores de eventos
   */
  const handleUpdate = (formData: any) => {
    setIsSaving(true); // Activar estado de carga
    const date = new Date(formData.date);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajustar la fecha para evitar el desfase de un día

    mutate({ 
      ...formData, 
      id, 
      date, 
      newAttachments: selectedAttachments, 
      existingAttachments 
    });
  };

  const handleFilesAdded = (files: FileWithPreview[]) => {
    setSelectedAttachments(files);
  };

  const handleExistingFilesRemoved = (files: Attachment[]) => {
    setExistingAttachments(files);
  };

  const handleCategoryChange = (selected: string) => {
    setSelectedCategory(parseInt(selected));
    setValue('category_id', parseInt(selected)); // Añadir esta línea para actualizar el valor del formulario
  };

  /**
   * Consulta para obtener las categorías disponibles
   */
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isLoadingActivity || isLoadingCategories || !attachmentsLoaded) return <LoadingSpinner className="h-10" />;

  return (
    <form noValidate onSubmit={handleSubmit(handleUpdate)} className="space-y-6 px-4">
      {/* Campo de fecha */}
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right dark:text-sidebar-foreground">
            Fecha
          </Label>
          <Input
            id="date"
            type="date"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('date', { required: 'Este campo es requerido', validate: (value) => {
              if (value) {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  
                  // Setear la hora a 00:00:00 para que solo se compare la fecha
                  selectedDate.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);

                  return selectedDate < today || 'Ingrese una fecha válida';
              }
              } })}
          />
          {errors.date && <ErrorMessage className="col-start-2 col-end-4">{errors.date.message}</ErrorMessage>}
        </div>

        {/* Selector de categoría - Adaptativo para móvil/desktop */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category_id" className="text-right dark:text-sidebar-foreground">
            Categoría
          </Label>
          <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
            {isLoadingCategories ? (
              <p>Cargando Categorías</p>
            ) : isMobile ? (
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedCategory 
                      ? categories?.find(cat => cat.id === selectedCategory)?.name 
                      : "Selecciona una categoría"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mt-4 border-t">
                    <Command>
                      <CommandInput placeholder="Buscar categoría..." className="h-9 text-base" />
                      <CommandList>
                        <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                        <CommandGroup>
                          {categories!.map((category) => (
                            <CommandItem
                              value={category.name}
                              key={category.id}
                              onSelect={() => {
                                handleCategoryChange(category.id.toString());
                                setIsDrawerOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{category.name}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 break-words">
                                  {category.description}
                                </span>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto",
                                  category.id === selectedCategory ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </DrawerContent>
              </Drawer>
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
                <SelectContent className="max-w-[500px]">
                  {categories!.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 break-words px-2">
                          {category.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {errors.category_id && <ErrorMessage className="col-start-2 col-end-4">{errors.category_id.message}</ErrorMessage>}
        </div>

        {/* Campo de descripción */}
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

        {/* Zona de archivos adjuntos */}
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

      {/* Botones de acción */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
