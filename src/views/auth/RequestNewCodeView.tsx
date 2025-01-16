import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from '@tanstack/react-query'
import { RequestConfirmationCodeForm } from "../../types";
import ErrorMessage from "@/components/ErrorMessage";
import { requestConfirmationCode } from "@/api/AuthAPI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function RequestNewCodeView({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"div">) {

    const {toast} = useToast()

    const initialValues: RequestConfirmationCodeForm = {
        email: ''
    }

    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initialValues });

    const { mutate } = useMutation({
        mutationFn: requestConfirmationCode,
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            toast({
                title: '🎉Código enviado!',
                description: data,
            })
        }
    })

    const handleRequestCode = (formData: RequestConfirmationCodeForm) => mutate(formData)

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Solicitar Código de Confirmación</CardTitle>
                    <CardDescription>
                        Coloca tu e-mail para recibir un nuevo código.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(handleRequestCode)} noValidate>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Email de Registro"
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
                                className="w-full"
                            >
                                Enviar Código
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
                    <Link
                        to='/auth/forgot-password'
                        className="text-center text-gray-400 hover:text-gray-500 font-normal"
                    >
                        ¿Olvidaste tu contraseña? Reestablecer
                    </Link>
                </nav>
            </Card>
        </div>
    )
}