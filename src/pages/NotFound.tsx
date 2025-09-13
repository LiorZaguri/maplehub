import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Shield, FileText } from 'lucide-react';
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="card-glow max-w-md w-full mx-4">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist in MapleHub.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => window.history.back()} 
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </Button>
              <Button 
                onClick={() => window.location.href = "/maplehub/"} 
                className="btn-hero flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Return Home</span>
              </Button>
            </div>
            
            {/* Legal Pages Links */}
            <div className="flex gap-2 justify-center">
              <Link to="/privacy-policy">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </Button>
              </Link>
              <Link to="/terms-of-service">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Terms of Service</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
