import { useState } from 'react';
import { Bell } from 'lucide-react';
import { requestNotificationPermission } from '../src/hooks/useNotifications';

export const NotificationBell = () => {
    const [enabled, setEnabled] = useState(false);

    const handleClick = async () => {
        const token = await requestNotificationPermission();
        if (token) setEnabled(true);
    };

    return (
        <button onClick={handleClick} className="p-2 text-gray-300 hover:text-white border border-white/10 rounded-full transition-all">
            <Bell className={`w-5 h-5 ${enabled ? 'text-cyan-400 fill-cyan-400' : ''}`} />
        </button>
    );
};
