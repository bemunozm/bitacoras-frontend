import { getProvisions } from "@/api/ProvisionAPI"
import { Provision } from "@/types"
import { useQuery } from "@tanstack/react-query"
import DataTable from 'react-data-table-component'
import { useState } from "react"
import { SquarePen, Trash2, MoreVertical } from 'lucide-react'
import { ResponsiveDialog } from "@/components/responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditProvisionModal } from "@/components/provisions/EditProvisionModal"
import { DeleteProvisionModal } from "@/components/provisions/DeleteProvisionModal"
import { themes } from "@/utils/theme"

export default function ProvisionTable({searchTerm}: {searchTerm: string}) {
    const {data , isLoading} = useQuery({
        queryKey: ['provisions'],
        queryFn: getProvisions
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedProvision, setSelectedProvision] = useState<Provision | null>(null)

    const filteredProvisions = data?.filter((provision: Provision) => {
        return provision.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const columns = [
        {
            name: 'Nombre',
            selector: (row: Provision) => row.name,
            sortable: true,
        },
        {
            name: 'Descripción',
            selector: (row: Provision) => row.description || '',
            sortable: true,
        },
        {
            name: 'Categoría',
            selector: (row: Provision) => row.category?.name || '',
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row: Provision) => (
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedProvision(row); setIsEditOpen(true); }}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setSelectedProvision(row); setIsDeleteOpen(true); }} className="text-red-500">
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

    if(isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
            <DataTable
                title='Prestaciones'
                columns={columns}
                data={filteredProvisions || []}
                theme={theme === 'dark' ? themes.dark : themes.default }
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
                highlightOnHover
                pointerOnHover
                noHeader
                noDataComponent="No hay prestaciones disponibles"
            />

            {selectedProvision && (
                <>
                    <ResponsiveDialog
                        isOpen={isEditOpen}
                        setIsOpen={setIsEditOpen}
                        title={`Edita la prestación ${selectedProvision.name}`}
                        description="Rellena el formulario para editar la prestación."
                    >
                        <EditProvisionModal id={selectedProvision.id} setIsOpen={setIsEditOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isDeleteOpen}
                        setIsOpen={setIsDeleteOpen}
                        title={`Eliminar la prestación ${selectedProvision.name}`}
                        description={`¿Estás seguro de que deseas eliminar la prestación ${selectedProvision.name}?`}
                    >
                        <DeleteProvisionModal id={selectedProvision.id} setIsOpen={setIsDeleteOpen} />
                    </ResponsiveDialog>
                </>
            )}
        </div>
    )
}
