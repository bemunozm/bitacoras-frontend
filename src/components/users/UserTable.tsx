import { getUsers } from "@/api/UserAPI"
import { User } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ArrowUpDown, CircleCheck, CircleX, MoreVertical, SquarePen, Trash2 } from 'lucide-react'
import { ResponsiveDialog } from "@/components/responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { getRoles } from "@/api/RoleAPI"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditUserModal } from "@/components/users/EditUserModal"
import { DeleteUserModal } from "@/components/users/DeleteUserModal"

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

    const [sortConfig, setSortConfig] = useState<{
        key: keyof User
        direction: 'asc' | 'desc'
    } | null>(null)
    
    const handleSort = (key: keyof User) => {
        setSortConfig(current => {
            if (!current || current.key !== key) {
                return { key, direction: 'asc' }
            }
            if (current.direction === 'asc') {
                return { key, direction: 'desc' }
            }
            return null
        })
    }
    
    const filteredAndSortedUsers = data && data
    .filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.job_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.run?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
        if (!sortConfig) return 0
        
        const aValue = a[sortConfig.key] || ''
        const bValue = b[sortConfig.key] || ''
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
    })
    
    if(isLoading) {
      return <LoadingSpinner />
    }

    return (
        <div className="overflow-x-auto rounded-md border dark:border-sidebar-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer">
                            <div className="flex items-center space-x-1">
                                <span>Avatar</span>
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                            <div className="flex items-center space-x-1">
                                <span>Nombre</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('job_position')} className="cursor-pointer hidden md:table-cell">
                            <div className="flex items-center space-x-1">
                                <span>Cargo</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('run')} className="cursor-pointer hidden lg:table-cell">
                            <div className="flex items-center space-x-1">
                                <span>Run</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        {roles && (
                            roles.map(role => (
                                <TableHead key={role.id} className="cursor-pointer hidden lg:table-cell">
                                    <div className="flex items-center space-x-1">
                                        <span>{role.name}</span>
                                    </div>
                                </TableHead>
                            ))
                        )
                        }
                        <TableHead className="w-[50px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAndSortedUsers && filteredAndSortedUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium dark:text-sidebar-foreground">
                            <Avatar className="h-8 w-8 rounded-lg">
                                {user.profile_image ? (
                                    <AvatarImage src={user.profile_image} alt={user.name} />
                                    ) : (<AvatarImage src="/avatars/shadcn.jpg" alt={user.name} />)}
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                            </TableCell>
                            <TableCell className="font-medium dark:text-sidebar-foreground">{user.name}</TableCell>
                            <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{user.job_position}</TableCell>
                            <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{user.run}</TableCell>
                            {roles && (
                                roles.map(role => (
                                    <TableCell key={role.id} className="dark:text-sidebar-foreground hidden lg:table-cell">{user.roles?.some(userRole => userRole?.id === role.id) ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/> }</TableCell>
                                ))
                            )    
                            }
                            <TableCell className="dark:text-sidebar-foreground">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedUser(user)
                                            setIsEditOpen(true)
                                        }}>
                                            <SquarePen className="h-4 w-4 mr-2" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedUser(user)
                                            setIsDeleteOpen(true)
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
