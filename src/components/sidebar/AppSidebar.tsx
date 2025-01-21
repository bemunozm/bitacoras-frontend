import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Component,
  Frame,
  Home,
  Map,
  PieChart,
  Settings2,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/sidebar/NavMain"
import { NavAdmin } from "@/components/sidebar/NavAdmin"
import { NavSecondary } from "@/components/sidebar/NavSecondary"
import { NavUser } from "@/components/sidebar/NavUser"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"

const data = {
  navMain: [
    {
      title: "Escritorio",
      url: "/",
      icon: Home,
    },
    {
      title: "Bitácoras",
      url: "/bitacoras",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Participantes",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Insumos",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    // {
    //   title: "Soporte",
    //   url: "#",
    //   icon: LifeBuoy,
    // },
    // {
    //   title: "Feedback",
    //   url: "#",
    //   icon: Send,
    // },
  ],
  admin: [
    {
      name: "Programas",
      url: "/administracion/programas",
      icon: PieChart,
    },
    {
      name: "Categorias",
      url: "/administracion/categorias",
      icon: Frame,
    },
    {
      name: "Residencias",
      url: "/administracion/residencias",
      icon: Map,
    },
    {
      name: "Usuarios",
      url: "/administracion/usuarios",
      icon: Users,
    },
    {
      name: "Roles",
      url: "/administracion/roles",
      icon: Component,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const {data: user, isError} = useAuth()

  if (isError) return <Navigate to="/auth/login" />
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FTU - Bitacoras</span>
                  <span className="truncate text-xs">Residencia: Jose Joaquin Perez</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {user?.roles?.some((role) => role?.name === 'Administrador') && <NavAdmin items={data.admin} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
