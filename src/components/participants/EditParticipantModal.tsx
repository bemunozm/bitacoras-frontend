import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { updateParticipant, getParticipant } from "@/api/ParticipantAPI"
import { useEffect, useState } from "react"
import LoadingSpinner from "../LoadingSpinner"

type EditParticipantFormProps = {
  id: number
  setIsOpen: (isOpen: boolean) => void
}

export function EditParticipantModal({ id, setIsOpen }: EditParticipantFormProps) {

  const calculateAge = (birthdate: string) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
    return age.toString();
  };

  const { data: participant, isLoading: isLoadingParticipant } = useQuery({
    queryKey: ['editParticipant', +id!],
    queryFn: () => getParticipant(id),
    enabled: !!id
  })

  const initialValues = {
    name: participant?.name || '',
    run: participant?.run || '',
    age: participant?.birthdate ? calculateAge(participant.birthdate) : '' ,
    birthdate: '',
    nationality: '',
    gender: ''
  }

  const { register, handleSubmit, reset, setValue, formState: { errors }, watch } = useForm({ defaultValues: initialValues })

  useEffect(() => {
    if (participant) {
      setValue('name', participant.name)
      setValue('run', participant.run)
      setValue('age', participant?.birthdate ? calculateAge(participant.birthdate) : '')
      setValue('birthdate', participant.birthdate ? new Date(participant.birthdate).toISOString().split('T')[0] : '')
      setValue('nationality', participant.nationality || '')
      setValue('gender', participant.gender || '')
    }
  }, [participant, setValue])

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'birthdate' && value.birthdate) {
        setValue('age', calculateAge(value.birthdate));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  

  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false);

  const { mutate } = useMutation({
    mutationFn: updateParticipant,
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
        title: '🎉Participante actualizado!',
        description: data,
      })
      setIsOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['participant', +id!] }) 
      queryClient.invalidateQueries({ queryKey: ['editParticipant', +id!] })
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    }
  })

  const handleUpdate = (formData: any) => {
    setIsSaving(true);
    if (formData.birthdate) {
      formData.birthdate = new Date(formData.birthdate).toISOString();
    }
    delete formData.age
    mutate({ ...formData, id: id })
  }

  if (isLoadingParticipant) return <LoadingSpinner className="h-10" />

  return (
    <form noValidate onSubmit={handleSubmit(handleUpdate)} className="space-y-6 px-4">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right dark:text-sidebar-foreground">
            Nombre
          </Label>
          <Input
            id="name"
            placeholder="Juan Perez"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('name', { required: 'Este campo es requerido' })}
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
            {...register('run', { required: 'Este campo es requerido' })}
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
            value={participant?.gender || ''}
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
            readOnly
            disabled
            {...register('age')}
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
          {errors.birthdate && <ErrorMessage className=" col-start-2 col-end-4">{errors.birthdate.message?.toString()}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nationality" className="text-right dark:text-sidebar-foreground">
            Nacionalidad
          </Label>
          <Input
            id="nationality"
            placeholder="Chilena"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('nationality')}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}
