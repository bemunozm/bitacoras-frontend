import { getResidences } from "@/api/ResidenceAPI";
import { Residence } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable from 'react-data-table-component';
import { useState } from "react";
import { SquarePen, Trash2, MoreVertical } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditResidenceModal from "@/components/residences/EditResidenceModal";
import DeleteResidenceModal from "@/components/residences/DeleteResidenceModal";
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { themes } from "@/utils/theme";
import { useAuth } from "@/hooks/useAuth";

export default function ResidenceTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['residences'],
    queryFn: getResidences
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null);

  const navigate = useNavigate();
  const { data: user } = useAuth(); // Obtener el usuario del contexto de autenticación

  const handleRowClick = (row: Residence) => {
    navigate(`/residencias/${row.id}`);
  };

  const filteredResidences = data?.filter((residence: Residence) => {
    return residence.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      name: 'Nombre',
      selector: (row: Residence) => row.name,
      sortable: true,
    },
    {
      name: 'Dirección',
      selector: (row: Residence) => row.address || '',
      sortable: true,
    },
    {
      name: 'Capacidad',
      selector: (row: Residence) => row.capacity || '',
      sortable: true,
    },
    {
      name: 'N° de ocupantes',
      selector: (row: any) => row.participants.filter((participant: any) => participant.status === 'Residencia en Curso' || participant.status === 'Pendiente de Salida').length,
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row: Residence) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedResidence(row); setIsEditOpen(true); }}>
              <SquarePen className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedResidence(row); setIsDeleteOpen(true); }} className="text-red-500">
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      button: true,
      omit: !user?.roles?.some(role => role?.name === "Administrador") // Omitir la columna si el usuario no es administrador
    }
  ];

  const theme = useTheme().theme;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
      <DataTable
        title='Residencias'
        columns={columns}
        data={filteredResidences || []}
        theme={theme === 'dark' ? themes.dark : themes.default}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        noDataComponent="No hay residencias disponibles"
        onRowClicked={handleRowClick}
      />

      {selectedResidence && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita la residencia ${selectedResidence.name}`}
            description="Rellena el formulario para editar la residencia."
          >
            <EditResidenceModal id={selectedResidence.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar la residencia ${selectedResidence.name}`}
            description={`¿Estás seguro de que deseas eliminar la residencia ${selectedResidence.name}?`}
          >
            <DeleteResidenceModal id={selectedResidence.id} setIsOpen={setIsDeleteOpen} /> 
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
