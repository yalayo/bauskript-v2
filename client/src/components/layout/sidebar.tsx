import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // For mobile display, add classes for fixed positioning when open
  const mobileClasses = isOpen
    ? "fixed inset-y-0 left-0 z-50 w-64 block"
    : "hidden";

  return (
    <aside
      className={`bg-white shadow-lg w-full lg:w-64 lg:min-h-screen lg:flex flex-col lg:block ${mobileClasses}`}
    >
      <div className="p-4 border-b flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-white">
          <i className="fas fa-hard-hat"></i>
        </div>
        <h1 className="text-xl font-bold">ConstructPro</h1>
      </div>

      <div className="py-4 flex-grow">
        <div className="px-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>
        </div>

        <nav>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Main
          </div>
          <a
            href="/"
            onClick={(e) => {
              if (location === "/") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${location === "/" ? "active" : ""}`}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </a>
          <a
            href="/diary"
            onClick={(e) => {
              if (location === "/diary") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${
              location === "/diary" ? "active" : ""
            }`}
          >
            <i className="fas fa-book"></i>
            <span>Construction Diary</span>
          </a>
          <a
            href="/attendance"
            onClick={(e) => {
              if (location === "/attendance") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${
              location === "/attendance" ? "active" : ""
            }`}
          >
            <i className="fas fa-user-hard-hat"></i>
            <span>Attendance</span>
          </a>
          <a
            href="/photos"
            onClick={(e) => {
              if (location === "/photos") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${
              location === "/photos" ? "active" : ""
            }`}
          >
            <i className="fas fa-images"></i>
            <span>Site Photos</span>
          </a>
          <a
            href="/issues"
            onClick={(e) => {
              if (location === "/issues") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${
              location === "/issues" ? "active" : ""
            }`}
          >
            <i className="fas fa-exclamation-triangle"></i>
            <span>Issues</span>
          </a>

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Marketing
          </div>
          <a
            href="/email-campaigns"
            onClick={(e) => {
              if (location === "/email-campaigns") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${
              location === "/email-campaigns" ? "active" : ""
            }`}
          >
            <i className="fas fa-envelope"></i>
            <span>Email Campaigns</span>
          </a>
          <a
            href="/blog"
            onClick={(e) => {
              if (location === "/blog") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${location === "/blog" ? "active" : ""}`}
          >
            <i className="fas fa-newspaper"></i>
            <span>Blog</span>
          </a>

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Settings
          </div>
          <a
            href="/settings"
            onClick={(e) => {
              if (location === "/settings") {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleSidebar();
                }
              }
            }}
            className={`sidebar-link ${
              location === "/settings" ? "active" : ""
            }`}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </a>
          <a
            href="#"
            className="sidebar-link"
          >
            <i className="fas fa-question-circle"></i>
            <span>Help & Support</span>
          </a>
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <i className="fas fa-user"></i>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.fullName || user?.username || "Guest"}</p>
            <p className="text-xs text-gray-500">{user?.role || "User"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};
