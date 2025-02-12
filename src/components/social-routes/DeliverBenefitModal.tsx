import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { deliverBenefits, getParticipants } from "@/api/ParticipantAPI"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import LoadingSpinner from "../LoadingSpinner"
import { ParticipantForm } from "@/components/participants/ParticipantForm"
import { getProvisions } from "@/api/ProvisionAPI"
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { MultiSelect } from "@/components/ui/multi-select"

type DeliverBenefitModalProps = {
  setIsOpen: (isOpen: boolean) => void
  isParticipantFormOpen: boolean
  setIsParticipantFormOpen: (isOpen: boolean) => void
  date: Date
  turn: string
  participantId?: number
}

export default function DeliverBenefitModal({
  setIsOpen,
  isParticipantFormOpen,
  setIsParticipantFormOpen,
  date,
  turn,
  participantId,
}: DeliverBenefitModalProps) {
  const initialValues = {
    participant_id: participantId,
    benefits: {
      food: "",
      shelter: [],
      hygiene: [],
    },
  }

  const {
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({ defaultValues: initialValues })

  const queryClient = useQueryClient()

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ["participants"],
    queryFn: () => getParticipants(),
  })

  const { data: provisions, isLoading: isLoadingProvisions } = useQuery({
    queryKey: ["provisions"],
    queryFn: () => getProvisions(),
  })

  const [isSaving, setIsSaving] = useState(false)
  const isMobile = useIsMobile()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { mutate } = useMutation({
    mutationFn: (data: any) => deliverBenefits(data),
    onError: (error) => {
      setIsSaving(false)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
    onSuccess: (data) => {
      setIsSaving(false)
      toast({
        title: "🎉Beneficio entregado!",
        description: data,
      })
      reset()
      setIsOpen(false)
      queryClient.invalidateQueries({ queryKey: ["benefits"] })
      queryClient.invalidateQueries({ queryKey: ["provisions", participantId] })
    },
  })

  const handleDeliver = (formData: any) => {
    setIsSaving(true)
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
    const dataToSend = {
      ...formData,
      date,
      turn,
      benefits: [selectedFood, ...selectedShelter, ...selectedHygiene],
    }
    mutate(dataToSend)
  }

  const [selectedFood, setSelectedFood] = useState<number | null>(null)
  const [selectedShelter, setSelectedShelter] = useState<string[]>([])
  const [selectedHygiene, setSelectedHygiene] = useState<string[]>([])

  const handleProvisionChange = (category: string, selected: any) => {
    if (category === "food") setSelectedFood(selected)
    if (category === "shelter") setSelectedShelter(selected)
    if (category === "hygiene") setSelectedHygiene(selected)
  }

  useEffect(() => {
    const currentHour = new Date().getHours()
    if (currentHour < 13) {
      const defaultFood = provisions?.find((provision) => provision.name === "Desayuno AM")
      if (defaultFood) setSelectedFood(defaultFood.id)
    } else {
      const defaultFood = provisions?.find((provision) => provision.name === "Almuerzo PM")
      if (defaultFood) setSelectedFood(defaultFood.id)
    }
  }, [provisions])

  useEffect(() => {
    setValue("participant_id", participantId)
  }, [participantId, setValue])

  if (isLoadingParticipants || isLoadingProvisions) return <LoadingSpinner className="h-10" />

  const foodProvisions = provisions?.filter((provision) => provision.category?.name === "Alimentación") || []
  const shelterProvisions = provisions?.filter((provision) => provision.category?.name === "Abrigo") || []
  const hygieneProvisions = provisions?.filter((provision) => provision.category?.name === "Higiene") || []

  return (
    <>
      {!isParticipantFormOpen ? (
        <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleDeliver)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="participant_id" className="text-right dark:text-sidebar-foreground">
                Participante
              </Label>
              {isMobile ? (
                <Drawer open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <DrawerTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
                      disabled={participantId ? true : false}
                    >
                      {participants?.find((participant) => participant.id === watch("participant_id"))?.name ||
                        "Seleccione un participante"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mt-4 border-t">
                      <Command>
                        <CommandInput placeholder="Buscar participante..." className="h-9 text-base" />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron participantes.
                            <Button className="font-bold" variant="link" onClick={() => setIsParticipantFormOpen(true)}>
                              Crear nuevo participante
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {participants?.map((participant) => (
                              <CommandItem
                                value={`${participant.name} (${participant.run})`}
                                key={participant.id}
                                onSelect={() => {
                                  setValue("participant_id", participant.id)
                                  setIsPopoverOpen(false)
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
                    <Button
                      variant="outline"
                      role="combobox"
                      className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
                      disabled={participantId ? true : false}
                    >
                      {participants?.find((participant) => participant.id === watch("participant_id"))?.name ||
                        "Seleccione un participante"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar participante..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>
                          No se encontraron participantes.
                          <Button className="font-bold" variant="link" onClick={() => setIsParticipantFormOpen(true)}>
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
              {errors.participant_id && (
                <ErrorMessage className=" col-start-2 col-end-4">
                  {errors.participant_id.message?.toString()}
                </ErrorMessage>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="food" className="text-right dark:text-sidebar-foreground">
                Alimentación
              </Label>
              <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
                <Select
                  value={selectedFood?.toString()}
                  onValueChange={(value) => handleProvisionChange("food", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una prestación" />
                  </SelectTrigger>
                  <SelectContent>
                    {foodProvisions.map((provision) => (
                      <SelectItem key={provision.id} value={provision.id.toString()}>
                        {provision.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shelter" className="text-right dark:text-sidebar-foreground">
                Abrigo
              </Label>
              <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
                <MultiSelect
                  options={shelterProvisions.map((provision) => ({
                    label: provision.name,
                    value: provision.id.toString(),
                  }))}
                  selected={selectedShelter}
                  onChange={(selected) => handleProvisionChange("shelter", selected)}
                  placeholder="Selecciona una o más prestaciones"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hygiene" className="text-right dark:text-sidebar-foreground">
                Higiene
              </Label>
              <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
                <MultiSelect
                  options={hygieneProvisions.map((provision) => ({
                    label: provision.name,
                    value: provision.id.toString(),
                  }))}
                  selected={selectedHygiene}
                  onChange={(selected) => handleProvisionChange("hygiene", selected)}
                  placeholder="Selecciona una o más prestaciones"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      ) : (
        <ParticipantForm setIsOpen={setIsParticipantFormOpen} />
      )}
    </>
  )
}

