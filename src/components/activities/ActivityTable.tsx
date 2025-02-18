import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Activity, Bitacora, User } from "@/types";
import DataTable from 'react-data-table-component';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import LoadingSpinner from "../LoadingSpinner";
import EditActivityModal from "@/components/activities/EditActivityModal";
import DeleteActivityModal from "@/components/activities/DeleteActivityModal";
import { ActivityForm } from './ActivityForm';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getActivitiesByBitacoraId } from '@/api/ActivityAPI';
import { formatDate } from '@/helpers';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../theme-provider';
import { Badge } from "@/components/ui/badge";
import { themes } from '@/utils/theme';

type ActivityTableProps = {
    bitacora: Bitacora;
    user: User;
};

export default function ActivityTable({ bitacora, user }: ActivityTableProps) {

  const navigate = useNavigate();
    
  // Agregar variables de control
  const isAdmin = user?.roles?.some(role => role?.name === 'Administrador')
  const isCoordinator = bitacora.program.users?.find((programUser) => programUser.is_coordinator)?.user.id === user.id
  const isBitacoraOwner = user?.id === bitacora.user_id
  const ownerIsReplacement = bitacora.user.is_replacement

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const { data: activities, isLoading } = useSuspenseQuery({
    queryKey: ['activities', bitacora.id],
    queryFn: () => getActivitiesByBitacoraId(bitacora.id)
  });

  // Separar las actividades en generales y específicas
  const generalActivities = activities?.filter((activity: Activity) => 
    activity.category.name === 'Actividades Generales'
  ) || [];

  const specificActivities = activities?.filter((activity: Activity) => 
    activity.category.name !== 'Actividades Generales'
  ) || [];

  // Aplicamos el filtrado solo a las actividades específicas
  const filteredSpecificActivities = specificActivities.filter((activity: Activity) => {
    return activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           activity.category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      name: 'Fecha',
      selector: (row: Activity) => formatDate(row.date),
      sortable: true,
    },
    {
      name: 'Categoría',
      selector: (row: Activity) => row.category.name,
      sortable: true,
    },
    {
      name: 'Actividad',
      selector: (row: Activity) => row.description,
      sortable: true,
      width: '28rem',
    },
    {
      name: 'Adjuntos',
      selector: (row: Activity) => row.attachments.length,
      sortable: true,
      width: '12rem',
      cell: (row: Activity) => <Badge className="bg-sidebar-ring dark:bg-sidebar-ring hover:bg-sidebar-ring/90 dark:hover:bg-sidebar-ring/90">{row.attachments.length}</Badge>,
    },
    ...(isAdmin || (isBitacoraOwner && bitacora.status === 'En Progreso') || (isCoordinator && ownerIsReplacement && bitacora.status === 'En Progreso') ? [{
      name: 'Acciones',
      cell: (row: Activity) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => { setSelectedActivity(row); setIsEditOpen(true); }}
            >
              <SquarePen className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => { setSelectedActivity(row); setIsDeleteOpen(true); }}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      button: true
    }] : [])
  ];

  const theme = useTheme().theme;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ResponsiveDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        title="Crear una nueva actividad"
        description="Rellena el formulario para crear una nueva actividad."
      >
        <ActivityForm setIsOpen={setIsCreateOpen} id={bitacora.id}/>
      </ResponsiveDialog>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold tracking-tight dark:text-sidebar-foreground">
            Actividades
          </h3>
          {/* Ajustar condicional del botón agregar según requerimientos */}
          {(isAdmin || 
            (isBitacoraOwner && bitacora.status === 'En Progreso') || 
            (isCoordinator && ownerIsReplacement && bitacora.status === 'En Progreso')
          ) && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center space-x-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Actividad
            </Button>
          )}
        </div>

        {/* Tabla de Actividades Generales */}
        <div className="space-y-4">
          <h4 className="text-xl font-semibold tracking-tight dark:text-sidebar-foreground">
            Actividades Generales
          </h4>
          <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
            <DataTable
              columns={columns}
              data={generalActivities}
              theme={theme === 'dark' ? themes.dark : themes.default}
              pagination
              paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
              highlightOnHover
              pointerOnHover
              noHeader
              customStyles={{ noData: { style: { minHeight: '50px' } } }}
              noDataComponent="No hay actividades generales disponibles"
              onRowClicked={(row) => user.roles?.some((role) => role?.name === 'Administrador') || (user.id === bitacora.user_id && bitacora.status === 'En Progreso') ? navigate(`/actividad/editar/${row.id}`) : navigate(`/actividad/${row.id}`)}
            />
          </div>
        </div>

        {/* Tabla de Actividades Específicas */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-4">
            <h4 className="text-xl font-semibold tracking-tight dark:text-sidebar-foreground">
              Actividades Específicas
            </h4>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
              <Input
                placeholder="Buscar actividades específicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
            <DataTable
              columns={columns}
              data={filteredSpecificActivities}
              theme={theme === 'dark' ? themes.dark : themes.default}
              pagination
              paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
              highlightOnHover
              pointerOnHover
              noHeader
              customStyles={{ noData: { style: { minHeight: '50px' } } }}
              noDataComponent="No hay actividades específicas disponibles"
              onRowClicked={(row) => user.roles?.some((role) => role?.name === 'Administrador') || (user.id === bitacora.user_id && bitacora.status === 'En Progreso') ? navigate(`/actividad/editar/${row.id}`) : navigate(`/actividad/${row.id}`)}
            />
          </div>
        </div>

        {selectedActivity && (
          <>
            <ResponsiveDialog
              isOpen={isEditOpen}
              setIsOpen={setIsEditOpen}
              title={`Edita la actividad`}
              description="Rellena el formulario para editar la actividad."
            >
              <EditActivityModal id={selectedActivity.id} setIsOpen={setIsEditOpen} /> 
            </ResponsiveDialog>
            <ResponsiveDialog
              isOpen={isDeleteOpen}
              setIsOpen={setIsDeleteOpen}
              title={`Eliminar la actividad ${selectedActivity.description}`}	
              description={`¿Estás seguro de que deseas eliminar la actividad?`}
            >
              <DeleteActivityModal id={selectedActivity.id} setIsOpen={setIsDeleteOpen} />
            </ResponsiveDialog>
          </>
        )}
      </div>
    </>
  );
}
