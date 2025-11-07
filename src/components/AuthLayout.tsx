import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <header className="relative p-4 flex items-center gap-4 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2 hover:scale-105 transition-transform"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Button>
        <img src="/logo.png" alt="Le Royaume CGA" className="h-12 object-contain" />
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold gradient-text mb-3">{title}</h1>
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          </div>
          
          <Card className="glass-effect shadow-2xl border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
            <CardContent className="p-8 relative">
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;