// frontend/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

// Projects
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import NewProject from './pages/NewProject';
import EditProject from './pages/EditProject';

// CV
import CV from './pages/CV';

// Portfolios (Phase 7)
import PortfoliosPage from './pages/Portfolios';
import CreatePortfolioPage from './pages/CreatePortfolio';
import PortfolioDetailPage from './pages/PortfolioDetail';
import PortfolioHtmlPreview from './pages/PortfolioHtmlPreview';
import PrintPortfolioPage from './pages/PrintPortfolio';
import PrintCVPage from './pages/PrintCV';
import SettingsPage from './pages/Settings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />

            {/* Projects Routes */}
            <Route path="projects">
              <Route index element={<Projects />} />
              <Route path="new" element={<NewProject />} />
              <Route path=":id" element={<ProjectDetail />} />
              <Route path=":id/edit" element={<EditProject />} />
            </Route>

            {/* CV Routes */}
            <Route path="cv" element={<CV />} />

            {/* Portfolio Routes */}
            <Route path="portfolios">
              <Route index element={<PortfoliosPage />} />
              {/* Align with UI link: /portfolios/new */}
              <Route path="new" element={<CreatePortfolioPage />} />
              <Route path=":id" element={<PortfolioDetailPage />} />
              <Route path=":id/preview" element={<PortfolioHtmlPreview />} />
            </Route>

            {/* Settings */}
            <Route path="settings" element={<SettingsPage />} />


          </Route>
          {/* Print-friendly route used by Playwright to render to PDF (no app chrome) */}
          <Route path="/print/portfolio/:id" element={<PrintPortfolioPage />} />
          <Route path="/print/cv" element={<PrintCVPage />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;