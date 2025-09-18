import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from '@/hooks/useTheme';
import Layout from '@/components/shared/Layout';
import LandingPage from '@/pages/LandingPage';
import NotFoundPage from '@/pages/NotFoundPage';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TeamManagementPage = lazy(() => import('@/pages/TeamManagementPage'));
const SchedulingPage = lazy(() => import('@/pages/SchedulingPage'));
const TaskBoardPage = lazy(() => import('@/pages/TaskBoardPage'));
const ResourceOverviewPage = lazy(() => import('@/pages/resource-overview/ResourceOverviewPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ProjectManagementPage = lazy(() => import('@/pages/ProjectManagementPage'));
const FinanceHubPage = lazy(() => import('@/pages/FinanceHubPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const LegalAndInfoPage = lazy(() => import('@/pages/LegalAndInfoPage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const HumanResourcesPage = lazy(() => import('@/pages/HumanResourcesPage'));
const MaintenancePage = lazy(() => import('@/pages/MaintenancePage'));
const CommunicationHubPage = lazy(() => import('@/pages/CommunicationHubPage'));
const TrainingDevelopmentPage = lazy(() => import('@/pages/TrainingDevelopmentPage'));
const ClientManagementPage = lazy(() => import('@/pages/ClientManagementPage'));
const DataManagementPage = lazy(() => import('@/pages/DataManagementPage'));
const DataSourcesPage = lazy(() => import('@/pages/DataSourcesPage'));
const FileSharingPage = lazy(() => import('@/pages/FileSharingPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const WorkSuiteAcademyPage = lazy(() => import('@/pages/WorkSuiteAcademyPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

const AppRoutes = () => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/team-management" element={<TeamManagementPage />} />
          <Route path="/task-board" element={<TaskBoardPage />} />
          <Route path="/resource-overview" element={<ResourceOverviewPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/project-management" element={<ProjectManagementPage />} />
          <Route path="/finance-hub" element={<FinanceHubPage />} />
          <Route path="/human-resources" element={<HumanResourcesPage />} />
          <Route path="/client-management" element={<ClientManagementPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/data-management" element={<DataManagementPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} /> 
          <Route path="/communication-hub" element={<CommunicationHubPage />} />
          <Route path="/training-development" element={<TrainingDevelopmentPage />} />
          <Route path="/file-sharing" element={<FileSharingPage />} />
          <Route path="/academy" element={<WorkSuiteAcademyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/information" element={<LegalAndInfoPage />} />
          
          {isDevelopment && (
            <>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </>
          )}
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme"> 
        <AppRoutes />
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default App;