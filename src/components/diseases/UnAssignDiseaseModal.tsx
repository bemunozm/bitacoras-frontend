import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { deleteAssignedDisease } from "@/api/DiseaseAPI"; // Asume que tienes una API para desasignar enfermedades
import { useForm } from "react-hook-form";
import { useState } from "react";

type UnAssignDiseaseModalProps = {
    id: number;
    setIsOpen: (isOpen: boolean) => void;
};

export default function UnAssignDiseaseModal({ id, setIsOpen }: UnAssignDiseaseModalProps) {
  const queryClient = useQueryClient();
  const { handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useMutation({
    mutationFn: () => deleteAssignedDisease(+id!),
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
        title: '🎉Enfermedad desasignada!',
        description: data,
      });
      queryClient.invalidateQueries({ queryKey: ['assignedDisease', id] });
      queryClient.invalidateQueries({ queryKey: ['diseases'] });
    }
  });

  const handleUnassign = () => {
    setIsLoading(true);
    mutate();
  };

  return (
    <form onSubmit={handleSubmit(handleUnassign)} className="space-y-6 px-4">
      <div className="w-full flex justify-center sm:space-x-6">
        <Button
          size="lg"
          variant="outline"
          disabled={isLoading}
          className="w-full hidden sm:block dark:bg-sidebar-accent"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          Cancelar
        </Button>
        <Button
          size="lg"
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 hover:bg-red-400"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              Desasignando...
            </div>
          ) : (
            <span>Desasignar</span>
          )}
        </Button>
      </div>
    </form>
  );
}
