
import { useQuery } from "@tanstack/react-query"
import DataTable from 'react-data-table-component'
import { useState } from "react"
import { SquarePen, Trash2, MoreVertical } from 'lucide-react'
import { ResponsiveDialog } from "@/components/responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { EditReplacementModal } from "@/components/replacements/EditReplacementModal"
import { DeleteReplacementModal } from "@/components/replacements/DeleteReplacementModal"
import { useTheme } from '../theme-provider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { themes } from "@/utils/theme"
import { getReplacements } from "@/api/UserAPI"
import { User } from "@/types"

export default function ReplacementTable({searchTerm}: {searchTerm: string}) {
    const {data , isLoading} = useQuery({
        queryKey: ['replacements'],
        queryFn: getReplacements
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedReplacement, setSelectedReplacement] = useState<User | null>(null)

    const filteredReplacements = data?.filter((replacement: User) => {
        return replacement.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const columns = [
        {
            name: 'Nombre',
            selector: (row: User) => row.name,
            sortable: true,
        },
        {
            name: 'RUT',
            selector: (row: User) => row.run || '',
            sortable: true,
        },
        {
            name: 'Email',
            selector: (row: User) => row.email || '',
            sortable: true,
        },
        {
            name: 'Teléfono',
            selector: (row: User) => row.phone || '',
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row: User) => (
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedReplacement(row); setIsEditOpen(true); }}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setSelectedReplacement(row); setIsDeleteOpen(true); }} className="text-red-500">
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
                columns={columns}
                data={filteredReplacements || []}
                theme={theme === 'dark' ? themes.dark : themes.default}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
                highlightOnHover
                pointerOnHover
                noHeader
                customStyles={{ noData: { style: { minHeight: '50px' } } }}
                noDataComponent="No hay reemplazos disponibles"
            />

            {selectedReplacement && (
                <>
                    <ResponsiveDialog
                        isOpen={isEditOpen}
                        setIsOpen={setIsEditOpen}
                        title={`Editar reemplazo ${selectedReplacement.name}`}
                        description="Rellena el formulario para editar el reemplazo."
                    >
                        <EditReplacementModal id={selectedReplacement.id} setIsOpen={setIsEditOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isDeleteOpen}
                        setIsOpen={setIsDeleteOpen}
                        title={`Eliminar reemplazo ${selectedReplacement.name}`}
                        description={`¿Estás seguro de que deseas eliminar el reemplazo ${selectedReplacement.name}?`}
                    >
                        <DeleteReplacementModal id={selectedReplacement.id} setIsOpen={setIsDeleteOpen} />
                    </ResponsiveDialog>
                </>
            )}
        </div>
    )
}
