import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, User } from 'lucide-react'
import ErrorMessage from '@/components/ErrorMessage'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile, updateCurrentUserPassword } from '@/api/AuthAPI'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export default function EditProfileView() {
    const initialProfileValues = {
        name: '',
        email: '',
        phone: ''
    }

    const initialPasswordValues = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    const [isHovered, setIsHovered] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const { register: registerProfile, handleSubmit: handleSubmitProfile, setValue: setValueProfile, formState: { errors: errorsProfile } } = useForm({ defaultValues: initialProfileValues })
    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: errorsPassword }, reset, getValues } = useForm({ defaultValues: initialPasswordValues })

    const {data} = useAuth()

    useEffect(() => {
        // Set default values
        if(data) {
            setValueProfile('name', data.name)
            setValueProfile('email', data.email)
            data.phone && setValueProfile('phone', data.phone)
        }
    }, [setValueProfile, data])

    const queryClient = useQueryClient()

    const { mutate: mutateProfile } = useMutation({
        mutationFn: updateProfile,
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            toast({
                title: '🎉Perfil actualizado!',
                description: data,
            })
            queryClient.invalidateQueries({ queryKey: ['user'] })
        }
    })

    const { mutate: mutatePassword } = useMutation({
        mutationFn: updateCurrentUserPassword,
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            toast({
                title: '🎉Contraseña actualizada!',
                description: data,
            })
            reset({ ...getValues(), currentPassword: '', newPassword: '', confirmPassword: '' })
        }
    })

    const onSubmitProfile = (data: any) => {
        mutateProfile({...data, profile_image: selectedImage})
    }

    const onSubmitPassword = (data: any) => {
        if (data.newPassword !== data.confirmPassword) {
            toast({
                title: 'Error',
                description: 'Las nuevas contraseñas no coinciden',
                variant: 'destructive'
            })
            return
        }
        mutatePassword({
            current_password: data.currentPassword,
            password: data.newPassword,
            password_confirmation: data.confirmPassword
        })
    }

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

    return (
        <div className="container max-w-3xl mx-auto p-6">
            <div className="space-y-2 mb-8">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <Avatar 
                        className="w-24 h-24 cursor-pointer relative"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => document.getElementById('profile_image')?.click()}
                    >
                        <AvatarImage src={previewImage || (data?.profile_image ? `${import.meta.env.VITE_BACKEND_URL}${data.profile_image}` : '')} alt="Foto de Perfil" />
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
                <h1 className="text-2xl font-semibold text-center dark:text-sidebar-primary-foreground">{data?.name || ''}</h1>
                <p className="text-muted-foreground text-center dark:text-sidebar-primary-foreground">{data?.job_position || ''}</p>
            </div>

            <form noValidate onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-6 dark:text-sidebar-primary-foreground">Informacion Personal</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className='dark:text-sidebar-primary-foreground'>Nombre</Label>
                            <Input className='dark:text-sidebar-primary-foreground' id="name" {...registerProfile('name', { required: 'El nombre no puede ir vacio' })} />
                            {errorsProfile.name && <ErrorMessage>{errorsProfile.name.message}</ErrorMessage>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className='dark:text-sidebar-primary-foreground'>Email</Label>
                            <Input className='dark:text-sidebar-primary-foreground' id="email" type="email" {...registerProfile('email', { required: 'El nombre no puede ir vacio' })} />
                            {errorsProfile.email && <ErrorMessage>{errorsProfile.email.message}</ErrorMessage>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="phone" className='dark:text-sidebar-primary-foreground'>Telefono</Label>
                            <Input className='dark:text-sidebar-primary-foreground' id="phone" type="tel" {...registerProfile('phone', { required: 'El nombre no puede ir vacio' })} />
                            {errorsProfile.phone && <ErrorMessage>{errorsProfile.phone.message}</ErrorMessage>}
                        </div>
                    </div>
                </section>

                <Button type="submit" className="w-full items-end sm:w-auto" variant="default">
                    Guardar Cambios
                </Button>
            </form>

            <form noValidate onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-8 mt-8">
                <section>
                    <h2 className="text-xl font-semibold mb-6 dark:text-sidebar-primary-foreground">Cambiar contraseña</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="current-password" className='dark:text-sidebar-primary-foreground'>Contraseña Actual</Label>
                            <Input
                                className='dark:text-sidebar-primary-foreground' 
                                id="current-password" 
                                type="password" 
                                {...registerPassword('currentPassword', { required: 'Debes llenar todos los campos para cambiar tu contraseña' })} 
                            />
                            {errorsPassword.currentPassword && <ErrorMessage>{errorsPassword.currentPassword.message}</ErrorMessage>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className='dark:text-sidebar-primary-foreground'>Nueva Contraseña</Label>
                            <Input 
                                className='dark:text-sidebar-primary-foreground'
                                id="new-password" 
                                type="password" 
                                {...registerPassword('newPassword', { required: 'Debes llenar todos los campos para cambiar tu contraseña' })} 
                            />
                            {errorsPassword.newPassword && <ErrorMessage>{errorsPassword.newPassword.message}</ErrorMessage>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="confirm-password" className='dark:text-sidebar-primary-foreground'>Confirmar Contraseña</Label>
                            <Input 
                                className='dark:text-sidebar-primary-foreground'
                                id="confirm-password" 
                                type="password" 
                                {...registerPassword('confirmPassword', { required: 'Debes llenar todos los campos para cambiar tu contraseña' })} 
                            />
                            {errorsPassword.confirmPassword && <ErrorMessage>{errorsPassword.confirmPassword.message}</ErrorMessage>}
                        </div>
                    </div>
                </section>

                <Button type="submit" className="w-full items-end sm:w-auto" variant="default">
                    Cambiar Contraseña
                </Button>
            </form>
        </div>
    )
}
