import { 
  FileText, BarChart3, Settings, FileBarChart, Instagram, LayoutDashboard, 
  Bell, TrendingUp, Menu, X, Eye, MessageSquare, Send, FolderTree, CalendarDays, Wand2,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const allMenuItems = [
  { 
    title: "Dashboard", 
    path: "/admin", 
    icon: LayoutDashboard,
    adminOnly: true,
  },
  { 
    title: "Conteúdo", 
    path: "/admin/content", 
    icon: FileText,
    adminOnly: false,
  },
  { 
    title: "Matérias Publicadas", 
    path: "/admin/published", 
    icon: Eye,
    adminOnly: true,
  },
  { 
    title: "Categorias", 
    path: "/admin/categories", 
    icon: FolderTree,
    adminOnly: true,
  },
  { 
    title: "Enquetes", 
    path: "/admin/polls", 
    icon: BarChart3,
    adminOnly: true,
  },
  { 
    title: "Eventos", 
    path: "/admin/events", 
    icon: CalendarDays,
    adminOnly: true,
  },
  { 
    title: "Designer IA", 
    path: "/admin/designer", 
    icon: Wand2,
    adminOnly: true,
  },
  { 
    title: "Analytics", 
    path: "/admin/analytics", 
    icon: TrendingUp,
    adminOnly: true,
  },
  { 
    title: "Notificações", 
    path: "/admin/notifications", 
    icon: Bell,
    adminOnly: true,
  },
  { 
    title: "Mensagens", 
    path: "/admin/messages", 
    icon: MessageSquare,
    adminOnly: true,
  },
  { 
    title: "Submissões", 
    path: "/admin/submissions", 
    icon: Send,
    adminOnly: true,
  },
  { 
    title: "Instagram", 
    path: "/admin/instagram", 
    icon: Instagram,
    adminOnly: true,
  },
  { 
    title: "Relatórios", 
    path: "/admin/reports", 
    icon: FileBarChart,
    adminOnly: true,
  },
  { 
    title: "Configurações", 
    path: "/admin/settings", 
    icon: Settings,
    adminOnly: true,
  },
];

interface AdminSidebarProps {
  userRole: 'admin' | 'editor';
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = userRole === 'admin';
  const menuItems = isAdmin 
    ? allMenuItems 
    : allMenuItems.filter(item => !item.adminOnly);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-sidebar border-r border-sidebar-border
          shadow-xl transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`h-16 flex items-center border-b border-sidebar-border bg-sidebar-accent/50 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">
                {isAdmin ? 'Admin' : 'Editor'}
              </h2>
              <p className="text-xs text-sidebar-foreground/60">Portal Luandê</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-64px)]">
          <nav className={`py-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {menuItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.path}
                end
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.title : undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg transition-all duration-150 mb-1
                  ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`
                }
              >
                <item.icon className={`flex-shrink-0 ${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{item.title}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
