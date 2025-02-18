import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { Program, ProgramUser } from "@/types"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreVertical, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useTheme } from '../theme-provider'
import { themes } from '@/utils/theme'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import AssociateUserModal from '@/components/programs/AssociateUserModal'
import EditAssociateUserModal from './EditAssociateUserModal'
import DisassociateUserModal from './DisassociateUserModal'
import { PenBoxIcon } from 'lucide-react'

type ProgramUsersTableProps = {
  program: Program
  coordinatorId: number
}

export default function ProgramUsersTable({ program, coordinatorId }: ProgramUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAssociateOpen, setIsAssociateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDisassociateOpen, setIsDisassociateOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ProgramUser | null>(null)
  const theme = useTheme().theme

  // Filtrar los usuarios excluyendo al coordinador y aplicar búsqueda
  const filteredUsers = (program.users ?? [])
    .filter((user: ProgramUser) => user.user.id !== coordinatorId)
    .filter((user: ProgramUser) => 
      user.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user.run?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const columns = [
    {
      name: 'Avatar',
      cell: (row: ProgramUser) => (
        <Avatar className="h-8 w-8 rounded-lg">
          {row.user.profile_image ? (
            <AvatarImage src={row.user.profile_image} alt={row.user.name} />
          ) : (
            <AvatarImage src="/avatars/shadcn.jpg" alt={row.user.name} />
          )}
          <AvatarFallback className="rounded-lg">
            {row.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ),
      ignoreRowClick: true,
      button: true
    },
    {
      name: 'Nombre',
      selector: (row: ProgramUser) => row.user.name,
      sortable: true,
    },
    {
      name: 'Rut',
      selector: (row: ProgramUser) => row.user.run || 'Sin información',
      sortable: true,
    },
    {
      name: 'Cargo',
      selector: (row: ProgramUser) => row.user.is_replacement ? 'Reemplazo' : row.user.job_position || 'Sin información',
      sortable: true,
    },
    {
      name: 'Turno',
      selector: (row: ProgramUser) => row.turn || 'Sin información',
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row: ProgramUser) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => { 
                setSelectedUser(row); 
                setIsEditOpen(true); 
              }}
            >
              <PenBoxIcon className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => { 
                setSelectedUser(row); 
                setIsDisassociateOpen(true); 
              }} 
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Desvincular</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      ignoreRowClick: true,
      button: true
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold tracking-tight dark:text-sidebar-foreground">
          Usuarios
        </h3>
        <Button 
          onClick={() => setIsAssociateOpen(true)} 
          className="flex items-center space-x-1"
        >
          <Plus className="mr-2 h-4 w-4" />
          Asociar Usuario
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-sidebar-accent-foreground/45" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 dark:text-sidebar-foreground dark:placeholder-sidebar-foreground/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
        <DataTable
          columns={columns}
          data={filteredUsers}
          theme={theme === 'dark' ? themes.dark : themes.default}
          pagination
          paginationComponentOptions={{ 
            rowsPerPageText: 'Filas por página', 
            rangeSeparatorText: 'de', 
            selectAllRowsItem: true, 
            selectAllRowsItemText: 'Todos' 
          }}
          highlightOnHover
          pointerOnHover
          noHeader
          customStyles={{ 
            noData: { 
              style: { minHeight: '50px' } 
            } 
          }}
          noDataComponent="No hay usuarios asociados"
        />
      </div>

      <ResponsiveDialog
        isOpen={isAssociateOpen}
        setIsOpen={setIsAssociateOpen}
        title="Asociar Usuario al Programa"
        description="Selecciona un usuario para asociarlo al programa."
      >
        <AssociateUserModal 
          program={program}
          setIsOpen={setIsAssociateOpen}
        />
      </ResponsiveDialog>

      {selectedUser && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title="Editar Asociación de Usuario"
            description="Modifica los detalles de la asociación del usuario."
          >
            <EditAssociateUserModal
                programName={program.name}
              programUser={selectedUser}
              setIsOpen={setIsEditOpen}
            />
          </ResponsiveDialog>

          <ResponsiveDialog
            isOpen={isDisassociateOpen}
            setIsOpen={setIsDisassociateOpen}
            title="Desvincular Usuario"
            description={`¿Estás seguro de que deseas desvincular a ${selectedUser.user.name} del programa?`}
          >
            <DisassociateUserModal
              programUserId={selectedUser.id}
              setIsOpen={setIsDisassociateOpen}
            />
          </ResponsiveDialog>
        </>
      )}
    </div>
  )
}
