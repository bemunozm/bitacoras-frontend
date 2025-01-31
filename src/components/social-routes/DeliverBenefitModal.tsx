import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import ErrorMessage from "@/components/ErrorMessage";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { deliverBenefits, getParticipants } from "@/api/ParticipantAPI"; // Asume que tienes una API para obtener participantes
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
import { ParticipantForm } from "@/components/participants/ParticipantForm";
import { getProvisions } from "@/api/ProvisionAPI"; // Asume que tienes una API para obtener prestaciones
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";

type DeliverBenefitModalProps = {
  setIsOpen: (isOpen: boolean) => void;
  isParticipantFormOpen: boolean;
  setIsParticipantFormOpen: (isOpen: boolean) => void;
  date: Date;
  turn: string;
  participantId?: number; // Nueva prop
};

export default function DeliverBenefitModal({ setIsOpen, isParticipantFormOpen, setIsParticipantFormOpen, date, turn, participantId }: DeliverBenefitModalProps) {
  const initialValues = {
    participant_id: participantId, // Preseleccionar participante
    benefits: {
      food: '',
      shelter: [],
      hygiene: [],
    },
  };

  const {  handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({ defaultValues: initialValues });

  const queryClient = useQueryClient();

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['participants'],
    queryFn: () => getParticipants(),
  });

  const { data: provisions, isLoading: isLoadingProvisions } = useQuery({
    queryKey: ['provisions'],
    queryFn: () => getProvisions(),
  });

  const { mutate } = useMutation({
    mutationFn: (data: any) => deliverBenefits(data),
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Beneficio entregado!',
        description: data,
      });
      reset();
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      queryClient.invalidateQueries({ queryKey: ['provisions', participantId] });
    }
  });

  const handleDeliver = (formData: any) => {
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajustar la fecha para evitar el desfase de un día
    const dataToSend = {
      ...formData,
      date,
      turn,
      benefits: [
        selectedFood,
        ...selectedShelter,
        ...selectedHygiene,
      ],
    };
    mutate(dataToSend);
  };

  const [selectedFood, setSelectedFood] = useState<number | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<number[]>([]);
  const [selectedHygiene, setSelectedHygiene] = useState<number[]>([]);

  const handleProvisionChange = (category: string, selected: any) => {
    if (category === 'food') setSelectedFood(selected);
    if (category === 'shelter') setSelectedShelter(selected);
    if (category === 'hygiene') setSelectedHygiene(selected);
  };

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 13) {
      const defaultFood = provisions?.find(provision => provision.name === 'Desayuno AM');
      if (defaultFood) setSelectedFood(defaultFood.id);
    } else {
      const defaultFood = provisions?.find(provision => provision.name === 'Almuerzo PM');
      if (defaultFood) setSelectedFood(defaultFood.id);
    }
  }, [provisions]);

  useEffect(() => {
    setValue('participant_id', participantId); // Preseleccionar participante
  }, [participantId, setValue]);

  if (isLoadingParticipants || isLoadingProvisions) return <LoadingSpinner className="h-10" />;

  const foodProvisions = provisions?.filter(provision => provision.category?.name === 'Alimentación') || [];
  const shelterProvisions = provisions?.filter(provision => provision.category?.name === 'Abrigo') || [];
  const hygieneProvisions = provisions?.filter(provision => provision.category?.name === 'Higiene') || [];

  return (
    <>
      {!isParticipantFormOpen ? (
        <form className="space-y-6 px-4" noValidate onSubmit={handleSubmit(handleDeliver)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="participant_id" className="text-right dark:text-sidebar-foreground">
                Participante
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
                  >
                    {participants?.find(participant => participant.id === watch('participant_id'))?.name || "Seleccione un participante"}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar participante..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>
                        No se encontraron participantes.
                        <Button className='font-bold' variant="link" onClick={() => setIsParticipantFormOpen(true)}>
                          Crear nuevo participante
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {participants?.map((participant) => (
                          <CommandItem
                            value={`${participant.name} (${participant.run})`}
                            key={participant.id}
                            onSelect={() => setValue('participant_id', participant.id)}
                          >
                            {participant.name} ({participant.run})
                            <Check
                              className={cn(
                                "ml-auto",
                                participant.id === watch('participant_id') ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.participant_id && <ErrorMessage className=" col-start-2 col-end-4">{errors.participant_id.message?.toString()}</ErrorMessage>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="food" className="text-right dark:text-sidebar-foreground">
                Alimentación
              </Label>
              <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
                <Select value={selectedFood?.toString()} onValueChange={(value) => handleProvisionChange('food', value)}>
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
                <Listbox value={selectedShelter} onChange={(selected) => handleProvisionChange('shelter', selected)} multiple>
                  <div className="relative">
                    <ListboxButton className="w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-sidebar-foreground shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-accent sm:text-sm sm:leading-6">
                      <span className="block truncate">
                        {selectedShelter.length > 0
                          ? selectedShelter
                              .map((id) => shelterProvisions.find((provision) => provision.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')
                          : 'Selecciona una o más prestaciones'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown aria-hidden="true" className="h-5 w-5 text-gray-400" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black py-1 text-base shadow-lg ring-1 ring-black dark:ring-sidebar-border ring-opacity-5 focus:outline-none sm:text-sm">
                      {shelterProvisions.map((provision) => (
                        <ListboxOption
                          key={provision.id}
                          value={provision.id}
                          className={({ active, selected }) =>
                            `relative cursor-default select-none py-2 pl-8 pr-4 ${
                              active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-gray-900 dark:text-sidebar-foreground'
                            } ${selected ? 'font-semibold' : 'font-normal'}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                {provision.name}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-sidebar-ring">
                                  <Check aria-hidden="true" className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hygiene" className="text-right dark:text-sidebar-foreground">
                Higiene
              </Label>
              <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
                <Listbox value={selectedHygiene} onChange={(selected) => handleProvisionChange('hygiene', selected)} multiple>
                  <div className="relative">
                    <ListboxButton className="w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-sidebar-foreground shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-accent sm:text-sm sm:leading-6">
                      <span className="block truncate">
                        {selectedHygiene.length > 0
                          ? selectedHygiene
                              .map((id) => hygieneProvisions.find((provision) => provision.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')
                          : 'Selecciona una o más prestaciones'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown aria-hidden="true" className="h-5 w-5 text-gray-400" />
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black py-1 text-base shadow-lg ring-1 ring-black dark:ring-sidebar-border ring-opacity-5 focus:outline-none sm:text-sm">
                      {hygieneProvisions.map((provision) => (
                        <ListboxOption
                          key={provision.id}
                          value={provision.id}
                          className={({ active, selected }) =>
                            `relative cursor-default select-none py-2 pl-8 pr-4 ${
                              active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-gray-900 dark:text-sidebar-foreground'
                            } ${selected ? 'font-semibold' : 'font-normal'}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                {provision.name}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-sidebar-ring">
                                  <Check aria-hidden="true" className="h-5 w-5" />
                                </span>
                              )}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      ) : (
        <ParticipantForm setIsOpen={setIsParticipantFormOpen} />
      )}
    </>
  );
}
