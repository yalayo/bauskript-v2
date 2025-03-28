import { useEffect } from "react";
import { useLocation } from "wouter";
import Dashboard from "@/pages/dashboard";

export default function HomePage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to the dashboard
    navigate("/");
  }, [navigate]);

  return <Dashboard />;
}
