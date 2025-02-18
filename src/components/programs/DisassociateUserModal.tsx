import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { disassociateUser } from "@/api/ProgramAPI"; // Necesitas crear esta función

type DisassociateUserModalProps = {
  programUserId: number;
  setIsOpen: (isOpen: boolean) => void;
};

export default function DisassociateUserModal({ programUserId, setIsOpen }: DisassociateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: disassociateUser,
    onSuccess: (data) => {
      setIsLoading(false);
      toast({
        title: "Usuario desvinculado",
        description: data,
      });
      setIsOpen(false);
      queryClient.invalidateQueries({queryKey: ['program']});	
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDisassociate = () => {
    setIsLoading(true);
    mutate(programUserId);
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={handleDisassociate}
          disabled={isLoading}
        >
          {isLoading ? "Desvinculando..." : "Desvincular"}
        </Button>
      </div>
    </div>
  );
}
