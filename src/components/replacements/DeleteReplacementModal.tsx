import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { deleteUser } from "@/api/UserAPI";

type DeleteReplacementModalProps = {
    id: number;
    setIsOpen: (isOpen: boolean) => void;
}

export function DeleteReplacementModal({ id, setIsOpen }: DeleteReplacementModalProps) {
    const queryClient = useQueryClient()
    const [isDeleting, setIsDeleting] = useState(false)

    const { mutate } = useMutation({
        mutationFn: deleteUser,
        onError: (error) => {
            setIsDeleting(false)
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            setIsDeleting(false)
            toast({
                title: '🎉 Reemplazo eliminado!',
                description: data,
            })
            setIsOpen(false)
            queryClient.invalidateQueries({ queryKey: ['replacements'] })
        }
    })

    const handleDelete = () => {
        setIsDeleting(true)
        mutate(id)
    }

    return (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
        </div>
    )
}
