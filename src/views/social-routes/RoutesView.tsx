import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, Plus, Save, FileText, Users, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import DeliverBenefitModal from "@/components/social-routes/DeliverBenefitModal"
import { ParticipantForm } from "@/components/participants/ParticipantForm"
import RouteTable from "@/components/social-routes/RouteTable"
import { useQuery } from "@tanstack/react-query"
import { getProvisionsAssignedByDate } from "@/api/ProvisionAPI"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import NotFound from "../NotFound"
import Acta from '@/components/pdfs/Acta';

export default function RoutesView() {
  const [date, setDate] = useState<Date>(new Date())
  const [turn, setTurn] = useState<string>("AM")
  const [isLoading, setIsLoading] = useState(false)
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false)
  const [isParticipantFormOpen, setIsParticipantFormOpen] = useState(false)
  const [isActaOpen, setIsActaOpen] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [actaKey, setActaKey] = useState(Date.now()); // Estado para la clave del componente Acta

  const {setBreadcrumbItems} = useBreadcrumb()

  useEffect(() => {
    setBreadcrumbItems([
      { label: "Escritorio", to: "/" },
      { label: "Rutas Sociales", to: undefined}
    ])
    const currentHour = new Date().getHours();
    if (currentHour < 13) {
      setTurn("AM");
    } else {
      setTurn("PM");
    }
  }, []);

  const handleGuardar = async () => {
    setIsLoading(true)
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsLoading(false)
  }


  const { data, isLoading: isDataLoading, refetch , isError} = useQuery({
    queryKey: ['provisionsAssigned', date.toISOString(), turn],
    queryFn: () => getProvisionsAssignedByDate(date.toISOString(), turn),
  });

  useEffect(() => {
    refetch()
  }, [date, turn, refetch])

  const handleDescargarPDF = async () => {
    setIsDownloadingPDF(true);
    setIsActaOpen(false); // Cerrar el componente Acta
    await new Promise((resolve) => setTimeout(resolve, 100)); // Esperar un momento para asegurarse de que se cierre
    setActaKey(Date.now()); // Cambiar la clave del componente Acta
    setIsActaOpen(true); // Abrir el componente Acta nuevamente
    // Simular descarga
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsDownloadingPDF(false);
  };

  if (isDataLoading) return <LoadingSpinner/>
  if (isError) return <NotFound title="¡Ups!" description="Hubo un problema al obtener la información de la ruta." />
  return (
    <>
      <ResponsiveDialog
        isOpen={isAddParticipantModalOpen}
        setIsOpen={setIsAddParticipantModalOpen}
        title="Entregar Prestaciones"
        description="Rellena el formulario para entregar una prestación a un participante."
      >
        <DeliverBenefitModal 
          setIsOpen={setIsAddParticipantModalOpen} 
          isParticipantFormOpen={isParticipantFormOpen} 
          setIsParticipantFormOpen={setIsParticipantFormOpen} 
          date={date}
          turn={turn}
        />
      </ResponsiveDialog>

      <ResponsiveDialog
        isOpen={isParticipantFormOpen}
        setIsOpen={setIsParticipantFormOpen}
        title="Crear Nuevo Participante"
        description="Rellena el formulario para crear un nuevo participante."
      >
        <ParticipantForm setIsOpen={setIsParticipantFormOpen} />
      </ResponsiveDialog>

      <div className="p-6 space-y-4">
        <Card className="border-0 p-0 shadow-none">
          <CardHeader className="space-y-1 p-0">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 text-sidebar-foreground">
                  <FileText className="h-6 w-6 text-blue-500" />
                  Acta de entrega de prestaciones
                </CardTitle>
                <CardDescription className="mt-1 text-sidebar-foreground">
                  Registro de prestaciones entregadas durante la ruta social
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-auto"
                        onClick={handleDescargarPDF}
                        disabled={isDownloadingPDF}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {isDownloadingPDF ? "Descargando..." : "Descargar Acta"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Descargar acta en formato PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-muted/50 py-4 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sidebar-foreground">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  Fecha de la ruta
                </Label>
                <Input
                  type="date"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();
                    if (selectedDate <= today) {
                      setDate(selectedDate);
                    } else {
                      setDate(today);
                    }
                  }}
                  max={new Date().toISOString().split("T")[0]} // Establecer la fecha máxima permitida
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sidebar-foreground">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Turno
                </Label>
                <Select value={turn} onValueChange={setTurn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">Mañana (AM)</SelectItem>
                    <SelectItem value="PM">Tarde (PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/50 py-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-sidebar-foreground">Participantes registrados</h3>
                    <p className="text-sm text-sidebar-foreground">Total: {data.length}</p>
                  </div>
                </div>
                <Button onClick={() => setIsAddParticipantModalOpen(true)} className="w-full sm:w-auto bg-green-500 hover:bg-green-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Participante
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <RouteTable data={data} />
      </div>

      {isActaOpen && <div className='hidden'> <Acta key={actaKey} data={data} date={date.toISOString().split("T")[0]} turn={turn} /> </div>}
    </>
  )
}
