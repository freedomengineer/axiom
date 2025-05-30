import Notification "Notification";

import E "../../../common/Errors";

import AxiomFlag "../../../core/axioms/flags/Flag";

import BinaryVotes "../../../library/votes/BinaryVotes";
import CircularBuffer "../../../library/CircularBuffer";
import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";
import TernaryVotes "../../../library/votes/TernaryVotes";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type BinaryChoice = BinaryVotes.Choice;
    private type TernaryChoice = TernaryVotes.Choice;
    private type CircularBuffer<T> = CircularBuffer.CircularBuffer<T>;
    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Set<T> = Set.Set<T>;

    private type FlagHeader = AxiomFlag.Header;
    private type Notification<T> = Notification.Notification<T>;
    private type SystemNotification = Notification<SystemVariant>;
    private type UserNotification = Notification<UserVariant>;
    private type FollowingNotification = Notification<FollowingVariant>;
    private type CustodianNotification = Notification<CustodianVariant>;
    private type SystemVariant = Notification.SystemVariant;
    private type UserVariant = Notification.UserVariant;
    private type FollowingVariant = Notification.FollowingVariant;
    private type CustodianVariant = Notification.CustodianVariant;

    private type UserNotificationData = {
        var custodian : Bool;
        var registering : List<Principal>;
        notification : UserNotification
    };

    private let { PrincipalKey = Key } = Map;

    /// FACADE ////// NOTIFICATION ////////////

    private type Self = Notifications;

    public type Notifications = {
        usersNotification : Map<Principal, UserNotificationData>;
        systemNotification : SystemNotification;
        custodiansNotification : CustodianNotification;
        followingNotification : Map<Principal, FollowingNotification>
    };

    public type Sharable = [{
        timestamp : Time;
        isSystem : Bool;
        data : SystemVariant or UserVariant
    }];

    public func init() : Self = {
        usersNotification = Map.new<Principal, UserNotificationData>();
        systemNotification = Notification.init<SystemVariant>();
        custodiansNotification = Notification.init<CustodianVariant>();
        followingNotification = Map.new<Principal, FollowingNotification>()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func register(__ : Self, from : Principal, to : { #Custodian; #Following : { principal : Principal; isFirst : Bool } }) {
        let user = Map.unwrap(__.usersNotification, Key(from));
        switch (to) {
            case (#Custodian) user.custodian := true;
            case (#Following({ principal; isFirst })) {
                switch (isFirst) {
                    case (true) Map.put(__.followingNotification, Key(principal), Notification.init<FollowingVariant>());
                    case (false) {}
                };
                switch (List.find<Principal>(user.registering, func(x) = x == principal)) {
                    case (null) user.registering := List.push(principal, user.registering);
                    case (_) {}
                }
            }
        }
    };
    public func unregister(__ : Self, from : Principal, to : { #Custodian; #Following : { principal : Principal; isLast : Bool } }) {
        let user = Map.unwrap(__.usersNotification, Key(from));
        switch (to) {
            case (#Custodian) user.custodian := false;
            case (#Following({ principal; isLast })) {
                switch (isLast) {
                    case (true) Map.delete(__.followingNotification, Key(principal));
                    case (false) {}
                };
                user.registering := List.filter<Principal>(user.registering, func(x) = x != principal)
            }
        }
    };

    public func postUserNotification(__ : Self, principal : Principal, data : UserVariant) {
        let { notification } = Map.unwrap(__.usersNotification, Key(principal));
        Notification.push(notification, data)
    };
    public func postSystemNotification(__ : Self, data : SystemVariant) {
        Notification.push(__.systemNotification, data)
    };
    public func postCustodianNotification(__ : Self, data : CustodianVariant) {
        Notification.push(__.custodiansNotification, data)
    };
    public func postFollowingNotification(__ : Self, principal : Principal, data : FollowingVariant) {
        let notification = Map.unwrap(__.followingNotification, Key(principal));
        Notification.push(notification, data)
    };

    /// PUBLIC ////// ACCESSORS ////////////

}
