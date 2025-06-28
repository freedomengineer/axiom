import User "User";

import E "../../../common/Errors";

import Configs "../../../library/Configs";
import Map "../../../library/Map";

import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;
    private type Configs = Configs.Configs;

    private type User = User.User;
    private type SharableUser = User.Sharable;

    private let { PrincipalKey } = Map;

    /// ESCROW ////// USERS ////////////

    private type Self = Users;

    public type Users = Map<Principal, User>;
    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal) {
        Map.put(__, PrincipalKey(founder), User.fromFounder())
    };

    public func register(__ : Self, principal : Principal, amount : Nat) {
        let user : User = User.init(amount);
        Map.put(__, PrincipalKey(principal), user)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func found(__ : Self, principal : Principal) : Bool = Map.includes(__, PrincipalKey(principal));

    public func user(__ : Self, principal : Principal) : User {
        switch (Map.get(__, PrincipalKey(principal))) {
            case (?user) user;
            case (null) E.f(#NOT_TOBE("User"), "User " # debug_show principal # " has not registered in Escrow")
        }
    };
    public func getUser(__ : Self, principal : Principal, configs : Configs) : SharableUser {
        User.toSharable(user(__, principal), configs)
    };

    public func getTop(__ : Self, category : { #PoweredVoters; #AcornBuriers }) : [(Principal, Nat)] {
        let map : ((Principal, User)) -> ((Principal, Nat)) = switch (category) {
            case (#PoweredVoters) func(i, e) = (i, User.getVotingPower(e));
            case (#AcornBuriers) func(i, e) = (i, User.getBuriedAmount(e))
        };
        Map.getEntriesMap<Principal, User, (Principal, Nat)>(__, map)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, principal : Principal) : () {
        if (not found(__, principal)) return;
        E.f(#ALREADY_EXISTED("User"), "User " # debug_show principal # " has already existed in Escrow")
    };
    public func expectFound(__ : Self, principal : Principal) : () {
        if (found(__, principal)) return;
        E.f(#NOT_EXISTED("User"), "User " # debug_show principal # " has not registered in Escrow")
    }
}
