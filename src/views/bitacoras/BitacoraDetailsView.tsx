import { CheckCircle2, Trash, CheckCircle, Clock, PenBoxIcon, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from '@/hooks/use-toast'
import ActivityTable from '@/components/activities/ActivityTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getBitacora, changeBitacoraStatus } from '@/api/BitacoraAPI'
import { getPeriod } from '@/helpers'
import LoadingSpinner from '@/components/LoadingSpinner'
import EditBitacoraModal from '@/components/bitacoras/EditBitacoraModal'
import DeleteBitacoraModal from '@/components/bitacoras/DeleteBitacoraModal'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { useState } from 'react'
import Informe from '@/components/pdfs/Informe'
import ReopenBitacoraModal from '@/components/bitacoras/ReopenBitacoraModal'

export default function BitacoraDetailsView() {

  const {id} = useParams()

  const {data: bitacora, isLoading} = useQuery({
    queryKey: ['bitacora', id],
    queryFn: () => getBitacora(parseInt(id!)),
    enabled: !!id
  })

  const queryClient = useQueryClient()

  const {mutate} = useMutation({
    mutationFn: (status: string) => changeBitacoraStatus(parseInt(id!), status),
    onSuccess: (data) => {
        queryClient.invalidateQueries({queryKey:['bitacoras']}),
        queryClient.invalidateQueries({queryKey:['bitacora', id!]}),
      toast({
        title: "Estado actualizado",
        description: `La bitácora ha sido marcada como ${data}`,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la bitácora",
      })
    }
  })

  const handleStatusChange = (status: string) => {
    mutate(status)
  }

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInformeOpen, setIsInformeOpen] = useState(false);
  const [isReopenConfirmOpen, setIsReopenConfirmOpen] = useState(false); // Nuevo estado para el modal de confirmación

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-bold tracking-tight dark:text-sidebar-foreground">{`Bitácora ${getPeriod(bitacora?.month!)}`}</h2>
            <Badge 
              variant={bitacora?.status === 'En Progreso' ? 'default' : bitacora?.status === 'Completado' ? 'secondary' : 'outline'}
              className={`text-sm py-1 px-2 ${bitacora?.status === 'En Progreso' ? 'bg-yellow-500 dark:bg-yellow-500' : bitacora?.status === 'Completado' ? 'bg-green-500 dark:bg-green-500' : 'bg-blue-500'}`}
            >
              {bitacora?.status === 'En Progreso' ? (
              <><Clock className="w-4 h-4 mr-1" /> En Progreso</>
              ) : bitacora?.status === 'Completado' ? (
              <><CheckCircle className="w-4 h-4 mr-1" /> Completada</>
              ) : (
              <><CheckCircle2 className="w-4 h-4 mr-1" /> Aprobada</>
              )}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button 
              onClick={() => {
                if (bitacora?.status === 'Aprobado') {
                  setIsReopenConfirmOpen(true); // Mostrar modal de confirmación
                } else {
                  handleStatusChange(bitacora?.status === 'En Progreso' ? 'Completado' : bitacora?.status === 'Completado' ? 'Aprobado' : 'En Progreso');
                }
              }}
              variant={bitacora?.status === 'Aprobado' ? 'secondary' : 'default'}
              className="w-full sm:w-auto"
            >
              {bitacora?.status === 'En Progreso' && 'Marcar Completada'}
              {bitacora?.status === 'Completado' && 'Marcar Aprobada'}
              {bitacora?.status === 'Aprobado' && 'Volver a En Progreso'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto dark:text-sidebar-foreground"
              onClick={() => setIsEditOpen(true)}
            >
              <PenBoxIcon className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button 
              variant="destructive" 
              className="w-full sm:w-auto"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Borrar
            </Button>
            {bitacora?.status === 'Aprobado' && (
              <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={() => setIsInformeOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generar Informe
            </Button>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-6">

        {/* Quick Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Usuario</Label>
            <p className="font-medium dark:text-sidebar-foreground">{bitacora?.users.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Programa</Label>
            <p className="font-medium dark:text-sidebar-foreground">{bitacora?.programs.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Mes</Label>
            <p className="font-medium dark:text-sidebar-foreground first-letter:uppercase">{bitacora?.month ? getPeriod(bitacora?.month) : ''}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Boleta</Label>
            <p className="font-medium dark:text-sidebar-foreground">#{bitacora?.recipe}</p>
          </div>
        </div>

        {/* Activities Section */}
        {id && <ActivityTable bitacoraId={parseInt(id)} />}

        </div>

        {bitacora && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita la bitácora del mes de ${getPeriod(bitacora.month)}`}
            description="Rellena el formulario para editar la bitácora."
          >
            <EditBitacoraModal id={bitacora.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar la bitácora ${getPeriod(bitacora.month)}`}
            description={`¿Estás seguro de que deseas eliminar la bitácora ${getPeriod(bitacora.month)}?\n Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
          >
            <DeleteBitacoraModal id={bitacora.id} setIsOpen={setIsDeleteOpen} />
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isReopenConfirmOpen}
            setIsOpen={setIsReopenConfirmOpen}
            title={`Reabrir la bitácora ${getPeriod(bitacora.month)}`}
            description={`¿Estás seguro de que deseas reabrir la bitácora ${getPeriod(bitacora.month)}?\n Esta acción cambiara el estado de la bitacora a 'En Progreso'.`}
          >
            <ReopenBitacoraModal handleStatusChange={handleStatusChange} setIsOpen={setIsReopenConfirmOpen} isOpen={isReopenConfirmOpen} />
          </ResponsiveDialog>

          {isInformeOpen && <div className='hidden'> <Informe bitacora={bitacora}/> </div>}
          
        </>
      )}
    </div>
  )
}
