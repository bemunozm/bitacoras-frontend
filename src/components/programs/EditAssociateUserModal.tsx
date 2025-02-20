import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProgramUser, ProgramUserUpdateForm } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateAssociation } from "@/api/ProgramAPI";
import { useForm } from "react-hook-form";
import ErrorMessage from "@/components/ErrorMessage";
import { ChevronsUpDown } from "lucide-react";

type EditAssociateUserModalProps = {
    programName: string;
  programUser: ProgramUser;
  setIsOpen: (isOpen: boolean) => void;
};

// Opciones predefinidas para los turnos
const turnOptions = [
  { value: "Diurno", label: "Diurno" },
  { value: "Vespertino", label: "Vespertino" },
  { value: "Nocturno", label: "Nocturno" },
];

/**
 * Modal para editar la asociación de un usuario a un programa
 * Permite modificar el turno del usuario
 */
export default function EditAssociateUserModal({ programUser, programName, setIsOpen }: EditAssociateUserModalProps) {
  // Estados y configuración del formulario
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // Inicialización del formulario con datos existentes
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ProgramUserUpdateForm>({
    defaultValues: {
      turn: programUser.turn || "",
    }
  });

  useEffect(() => {
    reset({ turn: programUser.turn || "" });
  }, [programUser, reset]);

  // Mutación para actualizar la asociación
  const { mutate } = useMutation({
    mutationFn: (data: ProgramUserUpdateForm) => updateAssociation(programUser.id, data.turn),
    onSuccess: (data) => {
      setIsSaving(false);
      toast({
        title: "Asociación actualizada",
        description: data,
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["program"] });
    },
    onError: (error) => {
      setIsSaving(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (formData: ProgramUserUpdateForm) => {
    setIsSaving(true);
    mutate(formData);
  };

  return (
    // Formulario con campos de programa y usuario (deshabilitados)
    // y selector de turno (editable)
    <form onSubmit={handleSubmit(handleEdit)} className="space-y-6 px-4">
      <div className="grid gap-4 py-4">
        {/* Programa (deshabilitado) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="program" className="text-right dark:text-sidebar-foreground">
            Programa
          </Label>
          <Select disabled value={programUser.program_id.toString()} onValueChange={() => {}}>
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue>{programName}</SelectValue>
            </SelectTrigger>
          </Select>
        </div>

        {/* Usuario (deshabilitado) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="user" className="text-right dark:text-sidebar-foreground">
            Usuario
          </Label>
          <Button
            variant="outline"
            role="combobox"
            className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
            disabled
          >
            {programUser.user.name}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </div>

        {/* Turno (editable) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="turn" className="text-right dark:text-sidebar-foreground">
            Turno
          </Label>
          <Select
            {...register('turn', { required: 'Este campo es requerido' })}
            onValueChange={(value) => setValue('turn', value)}
            defaultValue={programUser.turn ?? undefined}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue>
                {turnOptions.find(t => t.value === programUser.turn)?.label || "Seleccione un turno"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {turnOptions.map((turn) => (
                <SelectItem 
                  key={turn.value} 
                  value={turn.value}
                >
                  {turn.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.turn && (
            <ErrorMessage className="col-start-2 col-end-4">
              {errors.turn.message}
            </ErrorMessage>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
