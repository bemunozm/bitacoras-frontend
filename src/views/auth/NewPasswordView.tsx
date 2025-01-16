import NewPasswordToken from "@/components/auth/NewPasswordToken"
import NewPasswordForm from "@/components/auth/NewPasswordForm"
import { useState } from "react"
import { ConfirmToken } from "@/types/index"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NewPasswordView({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"div">) {
    const [token, setToken] = useState<ConfirmToken['token']>('')
    const [isValidToken, setIsValidToken] = useState(false)

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reestablecer Password</CardTitle>
                    <CardDescription>
                        Ingresa el código que recibiste por email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isValidToken ? 
                        <NewPasswordToken token={token} setToken={setToken} setIsValidToken={setIsValidToken}  /> : 
                        <NewPasswordForm token={token} />
                    }
                </CardContent>
            </Card>
        </div>
    )
}
