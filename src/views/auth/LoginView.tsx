import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import {useForm} from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { UserLoginForm } from '@/types'
import { authenticateUser } from '@/api/AuthAPI'
import ErrorMessage from '@/components/ErrorMessage'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export default function LoginView({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"div">) {

    const {toast} = useToast()
    const {refetch} = useAuth()

    const initialValues: UserLoginForm = {
        email: '',
        password: '',
      }
      const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: initialValues })
      const navigate = useNavigate()
    
      const { mutate } = useMutation({
        mutationFn: authenticateUser,
        onError: (error) => {
           toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive'
           })
        },
        onSuccess: () => {
            toast({
              title: '🎉Bienvenido!',
              description: 'Inicio de sesion exitoso',
            })
            reset()
            refetch()
            navigate('/')
        }
      })
    
      const handleLogin = (formData: UserLoginForm) => mutate(formData)

  return (
    <div className={cn("flex flex-col gap-6",   )} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ingrese a su cuenta</CardTitle>
          <CardDescription>
            Escriba sus credenciales abajo para ingresar a su cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleLogin)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
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
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    to="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Olvido su contraseña?
                  </Link>
                </div>
                <Input id="password" type="password" required {...register('password', {required: true, min:8})} />
                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
              </div>
              <Button type="submit" className="w-full">
                Iniciar Sesion
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              No tiene cuenta? {""}
              <a href="#" className="underline underline-offset-4">
                Contactese con nosotros
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
