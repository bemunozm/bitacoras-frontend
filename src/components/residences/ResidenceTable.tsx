import { getResidences } from "@/api/ResidenceAPI";
import { Residence } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable, { createTheme } from 'react-data-table-component';
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

export default function ResidenceTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['residences'],
    queryFn: getResidences
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null);

  const navigate = useNavigate();

  const handleRowClick = (row: Residence) => {
    navigate(`/residencias/${row.id}`);
  };

  const filteredResidences = data?.filter((residence: Residence) => {
    return residence.name.toLowerCase().includes(searchTerm.toLowerCase());
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
      
      button: true
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
        theme={theme === 'dark' ? 'dark' : 'default'}
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
