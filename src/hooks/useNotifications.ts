import { messaging, db, auth } from '../../services/firebase';
import { getToken } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        // For web push with Firebase Messaging we usually need a VAPID key.
        // If not provided, it might work but it depends on console setup.
        // The firebase-applet-config.json should have these details.
        
        const token = await getToken(messaging, { 
            // In a real app we would get this from console or config
            // vapidKey: '...'
        });

        if (token && auth.currentUser) {
            await setDoc(doc(db, 'notificationTokens', token), {
                userId: auth.currentUser.uid,
                token: token,
                updatedAt: serverTimestamp()
            });
            console.log('Token stored:', token);
            return token;
        }
        return token;
    } catch (err) {
        console.error('Error requesting notification permission:', err);
        return null;
    }
};
