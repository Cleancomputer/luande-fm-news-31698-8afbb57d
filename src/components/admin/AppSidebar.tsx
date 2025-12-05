import { FileText, BarChart3, Settings, FileBarChart, Instagram, LayoutDashboard, Bell, TrendingUp, CalendarDays, Wand2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Conteúdo", path: "/admin/content", icon: FileText },
  { title: "Enquetes", path: "/admin/polls", icon: BarChart3 },
  { title: "Eventos", path: "/admin/events", icon: CalendarDays },
  { title: "Designer", path: "/admin/designer", icon: Wand2 },
  { title: "Analytics", path: "/admin/analytics", icon: TrendingUp },
  { title: "Notificações", path: "/admin/notifications", icon: Bell },
  { title: "Instagram", path: "/admin/instagram", icon: Instagram },
  { title: "Relatórios", path: "/admin/reports", icon: FileBarChart },
  { title: "Configurações", path: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-gradient-to-r from-primary to-purple-600 text-white font-medium"
                          : "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-600/10 transition-all"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
