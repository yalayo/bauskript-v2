import { useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "../../components/ui/sheet";

export const MobileNav = () => {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex items-center justify-around p-3 z-10">
      <a
        href="/app"
        className={`mobile-nav-link ${location === "/app" ? "active" : ""}`}
      >
        <i className="fas fa-tachometer-alt mb-1"></i>
        <span className="text-xs">Dashboard</span>
      </a>
      <a
        href="/app/diary"
        className={`mobile-nav-link ${location === "/app/diary" ? "active" : ""}`}
      >
        <i className="fas fa-book mb-1"></i>
        <span className="text-xs">Diary</span>
      </a>
      <a
        href="/app/attendance"
        className={`mobile-nav-link ${
          location === "/app/attendance" ? "active" : ""
        }`}
      >
        <i className="fas fa-user-hard-hat mb-1"></i>
        <span className="text-xs">Attendance</span>
      </a>
      <a
        href="/app/issues"
        className={`mobile-nav-link ${location === "/app/issues" ? "active" : ""}`}
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
              href="/app/photos"
              className={`mobile-nav-extra ${location === "/app/photos" ? "text-primary" : ""}`}
            >
              <i className="fas fa-images mb-1 text-lg"></i>
              <span className="text-xs">Photos</span>
            </a>
            <a
              href="/app/email-campaigns"
              className={`mobile-nav-extra ${location === "/app/email-campaigns" ? "text-primary" : ""}`}
            >
              <i className="fas fa-envelope mb-1 text-lg"></i>
              <span className="text-xs">Emails</span>
            </a>
            <a
              href="/app/gmail-auth"
              className={`mobile-nav-extra ${location === "/app/gmail-auth" ? "text-primary" : ""}`}
            >
              <i className="fab fa-google mb-1 text-lg"></i>
              <span className="text-xs">Gmail</span>
            </a>
            <a
              href="/app/blog"
              className={`mobile-nav-extra ${location === "/app/blog" ? "text-primary" : ""}`}
            >
              <i className="fas fa-newspaper mb-1 text-lg"></i>
              <span className="text-xs">Blog</span>
            </a>
            <a
              href="/app/settings"
              className={`mobile-nav-extra ${location === "/app/settings" ? "text-primary" : ""}`}
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
