import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "@/hooks/use-toast"
import ErrorMessage from "@/components/ErrorMessage"
import { Check, ChevronsUpDown } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { getActiveParticipants } from "@/api/ResidenceAPI"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function DepartureView() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      departure_date: '',
      participant_id: 0,
      notes: '',
      status: 'Finalizado',
      residence_id: '',
      admission_date: ''
    }
  })

  const { mutate } = useMutation({
    mutationFn: (data: any) => {
      // Aquí irá la llamada a la API para registrar la salida
      return Promise.resolve(data)
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      toast({
        title: '🎉 Salida registrada!',
        description: 'La salida ha sido registrada exitosamente'
      })
      navigate('/residences')
    }
  })

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['activeParticipants'],
    queryFn: getActiveParticipants
  })

  const onSubmit = (data: any) => {
    mutate(data)
  }

  const {setBreadcrumbItems} = useBreadcrumb()
  
    useEffect(() => {
      const route = [
          {label: 'Escritorio', to: '/'},
          {label: 'Residencias', to: '/residences'},
          {label: 'Salida', to: undefined}
      ]
      setBreadcrumbItems(route)
      }, [setBreadcrumbItems])
  
      if (isLoadingParticipants) {
        return (
            <LoadingSpinner />
        )
      }

  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight dark:text-sidebar-foreground">
              Registro de Salida
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="participant_id" className="dark:text-sidebar-foreground">
                  Participante en Residencia
                </Label>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between dark:text-sidebar-foreground"
                    >
                      {participants?.find((participant: any) => participant.participant.id === watch('participant_id'))?.participant.name || 
                      "Seleccione un participante"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar participante..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>
                          <p>No hay participantes en residencia.</p>
                        </CommandEmpty>
                        <CommandGroup>
                          {participants?.map((participant: any) => (
                            <CommandItem
                              value={`${participant.participant.name} (${participant.participant.run})`}
                              key={participant.id}
                              onSelect={() => {
                                setValue('participant_id', participant.participant.id)
                                setValue('residence_id', participant.residence.id)
                                setValue('admission_date', new Date(participant.admission_date).toISOString().split('T')[0])
                                setValue('departure_date', new Date(participant.departure_date).toISOString().split('T')[0] || new Date().toISOString().split('T')[0])
                              }}
                            >
                              {participant.participant.name} ({participant.participant.run})
                              <Check
                                className={cn(
                                  "ml-auto",
                                  participant.participant.id === watch('participant_id') ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.participant_id && <ErrorMessage>{errors.participant_id.message}</ErrorMessage>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="residence_id" className="dark:text-sidebar-foreground">
                  Residencia
                </Label>
                <Select
                  {...register("residence_id", { required: "Este campo es requerido" })}
                  onValueChange={(value) => setValue("residence_id", value)}
                  defaultValue={watch("residence_id").toString() || ""}
                  value={watch("residence_id").toString()}
                >
                  <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                    <SelectValue placeholder="Seleccione una residencia">
                      {participants?.find((participant: any) => participant.residence.id === watch("residence_id"))?.residence.name || "Seleccione una residencia"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {participants?.map((participant: any) => (
                      <SelectItem key={participant.residence.id} value={participant.residence.id}>
                        {participant.residence.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.residence_id && <ErrorMessage>{errors.residence_id.message}</ErrorMessage>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admission_date" className="dark:text-sidebar-foreground">
                  Fecha de Ingreso
                </Label>
                <Input 
                  type="date" 
                  {...register('admission_date', { required: 'Este campo es requerido' })}
                  readOnly
                  className="dark:text-sidebar-foreground"
                />
                {errors.admission_date && <ErrorMessage>{errors.admission_date.message}</ErrorMessage>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departure_date" className="dark:text-sidebar-foreground">
                  Fecha de Salida
                </Label>
                <Input 
                  type="date" 
                  {...register('departure_date', { required: 'Este campo es requerido' })}
                  className="dark:text-sidebar-foreground"
                />
                {errors.departure_date && <ErrorMessage>{errors.departure_date.message}</ErrorMessage>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="dark:text-sidebar-foreground">
                  Estado
                </Label>
                <Select onValueChange={(value) => setValue("status", value)} defaultValue="Finalizado">
                  <SelectTrigger className="dark:text-sidebar-foreground">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finalizado">Finalizado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                    <SelectItem value="Expulsado">Expulsado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="dark:text-sidebar-foreground">
                  Notas de Salida
                </Label>
                <Textarea 
                  {...register('notes')} 
                  placeholder="Razón de salida, observaciones, etc." 
                  className="dark:text-sidebar-foreground min-h-32"
                />
                {errors.notes && <ErrorMessage>{errors.notes.message}</ErrorMessage>}
              </div>
            </div>

            <Button type="submit" >
              Registrar Salida
            </Button>
          </form>
    </div>
  )
}
