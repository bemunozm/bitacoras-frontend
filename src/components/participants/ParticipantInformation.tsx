import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, Flag, CreditCard, Cake } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Participant } from "@/types"
import { formatDate } from "@/helpers"

type ParticipantInfomationProps = {
    participant: Participant
}

export default function ParticipantInformation({ participant }: ParticipantInfomationProps) {
  const calculateAge = (birthdate: string) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
    return age;
  };

  return (
    <Card className="w-full overflow-x-hidden">
      <CardHeader className="text-sidebar-foreground border-b border-sidebar-border flex flex-row justify-between">
        <CardTitle className="flex items-center text-2xl">
          <User className="mr-2" />
          Información Personal
        </CardTitle>
            <div>
              <Badge variant="outline" className="text-sm">
                Participante Activo
              </Badge>
            </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-sidebar-foreground">{participant.name}</h3>
              <p className="text-sm text-sidebar-ring">Nombre completo</p>
            </div>
            <div className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{participant.run}</p>
                <p className="text-sm text-gray-500">RUT</p>
              </div>
            </div>
            <div className="flex items-center">
              <Cake className="mr-2 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{calculateAge(participant.birthdate!)} años</p>
                <p className="text-sm text-gray-500">Edad</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{formatDate(participant.birthdate!)}</p>
                <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
              </div>
            </div>
            <div className="flex items-center">
              <Flag className="mr-2 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{participant.nationality}</p>
                <p className="text-sm text-gray-500">Nacionalidad</p>
              </div>
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
