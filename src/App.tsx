import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import EventHero from './components/EventHero';
import TicketSelector from './components/TicketSelector';
import EventDescription from './components/EventDescription';
import EventLocation from './components/EventLocation';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import { track } from './lib/analytics';

function EventPage() {
  useEffect(() => {
    track('page_view', { path: window.location.pathname });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <EventHero />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="lg:hidden">
              <TicketSelector />
            </div>
            <EventDescription />
            <EventLocation />
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <TicketSelector />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventPage />} />
        <Route path="/admin-dashboard-x7k2" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
