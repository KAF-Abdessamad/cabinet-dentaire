import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api.js';
import { todayStr } from '../components/patient/patientShared.js';

export function usePatientPortal() {
    const [stats, setStats] = useState(null);
    const [appointmentsUp, setAppointmentsUp] = useState([]);
    const [patientBundle, setPatientBundle] = useState(null);
    const [treatments, setTreatments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPatientData = useCallback(async () => {
        try {
            const [statsRes, apptRes, medRes, invRes, treatRes, notifRes] = await Promise.all([
                api.get('/api/patient/stats'),
                api.get('/api/patient/appointments'),
                api.get('/api/patient/medical-records'),
                api.get('/api/patient/invoices'),
                api.get('/api/patient/treatments'),
                api.get('/api/notifications'),
            ]);
            setStats(statsRes.data);
            setAppointmentsUp(apptRes.data || []);
            setPatientBundle(medRes.data || null);
            setInvoices(invRes.data || []);
            setTreatments(treatRes.data || []);
            setNotifications(notifRes.data?.notifications || []);
        } catch (e) {
            console.error('Patient portal:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatientData();
        const interval = setInterval(fetchPatientData, 30000);
        return () => clearInterval(interval);
    }, [fetchPatientData]);

    const patient = patientBundle?.patient;
    const allAppointments = patientBundle?.appointments || [];

    const nextAppointment = useMemo(() => {
        if (!appointmentsUp.length) return null;
        return [...appointmentsUp].sort((a, b) => {
            const da = `${a.appointment_date} ${a.start_time || ''}`;
            const db = `${b.appointment_date} ${b.start_time || ''}`;
            return da.localeCompare(db);
        })[0];
    }, [appointmentsUp]);

    const recentAppointments = useMemo(() => {
        return [...allAppointments]
            .sort((a, b) => {
                const da = `${b.appointment_date || ''} ${b.start_time || ''}`;
                const db = `${a.appointment_date || ''} ${a.start_time || ''}`;
                return da.localeCompare(db);
            })
            .slice(0, 5);
    }, [allAppointments]);

    const lastCompletedCare = useMemo(() => {
        return allAppointments.find((a) => a.status === 'completed');
    }, [allAppointments]);

    const pendingInvoicesCount = useMemo(() => {
        return invoices.filter((i) => ['unpaid', 'pending', 'partially_paid'].includes(i.status)).length;
    }, [invoices]);

    const totalAppointments = allAppointments.length;

    const historyAppointments = useMemo(() => {
        const today = todayStr();
        return allAppointments.filter((a) => {
            if (!a?.appointment_date) return false;
            const d = String(a.appointment_date).slice(0, 10);
            return d < today || ['completed', 'cancelled'].includes(a.status);
        });
    }, [allAppointments]);

    return {
        stats,
        appointmentsUp,
        patient,
        patientBundle,
        treatments,
        invoices,
        notifications,
        loading,
        fetchPatientData,
        nextAppointment,
        recentAppointments,
        lastCompletedCare,
        pendingInvoicesCount,
        totalAppointments,
        historyAppointments,
        allAppointments,
    };
}
