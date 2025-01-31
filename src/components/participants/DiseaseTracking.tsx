import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Plus, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Participant } from '@/types';
import { useSuspenseQuery } from "@tanstack/react-query";
import { getDiseasesByParticipant } from "@/api/ParticipantAPI";
import { useState } from "react";
import { ResponsiveDialog } from "../responsive-dialog";
import AssignDiseaseModal from "../diseases/AssignDiseaseModal";
import EditAssignedDiseaseModal from "../diseases/EditAssignedDiseaseModal";
import UnAssignDiseaseModal from "../diseases/UnAssignDiseaseModal";

type DiseaseTrackingProps = {
    participantId: Participant['id'];
};

export default function DiseaseTracking({ participantId }: DiseaseTrackingProps) {

    const { data: enfermedades } = useSuspenseQuery({
        queryKey: ['diseases', participantId],
        queryFn: () => getDiseasesByParticipant(+participantId!)
    });

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUnassignOpen, setIsUnassignOpen] = useState(false);
    const [selectedDiseaseId, setSelectedDiseaseId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const sortedDiseases = enfermedades?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];
    const totalPages = Math.ceil(sortedDiseases.length / itemsPerPage);
    const diseasesToShow = sortedDiseases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };


    return (
        <>
            <ResponsiveDialog
                isOpen={isAssignOpen}
                setIsOpen={setIsAssignOpen}
                title="Asignar una nueva enfermedad"
                description="Rellena el formulario para asignar una nueva enfermedad."
            >
                <AssignDiseaseModal participant_id={participantId} setIsOpen={setIsAssignOpen} />
            </ResponsiveDialog>

            {selectedDiseaseId && (
                <>
                    <ResponsiveDialog
                        isOpen={isEditOpen}
                        setIsOpen={setIsEditOpen}
                        title="Editar enfermedad asignada"
                        description="Rellena el formulario para editar la enfermedad asignada."
                    >
                        <EditAssignedDiseaseModal id={selectedDiseaseId} setIsOpen={setIsEditOpen} />
                    </ResponsiveDialog>
                    <ResponsiveDialog
                        isOpen={isUnassignOpen}
                        setIsOpen={setIsUnassignOpen}
                        title="Desasignar enfermedad"
                        description="¿Estás seguro de que deseas desasignar esta enfermedad?"
                    >
                        <UnAssignDiseaseModal id={selectedDiseaseId} setIsOpen={setIsUnassignOpen} />
                    </ResponsiveDialog>
                </>
            )}

            <Card className="w-full overflow-x-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-red-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
                    <CardTitle className="text-lg font-semibold flex items-center text-red-700 dark:text-red-500">
                        <Heart className="mr-2 text-red-500" />
                        Enfermedades Asociadas
                    </CardTitle>
                    <Button variant="outline" size="icon" className="bg-white hover:bg-red-100" onClick={() => setIsAssignOpen(true)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="min-h-[300px]">
                        {diseasesToShow.length === 0 ? (
                            <p className="text-center text-gray-500">No se han registrado enfermedades</p>
                        ) : (
                            <ul className="space-y-2 w-full">
                                {diseasesToShow.map((enfermedad: any) => (
                                    <li
                                        key={enfermedad.id}
                                        className="flex items-center justify-between p-2 rounded-md shadow-sm border border-sidebar-border cursor-pointer"
                                        onClick={() => { setSelectedDiseaseId(enfermedad.id); setIsEditOpen(true); }}
                                    >
                                        <span>{enfermedad.disease.name}</span>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant='outline' className={`${enfermedad.treatment_status === 'En tratamiento' ? 'bg-green-500 text-white' : enfermedad.treatment_status === 'Pendiente' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'}`} >
                                                {enfermedad.treatment_status}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-red-500"
                                                onClick={(e) => { e.stopPropagation(); setSelectedDiseaseId(enfermedad.id); setIsUnassignOpen(true); }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {diseasesToShow.length > 0 && (
                        <div className="flex justify-between items-center mt-4">
                            <Button 
                                variant="ghost" 
                                className="flex items-center space-x-2"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <Button 
                                variant="ghost" 
                                className="flex items-center space-x-2"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
