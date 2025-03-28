import { useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

export const MobileNav = () => {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex items-center justify-around p-3 z-10">
      <a
        href="/"
        className={`mobile-nav-link ${location === "/" ? "active" : ""}`}
      >
        <i className="fas fa-tachometer-alt mb-1"></i>
        <span className="text-xs">Dashboard</span>
      </a>
      <a
        href="/diary"
        className={`mobile-nav-link ${location === "/diary" ? "active" : ""}`}
      >
        <i className="fas fa-book mb-1"></i>
        <span className="text-xs">Diary</span>
      </a>
      <a
        href="/attendance"
        className={`mobile-nav-link ${
          location === "/attendance" ? "active" : ""
        }`}
      >
        <i className="fas fa-user-hard-hat mb-1"></i>
        <span className="text-xs">Attendance</span>
      </a>
      <a
        href="/issues"
        className={`mobile-nav-link ${location === "/issues" ? "active" : ""}`}
      >
        <i className="fas fa-exclamation-triangle mb-1"></i>
        <span className="text-xs">Issues</span>
      </a>
      
      <Sheet>
        <SheetTrigger asChild>
          <button className="mobile-nav-link">
            <i className="fas fa-ellipsis-h mb-1"></i>
            <span className="text-xs">More</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl">
          <div className="grid grid-cols-3 gap-4 p-2 pt-6">
            <a
              href="/photos"
              className={`mobile-nav-extra ${location === "/photos" ? "text-primary" : ""}`}
            >
              <i className="fas fa-images mb-1 text-lg"></i>
              <span className="text-xs">Photos</span>
            </a>
            <a
              href="/email-campaigns"
              className={`mobile-nav-extra ${location === "/email-campaigns" ? "text-primary" : ""}`}
            >
              <i className="fas fa-envelope mb-1 text-lg"></i>
              <span className="text-xs">Emails</span>
            </a>
            <a
              href="/gmail-auth"
              className={`mobile-nav-extra ${location === "/gmail-auth" ? "text-primary" : ""}`}
            >
              <i className="fab fa-google mb-1 text-lg"></i>
              <span className="text-xs">Gmail</span>
            </a>
            <a
              href="/blog"
              className={`mobile-nav-extra ${location === "/blog" ? "text-primary" : ""}`}
            >
              <i className="fas fa-newspaper mb-1 text-lg"></i>
              <span className="text-xs">Blog</span>
            </a>
            <a
              href="/settings"
              className={`mobile-nav-extra ${location === "/settings" ? "text-primary" : ""}`}
            >
              <i className="fas fa-cog mb-1 text-lg"></i>
              <span className="text-xs">Settings</span>
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
