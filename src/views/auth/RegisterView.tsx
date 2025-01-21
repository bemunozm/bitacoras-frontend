import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { UserRegistrationForm } from '@/types'
import { createAccount } from '@/api/AuthAPI'
import ErrorMessage from '@/components/ErrorMessage'
import { useToast } from '@/hooks/use-toast'

export default function RegisterView({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"div">) {

    const {toast} = useToast()

    const initialValues: UserRegistrationForm = {
        run: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: ''
      }
      const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({ defaultValues: initialValues })
      const navigate = useNavigate()
    
      const { mutate } = useMutation({
        mutationFn: createAccount,
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            toast({
                title: '🎉Cuenta creada!',
                description: data,
            })
            reset()
            navigate('/auth/login')
        }
      })
    
      const handleRegister = (formData: UserRegistrationForm) => mutate(formData)

      const password = watch('password')

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Cree su nueva cuenta</CardTitle>
          <CardDescription>
            Rellene el formulario para crear una nueva cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleRegister)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="run">RUT</Label>
                <Input
                  id="run"
                  type="text"
                  placeholder="12.345.678-9"
                  required
                  {...register('run', { 
                    required: true,
                    pattern: {
                        value: /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$/,
                        message: "RUT no cumple formato válido 12.345.678-9",
                    } 
                    })}
                    
                  
                />
                {errors.run && <ErrorMessage>{errors.run.message}</ErrorMessage>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Perez"
                  required
                  {...register('name', { required: true })}
                />
                {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@ejemplo.com"
                  required
                  {...register("email", {
                    required: "El Email de registro es obligatorio",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "E-mail no válido",
                    },
                  })}
                />
                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56912345678"
                  required
                  {...register("phone", {
                    required: "El Teléfono de registro es obligatorio",
                    pattern: {
                      value: /^\+569\d{8}$/,
                      message: "Teléfono no cumple formato válido +56912345678",
                    },
                  })}
                />
                {errors.phone && <ErrorMessage>{errors.phone.message}</ErrorMessage>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe ser mínimo de 8 caracteres'
                    }
                  })}
                />
                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  required
                  {...register("password_confirmation", {
                    required: "Repetir la contraseña es obligatorio",
                    validate: value => value === password || 'Las contraseñas no son iguales'
                  })}
                />
                {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation.message}</ErrorMessage>}
              </div>
              <Button type="submit" className="w-full">
                Crear Cuenta
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              ¿Ya tiene una cuenta? {""}
              <Link to="/auth/login" className="underline underline-offset-4">
                Iniciar Sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
