import { FileText, BarChart3, Settings, FileBarChart, Instagram, LayoutDashboard, Bell, TrendingUp, Menu, X, Eye, MessageSquare, Send, FolderTree, CalendarDays } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const menuItems = [
  { 
    title: "Dashboard", 
    path: "/admin", 
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-cyan-500",
    color: "text-blue-500"
  },
  { 
    title: "Conteúdo", 
    path: "/admin/content", 
    icon: FileText,
    gradient: "from-purple-500 to-pink-500",
    color: "text-purple-500"
  },
  { 
    title: "Matérias Publicadas", 
    path: "/admin/published", 
    icon: Eye,
    gradient: "from-teal-500 to-cyan-500",
    color: "text-teal-500"
  },
  { 
    title: "Enquetes", 
    path: "/admin/polls", 
    icon: BarChart3,
    gradient: "from-green-500 to-emerald-500",
    color: "text-green-500"
  },
  { 
    title: "Eventos", 
    path: "/admin/events", 
    icon: CalendarDays,
    gradient: "from-violet-500 to-purple-500",
    color: "text-violet-500"
  },
  { 
    title: "Analytics", 
    path: "/admin/analytics", 
    icon: TrendingUp,
    gradient: "from-orange-500 to-red-500",
    color: "text-orange-500"
  },
  { 
    title: "Notificações", 
    path: "/admin/notifications", 
    icon: Bell,
    gradient: "from-pink-500 to-rose-500",
    color: "text-pink-500"
  },
  { 
    title: "Mensagens", 
    path: "/admin/messages", 
    icon: MessageSquare,
    gradient: "from-cyan-500 to-blue-500",
    color: "text-cyan-500"
  },
  { 
    title: "Submissões", 
    path: "/admin/submissions", 
    icon: Send,
    gradient: "from-amber-500 to-yellow-500",
    color: "text-amber-500"
  },
  { 
    title: "Categorias", 
    path: "/admin/categories", 
    icon: FolderTree,
    gradient: "from-lime-500 to-green-500",
    color: "text-lime-500"
  },
  { 
    title: "Instagram", 
    path: "/admin/instagram", 
    icon: Instagram,
    gradient: "from-fuchsia-500 to-purple-500",
    color: "text-fuchsia-500"
  },
  { 
    title: "Relatórios", 
    path: "/admin/reports", 
    icon: FileBarChart,
    gradient: "from-indigo-500 to-blue-500",
    color: "text-indigo-500"
  },
  { 
    title: "Configurações", 
    path: "/admin/settings", 
    icon: Settings,
    gradient: "from-slate-500 to-gray-500",
    color: "text-slate-500"
  },
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-slate-700/50 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary/20 to-purple-600/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Painel Admin
          </h2>
          <p className="text-sm text-slate-400 mt-1">Portal de Notícias</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.color}/20`
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    p-2 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-white/20' 
                      : `bg-slate-800 ${item.color} group-hover:bg-slate-700`
                    }
                  `}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-base">{item.title}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur">
          <div className="text-xs text-slate-500 text-center">
            <p>LuandeFM News Portal</p>
            <p className="mt-1">© 2025 Todos os direitos reservados</p>
          </div>
        </div>
      </aside>
    </>
  );
}
