import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import type { ParticipantForm } from "@/types"
import ErrorMessage from "@/components/ErrorMessage"
import { createParticipant } from "@/api/ParticipantAPI"
import { useEffect, useState } from "react"
import { validarIdentificacion } from "@/helpers"
import { countries } from "@/data/countries";
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
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Check, ChevronsUpDown } from "lucide-react"

type ParticipantFormProps = {
  setIsOpen: (isOpen: boolean) => void
}

export function ParticipantForm({setIsOpen}: ParticipantFormProps) {

    const initialValues = {
        name: '',
        run: '',
        age: '',
        birthdate: '',
        nationality: '',
        gender: ''
    }

    const {register, handleSubmit, reset, formState: {errors}, setValue, watch} = useForm({defaultValues: initialValues})

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'birthdate' && value.birthdate) {
                const birthDate = new Date(value.birthdate);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();
                const dayDifference = today.getDate() - birthDate.getDate();
                if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
                    age--;
                }
                setValue('age', age.toString());
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    const queryClient = useQueryClient()
    const [isSaving, setIsSaving] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const isMobile = useIsMobile();

    const {mutate} = useMutation({
        mutationFn: createParticipant,
        onError: (error) => {
            setIsSaving(false);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            setIsSaving(false);
            toast({
                title: '🎉Participante creado!',
                description: data,
            })
            setIsOpen(false)
            reset()
            queryClient.invalidateQueries({queryKey: ['participants']})
        }
    })
    
    const handleCreate = (formData: any) => {
        setIsSaving(true);
        if (formData.birthdate) {
            formData.birthdate = new Date(formData.birthdate).toISOString();
        }
        delete formData.age;
        mutate(formData)
    }

  return (
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-6 px-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
                    Nombre
                    </Label>
                    <Input
                        id="name"
                        placeholder="Juan Perez" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('name', {required: 'Este campo es requerido'})}
                    />
                    {errors.name && <ErrorMessage className=" col-start-2 col-end-4">{errors.name.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="run" className="text-right dark:text-sidebar-foreground">
                    RUN
                    </Label>
                    <Input
                        id="run"
                        placeholder="12.345.678-9" 
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('run', {
                            required: 'Este campo es requerido',
                            validate: (value) => {
                                if (value) {
                                    return validarIdentificacion(value) || 'Ingrese un RUN válido';
                                }
                        }})}	
                    />
                    {errors.run && <ErrorMessage className=" col-start-2 col-end-4">{errors.run.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gender" className="text-right dark:text-sidebar-foreground">
                    Género
                    </Label>
                    <Select
                        {...register('gender')}
                        onValueChange={(value) => setValue('gender', value)}
                    >
                        <SelectTrigger className="col-span-3 dark:text-sidebar-foreground">
                            <SelectValue placeholder="Selecciona un género">
                                {watch('gender')}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right dark:text-sidebar-foreground">
                    Edad
                    </Label>
                    <Input
                        id="age"
                        placeholder="Seleccione una fecha"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('age')}
                        readOnly
                        disabled
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="birthdate" className="text-right dark:text-sidebar-foreground">
                    Fecha de Nacimiento
                    </Label>
                    <Input
                        id="birthdate"
                        type="date"
                        className="col-span-3 dark:text-sidebar-foreground"
                        {...register('birthdate', { 
                            required: 'Este campo es obligatorio',
                            validate: (value) => {
                            if (value) {
                                const selectedDate = new Date(value);
                                const today = new Date();
                                
                                // Setear la hora a 00:00:00 para que solo se compare la fecha
                                selectedDate.setHours(0, 0, 0, 0);
                                today.setHours(0, 0, 0, 0);

                                return selectedDate < today || 'Ingrese una fecha válida';
                            }
                            }
                        })}
                    />
                    {errors.birthdate && <ErrorMessage className=" col-start-2 col-end-4">{errors.birthdate.message}</ErrorMessage>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nationality" className="text-right dark:text-sidebar-foreground">
                    Nacionalidad
                    </Label>
                    {isMobile ? (
                        <Drawer open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <DrawerTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            className="col-span-3 dark:text-sidebar-foreground w-full justify-between"
                            >
                            {watch('nationality') || "Seleccione una nacionalidad"}
                            <ChevronsUpDown className="opacity-50" />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="mt-4 border-t">
                            <Command>
                                <CommandInput placeholder="Buscar nacionalidad..." className="h-9 text-base" />
                                <CommandList>
                                <CommandEmpty>
                                    No se encontraron nacionalidades.
                                </CommandEmpty>
                                <CommandGroup>
                                    {countries.map((country) => (
                                    <CommandItem
                                        value={country}
                                        key={country}
                                        onSelect={() => {
                                        setValue('nationality', country);
                                        setIsPopoverOpen(false);
                                        }}
                                    >
                                        {country}
                                        <Check
                                        className={cn(
                                            "ml-auto",
                                            country === watch('nationality') ? "opacity-100" : "opacity-0"
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
                            {watch('nationality') || "Seleccione una nacionalidad"}
                            <ChevronsUpDown className="opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                            <CommandInput placeholder="Buscar nacionalidad..." className="h-9" />
                            <CommandList>
                                <CommandEmpty>
                                No se encontraron nacionalidades.
                                </CommandEmpty>
                                <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                    value={country}
                                    key={country}
                                    onSelect={() => setValue('nationality', country)}
                                    >
                                    {country}
                                    <Check
                                        className={cn(
                                        "ml-auto",
                                        country === watch('nationality') ? "opacity-100" : "opacity-0"
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
                </div>
                
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
  )
}
