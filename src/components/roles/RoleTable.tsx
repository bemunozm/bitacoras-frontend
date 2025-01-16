import { getRoles } from "@/api/RoleAPI"
import { Role } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/helpers"
import { EditRoleModal } from "@/components/roles/EditRoleModal"
import DeleteRoleModal from "@/components/roles/DeleteRoleModal"
import { useState } from "react"
import { ArrowUpDown, MoreVertical, SquarePen, Trash2 } from 'lucide-react'
import { ResponsiveDialog } from "../responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"

export default function RoleTable({searchTerm}: {searchTerm: string}) {
    const {data , isLoading} = useQuery({
        queryKey: ['roles'],
        queryFn: getRoles
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    const [sortConfig, setSortConfig] = useState<{
        key: keyof Role
        direction: 'asc' | 'desc'
    } | null>(null)
    
    const handleSort = (key: keyof Role) => {
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
    
    const filteredAndSortedRoles = data && data
    .filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer hidden lg:table-cell">
                            <div className="flex items-center space-x-1">
                                <span>Fecha de Creación</span>
                                <ArrowUpDown className="h-4 w-4" />
                            </div>
                        </TableHead>
                        <TableHead className="w-[50px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAndSortedRoles && filteredAndSortedRoles.map((role) => (
                        <TableRow key={role.id}>
                            <TableCell className="font-medium dark:text-sidebar-foreground">{role.name}</TableCell>
                            <TableCell className="dark:text-sidebar-foreground hidden md:table-cell">{role.description}</TableCell>
                            <TableCell className="dark:text-sidebar-foreground hidden lg:table-cell">{formatDate(role.created_at)}</TableCell>
                            <TableCell className="dark:text-sidebar-foreground">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedRole(role)
                                            setIsEditOpen(true)
                                        }}>
                                            <SquarePen className="h-4 w-4 mr-2" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedRole(role)
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

