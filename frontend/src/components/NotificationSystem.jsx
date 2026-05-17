import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api.js';

const isNetworkError = (error) =>
    !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error');

const NotificationSystem = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [apiOffline, setApiOffline] = useState(false);
    const lastNetworkLogRef = useRef(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get('/api/notifications');
            setNotifications(response.data?.notifications || []);
            setUnreadCount(response.data?.notifications?.filter((n) => !n.read_at).length || 0);
            setApiOffline(false);
        } catch (error) {
            if (isNetworkError(error)) {
                setApiOffline(true);
                const now = Date.now();
                if (now - lastNetworkLogRef.current > 60000) {
                    lastNetworkLogRef.current = now;
                    console.warn(
                        '[Notifications] API inaccessible. Démarrez Laravel (ex. cd backend && php artisan serve) sur le port du proxy Vite (défaut 8000).'
                    );
                }
            } else {
                console.error('Error fetching notifications:', error);
            }
        }
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.post(`/api/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            if (!isNetworkError(error)) console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            if (!isNetworkError(error)) console.error('Error marking all notifications as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                title={apiOffline ? 'API hors ligne — vérifiez que Laravel tourne' : 'Notifications'}
            >
                <Bell className={`h-6 w-6 ${apiOffline ? 'text-amber-500' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                    >
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllAsRead}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Tout marquer comme lu
                                    </button>
                                )}
                            </div>
                            {apiOffline && (
                                <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                                    Connexion API refusée. Lancez le backend :{' '}
                                    <code className="text-[10px]">php artisan serve</code> (port 8000 par défaut, voir
                                    proxy Vite).
                                </p>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    {apiOffline ? 'Impossible de charger les notifications.' : 'Aucune notification'}
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-blue-50' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {getNotificationIcon(notification.type)}
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-900 mt-1">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.created_at).toLocaleString('fr-FR')}
                                                </p>
                                            </div>
                                            {!notification.read_at && (
                                                <div className="h-2 w-2 bg-blue-500 rounded-full shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationSystem;
