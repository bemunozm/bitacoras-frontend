import * as React from "react";
import {
  BookOpen,
  BookUser,
  Command,
  Component,
  LayoutDashboard,
  School2Icon,
  Tag,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/NavMain";
import { NavAdmin } from "@/components/sidebar/NavAdmin";
import { NavSecondary } from "@/components/sidebar/NavSecondary";
import { NavUser } from "@/components/sidebar/NavUser";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const data = {
  navMain: [
    {
      title: "Escritorio",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Bitácoras",
      url: "/bitacoras",
      icon: BookOpen,
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
      name: "Categorías",
      url: "/categorias",
      icon: Tag,
    },
    {
      name: "Dispositivo/Programa",
      url: "/programas",
      icon: School2Icon,
    },
    {
      name: "Usuarios",
      url: "/usuarios",
      icon: Users,
    },
    {
      name: "Remplazos",
      url: "/remplazos",
      icon: BookUser,
    },
    {
      name: "Roles",
      url: "/roles",
      icon: Component,
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isError } = useAuth();

  if (isError) return <Navigate to="/auth/login" />;

  const adminItems = data.admin.filter((item) => {
    if (user?.roles?.some((role) => role?.name === "Administrador")) {
      return true;
    }
    if (user?.roles?.some((role) => role?.name === "Coordinador")) {
      return item.url === "/programas" || item.url === "/remplazos";
    }
    return false;
  });

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
                  <span className="truncate font-semibold">
                    FTU - Bitacoras
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {adminItems.length > 0 && <NavAdmin items={adminItems} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
