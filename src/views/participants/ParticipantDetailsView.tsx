import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Printer } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import ParticipantInformation from "@/components/participants/ParticipantInformation"
import ProvisionTracking from "@/components/participants/ProvisionTracking"
import DiseaseTracking from "@/components/participants/DiseaseTracking"
import EventTracking from "@/components/participants/EventTracking"
import ResidenceTracking from "@/components/participants/ResidenceTracking"
import { useQuery } from "@tanstack/react-query"
import { getParticipant } from "@/api/ParticipantAPI"
import LoadingSpinner from "@/components/LoadingSpinner"
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { EditParticipantModal } from "@/components/participants/EditParticipantModal";
import { useState, useEffect } from "react";
import NotFound from "../NotFound"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"


export default function ParticipantDetailsView() {

    const navigate = useNavigate()

    
    const { id: participantId } = useParams()

    const {data: participant, isLoading, isError} = useQuery({
        queryKey: ['participant', +participantId!],
        queryFn: () => getParticipant(+participantId!),
        enabled: !!participantId
    })

    const { setBreadcrumbItems } = useBreadcrumb()

    useEffect(() => {
        const rutas = [
            { label: "Escritorio", to: "/" },
            { label: "Participantes", to: "/participantes" },
        ]
        setBreadcrumbItems(rutas)
        if (participant) {
            setBreadcrumbItems([
                ...rutas,
                { label: `${participant.name}`, to: undefined }
            ])
        }
        
        return () => {
            setBreadcrumbItems([]) // Limpiar al desmontar
        }
    }, [participant, setBreadcrumbItems])

    const [isEditOpen, setIsEditOpen] = useState(false);

    if (isError) {
        return <NotFound title="¡Vaya!" description="Hubo un problema al obtener la información del participante." />
    }

    if (isLoading) {
        return <LoadingSpinner />
    }


  if (participant) return (
      <div className="p-6 space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 w-full">
          <Button variant="outline" className="w-full sm:w-auto text-sidebar-foreground" onClick={() => navigate('/participantes')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
          </Button>
        <h1 className="text-2xl font-bold text-center sm:text-left dark:text-sidebar-foreground w-full sm:w-auto">Detalle del Participante</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial text-sidebar-foreground" onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-initial text-sidebar-foreground">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <ParticipantInformation participant={participant} />

        <div className="grid sm:grid-cols-2 gap-6">
          <ProvisionTracking participantId={participant.id} />
          <DiseaseTracking participantId={participant.id} />
        </div>

        <EventTracking participantId={participant.id} />

        <ResidenceTracking participantId={participant.id} />
      </div>

      <ResponsiveDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        title={`Edita el participante ${participant.name}`}
        description="Rellena el formulario para editar el participante."
      >
        <EditParticipantModal id={participant.id} setIsOpen={setIsEditOpen} />
      </ResponsiveDialog>
    </div>
  )
}
