import User "User";

import E "../../../common/Errors";

import Map "../../../library/Map";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;

    private type User = User.User;
    private type SharableUser = User.Sharable;

    private let { PrincipalKey } = Map;

    /// DAO ////// USERS ////////////

    private type Self = Users;

    public type Users = Map<Principal, User>;
    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func register(__ : Self, principal : Principal, username : Text) {
        Map.put(__, PrincipalKey(principal), User.init(username))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func found(__ : Self, principal : Principal) : Bool = Map.includes(__, PrincipalKey(principal));

    public func user(__ : Self, principal : Principal) : User {
        switch (Map.get(__, PrincipalKey(principal))) {
            case (?user) user;
            case (null) E.f(#NOT_TOBE("User"), "User " # debug_show principal # " has not registered in Chat")
        }
    };
    public func getUser(__ : Self, principal : Principal) : SharableUser {
        User.toSharable(user(__, principal))
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, principal : Principal) {
        if (not found(__, principal)) return;
        E.f(#ALREADY_EXISTED("User"), "User " # debug_show principal # " has already existed in Chat ")
    };
    public func expectFound(__ : Self, principal : Principal) {
        if (found(__, principal)) return;
        E.f(#NOT_EXISTED("User"), "User " # debug_show principal # " has not registered in Chat ")
    }
}
