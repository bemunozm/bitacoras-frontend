import { getCategories } from "@/api/CategoryAPI";
import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUpDown, MoreVertical, SquarePen, Trash2 } from 'lucide-react';
import { ResponsiveDialog } from "../responsive-dialog";
import LoadingSpinner from "../LoadingSpinner";
import EditCategoryModal from "@/components/categories/EditCategoryModal";
import DeleteCategoryModal from "@/components/categories/DeleteCategoryModal";

export default function CategoryTable({ searchTerm }: { searchTerm: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Category;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: keyof Category) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const filteredAndSortedCategories = data && data
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="overflow-x-auto rounded-md border dark:border-sidebar-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
              <div className="flex items-center space-x-1">
                <span>Nombre</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('description')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center space-x-1">
                <span>Descripción</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-[50px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedCategories && filteredAndSortedCategories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium dark:text-sidebar-foreground">{category.name}</TableCell>
              <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{category.description}</TableCell>
              <TableCell className="dark:text-sidebar-foreground">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedCategory(category);
                      setIsEditOpen(true);
                    }}>
                      <SquarePen className="h-4 w-4 mr-2" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedCategory(category);
                      setIsDeleteOpen(true);
                    }} className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
