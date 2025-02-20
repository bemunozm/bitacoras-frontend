import { deleteActivity } from '@/api/ActivityAPI';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

/**
 * Props para el modal de eliminación de actividades
 * @param id ID de la actividad a eliminar
 * @param setIsOpen Función para controlar la visibilidad del modal
 */
type DeleteActivityModalProps = {
  id: number;
  setIsOpen: (isOpen: boolean) => void;
};

/**
 * Modal de confirmación para eliminar actividades
 * Incluye gestión de estado de carga y feedback visual
 */
export default function DeleteActivityModal({ id, setIsOpen }: DeleteActivityModalProps) {
  const queryClient = useQueryClient();
  const { handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Mutación para eliminar una actividad
   * Maneja estados de éxito y error con notificaciones
   */
  const { mutate } = useMutation({
    mutationFn: deleteActivity,
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      setIsLoading(false);
      setIsOpen(false);
      toast({
        title: '🎉Actividad eliminada!',
        description: data,
      });
      // Actualizar la lista de actividades después de eliminar
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    }
  });

  /**
   * Maneja el envío del formulario de eliminación
   * Activa el estado de carga y ejecuta la mutación
   */
  const onSubmit = () => {
    setIsLoading(true);
    mutate(id);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-4">
      <div className="w-full flex justify-center sm:space-x-6">
        {/* Botón de cancelar - visible solo en desktop */}
        <Button
          size="lg"
          variant="outline"
          disabled={isLoading}
          className="w-full hidden sm:block dark:text-sidebar-foreground"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          Cancelar
        </Button>
        {/* Botón de eliminar con estado de carga */}
        <Button
          size="lg"
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 hover:bg-red-400"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              Eliminando...
            </div>
          ) : (
            <span>Eliminar</span>
          )}
        </Button>
      </div>
    </form>
  );
}
