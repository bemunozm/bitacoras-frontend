import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

type ReopenBitacoraModalProps = {
    handleStatusChange: (status: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
};

export default function ReopenBitacoraModal({ handleStatusChange, setIsOpen, isOpen }: ReopenBitacoraModalProps) {
  const { handleSubmit } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  

  const onSubmit = () => {
    setIsLoading(true);
    handleStatusChange('En Progreso');
    isOpen ? setIsOpen(false) : setIsOpen(true);
  };

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-4">
        <div className="w-full flex justify-center sm:space-x-6">
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
          <Button
            size="lg"
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 hover:bg-blue-400"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                Reabriendo...
              </div>
            ) : (
              <span>Confirmar</span>
            )}
          </Button>
        </div>
      </form>
  );
}
