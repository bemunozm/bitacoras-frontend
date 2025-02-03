import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import ErrorMessage from "@/components/ErrorMessage";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { assingDiseaseToParticipant, getDiseases } from "@/api/DiseaseAPI"; // Asume que tienes una API para asignar enfermedades
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import LoadingSpinner from "../LoadingSpinner";
import { useState } from "react";

type AssignDiseaseModalProps = {
    participant_id: number;
    setIsOpen: (isOpen: boolean) => void;
};

export default function AssignDiseaseModal({ participant_id, setIsOpen }: AssignDiseaseModalProps) {
  const initialValues = {
    date: new Date().toISOString().split('T')[0], // Fecha por defecto es hoy
    treatment_status: '',
    comments: '',
    disease_id: 0,
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ defaultValues: initialValues });

  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false); // Nuevo estado

  const { mutate } = useMutation({
    mutationFn: (data: any) => assingDiseaseToParticipant({ participant_id, ...data }),
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
        title: '🎉Enfermedad asignada!',
        description: data,
      });
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['diseases', participant_id] });
    }
  });

  const { data: diseasesToAssign, isLoading: isLoadingDiseases } = useQuery({
    queryKey: ['diseases'],
    queryFn: () => getDiseases(),
  });

  const handleAssign = (formData: any) => {
    setIsSaving(true); // Activar estado de carga
    const date = new Date(formData.date).toISOString();
    const dataToSend = {
      ...formData,
      date
    };
    mutate(dataToSend);
  };

  if (isLoadingDiseases) return <LoadingSpinner className="h-10" />;

  return (
    <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleAssign)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right dark:text-sidebar-foreground">
            Fecha
          </Label>
          <Input
            id="date"
            type="date"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('date', { required: 'Este campo es requerido' })}
          />
          {errors.date && <ErrorMessage className=" col-start-2 col-end-4">{errors.date.message?.toString()}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="disease_id" className="text-right dark:text-sidebar-foreground">
            Enfermedad
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
              >
                {diseasesToAssign?.find(disease => disease.id === watch('disease_id'))?.name || "Seleccione una enfermedad"}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Buscar enfermedad..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No se encontraron enfermedades.</CommandEmpty>
                  <CommandGroup>
                    {diseasesToAssign?.map((disease) => (
                      <CommandItem
                        value={disease.name}
                        key={disease.id}
                        onSelect={() => setValue('disease_id', disease.id)}
                      >
                        {disease.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            disease.id === watch('disease_id') ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.disease_id && <ErrorMessage className=" col-start-2 col-end-4">{errors.disease_id.message?.toString()}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="treatment_status" className="text-right dark:text-sidebar-foreground">
            Estado del Tratamiento
          </Label>
          <Select
            {...register('treatment_status', { required: 'Este campo es requerido' })}
            onValueChange={(value) => setValue('treatment_status', value)}
          >
            <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
              <SelectValue placeholder="Seleccione el estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="En tratamiento">En tratamiento</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
            </SelectContent>
          </Select>
          {errors.treatment_status && <ErrorMessage className=" col-start-2 col-end-4">{errors.treatment_status.message?.toString()}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="comments" className="text-right dark:text-sidebar-foreground">
            Comentarios
          </Label>
          <Textarea
            id="comments"
            placeholder="Comentarios sobre el tratamiento"
            className="col-span-3 dark:text-sidebar-foreground h-40"
            {...register('comments', { required: 'Este campo es requerido' })}
          />
          {errors.comments && <ErrorMessage className=" col-start-2 col-end-4">{errors.comments.message?.toString()}</ErrorMessage>}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="dark:text-sidebar-foreground">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
