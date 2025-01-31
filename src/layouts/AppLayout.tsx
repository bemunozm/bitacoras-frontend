import LoadingSpinner from "@/components/LoadingSpinner"
import { AppSidebar } from "@/components/sidebar/AppSidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Suspense } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import { User } from "@/types"
import { useAuth } from "@/hooks/useAuth"

export default function AppLayout() {

  const {data, isLoading, isError} = useAuth()
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)
  const { breadcrumbItems } = useBreadcrumb()

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  if (isLoading) return <LoadingSpinner/>
  if (isError) return <Navigate to="/auth/login" />

  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 dark:text-sidebar-foreground" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.length ? (
                  breadcrumbItems.map((item, i) => (
                    <BreadcrumbItem key={i}>
                      {item.to ? (
                        <BreadcrumbLink href={item.to}>{item.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                      {i < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                  ))
                ) : (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/">
                        Escritorio
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathnames.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    {pathnames.map((value, index) => {
                      const to = `/${pathnames.slice(0, index + 1).join("/")}`
                      const isLast = index === pathnames.length - 1
                      return (
                        <BreadcrumbItem key={to}>
                          {isLast ? (
                            <BreadcrumbPage>{capitalizeFirstLetter(value)}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={to}>{capitalizeFirstLetter(value)}</BreadcrumbLink>
                          )}
                          {!isLast && <BreadcrumbSeparator />}
                        </BreadcrumbItem>
                      )
                    })}
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="gap-4 p-4 pt-0">
          <Suspense fallback={<LoadingSpinner />}>
           {data && <Outlet context={{ data } satisfies { data: User }} />}
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
