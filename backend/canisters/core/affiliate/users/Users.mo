import User "User";

import E "../../../common/Errors";

import Earning "../../../library/Earning";
import E8S "../../../library/E8S";
import Iter "../../../library/Iter";
import Map "../../../library/Map";
import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;
    private type Earning = Earning.Earning;
    private type SharableEarning = Earning.Sharable;
    private type Iter<T> = Iter.Iter<T>;
    private type Map<K, V> = Map.Map<K, V>;

    private type User = User.User;
    private type SharableUser = User.Sharable;

    private let { PrincipalKey } = Map;

    /// AFFILIATE ////// USERS ////////////

    private type Self = Users;

    public type Users = Map<Principal, User>;
    public func init() : Self = Map.new<Principal, User>();

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal, getNow : () -> Int) {
        Map.put(__, PrincipalKey(founder), User.init(null, getNow))
    };
    public func register(__ : Self, principal : Principal, referrer : ?Principal, getNow : () -> Int) {
        Map.put(__, PrincipalKey(principal), User.init(referrer, getNow))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func userOpt(__ : Self, principal : Principal) : ?User {
        Map.get(__, PrincipalKey(principal))
    };
    public func user(__ : Self, principal : Principal) : User {
        switch (Map.get(__, PrincipalKey(principal))) {
            case (?user) user;
            case (null) E.f(#NOT_TOBE("User"), "User " # debug_show principal # " has not registered in Affiliate")
        }
    };
    public func getUser(__ : Self, principal : Principal) : SharableUser {
        User.toSharable(user(__, principal))
    };

    public func found(__ : Self, principal : Principal) : Bool = Map.includes(__, PrincipalKey(principal));

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, principal : Principal) : () {
        if (not found(__, principal)) return;
        E.f(#ALREADY_EXISTED("User"), "User " # debug_show principal # " has already existed in Affiliate")
    };
    public func expectFound(__ : Self, principal : Principal) : () {
        if (found(__, principal)) return;
        E.f(#NOT_EXISTED("User"), "User " # debug_show principal # " has not registered in Affiliate")
    }
}
