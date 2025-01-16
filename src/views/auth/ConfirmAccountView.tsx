import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PinInput, PinInputField } from '@chakra-ui/pin-input'
import { useMutation } from '@tanstack/react-query'
import { ConfirmToken } from "@/types/index";
import { confirmAccount } from "@/api/AuthAPI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ConfirmAccountView({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"div">) {
    const [token, setToken] = useState<ConfirmToken['token']>('')

    const {toast} = useToast()

    const navigate = useNavigate()
    const { mutate } = useMutation({
        mutationFn: confirmAccount,
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess: (data) => {
            toast({
                title: '🎉Cuenta confirmada!',
                description: data,
            })
            navigate('/auth/login')
        }
    })

    const handleChange = (token : ConfirmToken['token']) => {
        setToken(token)
    }

    const handleComplete = (token: ConfirmToken['token']) => mutate({token})

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (token.length === 6) {
            mutate({ token })
        }
    }

    return (
        <div className={cn("flex flex-col gap-6",   )} {...props}>
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Confirmar cuenta</CardTitle>
                    <CardDescription>
                        Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="flex justify-center gap-5">
                            <PinInput value={token} onChange={handleChange} onComplete={handleComplete}>
                                <PinInputField className="w-10 h-10 p-3 rounded-lg border-gray-300 border placeholder-white dark:text-black" />
                                <PinInputField className="w-10 h-10 p-3 rounded-lg border-gray-300 border placeholder-white dark:text-black" />
                                <PinInputField className="w-10 h-10 p-3 rounded-lg border-gray-300 border placeholder-white dark:text-black" />
                                <PinInputField className="w-10 h-10 p-3 rounded-lg border-gray-300 border placeholder-white dark:text-black" />
                                <PinInputField className="w-10 h-10 p-3 rounded-lg border-gray-300 border placeholder-white dark:text-black" />
                                <PinInputField className="w-10 h-10 p-3 rounded-lg border-gray-300 border placeholder-white dark:text-black" />
                            </PinInput>
                        </div>
                    </CardContent>
                </form>
                <nav className="my-5 flex flex-col space-y-4">
                    <Link
                        to='/auth/request-code'
                        className="text-center text-gray-400 font-normal  hover:text-gray-600"
                    >
                        Solicitar un nuevo código
                    </Link>
                </nav>
            </Card>
        </div>
    )
}