import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveDialog } from "../responsive-dialog"
import EventForm from "../events/EventForm"
import { FileText, Plus, ChevronsLeft, ChevronsRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Participant } from '@/types'
import { useState } from "react"
import { Event } from "@/types"
import EditEventModal from "../events/EditEventModal"
import DeleteEventModal from "../events/DeleteEventModal"
import { getEventsByParticipant } from "@/api/EventAPI"
import { useSuspenseQuery } from "@tanstack/react-query"

type EventTrackingProps = {
    participantId: Participant['id'];
}

export default function EventTracking({ participantId }: EventTrackingProps) {
    
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3; // Cambiar el máximo por página a 3

    const {data: events} = useSuspenseQuery({
        queryKey: ['events', participantId],
        queryFn: () => getEventsByParticipant(+participantId!),
    })

    const sortedEvents = events?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
    const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
    const eventsToShow = sortedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

  return (
    <>
    <ResponsiveDialog
            isOpen={isCreateOpen}
            setIsOpen={setIsCreateOpen}
            title="Crear un nuevo evento"
            description="Rellena el formulario para crear un nuevo evento."
          >
            <EventForm setIsOpen={setIsCreateOpen} selectedParticipant={participantId} />
          </ResponsiveDialog>
        <Card className="w-full overflow-x-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
            <CardTitle className="text-lg font-semibold flex items-center text-green-700 dark:text-green-500">
            <FileText className="mr-2 text-green-500" />
            Eventos
            </CardTitle>
            <Button variant="outline" size="icon" className="bg-white hover:bg-green-100" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
            </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="min-h-[200px] ">
            {eventsToShow.length === 0 ? (
              <p className="text-center text-gray-500">No se han registrado eventos</p>
            ) : (
              <ul className="space-y-2 w-full">
                {eventsToShow.map((evento) => (
                  <li
                    key={evento.id}
                    className="flex items-center justify-between p-2 rounded-md shadow-sm border border-sidebar-border cursor-pointer"
                    onClick={() => { setSelectedEvent(evento); setIsEditOpen(true); }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{evento.type}</Badge>
                        <span className="text-sm text-gray-500">{evento.date.split('T')[0]}</span>
                      </div>
                      <p className="mt-1 text-sm">{evento.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(evento); setIsDeleteOpen(true); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {eventsToShow.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <span>Página {currentPage} de {totalPages}</span>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
        </Card>
        {selectedEvent && (
        <>
            <ResponsiveDialog
                isOpen={isEditOpen}
                setIsOpen={setIsEditOpen}
                title={`Edita el evento `}
                description="Rellena el formulario para editar el evento."
            >
                <EditEventModal id={selectedEvent.id} setIsOpen={setIsEditOpen} /> 
            </ResponsiveDialog>
            <ResponsiveDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title={`Eliminar el evento `}
                description={`¿Estás seguro de que deseas eliminar el evento?`}
            >
                <DeleteEventModal id={selectedEvent.id} setIsOpen={setIsDeleteOpen} /> 
            </ResponsiveDialog>
        </>
    )}
    </>
  )
}
