import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProgramUsersTable from '@/components/programs/ProgramUsersTable'
import { getProgram } from '@/api/ProgramAPI'
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PenBoxIcon, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import EditProgramModal from '@/components/programs/EditProgramModal'
import DeleteProgramModal from '@/components/programs/DeleteProgramModal'
import { useBreadcrumb } from '@/contexts/BreadcrumbContext'
import { useAuth } from '@/hooks/useAuth';

export default function ProgramDetailsView() {
  const { id } = useParams()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const { data: user } = useAuth();
  const isAdmin = user?.roles?.some((role) => role?.name === "Administrador");

  const { data: program, isLoading, isError } = useQuery({
    queryFn: () => getProgram(parseInt(id!)),
    queryKey: ['program', id],
    enabled: !!id
  })

  const navigate = useNavigate();

  const coordinator = program?.users?.find(user => user.is_coordinator)?.user;
  const isCoordinator = coordinator?.id === user?.id;

  const {setBreadcrumbItems} = useBreadcrumb()
  
    useEffect(() => {
      const routes = [
        {label: 'Escritorio', to: '/'},
        {label: isAdmin ? 'Administración' : 'Coordinación', to: undefined},
        {label: 'Programas', to: '/programas'}
      ]
  
      setBreadcrumbItems(routes)
  
      if (program) {
        setBreadcrumbItems([...routes, {label: program.name, to: undefined}])
      }
    }, [program, id, setBreadcrumbItems])

  if (isLoading) return <LoadingSpinner />
  if (isError || !program) return <div>Error al cargar el programa</div>
  if (!isAdmin && !isCoordinator && program) {
    navigate('/programas')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        {/* Header al estilo de BitacoraDetailsView */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-bold tracking-tight dark:text-sidebar-foreground">{program.name}</h2>
            <Badge variant="default" className="text-sm py-1 px-2">Programa</Badge>
          </div>
          {isAdmin && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditOpen(true)}
              >
                <PenBoxIcon className="mr-2 h-4 w-4" /> Editar
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="p-4 bg-white shadow rounded">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Mandante</Label>
            <p className="font-medium dark:text-sidebar-foreground">{program.company || 'Sin información'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Dirección</Label>
            <p className="font-medium dark:text-sidebar-foreground">{program.address}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Región</Label>
            <p className="font-medium dark:text-sidebar-foreground">{program.state}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs dark:text-sidebar-foreground">Coordinador</Label>
            <p className="font-medium dark:text-sidebar-foreground">{coordinator?.name || 'No asignado'}</p>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <ProgramUsersTable 
        program={program} 
        coordinatorId={coordinator?.id || -1}
      />

      {/* Modales solo se renderizan si es admin */}
      {isAdmin && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Editar programa ${program.name}`}
            description="Rellena el formulario para editar el programa."
          >
            <EditProgramModal id={program.id} setIsOpen={setIsEditOpen} />
          </ResponsiveDialog>

          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar programa ${program.name}`}
            description={`¿Estás seguro de que deseas eliminar el programa ${program.name}?\nEsta acción no se puede deshacer y se perderán todos los datos asociados.`}
          >
            <DeleteProgramModal id={program.id} setIsOpen={setIsDeleteOpen} />
          </ResponsiveDialog>
        </>
      )}
    </div>
  )
}
