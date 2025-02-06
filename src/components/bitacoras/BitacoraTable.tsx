import { getBitacoras } from "@/api/BitacoraAPI";
import { Bitacora, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable from 'react-data-table-component';
import { useState } from "react";
import { SquarePen, Trash2, MoreVertical, CircleCheck, CircleX } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import { getPeriod } from "@/helpers";
import EditBitacoraModal from "@/components/bitacoras/EditBitacoraModal";
import DeleteBitacoraModal from "@/components/bitacoras/DeleteBitacoraModal";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { themes } from "@/utils/theme";

export default function BitacoraTable({ searchTerm, filter, user }: { searchTerm: string, filter: string, user: User }) {
  const { data, isLoading } = useQuery({
    queryKey: ['bitacoras'],
    queryFn: getBitacoras
  });

  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBitacora, setSelectedBitacora] = useState<Bitacora | null>(null);

  const filteredBitacoras = data?.filter((bitacora: Bitacora) => {
    if (filter === "mine") {
      const currentUser = user?.id; // Reemplaza esto con la lógica real
      return bitacora.user_id === currentUser;
    }
    return bitacora.created_at.toLowerCase().includes(searchTerm.toLowerCase()) ||
           bitacora.users.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      name: 'Periodo',
      selector: (row: Bitacora) => getPeriod(row.month),
      sortable: true,
    },
    {
      name: 'Usuario',
      selector: (row: Bitacora) => row.users.name,
      sortable: true,
    },
    {
      name: 'Actividades',
      selector: (row: Bitacora) => row.activities?.length || 0,
      sortable: true,
      width: '6rem',
      cell: (row: Bitacora) => <Badge className="bg-sidebar-ring dark:bg-sidebar-ring hover:bg-sidebar-ring/90 dark:hover:bg-sidebar-ring/90">{row.activities?.length || 0}</Badge>,
    },
    {
      name: 'Fotos',
      selector: (row: Bitacora) => row.activities?.reduce((acc, activity) => acc + activity.attachments.length, 0) || 0,
      sortable: true,
      width: '6rem',
      cell: (row: Bitacora) => <Badge className="bg-sidebar-ring dark:bg-sidebar-ring hover:bg-sidebar-ring/90 dark:hover:bg-sidebar-ring/90">{row.activities?.reduce((acc, activity) => acc + activity.attachments.length, 0) || 0}</Badge>,
    },
    {
      name: 'Programa',
      selector: (row: Bitacora) => row.programs.name,
      sortable: true,
    },
    {
      name: 'Coordinador',
      selector: (row: Bitacora) => row.programs.coordinator.name,
      sortable: true,
    },
    {
      name: 'Terminado?',
      cell: (row: Bitacora) => row.status === 'Completado' || row.status === 'Aprobado' ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/>,
    },
    {
      name: 'Aprobado?',
      cell: (row: Bitacora) => row.status === 'Aprobado' ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/>,
    },
    ...(user.roles?.some((role) => role?.name === 'Administrador') || filter === 'mine' ? [{
      name: 'Acciones',
      cell: (row: Bitacora) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => { setSelectedBitacora(row); setIsEditOpen(true); }} 
              disabled={row.status !== 'En Progreso' && !user.roles?.some((role) => role?.name === 'Administrador')}
            >
              <SquarePen className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => { setSelectedBitacora(row); setIsDeleteOpen(true); }} 
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
    <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
      <DataTable
        title='Bitácoras'
        columns={columns}
        data={filteredBitacoras || []}
        theme={theme === 'dark' ? themes.dark : themes.default}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        noDataComponent="No hay bitácoras disponibles"
        onRowClicked={(row) => navigate(`/bitacoras/${row.id}`)}
      />

      {selectedBitacora && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita la bitácora del mes de ${getPeriod(selectedBitacora.month)}`}
            description="Rellena el formulario para editar la bitácora."
          >
            <EditBitacoraModal id={selectedBitacora.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar la bitácora ${getPeriod(selectedBitacora.month)}`}
            description={`¿Estás seguro de que deseas eliminar la bitácora ${getPeriod(selectedBitacora.month)}?\n Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
          >
            <DeleteBitacoraModal id={selectedBitacora.id} setIsOpen={setIsDeleteOpen} /> 
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
