import Rank "../ranks/Rank";
import Ranks "../ranks/Ranks";
import User "../users/User";

import E8S "../../../library/E8S";
import List "../../../library/List";
import Map "../../../library/Map";

import Nat "mo:base/Nat";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;

    private type User = User.User;
    private type Rank = Rank.Rank;
    private type SharableRank = Rank.Sharable;
    private type Ranks = Ranks.Ranks;
    private type SharableRanks = Ranks.Sharable;

    private let { PrincipalKey } = Map;

    /// PUBLIC ////// DECLARATIONS ////////////

    public func callerRevenueCallback(caller : ?(Principal, User)) : Self -> ?Nat = switch (caller) {
        case (?(caller, _)) func(payout) = ?getCallerRevenue(payout, caller);
        case (null) func(_) = null
    };

    /// AXIOMS ////// PAYOUT ////////////

    private type Self = Payout;

    public type Payout = {
        ranks : Ranks;
        recipients : Map<Principal, E8S>
    };
    public type Sharable = {
        ranks : SharableRanks;
        callerRevenue : ?SharableE8S
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getCallerRevenue(__ : Self, principal : Principal) : Nat {
        switch (Map.get(__.recipients, PrincipalKey(principal))) {
            case (null) 0;
            case (?revenue) E8S.toSharable(revenue)
        }
    };

    public func toSharable(__ : Self, getCallerRevenue : Self -> ?Nat) : Sharable = {
        ranks = Ranks.toSharable(__.ranks);
        callerRevenue = getCallerRevenue(__)
    }
}
