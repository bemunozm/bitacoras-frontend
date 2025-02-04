import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDisease } from "@/api/DiseaseAPI";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { DiseaseForm } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

type DiseaseFormProps = {
    setIsOpen: (isOpen: boolean) => void;
};

const diseaseTypes = [
  "Viral", "Bacteriana", "Parasitaria", "Micótica", "Autoinmune", "Metabólica", "Crónica", "Respiratoria", 
  "Dermatológica", "Infecciosa", "Alergia", "Ambiental", "Nutricional", "Neurológica", "Hematológica", 
  "Digestiva", "Psicológica", "Sistémica", "Reumática", "Cardiovascular", "Endocrina", "Genética", 
  "Degenerativa", "Oncológica", "Inmunológica", "Renal", "Oftalmológica", "Osteomuscular", 
  "Infecciosa respiratoria", "Infecciosa gastrointestinal", "Tropical", "Venérea", "Congénita", 
  "Traumática", "Neoplásica", "Toxica", "Inflamatoria", "Inmunodeficiencia", "Psiquiátrica"
];

export default function DiseaseForm({ setIsOpen }: DiseaseFormProps) {

    const initialValues = {
        name: '',
        description: '',
        type: '',
        treatment_required: false,
        contagious: false,
        notes: '',
    };

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({ defaultValues: initialValues });

    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false); // Nuevo estado

    const { mutate } = useMutation({
        mutationFn: createDisease,
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
                title: '🎉Enfermedad creada!',
                description: data,
            });
            setIsOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ['diseases'] });
        }
    });

    const handleCreate = (formData: DiseaseForm) => {
        setIsSaving(true); // Activar estado de carga
        mutate(formData);
    };

    return (
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
                        Nombre
                    </Label>
                    <Input
                        id="name"
                        placeholder="Nombre de la enfermedad"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('name', { required: 'Este campo es requerido' })}
                    />
                    {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
                        Descripción
                    </Label>
                    <Input
                        id="description"
                        placeholder="Descripción de la enfermedad"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('description')}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right dark:text-sidebar-foreground">
                        Tipo
                    </Label>
                    <Select
                        {...register('type', { required: 'Este campo es requerido' })}
                        onValueChange={(value) => setValue('type', value)} // Opcional: maneja el cambio de valor
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un tipo de enfermedad" />
                        </SelectTrigger>
                        <SelectContent>
                            {diseaseTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.type && <ErrorMessage className=" col-start-2 col-end-4">{errors.type.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="treatment_required" className="text-right dark:text-sidebar-foreground">
                        Requiere tratamiento
                    </Label>
                    <Checkbox
                        id="treatment_required"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('treatment_required')}
                        onCheckedChange={(checked: boolean) => setValue('treatment_required', checked)}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contagious" className="text-right dark:text-sidebar-foreground">
                        Contagiosa
                    </Label>
                    <Checkbox
                        id="contagious"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('contagious')}
                        onCheckedChange={(checked: boolean) => setValue('contagious', checked)}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right dark:text-sidebar-foreground">
                        Notas
                    </Label>
                    <Textarea
                        id="notes"
                        placeholder="Notas adicionales"
                        className="col-span-3 dark:text-sidebar-foreground h-40"
                        {...register('notes')}
                    />
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    );
}
