import { getRoles } from "@/api/RoleAPI"
import { Role } from "@/types"
import { useQuery } from "@tanstack/react-query"
import DataTable, { createTheme } from 'react-data-table-component'
import { useState } from "react"
import { SquarePen, Trash2, MoreVertical } from 'lucide-react'
import { ResponsiveDialog } from "../responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { EditRoleModal } from "@/components/roles/EditRoleModal"
import DeleteRoleModal from "@/components/roles/DeleteRoleModal"
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
                theme={theme === 'dark' ? 'dark' : 'default'}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
                highlightOnHover
                pointerOnHover
                noHeader
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

