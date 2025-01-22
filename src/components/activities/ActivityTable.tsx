import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Activity, Bitacora, User } from "@/types";
import DataTable, { createTheme } from 'react-data-table-component';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import LoadingSpinner from "../LoadingSpinner";
import EditActivityModal from "@/components/activities/EditActivityModal";
import DeleteActivityModal from "@/components/activities/DeleteActivityModal";
import { ActivityForm } from './ActivityForm';
import { useQuery } from '@tanstack/react-query';
import { getActivitiesByBitacoraId } from '@/api/ActivityAPI';
import { formatDate } from '@/helpers';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../theme-provider';
import { Badge } from "@/components/ui/badge";

type ActivityTableProps = {
    bitacora: Bitacora;
    user: User;
};

export default function ActivityTable({ bitacora, user }: ActivityTableProps) {

  const navigate = useNavigate();
    
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', bitacora.id],
    queryFn: () => getActivitiesByBitacoraId(bitacora.id)
  });

  const filteredActivities = activities?.filter((activity: Activity) => {
    return activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           activity.categories.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  createTheme(
    'dark',
    {
        text: {
            primary: '#f0f0f0', // --sidebar-foreground
            secondary: '#c0c0c0', // --sidebar-accent-foreground
        },
        background: {
            default: 'transparent', // --custom-background
        },
        context: {
            background: '#3a3a3a', // --sidebar-accent
            text: '#f0f0f0', // --sidebar-accent-foreground
        },
        divider: {
            default: '#2a2a2a', // --sidebar-border
        },
        button: {
            default: '#3a3a3a', // --sidebar-accent
            hover: 'rgba(0,0,0,.08)',
            focus: 'rgba(255,255,255,.12)',
            disabled: 'rgba(255, 255, 255, .34)',
        },
        sortFocus: {
            default: '#3a3a3a', // --sidebar-accent
        },
    },
    'dark',
);

createTheme(
    'default',
    {
        text: {
            primary: '#3f3f3f', // --sidebar-foreground
            secondary: '#1a1a1a', // --sidebar-primary
        },
        background: {
            default: 'transparent', // --custom-background
        },
        context: {
            background: '#e0e0e0', // --sidebar-accent
            text: '#1a1a1a', // --sidebar-primary
        },
        divider: {
            default: '#d0d0d0', // --sidebar-border
        },
        button: {
            default: '#e0e0e0', // --sidebar-accent
            hover: 'rgba(0,0,0,.08)',
            focus: 'rgba(0,0,0,.12)',
            disabled: 'rgba(0, 0, 0, .34)',
        },
        sortFocus: {
            default: '#e0e0e0', // --sidebar-accent
        },
    },
    'default',
);

  const columns = [
    {
      name: 'Fecha',
      selector: (row: Activity) => formatDate(row.date),
      sortable: true,
    },
    {
      name: 'Categoría',
      selector: (row: Activity) => row.categories.name,
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
      cell: (row: Activity) => <Badge className="bg-sidebar-ring dark:bg-sidebar-ring">{row.attachments.length}</Badge>,
    },
    ...(user.roles?.some((role) => role?.name === 'Administrador') || user.id === bitacora.user_id ? [{
      name: 'Acciones',
      cell: (row: Activity) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => { setSelectedActivity(row); setIsEditOpen(true); }} 
              disabled={row.status !== 'En Progreso' && !user.roles?.some((role) => role?.name === 'Administrador')}
            >
              <SquarePen className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => { setSelectedActivity(row); setIsDeleteOpen(true); }} 
              className="text-red-500" 
              disabled={row.status !== 'En Progreso' && !user.roles?.some((role) => role?.name === 'Administrador')}
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold tracking-tight dark:text-sidebar-foreground">
            Actividades
          </h3>
          {(user.roles?.some((role) => role?.name === 'Administrador') || (user.id === bitacora.user_id && bitacora.status === 'En Progreso')) && (
            <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1"
            >
            <Plus className="mr-2 h-4 w-4" />
            Actividad
          </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
            <Input
              placeholder="Buscar actividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
          <DataTable
            title='Actividades'
            columns={columns}
            data={filteredActivities || []}
            theme={theme === 'dark' ? 'dark' : 'default'}
            pagination
            paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
            highlightOnHover
            pointerOnHover
            noHeader
            noDataComponent="No hay actividades disponibles"
            onRowClicked={(row) => user.roles?.some((role) => role?.name === 'Administrador') || (user.id === bitacora.user_id && bitacora.status === 'En Progreso') ? navigate(`/actividad/editar/${row.id}`) : navigate(`/actividad/${row.id}`)}
          />

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
      </div>
    </>
  );
}
