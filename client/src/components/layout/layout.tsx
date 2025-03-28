import { useState, ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b shadow-sm bg-white">
        <div className="flex items-center space-x-3">
          <button
            className="text-slate-dark focus:outline-none"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white">
              <i className="fas fa-hard-hat"></i>
            </div>
            <h1 className="text-lg font-bold">ConstructPro</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-dark focus:outline-none">
            <i className="fas fa-search"></i>
          </button>
          <button className="p-2 text-slate-dark focus:outline-none">
            <i className="fas fa-bell"></i>
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <i className="fas fa-user"></i>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
