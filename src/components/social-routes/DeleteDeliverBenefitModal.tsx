import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { deleteDeliveredBenefits } from "@/api/ParticipantAPI";

type DeleteDeliverBenefitModalProps = {
  benefits: string [];
  setIsOpen: (val: boolean) => void;
};

export default function DeleteDeliverBenefitModal({
  benefits,
  setIsOpen
}: DeleteDeliverBenefitModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit } = useForm();

  // Simula tu API de borrado.
  const { mutate } = useMutation({
    mutationFn: () => deleteDeliveredBenefits(benefits),
    onSuccess: (response) => {
      toast({ title: "Beneficio eliminado", description: response });
      queryClient.invalidateQueries({ queryKey: ["provisions"] });
      queryClient.invalidateQueries({ queryKey: ["deliveredBenefit"] });
      setIsOpen(false);
      setIsLoading(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  });

  const handleDelete = () => {
    setIsLoading(true);
    console.log("benefits", benefits);
    mutate();
  };

  return (
    <form onSubmit={handleSubmit(handleDelete)} className="space-y-6 px-4">
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
