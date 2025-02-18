import { getCategories } from "@/api/CategoryAPI";
import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";
import DataTable from 'react-data-table-component';
import { useState } from "react";
import { SquarePen, Trash2, MoreVertical } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditCategoryModal from "@/components/categories/EditCategoryModal";
import DeleteCategoryModal from "@/components/categories/DeleteCategoryModal";
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { themes } from "@/utils/theme";

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
      cell: (row: Category) => {
        const maxLength = 50;
        const text = row.description || '';
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
      },
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
        theme={theme === 'dark' ? themes.dark : themes.default}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        customStyles={{ noData: { style: {
          minHeight: '50px', // Establece la altura mínima deseada
        } } }}
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
