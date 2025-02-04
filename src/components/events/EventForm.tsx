import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/api/EventAPI";
import { getParticipants } from "@/api/ParticipantAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import type { EventForm, Participant } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import { Textarea } from "../ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LoadingSpinner from "../LoadingSpinner";
import { useState } from 'react';

type EventFormProps = {
    setIsOpen: (isOpen: boolean) => void;
    selectedParticipant?: number;
};

export default function EventForm({ setIsOpen, selectedParticipant }: EventFormProps) {

    const initialValues = {
        date: new Date().toISOString().split('T')[0], // Fecha por defecto es hoy
        description: '',
        type: '',
        participant_id: selectedParticipant || 0,
    };

    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ defaultValues: initialValues });

    const queryClient = useQueryClient();

    const { data: participants, isLoading: isLoadingParticipants } = useQuery({
        queryKey: ['participants'],
        queryFn: getParticipants
    });

    const [isSaving, setIsSaving] = useState(false);

    const { mutate } = useMutation({
        mutationFn: createEvent,
        onError: (error) => {
            setIsSaving(false);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            });
        },
        onSuccess: (data) => {
            setIsSaving(false);
            toast({
                title: '🎉Evento creado!',
                description: data,
            });
            setIsOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ['events', selectedParticipant] });
        }
    });

    const handleCreate = (formData: EventForm) => {
        setIsSaving(true);
        const date = new Date(formData.date).toISOString();	
        mutate({ ...formData, date});
    };

    if (isLoadingParticipants) return <LoadingSpinner className="h-10" />;

    return (
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="participant_id" className="text-right dark:text-sidebar-foreground">
                        Participante
                    </Label>
                    <Select
                        {...register('participant_id', { required: 'Este campo es requerido' })}
                        onValueChange={(value) => setValue('participant_id', parseInt(value))}
                        defaultValue={selectedParticipant?.toString() || ''}
                        disabled
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un participante">
                                {participants?.find(participant => participant.id === watch('participant_id'))?.name || 'Seleccione un participante'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {participants?.map((participant: Participant) => (
                                <SelectItem key={participant.id} value={participant.id.toString()}>{participant.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.participant_id && <ErrorMessage className=" col-start-2 col-end-4">{errors.participant_id.message}</ErrorMessage>}
                </div>
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
                    {errors.date && <ErrorMessage className=" col-start-2 col-end-4">{errors.date.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right dark:text-sidebar-foreground">
                        Tipo
                    </Label>
                    <Select
                        {...register('type', { required: 'Este campo es requerido' })}
                        onValueChange={(value) => setValue('type', value)}
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Seleccione un tipo">
                                {watch('type') || 'Seleccione un tipo'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Observación">Observación</SelectItem>
                            <SelectItem value="Nota">Nota</SelectItem>
                            <SelectItem value="Advertencia">Advertencia</SelectItem>
                            <SelectItem value="Incidente">Incidente</SelectItem>
                            <SelectItem value="Reconocimiento">Reconocimiento</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.type && <ErrorMessage className=" col-start-2 col-end-4">{errors.type.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
                        Descripción
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Descripción del evento"
                        className="col-span-3 dark:text-sidebar-foreground h-40"
                        {...register('description', { required: 'Este campo es requerido' })}
                    />
                    {errors.description && <ErrorMessage className=" col-start-2 col-end-4">{errors.description.message}</ErrorMessage>}
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
