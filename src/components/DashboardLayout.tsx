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
}

const DashboardLayout = ({ children, user, onLogout }: DashboardLayoutProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold">TC</span>
            </div>
            <div>
              <h2 className="font-bold text-foreground">TaxContrib</h2>
              <p className="text-xs text-muted-foreground">Gestion des contribuables</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className="w-full justify-start text-left"
              onClick={() => setActiveTab(item.id)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <div className="flex items-center space-x-2">
                <Badge variant={user.role === "admin" ? "destructive" : "secondary"} className="text-xs">
                  {user.role === "admin" ? "Admin" : "Staff"}
                </Badge>
                <span className="text-xs text-muted-foreground">#{user.workNumber}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={onLogout}
          >
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;