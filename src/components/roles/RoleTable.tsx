import { getRoles } from "@/api/RoleAPI"
import { Role } from "@/types"
import { useQuery } from "@tanstack/react-query"
import DataTable from 'react-data-table-component'
import { useState } from "react"
import { SquarePen, Trash2, MoreVertical } from 'lucide-react'
import { ResponsiveDialog } from "../responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { EditRoleModal } from "@/components/roles/EditRoleModal"
import DeleteRoleModal from "@/components/roles/DeleteRoleModal"
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { themes } from "@/utils/theme"

export default function RoleTable({searchTerm}: {searchTerm: string}) {
    const {data , isLoading} = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    const filteredRoles = data?.filter((role: Role) => {
        return role.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const columns = [
        {
            name: 'Nombre',
            selector: (row: Role) => row.name,
            sortable: true,
        },
        {
            name: 'Descripción',
            selector: (row: Role) => row.description || '',
            sortable: true,
        },
        {
            name: 'Fecha de Creación',
            selector: (row: Role) => new Date(row.created_at).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row: Role) => (
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedRole(row); setIsEditOpen(true); }}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setSelectedRole(row); setIsDeleteOpen(true); }} className="text-red-500">
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
                title='Roles'
                columns={columns}
                data={filteredRoles || []}
                theme={theme === 'dark' ? themes.dark : themes.default}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
                highlightOnHover
                pointerOnHover
                noHeader
                customStyles={{ noData: { style: {
                    minHeight: '50px', // Establece la altura mínima deseada
                  } } }}
                noDataComponent="No hay roles disponibles"
            />

            {selectedRole && (
                <>
                    <ResponsiveDialog
                        isOpen={isEditOpen}
                        setIsOpen={setIsEditOpen}
                        title={`Edita el rol ${selectedRole.name}`}
                        description="Rellena el formulario para editar el rol."
                    >
                        <EditRoleModal id={selectedRole.id} setIsOpen={setIsEditOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isDeleteOpen}
                        setIsOpen={setIsDeleteOpen}
                        title={`Eliminar el rol ${selectedRole.name}`}
                        description={`¿Estás seguro de que deseas eliminar el rol ${selectedRole.name}?`}
                    >
                        <DeleteRoleModal id={selectedRole.id} setIsOpen={setIsDeleteOpen} />
                    </ResponsiveDialog>
                </>
            )}
        </div>
    )
}

