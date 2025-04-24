import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { Layout } from "./components/layout/layout";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "./pages/not-found";
import AuthPage from "./pages/auth-page";
import Dashboard from "./pages/dashboard";
import DiaryPage from "./pages/diary";
import ReportDetailPage from "./pages/diary/[id]";
import AttendancePage from "./pages/attendance";
import PhotoGalleryPage from "./pages/photo-gallery";
import IssuesPage from "./pages/issues";
import EmailCampaignsPage from "./pages/email-campaigns";
import CampaignDetailPage from "./pages/campaign-detail";
import GmailAuthPage from "./pages/gmail-auth";
import BlogPage from "./pages/blog";
import SettingsPage from "./pages/settings";
import CheckoutPage from "./pages/checkout";
import SubscribePage from "./pages/subscribe";
import QuestionnairePage from "./pages/questionnaire";
import SurveyAnalyticsPage from "./pages/survey-analytics";
import LandingPage from "./pages/landing-page-v1";

function AppRouter() {
  const [location] = useLocation();
  const isAppRoute = location.startsWith("/app") || location === "/auth";
  
  // Use Layout only for app routes
  return isAppRoute ? (
    <Layout>
      <Switch>
        <ProtectedRoute path="/app" component={Dashboard} />
        <ProtectedRoute path="/app/diary" component={DiaryPage} />
        <ProtectedRoute path="/app/diary/:id" component={ReportDetailPage} />
        <ProtectedRoute path="/app/attendance" component={AttendancePage} />
        <ProtectedRoute path="/app/photos" component={PhotoGalleryPage} />
        <ProtectedRoute path="/app/issues" component={IssuesPage} />
        <ProtectedRoute path="/app/email-campaigns" component={EmailCampaignsPage} />
        <ProtectedRoute path="/app/campaign-detail/:id" component={CampaignDetailPage} />
        <ProtectedRoute path="/app/gmail-auth" component={GmailAuthPage} />
        <ProtectedRoute path="/app/blog" component={BlogPage} />
        <ProtectedRoute path="/app/settings" component={SettingsPage} />
        <ProtectedRoute path="/app/survey-analytics" component={SurveyAnalyticsPage} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  ) : (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/subscribe" component={SubscribePage} />
      <Route path="/questionnaire" component={QuestionnairePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
