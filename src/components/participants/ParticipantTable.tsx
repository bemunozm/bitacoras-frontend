import { getParticipants } from "@/api/ParticipantAPI"
import { Participant } from "@/types"
import { useQuery } from "@tanstack/react-query"
import DataTable from 'react-data-table-component'
import { useState } from "react"
import { SquarePen, Trash2, MoreVertical } from 'lucide-react'
import { ResponsiveDialog } from "@/components/responsive-dialog"
import LoadingSpinner from "../LoadingSpinner"
import { useTheme } from '../theme-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditParticipantModal } from "@/components/participants/EditParticipantModal"
import { DeleteParticipantModal} from "@/components/participants/DeleteParticipantModal"
import { useNavigate } from 'react-router-dom';

export default function ParticipantTable({searchTerm}: {searchTerm: string}) {
    const {data , isLoading} = useQuery({
        queryKey: ['participants'],
        queryFn: getParticipants
    })

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

    const navigate = useNavigate();

    const handleRowClick = (row: Participant) => {
        navigate(`/participantes/${row.id}`);
    };

    const filteredParticipants = data?.filter((participant: Participant) => {
        const normalizedRun = participant.run?.replace(/[\.\-]/g, '').toLowerCase() || '';
        const normalizedSearchTerm = searchTerm.replace(/[\.\-]/g, '').toLowerCase();
        return participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               normalizedRun.includes(normalizedSearchTerm);
    });

    const columns = [
        {
            name: 'Nombre',
            selector: (row: Participant) => row.name,
            sortable: true,
        },
        {
            name: 'Run',
            selector: (row: Participant) => row.run || '',
            sortable: true,
        },
        {
            name: 'Edad',
            selector: (row: Participant) => {
                const birthDate = row.birthdate ? new Date(row.birthdate) : new Date();
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();
                const dayDifference = today.getDate() - birthDate.getDate();
                if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
                    age--;
                }
                return age;
            },
            sortable: true,
        },
        {
            name: 'Nacionalidad',
            selector: (row: Participant) => row.nationality || '',
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row: Participant) => (
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedParticipant(row); setIsEditOpen(true); }}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setSelectedParticipant(row); setIsDeleteOpen(true); }} className="text-red-500">
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
                title='Participantes'
                columns={columns}
                data={filteredParticipants || []}
                theme={theme === 'dark' ? 'dark' : 'default'}
                pagination
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
                highlightOnHover
                pointerOnHover
                noHeader
                customStyles={{ noData: { style: {
                    minHeight: '50px', // Establece la altura mínima deseada
                  } } }}
                noDataComponent="No hay participantes disponibles"
                onRowClicked={handleRowClick}
            />

            {selectedParticipant && (
                <>
                    <ResponsiveDialog
                        isOpen={isEditOpen}
                        setIsOpen={setIsEditOpen}
                        title={`Edita el participante ${selectedParticipant.name}`}
                        description="Rellena el formulario para editar el participante."
                    >
                        <EditParticipantModal id={selectedParticipant.id} setIsOpen={setIsEditOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isDeleteOpen}
                        setIsOpen={setIsDeleteOpen}
                        title={`Eliminar el participante ${selectedParticipant.name}`}
                        description={`¿Estás seguro de que deseas eliminar el participante ${selectedParticipant.name}?`}
                    >
                        <DeleteParticipantModal id={selectedParticipant.id} setIsOpen={setIsDeleteOpen} />
                    </ResponsiveDialog>
                </>
            )}
        </div>
    )
}
