import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, ChevronsLeft, ChevronsRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react";
import { ResponsiveDialog } from "../responsive-dialog";
import DeliverBenefitModal from "../social-routes/DeliverBenefitModal";
import { Participant } from "@/types"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getProvisionsByParticipant } from "@/api/ProvisionAPI"
import EditDeliveryBenefitModal from "../social-routes/EditDeliveryBenefitModal"
import DeleteDeliverBenefitModal from "../social-routes/DeleteDeliverBenefitModal"

type ProvisionTrackingProps = {
    participantId: Participant['id'];
}

export default function ProvisionTracking({ participantId }: ProvisionTrackingProps) {
  const [isDeliverOpen, setIsDeliverOpen] = useState(false);
  const [turn, setTurn] = useState<string>("AM");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(null);

  const {data: provisions} = useSuspenseQuery({
      queryKey: ['provisions', participantId],
      queryFn: () => getProvisionsByParticipant(+participantId!),
  })

  useEffect(() => {
      const currentHour = new Date().getHours();
      if (currentHour < 13) {
        setTurn("AM");
      } else {
        setTurn("PM");
      }
    }, []);

    

  const sortedProvisions = provisions?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  const totalPages = Math.ceil(sortedProvisions.length / itemsPerPage);
  const provisionsToShow = sortedProvisions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        isOpen={isDeliverOpen}
        setIsOpen={setIsDeliverOpen}
        title="Entregar Beneficio"
        description="Rellena el formulario para entregar un beneficio."
      >
        <DeliverBenefitModal
          setIsOpen={setIsDeliverOpen}
          isParticipantFormOpen={false}
          setIsParticipantFormOpen={() => {}}
          date={new Date()}
          turn={turn}
          participantId={participantId}
        />
      </ResponsiveDialog>
      {selectedBenefitId && (
        <>
          <ResponsiveDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            title="Editar entrega"
            description="Rellena el formulario para editar la entrega."
          >
            <EditDeliveryBenefitModal
              benefitId={+selectedBenefitId}
              setIsOpen={setIsEditOpen}
            />
          </ResponsiveDialog>
          <ResponsiveDialog
            isOpen={isDeleteOpen}
            setIsOpen={setIsDeleteOpen}
            title="Eliminar entrega"
            description="¿Estás seguro de que deseas eliminar esta entrega?"
          >
            <DeleteDeliverBenefitModal
              benefits={[selectedBenefitId]}
              setIsOpen={setIsDeleteOpen}
            />
          </ResponsiveDialog>
        </>
      )}
      <Card className="w-full overflow-x-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 dark:bg-transparent dark:border-b dark:border-sidebar-border">
          <CardTitle className="text-lg font-semibold flex items-center text-blue-700 dark:text-sidebar-ring">
            <Package className="mr-2 text-blue-500" />
            Seguimiento de Prestaciones
          </CardTitle>
          <Button variant="outline" size="icon" className="bg-white hover:bg-blue-100" onClick={() => setIsDeliverOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="min-h-[300px]">
            {provisionsToShow.length === 0 ? (
              <p className="text-center text-gray-500">No se han registrado prestaciones</p>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provisionsToShow.map((provision: any) => (
                    <TableRow
                      key={provision.id}
                      onClick={() => {
                        setSelectedBenefitId(provision.id);
                        setIsEditOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">{provision.provision.category?.name}</TableCell>
                      <TableCell>{new Date(provision.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant='default' className={provision.turn === "PM" ? "bg-orange-500 dark:bg-orange-500 hover:bg-orange-400 dark:hover:bg-orange-400" : "bg-cyan-500 dark:bg-cyan-500 hover:bg-cyan-400 dark:hover:bg-cyan-400"}>{provision.turn}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBenefitId(provision.id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {provisionsToShow.length > 0 && (
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
  )
}
