import { getProvisionCategories } from "@/api/ProvisionCategoryAPI"
import { ProvisionCategory } from "@/types"
import { useQuery } from "@tanstack/react-query"
import DataTable from 'react-data-table-component'
import { useEffect, useState } from "react"
import { SquarePen, Trash2, MoreVertical } from 'lucide-react'
import { ResponsiveDialog } from "@/components/responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EditProvisionCategoryModal from "@/components/provision_category/EditProvisionCategoryModal"
import DeleteProvisionCategoryModal from "@/components/provision_category/DeleteProvisionCategoryModal"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { themes } from "@/utils/theme"

export default function ProvisionCategoryTable({ searchTerm }: { searchTerm: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['provisionCategories'],
        queryFn: getProvisionCategories
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<ProvisionCategory | null>(null)

    const filteredCategories = data?.filter((category: ProvisionCategory) => {
        return category.name.toLowerCase().includes(searchTerm.toLowerCase());
    }); 

    const columns = [
        {
            name: 'Nombre',
            selector: (row: ProvisionCategory) => row.name,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row: ProvisionCategory) => (
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedCategory(row); setIsEditOpen(true); }}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setSelectedCategory(row); setIsDeleteOpen(true); }} className="text-red-500">
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

    const { setBreadcrumbItems } = useBreadcrumb()
    
      useEffect(() => {
        const route = [
          { label: "Escritorio", to: "/" },
          { label: "Categorías de Prestaciones", to: undefined },
        ]
        setBreadcrumbItems(route)
      }, [setBreadcrumbItems])

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
            <DataTable
                title='Categorías de Prestaciones'
                columns={columns}
                data={filteredCategories || []}
                theme={theme === 'dark' ? themes.dark : themes.default}
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
                        <EditProvisionCategoryModal id={selectedCategory.id} setIsOpen={setIsEditOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isDeleteOpen}
                        setIsOpen={setIsDeleteOpen}
                        title={`Eliminar la categoría ${selectedCategory.name}`}
                        description={`¿Estás seguro de que deseas eliminar la categoría ${selectedCategory.name}?`}
                    >
                        <DeleteProvisionCategoryModal id={selectedCategory.id} setIsOpen={setIsDeleteOpen} />
                    </ResponsiveDialog>
                </>
            )}
        </div>
    )
}
