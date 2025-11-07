import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    role: "admin" | "personnel";
    workNumber: string;
    name: string;
  };
  onLogout: () => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const DashboardLayout = ({ children, user, onLogout, activeView = "dashboard", onViewChange }: DashboardLayoutProps) => {
  const [activeTab, setActiveTab] = useState(activeView);

  const adminMenuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "taxpayers", label: "Contribuables", icon: "👥" },
    { id: "staff", label: "Personnel", icon: "👤" },
    { id: "exports", label: "Exports", icon: "📁" },
    { id: "settings", label: "Paramètres", icon: "⚙️" },
  ];

  const staffMenuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "📊" },
    { id: "taxpayers", label: "Contribuables", icon: "👥" },
    { id: "register", label: "Nouveau contribuable", icon: "➕" },
  ];

  const menuItems = user.role === "admin" ? adminMenuItems : staffMenuItems;

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Sidebar */}
      <div className="w-64 glass-effect flex flex-col relative overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-6 border-b border-border relative">
          <div className="flex flex-col space-y-3 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="w-fit gap-2 hover:bg-primary/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </Button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Le Royaume CGA" className="h-10 w-10 object-contain rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl animate-pulse-glow"></div>
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground">Le Royaume CGA</h2>
                <p className="text-xs text-muted-foreground">Gestion des contribuables</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 relative">
          {menuItems.map((item, index) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={`w-full justify-start text-left transition-all hover:scale-[1.02] animate-fade-in ${
                activeView === item.id ? 'bg-gradient-to-r from-primary to-primary-glow shadow-lg glow-primary' : 'hover:bg-primary/10'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => {
                setActiveTab(item.id);
                onViewChange?.(item.id);
              }}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border relative">
          <div className="flex items-center space-x-3 mb-3 animate-fade-in">
            <Avatar className="ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <div className="flex items-center space-x-2">
                <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className={`text-xs ${
                  user.role === "admin" ? 'bg-gradient-to-r from-accent to-accent-glow' : 'bg-gradient-to-r from-secondary to-secondary-glow'
                }`}>
                  {user.role === "admin" ? "Admin" : "Staff"}
                </Badge>
                <span className="text-xs text-muted-foreground">#{user.workNumber}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
            onClick={onLogout}
          >
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-transparent to-primary/5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;