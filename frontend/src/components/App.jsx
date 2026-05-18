import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import PatientList from './PatientList.jsx';
import PatientDetail from './PatientDetail.jsx';
import AppointmentCalendar from './AppointmentCalendar.jsx';
import PatientShell from './PatientShell.jsx';
import PatientHome from './patient/PatientHome.jsx';
import PatientAppointmentsPage from './patient/PatientAppointmentsPage.jsx';
import PatientCarePage from './patient/PatientCarePage.jsx';
import PatientInvoicesPage from './patient/PatientInvoicesPage.jsx';
import PatientProfilePage from './patient/PatientProfilePage.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import AdminLogin from './AdminLogin.jsx';
import LandingPage from './LandingPage.jsx';
import Contact from './Contact.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import NotificationSystem from './NotificationSystem.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import Sidebar from './Sidebar.jsx';
import PlaceholderAdminView from './PlaceholderAdminView.jsx';
import InvoiceManager from './InvoiceManager.jsx';
import { Search, Menu } from 'lucide-react';

// Layout component that wraps all protected routes
const AppLayout = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
            {/* Fixed/Responsive Sidebar */}
            <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* Right side container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* Fixed Top Header */}
                <header className="bg-white border-b border-slate-100 h-20 px-4 sm:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm shadow-slate-100/40 gap-4">
                    
                    {/* Left hamburger menu toggle for mobile */}
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="sm:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition shrink-0"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search Bar */}
                    <div className="flex items-center bg-slate-50 border border-slate-150 px-4 py-2.5 rounded-xl w-40 sm:w-80 group focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-xs font-semibold text-slate-700 placeholder:text-slate-400 w-full ml-3 outline-none"
                        />
                    </div>

                    {/* Right utilities: Notifications and User Info */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                        {/* Notifications cloche with system integrations */}
                        <NotificationSystem />

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-slate-200" />

                        {/* Profile Admin */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-800 leading-none">{user?.name || 'Administrateur'}</p>
                                <p className="text-[9px] font-black text-blue-500 uppercase mt-1">Cabinet</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/10 shrink-0">
                                <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center font-black text-white text-xs">
                                    {user?.name?.[0]?.toUpperCase() || 'A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area (Scrollable) */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Patient routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<PatientShell />}>
                        <Route path="/patient/dashboard" element={<PatientHome />} />
                        <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
                        <Route path="/patient/care" element={<PatientCarePage />} />
                        <Route path="/patient/invoices" element={<PatientInvoicesPage />} />
                        <Route path="/patient/profile" element={<PatientProfilePage />} />
                    </Route>
                </Route>
                
                {/* Admin/Dentist routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/app" element={<Dashboard />} />
                        <Route path="/app/dashboard" element={<Navigate to="/app" replace />} />
                        <Route path="/app/patients" element={<PatientList />} />
                        <Route path="/app/patients/:id" element={<PatientDetail />} />
                        <Route path="/app/appointments" element={<AppointmentCalendar />} />
                        <Route path="/app/soins" element={<PlaceholderAdminView section="soins" />} />
                        <Route path="/app/factures" element={<InvoiceManager />} />
                        <Route path="/app/ordonnances" element={<PlaceholderAdminView section="ordonnances" />} />
                        <Route path="/app/parametres" element={<PlaceholderAdminView section="parametres" />} />
                    </Route>
                </Route>
                
                {/* Global redirects */}
                <Route path="/admin/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/admin" element={<Navigate to="/app" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
