import { useLocation } from "wouter";

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
      <a
        href="/photos"
        className={`mobile-nav-link ${location === "/photos" ? "active" : ""}`}
      >
        <i className="fas fa-images mb-1"></i>
        <span className="text-xs">Photos</span>
      </a>
    </div>
  );
};
