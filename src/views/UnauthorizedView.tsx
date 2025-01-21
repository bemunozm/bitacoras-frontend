import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function UnauthorizedView() {
    const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Acceso No Autorizado</CardTitle>
          <CardDescription className="text-center">
            Lo sentimos, no tienes los permisos necesarios para acceder a esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sidebar-accent-foreground">
            Si crees que esto es un error, por favor contacta al administrador del sistema.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/")} className="w-full">
             Volver al Inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

