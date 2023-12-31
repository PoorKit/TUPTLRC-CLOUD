import { flow, types, applySnapshot } from 'mobx-state-tree';
import { fetchNotifications } from '../services/api';
import { createContext } from 'react';

import dayjs from 'dayjs';

const Notification = types
.model('Notification', {
    _id: types.maybe(types.string),
    sender: types.maybe(types.string),
    receiver: types.maybe(types.string),
    notificationType: types.maybe(types.enumeration('notificationType',['Approve', 'Decline', 'Penalty', 'Others'])),
    notificationTitle: types.maybe(types.string),
    notificationText: types.maybe(types.string),
    createdAt: types.maybe(types.string),
    deliveryStatus: types.maybe(types.enumeration('deliveryStatus',['Delivered', 'Seen'])),
});

const Notifications = types
.model('Notifications', {
    notifications: types.optional(types.array(Notification), []),
    success: types.optional(types.boolean, false),
})
.actions(self => ({
    fetchCurrentNotifications: flow(function*() {
        try {
            const data = yield fetchNotifications();
            if(data){
                applySnapshot(self, data);
            }
        } catch (err) {
            console.error(err);
        }
    }),
    seenNotification(notificationID) {
        self.notifications.find(notification => notification._id === notificationID).deliveryStatus = 'Seen';
        alert("Notification has been marked as seen");
    },
    // Create a function that would empty out/ set the notifications null
    emptyout: flow(function*() {
        applySnapshot(self, { notifications: [], success: false });
    })
}))
.views(self => ({
    // Modify this to be Today vs Previous Notifications using dayjs
    get AllNewNotifications() {
        if(self.notifications.length !== 0) {
            // filter the self.notifications by those created today and is sorted by deliverystatus, 'delivered' first.
            return self.notifications.filter(item => dayjs(item.createdAt).isSame(dayjs(), 'day'));
        }else{
            return self.notifications;
        }
        
    },
    get AllNotifications(){
        if(self.notifications.length !== 0) {
            // filter the self.notifications by those before today and is sorted by deliverystatus, 'delivered' first.
            return self.notifications.filter(item => dayjs(item.createdAt).isBefore(dayjs(), 'day'));;
        }else{
            return self.notifications;
        }
    }
}));

const NotificationsModel = createContext(Notifications.create({}));

export default NotificationsModel;
