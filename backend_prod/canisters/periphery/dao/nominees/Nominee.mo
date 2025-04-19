import User "../users/User";

import Base "../../../library/Base";
import E8S "../../../library/E8S";
import Iter "../../../library/Iter";
import Map "../../../library/Map";

import Time "mo:base/Time";
import Debug "mo:base/Debug";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;
    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;
    private type Time = Time.Time;
    private type Iter<T> = Iter.Iter<T>;

    private type User = User.User;

    private let { PrincipalKey = Key } = Map;

    /// PUBLIC ////// DECLARATIONS ////////////

    public func callerBallotCallback(callerUser : ?(Principal, User), duration : Nat) : Nominee -> ?Nat = switch (callerUser) {
        case (?(principal, user)) switch (User.hasExpiredBallot(user, duration)) {
            case (false) func({ ballots }) = ?Map.getOrDefault(ballots, Key(principal), 0);
            case (true) func(_) = ?0
        };
        case (_) func(_) = null
    };

    /// DAO ////// NOMINEE ////////////

    private type Self = Nominee;

    public type Nominee = {
        var totalValue : Nat;
        var title : Text;
        ballots : Map<Principal, Nat>
    };
    public type Sharable = {
        principal : Principal;
        title : Text;
        ballots : (Nat, Nat);
        isCustodian : Bool;
        callerBallot : ?Nat
    };

    public func init(title : Text) : Self = {
        var totalValue = 0;
        var title;
        ballots = Map.new<Principal, Nat>()
    };
    public func fromFounder(founder : Principal) : Self = {
        var totalValue = 40_000_000_00_000_000;
        var title = "I should keep being custodian because I'm the founder! I'm willing to work to keep the platform safe and well maintained.";
        ballots = Map.make<Principal, Nat>(Key(founder), 40_000_000_00_000_000)
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _foldExpiredValue(__ : Self, hasExpiredBallot : Principal -> Bool) : Nat {
        func predicate(voter : Principal, _ : Nat) : Bool = hasExpiredBallot(voter);
        func accumulate(accumulated : Nat, (_, value) : (Principal, Nat)) : Nat = accumulated + value;
        Map.foldEntriesWhile(__.ballots, 0, accumulate, predicate)
    };
    private func _foldExpiredCount(__ : Self, hasExpiredBallot : Principal -> Bool) : Nat {
        func predicate(voter : Principal, _ : Nat) : Bool = hasExpiredBallot(voter);
        func accumulate(accumulated : Nat, _ : (Principal, Nat)) : Nat = accumulated + 1;
        Map.foldEntriesWhile(__.ballots, 0, accumulate, predicate)
    };
    private func _foldExpired(__ : Self, hasExpiredBallot : Principal -> Bool) : (Nat, Nat) {
        func predicate(voter : Principal, _ : Nat) : Bool = hasExpiredBallot(voter);
        func accumulate(accumulated : ((Nat, Nat)), (_, value) : (Principal, Nat)) : ((Nat, Nat)) = (accumulated.0 + 1, accumulated.1 + value);
        Map.foldEntriesWhile(__.ballots, (0, 0), accumulate, predicate)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func cleanUpExpiredBallots(__ : Self, hasExpiredBallot : Principal -> Bool) : (Nat, Nat) {
        func predicate(voter : Principal, _ : Nat) : Bool = hasExpiredBallot(voter);
        func accumulate((count, value) : ((Nat, Nat)), (voter, _) : (Principal, Nat)) : ((Nat, Nat)) {
            let expiredValue : Nat = Base.unwrap(Map.remove(__.ballots, Key(voter)));
            (count + 1, value + expiredValue)
        };
        let (currentCount, currentValue) : (Nat, Nat) = (Map.size(__.ballots), __.totalValue);
        let (expiredCount, expiredValue) : (Nat, Nat) = Map.foldEntriesWhile(__.ballots, (0, 0), accumulate, predicate);
        let remainingCount : Nat = currentCount - expiredCount;
        let remainingValue : Nat = currentValue - expiredValue;
        __.totalValue := remainingValue;
        (remainingCount, remainingValue)
    };

    public func castBallot(__ : Self, voter : Principal, value : Nat) {
        __.totalValue += value;
        switch (Map.replace(__.ballots, Key(voter), value)) {
            case (?prevValue) __.totalValue -= prevValue;
            case (null) {}
        }
    };
    public func withdrawBallot(__ : Self, voter : Principal) {
        switch (Map.remove(__.ballots, Key(voter))) {
            case (?prevValue) __.totalValue -= prevValue;
            case (null) {}
        }
    };
    public func updateBallot(__ : Self, voter : Principal, value : Nat) {
        withdrawBallot(__, voter);
        castBallot(__, voter, value)
    };
    public func updateTitle(__ : Self, title : Text) {
        __.title := title
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func voters(__ : Self) : Iter<Principal> = Map.keys(__.ballots);

    /// PUBLIC ////// ACCESSORS ////////////

    public func ballot(__ : Self, voter : Principal) : Nat = Map.unwrap(__.ballots, Key(voter));

    public func getCount(__ : Self, hasExpiredBallot : Principal -> Bool) : Nat {
        Map.size(__.ballots) - _foldExpiredCount(__, hasExpiredBallot)
    };
    public func getValue(__ : Self, hasExpiredBallot : Principal -> Bool) : Nat {
        __.totalValue - _foldExpiredValue(__, hasExpiredBallot)
    };

    public func toSharable(__ : Self, principal : Principal, isCustodian : Bool, hasExpiredBallot : Principal -> Bool, getCallerBallot : Self -> ?Nat) : Sharable {
        let (expiredCount, expiredValue) = _foldExpired(__, hasExpiredBallot);
        {
            principal;
            isCustodian;
            title = __.title;
            ballots = (Map.size(__.ballots) - expiredCount, __.totalValue - expiredValue);
            callerBallot = getCallerBallot(__)
        }
    }
}
