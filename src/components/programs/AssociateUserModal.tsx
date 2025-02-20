import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ErrorMessage from "@/components/ErrorMessage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "../LoadingSpinner";
import { getUsers } from "@/api/UserAPI";
import { associateUser } from "@/api/ProgramAPI";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Program } from "@/types";

// Tipos para el formulario de asociación
type AssociateUserForm = {
  program_id: number;
  user_id: number;
  turn: string;
};

type AssociateUserModalProps = {
  program: Program;
  setIsOpen: (isOpen: boolean) => void;
};

// Opciones predefinidas para los turnos
const turnOptions = [
  { value: "Diurno", label: "Diurno" },
  { value: "Vespertino", label: "Vespertino" },
  { value: "Nocturno", label: "Nocturno" },
];

/**
 * Componente modal para asociar un usuario a un programa
 * Permite seleccionar un usuario y asignarle un turno
 */
export default function AssociateUserModal({ program, setIsOpen }: AssociateUserModalProps) {
  // Estados y hooks
  const [isSaving, setIsSaving] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isMobile = useIsMobile();

  // Configuración del formulario con react-hook-form
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AssociateUserForm>({
    defaultValues: {
      program_id: program.id,
      user_id: 0,
      turn: "",
    }
  });

  const queryClient = useQueryClient();

  // Consulta de usuarios disponibles
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  // Mutación para asociar usuario
  const { mutate } = useMutation({
    mutationFn: (data: AssociateUserForm) => associateUser(data),
    onError: (error) => {
      setIsSaving(false);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data: any) => {
      setIsSaving(false);
      toast({
        title: '🎉Usuario asociado!',
        description: data,
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['program'] });
    }
  });

  // Manejo del envío del formulario
  const handleAssociate = (formData: AssociateUserForm) => {
    setIsSaving(true);
    mutate(formData);
  };


  if (isLoadingUsers) return <LoadingSpinner className="h-10" />;

  return (
    // Formulario con campos para programa (deshabilitado), 
    <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleAssociate)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="program" className="text-right dark:text-sidebar-foreground">
            Programa
          </Label>
          <Select
            disabled
            value={program.id.toString()}
            onValueChange={() => {}}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue>{program.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={program.id.toString()}>{program.name}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="user_id" className="text-right dark:text-sidebar-foreground">
            Usuario
          </Label>
          {isMobile ? (
            <Drawer open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
                >
                  <span className="truncate block">
                    {users?.find((user) => user.id === watch("user_id"))?.name || "Seleccione un usuario"}
                    {users?.find((user) => user.id === watch("user_id"))?.is_replacement && " [Remplazo]"}
                  </span>
                  <ChevronsUpDown className="opacity-50 flex-shrink-0 ml-2" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mt-4 border-t">
                  <Command>
                    <CommandInput placeholder="Buscar usuario..." className="h-9 text-base" />
                    <CommandList>
                      <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                      <CommandGroup>
                        {users?.map((user) => (
                          <CommandItem
                            value={`${user.name}${user.is_replacement ? ' [Remplazo]' : ''} (${user.run || 'Sin RUT'})`}
                            key={user.id}
                            className="flex items-center justify-between"
                            onSelect={() => {
                              setValue("user_id", user.id);
                              setIsPopoverOpen(false);
                            }}
                          >
                            <span className="mr-2">
                              {user.name}{user.is_replacement ? ' [Remplazo]' : ''} ({user.run || 'Sin RUT'})
                            </span>
                            <Check
                              className={cn(
                                "flex-shrink-0",
                                user.id === watch("user_id") ? "opacity-100" : "opacity-0",
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
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
                >
                  <span className="truncate block">
                    {users?.find((user) => user.id === watch("user_id"))?.name || "Seleccione un usuario"}
                    {users?.find((user) => user.id === watch("user_id"))?.is_replacement && " [Remplazo]"}
                  </span>
                  <ChevronsUpDown className="opacity-50 flex-shrink-0 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar usuario..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                    <CommandGroup>
                      {users?.map((user) => (
                        <CommandItem
                          value={`${user.name}${user.is_replacement ? ' [Remplazo]' : ''} (${user.run || 'Sin RUT'})`}
                          key={user.id}
                          className="flex items-center justify-between"
                          onSelect={() => {
                            setValue("user_id", user.id);
                            setIsPopoverOpen(false);
                          }}
                        >
                          <span className="mr-2">
                            {user.name}{user.is_replacement ? ' [Remplazo]' : ''} ({user.run || 'Sin RUT'})
                          </span>
                          <Check
                            className={cn(
                              "flex-shrink-0",
                              user.id === watch("user_id") ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          {errors.user_id && (
            <ErrorMessage className="col-start-2 col-end-4">
              {errors.user_id.message}
            </ErrorMessage>
          )}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="turn" className="text-right dark:text-sidebar-foreground">
            Turno
          </Label>
          <Select
            {...register('turn', { required: 'Este campo es requerido' })}
            onValueChange={(value) => setValue('turn', value)}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione un turno" />
            </SelectTrigger>
            <SelectContent>
              {turnOptions.map((turn) => (
                <SelectItem key={turn.value} value={turn.value}>{turn.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.turn && <ErrorMessage className="col-start-2 col-end-4">{errors.turn.message}</ErrorMessage>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? 'Guardando...' : 'Asociar Usuario'}
        </Button>
      </div>
    </form>
  );
}
