import Notification "Notification";

import List "../../../library/List";
import Map "../../../library/Map";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;

    private type Notification<T> = Notification.Notification<T>;

    private type SystemNotification = Notification<SystemVariant>;
    private type SystemVariant = Notification.SystemVariant;
    private type SystemVariantParam = Notification.SystemVariantParam;
    private type SharableSystemVariant = Notification.SharableSystemVariant;

    private type UserNotification = Notification<UserVariant>;
    private type UserVariant = Notification.UserVariant;
    private type UserVariantParam = Notification.UserVariantParam;
    private type SharableUserVariant = Notification.SharableUserVariant;

    private let { PrincipalKey = Key } = Map;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type UserNotificationBatch = List<(Principal, UserVariantParam)>;
    public type SystemNotificationBatch = List<SystemVariantParam>;

    /// FACADE ////// NOTIFICATION ////////////

    private type Self = Notifications;
    public type Notifications = {
        usersNotification : Map<Principal, UserNotification>;
        systemNotification : SystemNotification
    };
    public type Sharable = ([SharableUserVariant], [SharableSystemVariant]);

    public func init() : Self = {
        usersNotification = Map.new<Principal, UserNotification>();
        systemNotification = Notification.init<SystemVariant>()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func postUserNotification(__ : Self, principal : Principal, data : UserVariantParam, maxNotificationSize : Nat, maxNotificationCapacity : Nat) {
        let userNotification = notification(__, principal);
        Notification.pushUserNotification(userNotification, data, maxNotificationSize, maxNotificationCapacity)
    };
    public func postSystemNotification(__ : Self, data : SystemVariantParam, maxNotificationSize : Nat) {
        Notification.pushSystemNotification(__.systemNotification, data, maxNotificationSize)
    };

    public func postUserNotificationBatch(__ : Self, batch : UserNotificationBatch, maxNotificationSize : Nat, maxNotificationCapacity : Nat) {
        for ((principal, data) in List.toIter(batch)) {
            let userNotification = notification(__, principal);
            Notification.pushUserNotification(userNotification, data, maxNotificationSize, maxNotificationCapacity)
        }
    };
    public func postSystemNotificationBatch(__ : Self, batch : SystemNotificationBatch, maxNotificationSize : Nat) {
        for (data in List.toIter(batch)) {
            Notification.pushSystemNotification(__.systemNotification, data, maxNotificationSize)
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func notification(__ : Self, principal : Principal) : UserNotification {
        switch (Map.get(__.usersNotification, Key(principal))) {
            case (?notification) notification;
            case (null) {
                let notification : UserNotification = Notification.init<UserVariant>();
                Map.put(__.usersNotification, Key(principal), notification);
                notification;
                // E.f(#NOT_EXISTED("User Notification"), "Attempted to get notification for a non-existent user " # debug_show (principal))
            }
        }
    };
    public func getNotification(__ : Self, principal : Principal) : Sharable {
        let userNotification = notification(__, principal);
        (Notification.toSharableUser(userNotification), Notification.toSharableSystem(__.systemNotification))
    }
}
