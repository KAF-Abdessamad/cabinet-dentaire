import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

const PatientDashboard = () => {
    const [stats, setStats] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatientData();
    }, []);

    const fetchPatientData = async () => {
        try {
            // Fetch patient stats
            const statsResponse = await api.get('/api/patient/stats');
            setStats(statsResponse.data);

            // Fetch upcoming appointments
            const appointmentsResponse = await api.get('/api/patient/appointments');
            setAppointments(appointmentsResponse.data);

            // Fetch full patient profile + history bundle
            const medicalRecordsResponse = await api.get('/api/patient/medical-records');
            setPatient(medicalRecordsResponse.data.patient);
        } catch (error) {
            console.error('Error fetching patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dentist-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-dentist-primary to-dentist-dark text-white rounded-2xl p-6 shadow-lg">
                <h1 className="text-3xl font-bold mb-2">
                    Bienvenue{patient?.first_name ? `, ${patient.first_name}` : ''}
                </h1>
                <p className="text-dentist-light opacity-90">
                    Suivez votre santé dentaire et vos rendez-vous
                </p>
            </div>

            {/* Patient Profile */}
            {patient && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Mes informations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">Nom</span><div className="font-medium">{patient.first_name} {patient.last_name}</div></div>
                        <div><span className="text-gray-500">Email</span><div className="font-medium">{patient.email || '—'}</div></div>
                        <div><span className="text-gray-500">Téléphone</span><div className="font-medium">{patient.phone || '—'}</div></div>
                        <div><span className="text-gray-500">Date de naissance</span><div className="font-medium">{patient.birth_date || '—'}</div></div>
                        <div><span className="text-gray-500">Sexe</span><div className="font-medium">{patient.gender || '—'}</div></div>
                        <div><span className="text-gray-500">CIN</span><div className="font-medium">{patient.cin || '—'}</div></div>
                        <div><span className="text-gray-500">Groupe sanguin</span><div className="font-medium">{patient.blood_group || '—'}</div></div>
                        <div className="md:col-span-2"><span className="text-gray-500">Adresse</span><div className="font-medium">{patient.address || '—'}</div></div>
                        <div className="md:col-span-2"><span className="text-gray-500">Allergies</span><div className="font-medium whitespace-pre-wrap">{patient.allergies || '—'}</div></div>
                        <div className="md:col-span-2"><span className="text-gray-500">Antécédents médicaux</span><div className="font-medium whitespace-pre-wrap">{patient.medical_history || '—'}</div></div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-dentist-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Rendez-vous à venir</p>
                                <p className="text-3xl font-bold text-dentist-primary mt-2">
                                    {stats.upcoming_appointments}
                                </p>
                            </div>
                            <div className="bg-dentist-soft p-3 rounded-full">
                                <svg className="w-6 h-6 text-dentist-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-dentist-secondary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Traitements en cours</p>
                                <p className="text-3xl font-bold text-dentist-secondary mt-2">
                                    {stats.active_treatments}
                                </p>
                            </div>
                            <div className="bg-dentist-soft p-3 rounded-full">
                                <svg className="w-6 h-6 text-dentist-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Dossier complet</p>
                                <p className="text-lg font-bold text-green-500 mt-2">
                                    {stats.profile_complete ? 'Oui' : 'Non'}
                                </p>
                            </div>
                            <div className="bg-dentist-soft p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Prochains rendez-vous</h2>
                    <Link
                        to="/patient/appointments"
                        className="text-dentist-primary hover:underline font-medium"
                    >
                        Voir tout
                    </Link>
                </div>

                {appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex items-center justify-between p-4 bg-dentist-soft rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-dentist-primary text-white p-3 rounded-lg">
                                        <p className="text-sm font-bold">
                                            {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </p>
                                        <p className="text-xs">{appointment.start_time}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {appointment.dentist?.name || 'Dr. à définir'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {appointment.treatments?.map(t => t.name).join(', ') || 'Consultation'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {appointment.status === 'confirmed' ? 'Confirmé' :
                                     appointment.status === 'pending' ? 'En attente' :
                                     appointment.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>Aucun rendez-vous programmé</p>
                        <Link
                            to="/patient/appointments/new"
                            className="inline-block mt-4 bg-dentist-primary text-white px-6 py-2 rounded-lg hover:bg-dentist-dark transition-colors"
                        >
                            Prendre rendez-vous
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/patient/appointments/new"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="bg-dentist-primary text-white p-4 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Prendre rendez-vous</h3>
                            <p className="text-sm text-gray-600">Planifier une nouvelle consultation</p>
                        </div>
                    </div>
                </Link>

                <Link
                    to="/patient/medical-records"
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="bg-dentist-secondary text-white p-4 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Dossier médical</h3>
                            <p className="text-sm text-gray-600">Voir votre historique de santé</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PatientDashboard;
