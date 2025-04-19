import User "User";

import E "../../../common/Errors";

import Map "../../../library/Map";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Self = Users;

    private type Map<K, V> = Map.Map<K, V>;
    private type User = User.User;
    private type SharableUser = User.Sharable;

    private let { PrincipalKey } = Map;

    /// AXIOMS ////// USERS ////////////

    public type Users = Map<Principal, User>;

    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal, getNow : () -> Int) {
        Map.put(__, PrincipalKey(founder), User.fromFounder(getNow))
    };

    public func register(__ : Self, principal : Principal, getNow : () -> Int) {
        Map.put(__, PrincipalKey(principal), User.init(getNow))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func found(__ : Self, principal : Principal) : Bool = Map.includes(__, PrincipalKey(principal));

    public func user(__ : Self, principal : Principal) : User {
        switch (Map.get(__, PrincipalKey(principal))) {
            case (?user) user;
            case (null) E.f(#NOT_TOBE("User"), "User " # debug_show principal # " has not registered in Axioms")
        }
    };
    public func userOpt(__ : Self, principal : Principal) : ?User {
        Map.get(__, PrincipalKey(principal))
    };
    public func getUser(__ : Self, principal : Principal) : SharableUser {
        User.toSharable(user(__, principal))
    };
    public func callerUser(__ : Self, caller : ?Principal) : ?(Principal, User) {
        switch (caller) {
            case (?principal) ?(principal, user(__, principal));
            case (null) null
        }
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, principal : Principal) {
        if (not found(__, principal)) return;
        E.f(#ALREADY_EXISTED("User"), "User " # debug_show principal # " has already existed in Axioms ")
    };
    public func expectFound(__ : Self, principal : Principal) {
        if (found(__, principal)) return;
        E.f(#NOT_EXISTED("User"), "User " # debug_show principal # " has not registered in Axioms ")
    }
}
