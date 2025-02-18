import { getUsers } from "@/api/UserAPI"
import { User } from "@/types"
import { useQuery } from "@tanstack/react-query"
import DataTable from 'react-data-table-component'
import { useState } from "react"
import { SquarePen, Trash2, CircleCheck, CircleX, MoreVertical } from 'lucide-react'
import { ResponsiveDialog } from "@/components/responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { getRoles } from "@/api/RoleAPI"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditUserModal } from "@/components/users/EditUserModal"
import { DeleteUserModal } from "@/components/users/DeleteUserModal"
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { themes } from "@/utils/theme";

export default function UserTable({searchTerm}: {searchTerm: string}) {
    const {data , isLoading} = useQuery({
        queryKey: ['users'],
        queryFn: getUsers
    })

    const {data: roles} = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const filteredUsers = data?.filter((user: User) => {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase()) && !user.is_replacement;
    });

    

    const columns = [
        {
            name: 'Avatar',
            cell: (row: User) => (
                <Avatar className="h-8 w-8 rounded-lg">
                    {row.profile_image ? (
                        <AvatarImage src={row.profile_image} alt={row.name} />
                    ) : (<AvatarImage src="/avatars/shadcn.jpg" alt={row.name} />)}
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
            ),
            ignoreRowClick: true,
            
            button: true
        },
        {
            name: 'Nombre',
            selector: (row: User) => row.name,
            sortable: true,
        },
        {
            name: 'Cargo',
            selector: (row: User) => row.job_position || '',
            sortable: true,
        },
        {
            name: 'Run',
            selector: (row: User) => row.run || '',
            sortable: true,
        },
        ...roles?.map(role => ({
            name: role.name,
            cell: (row: User) => row.roles?.some(userRole => userRole?.id === role.id) ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/>,
            ignoreRowClick: true,
            
            button: true
        })) || [],
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
                        <DropdownMenuItem onClick={() => { setSelectedUser(row); setIsEditOpen(true); }}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setSelectedUser(row); setIsDeleteOpen(true); }} className="text-red-500">
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
                title='Usuarios'
                columns={columns}
                data={filteredUsers || []}
                theme={theme === 'dark' ? themes.dark : themes.default}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
                highlightOnHover
                pointerOnHover
                noHeader
                customStyles={{ noData: { style: {
                    minHeight: '50px', // Establece la altura mínima deseada
                  } } }}
                noDataComponent="No hay usuarios disponibles"
            />

            {selectedUser && (
                <>
                    <ResponsiveDialog
                        isOpen={isEditOpen}
                        setIsOpen={setIsEditOpen}
                        title={`Edita el usuario ${selectedUser.name}`}
                        description="Rellena el formulario para editar el usuario."
                    >
                        <EditUserModal id={selectedUser.id} setIsOpen={setIsEditOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isDeleteOpen}
                        setIsOpen={setIsDeleteOpen}
                        title={`Eliminar el usuario ${selectedUser.name}`}
                        description={`¿Estás seguro de que deseas eliminar el usuario ${selectedUser.name}?`}
                    >
                        <DeleteUserModal id={selectedUser.id} setIsOpen={setIsDeleteOpen} />
                    </ResponsiveDialog>
                </>
            )}
        </div>
    )
}
