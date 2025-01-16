import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from '@tanstack/react-query'
import type { ConfirmToken, NewPasswordForm } from "../../types";
import ErrorMessage from "@/components/ErrorMessage";
import { updatePasswordWithToken } from "@/api/AuthAPI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type NewPasswordFormProps = {
    token: ConfirmToken['token']
}

export default function NewPasswordForm({token} : NewPasswordFormProps) {

    const {toast} = useToast()

    const navigate = useNavigate()
    const initialValues: NewPasswordForm = {
        password: '',
        password_confirmation: '',
    }
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

    const { mutate } = useMutation({
        mutationFn: updatePasswordWithToken,
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
            reset()
            navigate('/auth/login')
        }
    })

    const handleNewPassword = (formData: NewPasswordForm) => {
        const data = {
            formData,
            token
        }
        mutate(data)
    }

    const password = watch('password');

    return (
        <>
            <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-8" noValidate>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Contraseña de Registro"
                            required
                            {...register("password", {
                                required: "La contraseña es obligatoria",
                                minLength: {
                                    value: 8,
                                    message: 'La contraseña debe ser mínimo de 8 caracteres'
                                }
                            })}
                        />
                        {errors.password && (
                            <ErrorMessage>{errors.password.message}</ErrorMessage>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Repetir Contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            placeholder="Repite la contraseña"
                            required
                            {...register("password_confirmation", {
                                required: "Repetir la contraseña es obligatorio",
                                validate: value => value === password || 'Las contraseñas no son iguales'
                            })}
                        />
                        {errors.password_confirmation && (
                            <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>
                        )}
                    </div>
                    <Button type="submit" className="w-full">Establecer Contraseña</Button>
                </div>
            </form>
        </>
    )
}