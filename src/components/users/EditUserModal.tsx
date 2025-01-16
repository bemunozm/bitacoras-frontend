import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import ErrorMessage from "@/components/ErrorMessage"
import { updateUser, getUserById } from "@/api/UserAPI"
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react"
import { useState, useEffect } from "react"
import { getRoles } from "@/api/RoleAPI"
import type { Role } from "@/types"
import { Check, ChevronsUpDown } from "lucide-react"
import LoadingSpinner from "../LoadingSpinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, User } from 'lucide-react'

type EditUserModalProps = {
  id: number
  setIsOpen: (isOpen: boolean) => void
}

export function EditUserModal({ id, setIsOpen }: EditUserModalProps) {
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id
  })

  const initialValues = {
    name: '',
    job_position: '',
    email: '',
    phone: '',
    run: '',
    profile_image: '',
    roles: []
  }

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: initialValues })

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('job_position', user.job_position || '')
      setValue('email', user.email)
      setValue('phone', user.phone || '')
      setValue('run', user.run)
      setValue('profile_image', user.profile_image || '')
      setSelectedRoles(user.roles ? user.roles.filter((role: Role | undefined): role is Role => role !== undefined).map((role: Role) => role.id) : [])
      setPreviewImage(user.profile_image ? `${import.meta.env.VITE_BACKEND_URL}${user.profile_image}` : null)
    }
  }, [user, setValue])

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: updateUser,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Usuario actualizado!',
        description: data,
      })
      setIsOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  const handleUpdate = (formData: any) => {
    mutate({ ...formData, roles: selectedRoles, id: id, profile_image: selectedImage })
  }

  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  })

  const handleRoleChange = (selected: number[]) => {
    setSelectedRoles(selected);
  };

  const [isHovered, setIsHovered] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoadingUser) return <LoadingSpinner className="h-10" />

  return (
    <form noValidate onSubmit={handleSubmit(handleUpdate)} className="space-y-6 px-4">
      <div className="grid gap-4 py-4">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <Avatar 
            className="w-24 h-24 cursor-pointer relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => document.getElementById('profile_image')?.click()}
          >
            <AvatarImage src={previewImage || ''} alt="Foto de Perfil" />
            <AvatarFallback><User/></AvatarFallback>
            {isHovered && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
          </Avatar>
          <input 
            type="file" 
            id="profile_image" 
            name='profile_image'
            className="hidden" 
            accept="image/*"
            onChange={handleImageChange}
          />
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
          <Label htmlFor="job_position" className="text-right dark:text-sidebar-foreground">
            Cargo
          </Label>
          <Input
            id="job_position"
            placeholder="Gerente"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('job_position')}
          />
          {errors.job_position && <ErrorMessage className=" col-start-2 col-end-4">{errors.job_position.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right dark:text-sidebar-foreground">
            Correo Electrónico
          </Label>
          <Input
            id="email"
            placeholder="juan.perez@example.com"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('email', { required: 'Este campo es requerido' })}
          />
          {errors.email && <ErrorMessage className=" col-start-2 col-end-4">{errors.email.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right dark:text-sidebar-foreground">
            Teléfono
          </Label>
          <Input
            id="phone"
            placeholder="+56912345678"
            className="col-span-3 dark:text-sidebar-foreground"
            {...register('phone')}
          />
          {errors.phone && <ErrorMessage className=" col-start-2 col-end-4">{errors.phone.message}</ErrorMessage>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="roles" className="text-right dark:text-sidebar-foreground">
            Roles
          </Label>
          <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
            {isLoadingRoles ? (
              <p>Cargando Roles</p>
            ) : (
              <Listbox value={selectedRoles} onChange={handleRoleChange} multiple >
                <div className="relative">
                  <ListboxButton className="w-full cursor-default rounded-md py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-sidebar-foreground shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-accent sm:text-sm sm:leading-6">
                    <span className="block truncate">
                      {selectedRoles.length > 0
                        ? selectedRoles
                          .map((id) => roles!.find((role: Role) => role.id === id)?.name)
                          .filter(Boolean)
                          .join(', ')
                        : 'Selecciona uno o más roles'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronsUpDown aria-hidden="true" className="h-5 w-5 text-gray-400" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black py-1 text-base shadow-lg ring-1 ring-black dark:ring-sidebar-border ring-opacity-5 focus:outline-none sm:text-sm">
                    {roles!.map((role: Role) => (
                      <ListboxOption
                        key={role.id}
                        value={role.id}
                        className={({ active, selected }) =>
                          `relative cursor-default select-none py-2 pl-8 pr-4 ${active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-gray-900 dark:text-sidebar-foreground'} ${selected ? 'font-semibold' : 'font-normal'}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                              {role.name}
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
            )}
          </div>
          {errors.roles && <ErrorMessage className=" col-start-2 col-end-4">{errors.roles.message}</ErrorMessage>}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}
