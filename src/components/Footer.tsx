import { Link } from 'react-router-dom';
import { Shield, FileText, Coffee, MessageCircle } from 'lucide-react';
import { DiscordIcon } from './icons/DiscordIcon';

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Brand */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img 
              src="./logo_leaf.png" 
              alt="MapleHub Logo" 
              className="h-6 w-6 object-contain logo-themed"
            />
            <div>
              <p className="text-sm font-medium">MapleHub</p>
              <p className="text-xs text-muted-foreground">Your MapleStory Companion</p>
            </div>
          </Link>

          {/* Center - Legal Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/privacy-policy" 
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Privacy Policy</span>
            </Link>
            <Link 
              to="/terms-of-service" 
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Terms of Service</span>
            </Link>
          </div>

          {/* Right side - Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://discord.gg/DykSm9Pd9D"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <DiscordIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Discord</span>
            </a>
            <a
              href="https://buymeacoffee.com/lzaguri10a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </a>
          </div>
        </div>

        {/* Bottom row - Copyright */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MapleHub. Not affiliated with Nexon.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for the MapleStory community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
