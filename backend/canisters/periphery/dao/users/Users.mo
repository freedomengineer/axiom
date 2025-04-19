import User "User";

import E "../../../common/Errors";

import E8S "../../../library/E8S";
import Earning "../../../library/Earning";
import List "../../../library/List";
import Map "../../../library/Map";
import TernaryVotes "../../../library/votes/TernaryVotes";
import Set "../../../library/Set";

import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Set<T> = Set.Set<T>;
    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Time = Time.Time;

    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;
    private type Earning = Earning.Earning;
    private type SharableEarning = Earning.Sharable;
    private type TernaryVotes = TernaryVotes.Votes;
    private type TernaryVote = TernaryVotes.Vote;
    private type TernaryChoice = TernaryVotes.Choice;

    private type User = User.User;
    private type SharableUser = User.Sharable;

    private let { PrincipalKey } = Map;

    /// DAO ////// USERS ////////////

    private type Self = Users;

    public type Users = Map<Principal, User>;
    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal, getNow : () -> Int) {
        Map.put(__, PrincipalKey(founder), User.fromFounder(founder, getNow))
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
    public func getUser(__ : Self, principal : Principal, duration : Nat, getBallot : Principal -> Nat, getNow : () -> Int) : SharableUser {
        User.toSharable(user(__, principal), duration, getBallot, getNow)
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
