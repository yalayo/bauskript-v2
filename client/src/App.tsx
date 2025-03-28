import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { Layout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import DiaryPage from "@/pages/diary";
import ReportDetailPage from "@/pages/diary/[id]";
import AttendancePage from "@/pages/attendance";
import PhotoGalleryPage from "@/pages/photo-gallery";
import IssuesPage from "@/pages/issues";
import EmailCampaignsPage from "@/pages/email-campaigns";
import GmailAuthPage from "@/pages/gmail-auth";
import BlogPage from "@/pages/blog";
import SettingsPage from "@/pages/settings";
import CheckoutPage from "@/pages/checkout";
import SubscribePage from "@/pages/subscribe";
import QuestionnairePage from "@/pages/questionnaire";
import SurveyAnalyticsPage from "@/pages/survey-analytics";
import LandingPage from "@/pages/landing-page";

function Router() {
  return (
    <Layout>
      <Switch>
        <ProtectedRoute path="/" component={Dashboard} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/diary" component={DiaryPage} />
        <ProtectedRoute path="/diary/:id" component={ReportDetailPage} />
        <ProtectedRoute path="/attendance" component={AttendancePage} />
        <ProtectedRoute path="/photos" component={PhotoGalleryPage} />
        <ProtectedRoute path="/issues" component={IssuesPage} />
        <ProtectedRoute path="/email-campaigns" component={EmailCampaignsPage} />
        <ProtectedRoute path="/gmail-auth" component={GmailAuthPage} />
        <ProtectedRoute path="/blog" component={BlogPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/survey-analytics" component={SurveyAnalyticsPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/subscribe" component={SubscribePage} />
        <Route path="/questionnaire" component={QuestionnairePage} />
        <Route path="/landing" component={LandingPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
