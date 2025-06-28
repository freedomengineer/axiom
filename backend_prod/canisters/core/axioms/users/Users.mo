import User "User";

import E "../../../common/Errors";

import Base "../../../library/Base";
import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";

import Nat "mo:base/Nat";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;
    private type Set<T> = Set.Set<T>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;

    private type User = User.User;
    private type SharableUser = User.Sharable;

    private let { PrincipalKey } = Map;

    /// AXIOMS ////// USERS ////////////

    private type Self = Users;

    public type Users = Map<Principal, User>;

    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal) {
        Map.put(__, PrincipalKey(founder), User.fromFounder())
    };

    public func register(__ : Self, principal : Principal) {
        Map.put(__, PrincipalKey(principal), User.init())
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
    public func getUser(__ : Self, principal : Principal, callerUser : ?(Principal, User)) : SharableUser {
        let getCallerFollowing : (Principal) -> ?Bool = User.callerFollowingCallback(callerUser);
        let getCallerFollower : (Principal) -> ?Bool = User.callerFollowerCallback(callerUser);
        User.toSharable(user(__, principal), principal, getCallerFollowing, getCallerFollower)
    };
    public func callerUser(__ : Self, caller : ?Principal) : ?(Principal, User) {
        switch (caller) {
            case (?principal) ?(principal, user(__, principal));
            case (null) null
        }
    };

    public func getTop(__ : Self, category : { #Influencers; #HypothesisPublishers; #EvidencePublishers; #HypothesisVoters; #EvidenceVoters; #AcornEarners }) : [(Principal, Nat)] {
        let map : ((Principal, User)) -> ((Principal, Nat)) = switch (category) {
            case (#Influencers) func(i, e) = (i, Set.size(e.followers));
            case (#HypothesisPublishers) func(i, e) = (i, List.size(e.hypotheses));
            case (#EvidencePublishers) func(i, e) = (i, List.size(e.evidences));
            case (#HypothesisVoters) func(i, e) = (i, Map.size(e.votedHypotheses));
            case (#EvidenceVoters) func(i, e) = (i, Map.size(e.votedEvidences));
            case (#AcornEarners) func(i, e) = (i, User.getEarning(e).revenue)
        };
        Map.getEntriesMap<Principal, User, (Principal, Nat)>(__, map)
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
