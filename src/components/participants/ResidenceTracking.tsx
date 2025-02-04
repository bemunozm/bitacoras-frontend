import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Participant } from '@/types'
import { getParticipantResidences } from "@/api/ParticipantAPI"
import { useSuspenseQuery } from "@tanstack/react-query"

type ResidenceTrackingProps = {
    participantId: Participant['id'];
}

export default function ResidenceTracking({participantId} : ResidenceTrackingProps) {
  
  const {data: residencias} = useSuspenseQuery({
    queryKey: ['residencias', participantId],
    queryFn: () => getParticipantResidences(+participantId!),
  })
  return (
    <Card className="w-full overflow-x-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
        <CardTitle className="text-lg font-semibold flex items-center text-purple-700 dark:text-purple-500">
          <Home className="mr-2 text-purple-500" />
          Historial de Residencias
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {residencias.length === 0 ? (
            <p className="text-center text-gray-500">No hay datos de residencias asociados.</p>
          ) : (
            residencias.map((residencia: any) => (
              <div
                key={residencia.id}
                className="flex items-start space-x-4 p-3 rounded-lg shadow-sm border border-sidebar-border"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{residencia.residence.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(residencia.admission_date).toLocaleDateString()} - {new Date(residencia.departure_date).toLocaleDateString() || "Presente"}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={residencia.status == 'Finalizado' ? "secondary" : residencia.status == 'Expulsado' ? "destructive" : "default"}
                  className={residencia.status == 'Finalizado' ? "bg-blue-500 dark:bg-blue-500 hover:bg-blue-400 dark:hover:bg-blue-400" : residencia.status == 'Expulsado' ? "bg-red-500 dark:bg-red-500 hover:bg-red-400 dark:hover:bg-red-400" : residencia.status == 'Residencia en Curso' ? "bg-green-500 dark:bg-green-500 hover:bg-green-400 dark:hover:bg-green-400" : "bg-gray-500 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-400"}
                >
                  {residencia.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
