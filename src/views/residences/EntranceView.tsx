import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ErrorMessage from "@/components/ErrorMessage"
import { getParticipants, getParticipantResidences } from "@/api/ParticipantAPI"
import { getResidences, participantEntrance } from "@/api/ResidenceAPI"
import { getEventsByParticipant } from "@/api/EventAPI"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronsUpDown, Info, Home, FileText, Calendar } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { ParticipantForm } from "@/components/participants/ParticipantForm"
import { useEffect, useState } from "react"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

export default function EntranceView() {
  const [isParticipantFormOpen, setIsParticipantFormOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      admission_date: new Date().toISOString().split("T")[0],
      departure_date: new Date().toISOString().split("T")[0],
      residence_id: 0,
      participant_id: 0,
      admission_notes: "",
      status: "Pendiente de Admision", // Valor por defecto
    },
  })

  const { mutate } = useMutation({
    mutationFn: participantEntrance,
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Ingreso registrado!",
        description: data,
      })
      reset()
    },
  })

  const { data: residences, isLoading: isLoadingResidences } = useQuery({
    queryKey: ["residences"],
    queryFn: getResidences,
  })

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ["participants"],
    queryFn: getParticipants,
  })

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events", watch("participant_id")],
    queryFn: () => getEventsByParticipant(watch("participant_id")),
    enabled: !!watch("participant_id"),
  })

  const { data: participantResidences, isLoading: isLoadingParticipantResidences } = useQuery({
    queryKey: ["participantResidences", watch("participant_id")],
    queryFn: () => getParticipantResidences(watch("participant_id")),
    enabled: !!watch("participant_id"),
  })

  const selectedParticipant = participants?.find((participant) => participant.id === watch("participant_id"))

  const onSubmit = (data: any) => {
    const admission_date = new Date(data.admission_date).toISOString()
    const departure_date = new Date(data.departure_date).toISOString()
    mutate({...data, admission_date, departure_date})
  }

  const { setBreadcrumbItems } = useBreadcrumb()

  useEffect(() => {
    const route = [
      { label: "Escritorio", to: "/" },
      { label: "Residencias", to: "/residencias" },
      { label: "Ingreso", to: undefined },
    ]
    setBreadcrumbItems(route)
  }, [setBreadcrumbItems])

  const isMobile = useIsMobile();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  if (isLoadingResidences || isLoadingParticipants) {
    return <LoadingSpinner/>
  }

  return (
    <>
      <ResponsiveDialog
        isOpen={isParticipantFormOpen}
        setIsOpen={setIsParticipantFormOpen}
        title="Crear Nuevo Participante"
        description="Rellena el formulario para crear un nuevo participante."
      >
        <ParticipantForm setIsOpen={setIsParticipantFormOpen} />
      </ResponsiveDialog>

      <div className="max-w-7xl mx-auto space-y-2 h-screen flex flex-col p-6">
        <div className="flex-1 min-h-0 grid gap-8 lg:grid-cols-3 overflow-auto">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold tracking-tight dark:text-sidebar-foreground">Registro de Ingreso</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="participant_id" className="dark:text-sidebar-foreground">Participante</Label>
                {isMobile ? (
                  <Drawer open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between dark:text-sidebar-foreground">
                        {selectedParticipant?.name || "Seleccione un participante"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mt-4 border-t">
                        <Command>
                          <CommandInput placeholder="Buscar participante..." className="h-9 text-base" />
                          <CommandList>
                            <CommandEmpty>
                              <p>No se encontraron participantes.</p>
                              <Button
                                variant="link"
                                className="font-bold"
                                onClick={() => {
                                  setIsParticipantFormOpen(true)
                                  setIsSheetOpen(false)
                                }}
                              >
                                Crear nuevo participante
                              </Button>
                            </CommandEmpty>
                            <CommandGroup>
                              {participants?.map((participant) => (
                                <CommandItem
                                  value={`${participant.name} (${participant.run})`}
                                  key={participant.id}
                                  onSelect={() => {
                                    setValue("participant_id", participant.id);
                                    setIsPopoverOpen(false);
                                  }}
                                >
                                  {participant.name} ({participant.run})
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      participant.id === watch("participant_id") ? "opacity-100" : "opacity-0",
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
                      <Button variant="outline" role="combobox" className="w-full justify-between dark:text-sidebar-foreground">
                        {selectedParticipant?.name || "Seleccione un participante"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar participante..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>
                            <p>No se encontraron participantes.</p>
                            <Button
                              variant="link"
                              className="font-bold"
                              onClick={() => {
                                setIsParticipantFormOpen(true)
                                setIsSheetOpen(false)
                              }}
                            >
                              Crear nuevo participante
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {participants?.map((participant) => (
                              <CommandItem
                                value={`${participant.name} (${participant.run})`}
                                key={participant.id}
                                onSelect={() => setValue("participant_id", participant.id)}
                              >
                                {participant.name} ({participant.run})
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    participant.id === watch("participant_id") ? "opacity-100" : "opacity-0",
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
                {errors.participant_id && <ErrorMessage>{errors.participant_id.message}</ErrorMessage>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="residence_id" className="dark:text-sidebar-foreground">Residencia</Label>
                <Select
                  {...register("residence_id", { required: "Este campo es requerido" })}
                  onValueChange={(value) => setValue("residence_id", +value)}
                  defaultValue={watch("residence_id").toString() || ""}
                >
                  <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                    <SelectValue placeholder="Seleccione una residencia">
                      {residences?.find((residence: any) => residence.id === watch("residence_id"))?.name || "Seleccione una residencia"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {residences?.map((residence: any) => (
                      <SelectItem key={residence.id} value={residence.id}>
                        {residence.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.residence_id && <ErrorMessage>{errors.residence_id.message}</ErrorMessage>}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="dark:text-sidebar-foreground">Fecha de Ingreso</Label>
                  <Input className="dark:text-sidebar-foreground" type="date" {...register("admission_date", { required: "Este campo es requerido" })} />
                  {errors.admission_date && <ErrorMessage>{errors.admission_date.message}</ErrorMessage>}
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-sidebar-foreground">Fecha Estimada de Salida</Label>
                  <Input className="dark:text-sidebar-foreground" type="date" {...register("departure_date", { required: "Este campo es requerido" })} />
                  {errors.departure_date && <ErrorMessage>{errors.departure_date.message}</ErrorMessage>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="dark:text-sidebar-foreground">Estado</Label>
                <Select onValueChange={(value) => setValue("status", value)} defaultValue="Pendiente de Admision">
                  <SelectTrigger className="dark:text-sidebar-foreground">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente de Admision">Pendiente de Admision</SelectItem>
                    <SelectItem value="Residencia en Curso">Residencia en Curso</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <ErrorMessage>{errors.status.message}</ErrorMessage>}
              </div>

              <div className="space-y-2">
                <Label className="dark:text-sidebar-foreground" htmlFor="notes">Notas de Ingreso</Label>
                <Textarea
                  {...register("admission_notes")}
                  placeholder="Ingrese notas adicionales aquí..."
                  className="min-h-32 dark:text-sidebar-foreground"
                  
                />
                {errors.admission_notes && <ErrorMessage>{errors.admission_notes.message}</ErrorMessage>}
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Registrar Ingreso
              </Button>
            </form>
          </div>

          <div className="lg:col-span-1 overflow-auto flex flex-col space-y-2">
            <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
              <Card className=" h-[calc(50vh-60px)] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
                  <CardTitle className="text-lg font-semibold flex items-center text-purple-700 dark:text-purple-500">
                    <Home className="mr-2 text-purple-500" />
                    Historial de Residencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-auto">
                  {isLoadingParticipantResidences ? (
                    <p className="text-center text-gray-500">Cargando residencias...</p>
                  ) : selectedParticipant ? (
                    <div className="space-y-2">
                      {(participantResidences?.length ?? 0 > 0) ? (
                        participantResidences.map((residence: any) => (
                          <div
                            key={residence.id}
                            className="flex items-start space-x-4 p-3 rounded-lg shadow-sm border border-sidebar-border"
                          >
                            <div className="flex-1">
                              <h4 className="font-semibold">{residence.residence.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {new Date(residence.admission_date).toLocaleDateString()} -{" "}
                                  {residence.departure_date
                                    ? new Date(residence.departure_date).toLocaleDateString()
                                    : "Presente"}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant={residence.status == 'Finalizado' ? "secondary" : residence.status == 'Expulsado' ? "destructive" : "default"}
                              className={residence.status == 'Finalizado' ? "bg-blue-500 dark:bg-blue-500 hover:bg-blue-400 dark:hover:bg-blue-400" : residence.status == 'Expulsado' ? "bg-red-500 dark:bg-red-500 hover:bg-red-400 dark:hover:bg-red-400" : residence.status == 'Residencia en Curso' ? "bg-green-500 dark:bg-green-500 hover:bg-green-400 dark:hover:bg-green-400" : "bg-gray-500 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-400"}
                            >
                              {residence.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">No hay registros de residencias.</p>
                      )}
                    </div>
                  ) : (
                    <p>Seleccione un participante para ver su información.</p>
                  )}
                </CardContent>
              </Card>

              <Card className=" h-[calc(50vh-60px)] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
                  <CardTitle className="text-lg font-semibold flex items-center text-green-700 dark:text-green-500">
                    <FileText className="mr-2 text-green-500" />
                    Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-auto">
                  {isLoadingEvents ? (
                    <p className="text-center text-gray-500">Cargando eventos...</p>
                  ) : selectedParticipant ? (
                    <div className="space-y-2">
                      {(events ?? []).length > 0 ? (
                        events?.map((event: any) => (
                          <div
                            key={event.id}
                            className="flex items-start space-x-4 p-3 rounded-lg shadow-sm border border-sidebar-border"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{event.type}</Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(event.date).toLocaleDateString("es-ES")}
                                </span>
                              </div>
                              <p className="mt-1 text-sm">{event.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500">No hay registros de eventos.</p>
                      )}
                    </div>
                  ) : (
                    <p>Seleccione un participante para ver su información.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="fixed bottom-4 right-4 z-50 lg:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                  <Info className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] h-full overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 dark:text-sidebar-foreground">Información del Participante</h2>
                    {selectedParticipant ? (
                      <div className="space-y-2">
                          <Card className="w-full overflow-x-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
                              <CardTitle className="text-lg font-semibold flex items-center text-purple-700 dark:text-purple-500">
                                <Home className="mr-2 text-purple-500" />
                                Historial de Residencias
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              {isLoadingParticipantResidences ? (
                                <p className="text-center text-gray-500">Cargando residencias...</p>
                              ) : (participantResidences?.length ?? 0 > 0) ? (
                                participantResidences.map((residence: any) => (
                                  <div
                                    key={residence.id}
                                    className="flex items-start space-x-4 p-3 rounded-lg shadow-sm border border-sidebar-border"
                                  >
                                    <div className="flex-1">
                                      <h4 className="font-semibold">{residence.residence.name}</h4>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                          {new Date(residence.admission_date).toLocaleDateString("es-ES")} -{" "}
                                          {residence.departure_date
                                            ? new Date(residence.departure_date).toLocaleDateString("es-ES")
                                            : "Presente"}
                                        </span>
                                      </div>
                                    </div>
                                    <Badge
                                      variant={residence.status == 'Finalizado' ? "secondary" : residence.status == 'Expulsado' ? "destructive" : "default"}
                                      className={residence.status == 'Finalizado' ? "bg-blue-500 dark:bg-blue-500 hover:bg-blue-400 dark:hover:bg-blue-400" : residence.status == 'Expulsado' ? "bg-red-500 dark:bg-red-500 hover:bg-red-400 dark:hover:bg-red-400" : residence.status == 'Residencia en Curso' ? "bg-green-500 dark:bg-green-500 hover:bg-green-400 dark:hover:bg-green-400" : "bg-gray-500 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-400"}
                                    >
                                      {residence.status}
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-gray-500">No hay registros de residencias.</p>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="w-full overflow-x-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
                              <CardTitle className="text-lg font-semibold flex items-center text-green-700 dark:text-green-500">
                                <FileText className="mr-2 text-green-500" />
                                Eventos
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              {isLoadingEvents ? (
                                <p className="text-center text-gray-500">Cargando eventos...</p>
                              ) : events && events.length > 0 ? (
                                events?.map((event: any) => (
                                  <div
                                    key={event.id}
                                    className="flex items-start space-x-4 p-3 rounded-lg shadow-sm border border-sidebar-border"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{event.type}</Badge>
                                        <span className="text-sm text-gray-500">
                                          {new Date(event.date).toLocaleDateString("es-ES")}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm">{event.description}</p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-gray-500">No hay registros de eventos.</p>
                              )}
                            </CardContent>
                          </Card>
                      </div>
                    ) : (
                      <p className="dark:text-sidebar-foreground">Seleccione un participante para ver su información.</p>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  )
}

