import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <header className="relative p-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <a href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all hover:scale-105">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </a>
          <img src="/logo.png" alt="Le Royaume CGA" className="h-12 object-contain" />
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-center animate-slide-up">
          <div className="mb-8 inline-block">
            <h1 className="text-9xl font-heading font-bold gradient-text">404</h1>
          </div>
          <h2 className="mb-4 text-3xl font-heading font-bold text-foreground">Page introuvable</h2>
          <p className="mb-8 text-xl text-muted-foreground max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl glow-primary hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
