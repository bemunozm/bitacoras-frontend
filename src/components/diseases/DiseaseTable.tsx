import { getDiseases } from "@/api/DiseaseAPI";
import { Disease } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable, { createTheme } from 'react-data-table-component';
import { useState } from "react";
import { SquarePen, Trash2, MoreVertical } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditDiseaseModal from "@/components/diseases/EditDiseaseModal";
import DeleteDiseaseModal from "@/components/diseases/DeleteDiseaseModal";
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function DiseaseTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['diseases'],
    queryFn: getDiseases
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const filteredDiseases = data?.filter((disease: Disease) => {
    return disease.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  createTheme(
    'dark',
    {
        text: {
            primary: '#f0f0f0',
            secondary: '#c0c0c0',
        },
        background: {
            default: 'transparent',
        },
        context: {
            background: '#3a3a3a',
            text: '#f0f0f0',
        },
        divider: {
            default: '#2a2a2a',
        },
        button: {
            default: '#3a3a3a',
            hover: 'rgba(0,0,0,.08)',
            focus: 'rgba(255,255,255,.12)',
            disabled: 'rgba(255, 255, 255, .34)',
        },
        sortFocus: {
            default: '#3a3a3a',
        },
    },
    'dark',
);

createTheme(
    'default',
    {
        text: {
            primary: '#3f3f3f',
            secondary: '#1a1a1a',
        },
        background: {
            default: 'transparent',
        },
        context: {
            background: '#e0e0e0',
            text: '#1a1a1a',
        },
        divider: {
            default: '#d0d0d0',
        },
        button: {
            default: '#e0e0e0',
            hover: 'rgba(0,0,0,.08)',
            focus: 'rgba(0,0,0,.12)',
            disabled: 'rgba(0, 0, 0, .34)',
        },
        sortFocus: {
            default: '#e0e0e0',
        },
    },
    'default',
);


  const columns = [
    {
      name: 'Nombre',
      selector: (row: Disease) => row.name,
      sortable: true,
    },
    {
      name: 'Tipo',
      selector: (row: Disease) => row.type,
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row: Disease) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedDisease(row); setIsEditOpen(true); }}>
              <SquarePen className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSelectedDisease(row); setIsDeleteOpen(true); }} className="text-red-500">
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
        title='Enfermedades'
        columns={columns}
        data={filteredDiseases || []}
        theme={theme === 'dark' ? 'dark' : 'default'}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        noDataComponent="No hay enfermedades disponibles"
      />

      {selectedDisease && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita la enfermedad ${selectedDisease.name}`}
            description="Rellena el formulario para editar la enfermedad."
          >
            <EditDiseaseModal id={selectedDisease.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar la enfermedad ${selectedDisease.name}`}
            description={`¿Estás seguro de que deseas eliminar la enfermedad ${selectedDisease.name}?`}
          >
            <DeleteDiseaseModal id={selectedDisease.id} setIsOpen={setIsDeleteOpen} /> 
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
