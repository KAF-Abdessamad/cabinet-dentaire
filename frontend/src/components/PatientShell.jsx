import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientPortalProvider } from '../contexts/PatientPortalContext.jsx';
import PatientSidebar from './patient/PatientSidebar.jsx';

const PatientShell = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <PatientPortalProvider>
            <div className="min-h-screen flex bg-dp-bg">
                {/* Desktop sidebar */}
                <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
                    <PatientSidebar />
                </div>

                {/* Mobile drawer */}
                <AnimatePresence>
                    {mobileOpen && (
                        <>
                            <motion.button
                                type="button"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-dp-neutral-900/50 lg:hidden"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Fermer le menu"
                            />
                            <motion.div
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                                className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-2xl"
                            >
                                <PatientSidebar onNavigate={() => setMobileOpen(false)} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
                    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white border-b border-dp-neutral-200">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="p-2 rounded-xl bg-dp-bg text-dp-primary"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-display text-lg text-dp-primary">DentistPro</span>
                        <div className="w-10" />
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                        >
                            <Outlet />
                        </motion.div>
                    </main>
                </div>
            </div>
        </PatientPortalProvider>
    );
};

export default PatientShell;
