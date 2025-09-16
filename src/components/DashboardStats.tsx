import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

const StatsCard = ({ title, value, icon, change, changeType = "neutral" }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <Badge 
            variant={changeType === "positive" ? "default" : changeType === "negative" ? "destructive" : "secondary"}
            className="mt-2 text-xs"
          >
            {change}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  userRole: "admin" | "personnel";
}

const DashboardStats = ({ userRole }: DashboardStatsProps) => {
  // Données mockées pour la démo
  const stats = {
    admin: [
      { title: "Total Contribuables", value: 1247, icon: "👥", change: "+12% ce mois", changeType: "positive" as const },
      { title: "En attente de validation", value: 23, icon: "⏳", change: "5 nouveaux", changeType: "neutral" as const },
      { title: "Personnel actif", value: 8, icon: "👤", change: "Tous connectés", changeType: "positive" as const },
      { title: "Documents traités", value: 156, icon: "📋", change: "+8% cette semaine", changeType: "positive" as const },
    ],
    personnel: [
      { title: "Mes Contribuables", value: 45, icon: "👥", change: "+3 ce mois", changeType: "positive" as const },
      { title: "En attente", value: 7, icon: "⏳", change: "À traiter", changeType: "neutral" as const },
      { title: "Validés", value: 38, icon: "✅", change: "Cette semaine", changeType: "positive" as const },
      { title: "Documents uploadés", value: 89, icon: "📄", change: "Total", changeType: "neutral" as const },
    ],
  };

  const currentStats = stats[userRole];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {currentStats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;