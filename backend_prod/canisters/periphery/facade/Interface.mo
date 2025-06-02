import Notification "notifications/Notification";
import Notifications "notifications/Notifications";
import User "users/User";
import Users "users/Users";
import Base "../../library/Base";
import Configs "../../library/Configs";
import Format "../../library/Format";
import Pagination "../../library/Pagination";

module {
    public type Facade = actor {
        initialize : shared () -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        updateCapitalRaised : shared (Principal, Nat) -> async ();
        postUserNotification : shared (Principal, Notification.UserVariantParam) -> async ();
        postUsersNotification : shared (Notifications.UsersBatch, Notification.UserVariantParam) -> async ();
        postUserNotifications : shared (Principal, Notifications.UserNotificationsBatch) -> async ();
        postUsersNotifications : shared (Notifications.UsersNotificationsBatch) -> async ();
        postSystemNotification : shared (Notification.SystemVariantParam) -> async ();
        postSystemNotifications : shared (Notifications.SystemNotificationsBatch) -> async ();
        postSystemGenericNotification : shared (Text, ?Format.Hyperlink) -> async ();
        register : shared (Text, Nat, ?Principal) -> async ();
        editUsername : shared (Text) -> async ();
        editLocation : shared (?Text) -> async ();
        editAvatar : shared (?Format.Picture) -> async ();
        editLinks : shared ([Format.Hyperlink]) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getUserIdentifier : query (User.IdentifierVariant) -> async User.Identifier;
        getUsersIdentifier : query () -> async [User.Identifier];
        getUsersPrincipal : query () -> async [Principal];
        getUsersCount : query () -> async Nat;
        getUser : query (Principal) -> async User.Sharable;
        getUsers : query (Users.Filter, Base.Sort<Users.Sort>) -> async [User.Sharable];
        getUsersPagination : query (Users.Filter, Base.Sort<Users.Sort>, Nat, Nat) -> async Pagination.Pagination<User.Sharable>;
        getNotification : query (Principal) -> async Notifications.Sharable;
    };
};