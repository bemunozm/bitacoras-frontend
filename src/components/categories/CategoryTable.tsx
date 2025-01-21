import { getCategories } from "@/api/CategoryAPI";
import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable, { createTheme } from 'react-data-table-component';
import { useState } from "react";
import { SquarePen, Trash2, MoreVertical } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditCategoryModal from "@/components/categories/EditCategoryModal";
import DeleteCategoryModal from "@/components/categories/DeleteCategoryModal";
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function CategoryTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredCategories = data?.filter((category: Category) => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
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
      selector: (row: Category) => row.name,
      sortable: true,
    },
    {
      name: 'Descripción',
      selector: (row: Category) => row.description || '',
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row: Category) => (
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSelectedCategory(row); setIsEditOpen(true); }}>
                <SquarePen className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSelectedCategory(row); setIsDeleteOpen(true); }} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        title='Categorías'
        columns={columns}
        data={filteredCategories || []}
        theme={theme === 'dark' ? 'dark' : 'default'}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        noDataComponent="No hay categorías disponibles"
      />

      {selectedCategory && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title={`Edita la categoría ${selectedCategory.name}`}
            description="Rellena el formulario para editar la categoría."
          >
            <EditCategoryModal id={selectedCategory.id} setIsOpen={setIsEditOpen} /> 
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title={`Eliminar la categoría ${selectedCategory.name}`}
            description={`¿Estás seguro de que deseas eliminar la categoría ${selectedCategory.name}?`}
          >
            <DeleteCategoryModal id={selectedCategory.id} setIsOpen={setIsDeleteOpen} /> 
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
}
