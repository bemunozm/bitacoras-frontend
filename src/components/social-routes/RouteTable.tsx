import { useState } from 'react';
import DataTable, { createTheme } from 'react-data-table-component';
import { useTheme } from '../theme-provider';
import { CircleCheck, CircleX } from 'lucide-react';
import DeleteDeliverBenefitModal from './DeleteDeliverBenefitModal'; // Importar el modal
import { ResponsiveDialog } from '../responsive-dialog';

type RouteTableProps = {
  data: any;
};

export default function RouteTable({ data }: RouteTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedPersonName, setSelectedPersonName] = useState<string>(''); // Nuevo estado para el nombre de la persona

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
      name: 'Nº',
      selector: (row: any) => data.indexOf(row) + 1,
      sortable: true,
    },
    {
      name: 'Nombre',
      selector: (row: any) => row.participant.name,
      sortable: true,
    },
    {
      name: 'Sexo',
      selector: (row: any) => row.participant.gender,
      sortable: true,
    },
    {
      name: 'Edad',
      selector: (row: any) => {
        const birthDate = row.participant.birthdate ? new Date(row.participant.birthdate) : new Date();
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
      name: 'Fecha de Nacimiento',
      selector: (row: any) => new Date(row.participant.birthdate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Nº Cedula',
      selector: (row: any) => row.participant.run,
      sortable: true,
    },
    {
      name: 'Nacionalidad',
      selector: (row: any) => row.participant.nationality,
      sortable: true,
    },
    {
      name: 'E.Base',
      cell: (row: any) => row.participant.diseases.length > 0 ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/>,
      ignoreRowClick: true,
      button: true,
      sortable: true,
    },
    {
      name: 'Alimentación',
      cell: (row: any) => row.provisions?.some((provision: any) => provision.category.name === 'Alimentación') ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/>,
      ignoreRowClick: true,
      button: true,
      sortable: true,
    },
    {
      name: 'Abrigo',
      cell: (row: any) => row.provisions?.some((provision: any) => provision.category.name === 'Abrigo') ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/>,
      ignoreRowClick: true,
      button: true,
      sortable: true,
    },
    {
      name: 'Higiene',
      cell: (row: any) => row.provisions?.some((provision: any) => provision.category.name === 'Higiene') ? <CircleCheck className="text-green-500 text-center"/> : <CircleX className="text-red-500"/>,
      ignoreRowClick: true,
      button: true,
      sortable: true,
    },
  ];

  const theme = useTheme().theme;

  const handleRowClick = (row: any) => {
    const benefitIds = row.provisions.map((provision: any) => provision.pivotId.toString());
    setSelectedBenefits(benefitIds);
    setSelectedPersonName(row.participant.name); // Establecer el nombre de la persona seleccionada
    setIsModalOpen(true);
  };

  return (
    <div className="grid grid-cols-1 overflow-x-scroll rounded-md border dark:border-sidebar-border">
      <DataTable
        title='Prestaciones Asignadas'
        columns={columns}
        data={data || []}
        theme={theme === 'dark' ? 'dark' : 'default'}
        pagination
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de', selectAllRowsItem: true, selectAllRowsItemText: 'Todos' }}
        highlightOnHover
        pointerOnHover
        noHeader
        noDataComponent="Al parecer no hay prestaciones asignadas para esta fecha y turno."
        onRowClicked={handleRowClick} // Agregar evento onRowClicked
      />
      {isModalOpen && (
        <ResponsiveDialog
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          title={`¿Deseas eliminar a ${selectedPersonName} de la lista de prestaciones asignadas?`} // Mostrar el nombre de la persona
          description="Se eliminarán las prestaciones asignadas a este participante."
        >
            <DeleteDeliverBenefitModal
            benefits={selectedBenefits} // Pasar las IDs de los beneficios
            setIsOpen={setIsModalOpen}
          />
        </ResponsiveDialog>
      )}
    </div>
  );
}
