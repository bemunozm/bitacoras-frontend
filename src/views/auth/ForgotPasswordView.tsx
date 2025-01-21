import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from '@tanstack/react-query'
import { ForgotPasswordForm } from "../../types";
import ErrorMessage from "@/components/ErrorMessage";
import { forgotPassword } from "@/api/AuthAPI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordView({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"div">) {
  const initialValues: ForgotPasswordForm = {
    email: ''
  }

  const { toast } = useToast()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

  const { mutate } = useMutation({
    mutationFn: forgotPassword,
    onError: (error) => {
        toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive'
        })
    },
    onSuccess: (data) => {
        toast({
            title: '🎉Instrucciones enviadas!',
            description: data,
        })
        reset()
    }
  })
  
  const handleForgotPassword = (formData: ForgotPasswordForm) => mutate(formData)

  return (
    <div className={cn("flex flex-col gap-6",   )} {...props}>
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Reestablecer contraseña</CardTitle>
                <CardDescription>
                    ¿Olvidaste tu password? coloca tu email y reestable tu contraseña.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handleForgotPassword)} noValidate>
                <CardContent>
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
                      <Button
                          type="submit"
                          className="w-full "
                      >
                        Enviar Instrucciones
                      </Button>
                    </div>
                </CardContent>
            </form>
            <nav className="my-5 flex flex-col space-y-4">
                <Link
                    to='/auth/login'
                    className="text-center text-gray-400 hover:text-gray-500 font-normal"
                >
                    ¿Ya tienes cuenta? Iniciar Sesión
                </Link>
                {/* <Link
                    to='/auth/register'
                    className="text-center text-gray-400 hover:text-gray-500 font-normal"
                >
                    ¿No tienes cuenta? Crea una
                </Link> */}
            </nav>
        </Card>
    </div>
  )
}