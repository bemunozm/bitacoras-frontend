import { deleteRole } from '@/api/RoleAPI'
import { toast } from '@/hooks/use-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

type DeleteRoleModalProps = {
    id: number
    setIsOpen: (isOpen: boolean) => void
}

export default function DeleteRoleModal({id, setIsOpen}: DeleteRoleModalProps) {

    const queryClient = useQueryClient()

    const {handleSubmit} = useForm()

    const [isLoading, setIsLoading] = useState(false)

    const {mutate} = useMutation({
        mutationFn: deleteRole,
        onError: (error) => {
            setIsLoading(false)
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
          })
        },
        onSuccess: (data) => {
            setIsLoading(false)
            setIsOpen(false)
          toast({
            title: '🎉Rol eliminado!',
            description: data,
          })
          queryClient.invalidateQueries({queryKey: ['roles']})
        }
      })

      const onSubmit = () => {
        setIsLoading(true)
        mutate(id)
      }

  return (
    <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 px-4"
      >
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
  )
}
