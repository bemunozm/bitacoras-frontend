import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useQuery } from "@tanstack/react-query"
import { getActivity } from "@/api/ActivityAPI"
import LoadingSpinner from "@/components/LoadingSpinner"
import { getPeriod } from '@/helpers'
import { useParams } from 'react-router-dom'
import type { Attachment } from '@/types'
import { useBreadcrumb } from '@/contexts/BreadcrumbContext'
import NotFound from '../NotFound'
import { useIsMobile } from '@/hooks/use-mobile'

export default function ActivityDetailsView() {
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([])

  const activityId = useParams().id

  const { data: activity, isLoading: isLoadingActivity, isError } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => getActivity(+activityId!),
    enabled: !!activityId
  })

  useEffect(() => {
    if (activity) {
      setExistingAttachments(activity.attachments)
    }
  }, [activity])

  const {setBreadcrumbItems} = useBreadcrumb()
  
  useEffect(() => {
    const routes = [
      {label: 'Escritorio', to: '/'},
      {label: 'Bitácoras', to: '/bitacoras'},
      {label: 'Actividades', to: `/bitacoras/${activity?.bitacora_id}`},
      {label: 'Ver Actividad', to: undefined}
    ]

    setBreadcrumbItems(routes)

    if (activity) {
      setBreadcrumbItems([...routes, {label: `Actividad de la bitácora ${getPeriod(activity.date)}`}])
    }
  }, [activity, activityId, setBreadcrumbItems])

  const isMobile = useIsMobile()

  if (isLoadingActivity) return <LoadingSpinner/>

  if (isError) return <NotFound title="¡Ups!" description="Hubo un problema al obtener la información de la actividad." />

  return (
    <div className="p-6 space-y-6">
      {!isMobile && (
        <Card>
          <CardHeader>
            <CardTitle>{'Actividad de la bitácora ' + getPeriod(activity.date)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right dark:text-sidebar-foreground">
                      Fecha
                    </Label>
                    <p className="col-span-3 dark:text-sidebar-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category_id" className="text-right dark:text-sidebar-foreground">
                      Categoría
                    </Label>
                    <p className="col-span-3 dark:text-sidebar-foreground">{activity.category.name}</p>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right dark:text-sidebar-foreground">
                      Descripción
                    </Label>
                    <p className="col-span-3 dark:text-sidebar-foreground">{activity.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {isMobile && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-sidebar-foreground my-4">Detalles de la Actividad</h2>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="date" className="dark:text-sidebar-foreground">
                  Fecha
                </Label>
                <p className="dark:text-sidebar-foreground">{new Date(activity.date).toLocaleDateString()}</p>
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="category_id" className="dark:text-sidebar-foreground">
                  Categoría
                </Label>
                <p className="dark:text-sidebar-foreground">{activity.category.name}</p>
              </div>
              <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="description" className="dark:text-sidebar-foreground">
                  Descripción
                </Label>
                <p className="dark:text-sidebar-foreground">{activity.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold tracking-tight dark:text-sidebar-foreground">Anexos o Evidencias</h2>
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
