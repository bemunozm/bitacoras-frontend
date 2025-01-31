import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "../LoadingSpinner";
import { getDeliveredBenefit } from "@/api/ProvisionAPI";
import { updateDeliveredBenefits } from "@/api/ParticipantAPI";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getProvisions } from "@/api/ProvisionAPI";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type EditDeliveryBenefitModalProps = {
  benefitId: number;
  setIsOpen: (val: boolean) => void;
};

export default function EditDeliveryBenefitModal({
  benefitId,
  setIsOpen
}: EditDeliveryBenefitModalProps) {
  const queryClient = useQueryClient();
  const initialValues = {
    date: "",
    turn: "",
    provision_id: ""
  };
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: initialValues
  });

  const { data: currentBenefit, isLoading } = useQuery({
    queryKey: ["deliveredBenefit", benefitId],
    queryFn: () => getDeliveredBenefit(benefitId)
  });
  const { data: provisions, isLoading: isLoadingProvisions } = useQuery({
    queryKey: ["provisions-list"],
    queryFn: () => getProvisions()
  });
  const { mutate } = useMutation({
    mutationFn: (data: any) => updateDeliveredBenefits(benefitId, data),
    onSuccess: (response) => {
      toast({ title: "Beneficio editado", description: response });
        queryClient.invalidateQueries({ queryKey: ["provisions"] });
      queryClient.invalidateQueries({ queryKey: ["deliveredBenefit", +benefitId!] });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (currentBenefit) {
      setValue("date", new Date(currentBenefit.date).toISOString().split("T")[0]);
      setValue("turn", currentBenefit.turn);
      setValue("provision_id", currentBenefit.provision_id);
    }
  }, [currentBenefit, setValue]);

  const onSubmit = (formData: any) => {
    const date = new Date(formData.date)
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    mutate({ ...formData, date });
  };

  if (isLoading || isLoadingProvisions) return <LoadingSpinner className="h-10" />;
  if (!currentBenefit) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">Fecha</Label>
          <Input
            id="date"
            type="date"
            className="col-span-3"
            {...register("date", { required: "Requerido" })}
          />
          {errors.date && <p>{errors.date.message?.toString()}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="turn" className="text-right">Turno</Label>
          <Select
            value={watch("turn")}
            onValueChange={(val) => setValue("turn", val)}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecciona turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">Mañana (AM)</SelectItem>
              <SelectItem value="PM">Tarde (PM)</SelectItem>
            </SelectContent>
          </Select>
          {errors.turn && <p>{errors.turn.message?.toString()}</p>}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="provision_id" className="text-right">Beneficio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="col-span-3 w-full justify-between"
              >
                {provisions?.find((prov: any) => prov.id === +watch("provision_id"))?.name || "Seleccione un beneficio"}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Buscar beneficio..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No se encontraron beneficios.</CommandEmpty>
                  <CommandGroup>
                    {provisions?.map((prov: any) => (
                      <CommandItem
                        key={prov.id}
                        value={prov.name}
                        onSelect={() => setValue("provision_id", String(prov.id))}
                      >
                        {prov.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            String(prov.id) === watch("provision_id") ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.provision_id && <p>{errors.provision_id.message?.toString()}</p>}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
