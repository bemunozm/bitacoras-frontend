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
import { useEffect, useState } from 'react'
import Informe from '@/components/pdfs/Informe'
import ReopenBitacoraModal from '@/components/bitacoras/ReopenBitacoraModal'
import { useAuth } from '@/hooks/useAuth'
import { useBreadcrumb } from '@/contexts/BreadcrumbContext'
import NotFound from '../NotFound'
import InformePerDay from '@/components/pdfs/InformePerDay'

export default function BitacoraDetailsView() {

  const {id} = useParams()

  const {data: bitacora, isLoading, isError} = useQuery({
    queryKey: ['bitacora', id],
    queryFn: () => getBitacora(parseInt(id!)),
    enabled: !!id
  })

  const {setBreadcrumbItems} = useBreadcrumb()

  useEffect(() => {
    const rutas = [
      {label: 'Escritorio', to: '/'},
      {label: 'Bitácoras', to: '/bitacoras'},
    ]
    setBreadcrumbItems(rutas)
    if (bitacora) {
      setBreadcrumbItems([...rutas, {label: `Bitácora ${getPeriod(bitacora.month)}`, to: undefined}])
    }
  }, [bitacora, setBreadcrumbItems])

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
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
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
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false); // Nuevo estado para el modal de confirmación de completar
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false); // Nuevo estado para el modal de confirmación de aprobar
  const [isDownloadingInforme, setIsDownloadingInforme] = useState(false);
  const [informeKey, setInformeKey] = useState(Date.now()); // Estado para la clave del componente Informe

  const {data: user, isLoading: isUserLoading} = useAuth()

  // Agregar estas variables después de obtener user y bitacora
  const isAdmin = user?.roles?.some(role => role?.name === 'Administrador')
  const isCoordinator = bitacora?.program.users?.find((programUser) => programUser.is_coordinator)?.user.id === user?.id
  const isBitacoraOwner = user?.id === bitacora?.user_id
  const ownerIsReplacement = bitacora?.user.is_replacement
  if (isLoading || isUserLoading) {
    return <LoadingSpinner />
  }

  if (isError) {
    return <NotFound title="Ohhh!" description="Hubo un problema al obtener la información de la bitácora." />
  }

  const handleGenerarInforme = async () => {
    setIsDownloadingInforme(true);
    setIsInformeOpen(false); // Cerrar el componente Informe
    await new Promise((resolve) => setTimeout(resolve, 100)); // Esperar un momento para asegurarse de que se cierre
    setInformeKey(Date.now()); // Cambiar la clave del componente Informe
    setIsInformeOpen(true); // Abrir el componente Informe nuevamente
    // Simular generación de informe
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsDownloadingInforme(false);
  };

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
            {/* En Progreso - Solo admin o dueño de la bitácora */}
            {bitacora?.status === 'En Progreso' && ((isAdmin || isBitacoraOwner) || ((isAdmin || isCoordinator) && ownerIsReplacement)) && (
              <Button 
                onClick={() => setIsCompleteConfirmOpen(true)}
                variant="default"
                className="w-full sm:w-auto"
              >
                Marcar Completada
              </Button>
            )}

            {/* Completado - Solo admin o coordinador del programa */}
            {bitacora?.status === 'Completado' && (isAdmin || isCoordinator) && (
              <Button 
                onClick={() => setIsApproveConfirmOpen(true)}
                variant="default"
                className="w-full sm:w-auto"
              >
                Marcar Aprobada
              </Button>
            )}

            {/* Aprobado - Solo admin o coordinador del programa */}
            {bitacora?.status === 'Aprobado' && (isAdmin || isCoordinator) && (
              <Button 
                onClick={() => setIsReopenConfirmOpen(true)}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Volver a En Progreso
              </Button>
            )}

            {/* Editar/Eliminar - Solo admin o dueño si está En Progreso */}
            {(isAdmin || (isBitacoraOwner && bitacora?.status === 'En Progreso') || (isCoordinator && ownerIsReplacement && bitacora.status === 'En Progreso')) && (
              <>
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
                  Eliminar
                </Button>
              </>
            )}

            {/* Generar Informe - Solo admin o coordinador del programa cuando está Aprobado */}
            {bitacora?.status === 'Aprobado' && (isAdmin || isCoordinator) && (
              <Button 
                variant="default" 
                className="w-full sm:w-auto"
                onClick={handleGenerarInforme}
                disabled={isDownloadingInforme}
              >
                <FileText className="mr-2 h-4 w-4" />
                {isDownloadingInforme ? "Descargando..." : "Generar Informe"}
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
            <p className="font-medium dark:text-sidebar-foreground">{bitacora?.user.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Programa</Label>
            <p className="font-medium dark:text-sidebar-foreground">{bitacora?.program.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Mes</Label>
            <p className="font-medium dark:text-sidebar-foreground first-letter:uppercase">{bitacora?.month ? getPeriod(bitacora?.month) : ''}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Nº BH o Liquidación</Label>
            <p className="font-medium dark:text-sidebar-foreground">{bitacora?.recipe ? `#${bitacora.recipe}` : 'Sin Información'}</p>
          </div>
        </div>

        {/* Activities Section */}
        {user && bitacora && <ActivityTable bitacora={bitacora} user={user} />}

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
          <ResponsiveDialog
            isOpen={isCompleteConfirmOpen}
            setIsOpen={setIsCompleteConfirmOpen}
            title={`Completar la bitácora ${getPeriod(bitacora.month)}`}
            description={`¿Estás seguro de que deseas marcar la bitácora ${getPeriod(bitacora.month)} como completada?\n Después de esta acción, no podrás realizar cambios en la bitácora ni en sus actividades.`}
          >
            <ReopenBitacoraModal handleStatusChange={() => handleStatusChange('Completado')} setIsOpen={setIsCompleteConfirmOpen} isOpen={isCompleteConfirmOpen} />
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isApproveConfirmOpen}
            setIsOpen={setIsApproveConfirmOpen}
            title={`Aprobar la bitácora ${getPeriod(bitacora.month)}`}
            description={`¿Estás seguro de que deseas marcar como aprobada la bitácora ${getPeriod(bitacora.month)}?\n Esta acción cambiara el estado de la bitacora a 'Aprobado'.`}
          >
            <ReopenBitacoraModal handleStatusChange={() => handleStatusChange('Aprobado')} setIsOpen={setIsApproveConfirmOpen} isOpen={isApproveConfirmOpen} />
          </ResponsiveDialog>

          {isInformeOpen && (
            <div className='hidden'>
              {bitacora.user.roles?.some(role => role?.name === 'Administrativo') ? (
                <Informe key={informeKey} bitacora={bitacora}/>
              ) : (
                <InformePerDay key={informeKey} bitacora={bitacora}/>
              )}
            </div>
          )}
          
        </>
      )}
    </div>
  )
}
