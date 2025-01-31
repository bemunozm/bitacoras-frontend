import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import DropZone, { FileWithPreview } from "@/components/DropZone"
import { useForm } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCategories } from "@/api/CategoryAPI"
import { updateActivity, getActivity } from "@/api/ActivityAPI"
import LoadingSpinner from "@/components/LoadingSpinner"
import { toast } from "@/hooks/use-toast"
import { getPeriod } from '@/helpers'
import { useParams } from 'react-router-dom'
import type { Attachment } from '@/types'
import { useBreadcrumb } from '@/contexts/BreadcrumbContext'
import NotFound from '../NotFound'

export default function EditActivityDetailsView() {
  const [selectedAttachments, setSelectedAttachments] = useState<FileWithPreview[]>([])
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]) // Nuevo estado
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false)

  const activityId = useParams().id

  const { data: activity, isLoading: isLoadingActivity, isError } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => getActivity(+activityId!),
    enabled: !!activityId
  })

  const { data: categories, isLoading: isLoadingCategories, isError:isCategoryError } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const initialValues = {
    description: '',
    date: '', // Inicializar la fecha como una cadena vacía
    bitacora_id: 0,
    category_id: 0,
    attachments: []
  }

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: initialValues })

  useEffect(() => {
    if (activity) {
      setValue('description', activity.description);
      const date = new Date(activity.date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Ajustar la fecha para evitar el desfase de un día
      setValue('date', date.toISOString().split('T')[0]);
      setValue('bitacora_id', activity.bitacora_id);
      setValue('category_id', activity.category_id);
      setExistingAttachments(activity.attachments); // Guardar los adjuntos existentes
      setSelectedCategory(activity.category_id);
      setAttachmentsLoaded(true);
    }
  }, [activity, setValue])

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: updateActivity,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    },
    onSuccess: (data) => {
      toast({
        title: '🎉Actividad actualizada!',
        description: data,
      })
      reset()
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    }
  })

  const handleUpdate = (formData: any) => {
    const date = new Date(formData.date);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajustar la fecha para evitar el desfase de un día

    mutate({ ...formData, id: activityId, date: date, newAttachments: selectedAttachments, existingAttachments: existingAttachments });
  }

  const handleFilesAdded = (files: FileWithPreview[]) => {
    setSelectedAttachments(files)
  }

  const handleExistingFilesRemoved = (files: Attachment[]) => {
    setExistingAttachments(files)
  }

  const handleCategoryChange = (selected: string) => {
    setSelectedCategory(parseInt(selected))
  }

  const {setBreadcrumbItems} = useBreadcrumb()

  useEffect(() => {
    const routes = [
      {label: 'Escritorio', to: '/'},
      {label: 'Bitácoras', to: '/bitacoras'},
      {label: 'Actividades', to: `/bitacoras/${activity?.bitacora_id}/actividades`},
      {label: 'Editar Actividad', to: `/bitacoras/${activity?.bitacora_id}/actividades/${activityId}/editar`}
    ]

    setBreadcrumbItems(routes)

    if (activity) {
      setBreadcrumbItems([...routes, {label: `Actividad de la bitácora ${getPeriod(activity.date)}`}])
    }
  }, [activity, activityId, setBreadcrumbItems])

  if (isLoadingActivity || isLoadingCategories || !attachmentsLoaded) return <LoadingSpinner/>
  if (isError || isCategoryError) return <NotFound title="¡Rayos!" description="Hubo un problema al obtener la información de la actividad." />

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{'Actividad de la bitácora ' + getPeriod(activity.date)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right dark:text-sidebar-foreground">
                    Fecha
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-3 dark:text-sidebar-foreground"
                    {...register('date', { required: 'Este campo es requerido' })}
                  />
                  {errors.date && <p className="col-start-2 col-end-4 text-red-500">{errors.date.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category_id" className="text-right dark:text-sidebar-foreground">
                    Categoría
                  </Label>
                  <div className="col-span-3 mt-2 dark:text-sidebar-foreground">
                    {isLoadingCategories ? (
                      <p>Cargando Categorías</p>
                    ) : (
                      <Select
                        value={selectedCategory?.toString() || ''}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una categoría">
                            {categories?.find(category => category.id === selectedCategory)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories!.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {errors.category_id && <p className="col-start-2 col-end-4 text-red-500">{errors.category_id.message}</p>}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción de la actividad"
                    className="col-span-3 dark:text-sidebar-foreground min-h-40"
                    {...register('description', { required: 'Este campo es requerido' })}
                  />
                  {errors.description && <p className="col-start-2 col-end-4 text-red-500">{errors.description.message}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <DropZone
                  onFilesAdded={handleFilesAdded}
                  onExistingFilesRemoved={handleExistingFilesRemoved}
                  maxFiles={5}
                  maxSize={5 * 1024 * 1024}
                  accept="image/*,application/pdf"
                  initialFiles={selectedAttachments}
                  existingFiles={existingAttachments}
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div>
        <h2 className="text-2xl font-bold tracking-tight dark:text-sidebar-foreground">Previsualización de Anexos o Evidencias</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {existingAttachments.map(attachment => (
            <div key={attachment.id} className="relative">
              <img src={attachment.image} alt={attachment.image.split('/').pop()} className="w-full h-auto" />
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
