import Nominee "Nominee";
import User "../users/User";

import E "../../../common/Errors";

import Base "../../../library/Base";
import E8S "../../../library/E8S";
import Iter "../../../library/Iter";
import Map "../../../library/Map";
import Set "../../../library/Set";

import Configs "../../../library/Configs";
import TernaryVotes "../../../library/votes/TernaryVotes";

import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;
    private type Set<T> = Set.Set<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;
    private type Time = Time.Time;
    private type Configs = Configs.Configs;
    private type TernaryVote = TernaryVotes.Vote;
    private type TernaryVotes = TernaryVotes.Votes;
    private type SharableTernaryVotes = TernaryVotes.Sharable;

    private type Nominee = Nominee.Nominee;
    private type SharableNominee = Nominee.Sharable;
    private type User = User.User;

    private type Entry = (Principal, Nominee);

    private let { PrincipalKey = Key } = Map;
    private let { PrincipalVal = Val } = Set;

    private func _voter(orderBy : Order) : Compare<SharableNominee> = switch (orderBy) {
        case (#ascending) func(a : SharableNominee, b : SharableNominee) = Nat.compare(a.ballots.0, b.ballots.0);
        case (#descending) func(a : SharableNominee, b : SharableNominee) = Nat.compare(b.ballots.0, a.ballots.0)
    };
    private func _token(orderBy : Order) : Compare<SharableNominee> = switch (orderBy) {
        case (#ascending) func(a : SharableNominee, b : SharableNominee) = Nat.compare(a.ballots.1, b.ballots.1);
        case (#descending) func(a : SharableNominee, b : SharableNominee) = Nat.compare(b.ballots.1, a.ballots.1)
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        voter : ?Principal;
        isCustodian : ?Bool
    };
    public type Sort = {
        #voter;
        #token
    };

    /// DAO ////// NOMINEES ////////////

    private type Self = Nominees;

    public type Nominees = {
        nominees : Map<Principal, Nominee>;
        var custodians : Set<Principal>
    };
    public type Sharable = [SharableNominee];

    public func init() : Self = {
        nominees = Map.new();
        var custodians = Set.new()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal) {
        Set.put(__.custodians, Val(founder));
        Map.put(__.nominees, Key(founder), Nominee.fromFounder(founder))
    };

    public func nominate(__ : Self, principal : Principal, nominee : Nominee) {
        Map.put(__.nominees, Key(principal), nominee)
    };
    public func eliminate(__ : Self, principal : Principal) {
        Map.delete(__.nominees, Key(principal))
    };

    public func tally(__ : Self, maxCustodians : Nat, hasExpiredBallot : Principal -> Bool) : (Set<Principal>, Set<Principal>, Set<Principal>) {
        let entries : [Entry] = Map.getEntries(__.nominees);
        let sorted : [Entry] = Array.sort<Entry>(
            entries,
            func((_, a), (_, b)) = Nat.compare(Nominee.getValue(b, hasExpiredBallot), Nominee.getValue(a, hasExpiredBallot)),
        );
        let limit : Nat = Nat.min(sorted.size(), maxCustodians);
        switch (limit != 0) {
            case (true) {
                let newCustodians : Set<Principal> = Set.new();
                for (i in Iter.range(0, limit - 1)) {
                    Set.put(newCustodians, Val(sorted[i].0))
                };
                let removed : Set<Principal> = Set.difference(__.custodians, newCustodians, { equal = Principal.equal; hash = Principal.hash });
                let unchanged : Set<Principal> = Set.intersection(__.custodians, newCustodians, { equal = Principal.equal; hash = Principal.hash });
                let new : Set<Principal> = Set.difference(newCustodians, __.custodians, { equal = Principal.equal; hash = Principal.hash });
                __.custodians := newCustodians;
                (removed, unchanged, new)
            };
            case (false)(Set.new(), Set.new(), Set.new())
        }
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func custodians(__ : Self) : Iter<Principal> = Set.vals(__.custodians);

    /// PUBLIC ////// ACCESSORS ////////////

    public func titleValid(title : Text, configs : Configs) : Bool {
        let MIN_NOMINEE_TITLE_LENGTH : Nat = Configs.Nat(configs, "MIN_NOMINEE_TITLE_LENGTH");
        let MAX_NOMINEE_TITLE_LENGTH : Nat = Configs.Nat(configs, "MAX_NOMINEE_TITLE_LENGTH");

        let length : Nat = title.size();
        if (length < MIN_NOMINEE_TITLE_LENGTH or length > MAX_NOMINEE_TITLE_LENGTH) return false;

        true
    };

    public func nomineeFound(__ : Self, principal : Principal) : Bool = Map.includes(__.nominees, Key(principal));
    public func custodianFound(__ : Self, principal : Principal) : Bool = Set.includes(__.custodians, Val(principal));

    public func nominee(__ : Self, principal : Principal) : Nominee {
        switch (Map.get(__.nominees, Key(principal))) {
            case (?nominee) nominee;
            case (null) E.f(#NOT_EXISTED("Nominee"), "Attempted to get a non-existent nominee " # debug_show (principal))
        }
    };
    public func nomineeOpt(__ : Self, principal : Principal) : ?Nominee {
        Map.get(__.nominees, Key(principal))
    };
    public func getNominee(__ : Self, principal : Principal, getCallerBallot : Nominee -> ?Nat, hasExpiredBallot : Principal -> Bool) : SharableNominee {
        Nominee.toSharable(nominee(__, principal), principal, custodianFound(__, principal), hasExpiredBallot, getCallerBallot)
    };
    public func getNominees(__ : Self, filter : Filter, sort : Sorted<Sort>, getCallerBallot : Nominee -> ?Nat, hasExpiredBallot : Principal -> Bool, getUser : Principal -> User) : Sharable {
        var filtered : ?[Entry] = null;
        let toEntry : (Principal) -> Entry = func(p) = switch (Map.get(__.nominees, Key(p))) {
            case (?e)(p, e);
            case (null)(
                p,
                Nominee.init("[This user has requested to relinquish custodianship and will no longer be a custodian after the next election.]"),
            )
        };
        let toSharable : (Entry) -> SharableNominee = func(principal, nominee) = Nominee.toSharable(nominee, principal, custodianFound(__, principal), hasExpiredBallot, getCallerBallot);

        switch (filter.voter) {
            case (null) {};
            case (?voter) switch (hasExpiredBallot(voter)) {
                case (true) filtered := ?[];
                case (false) filtered := ?Set.toArrayMap(getUser(voter).ballots, toEntry)
            }
        };
        switch (filter.isCustodian, filtered) {
            case (null, _) {};
            case (?true, null) filtered := ?Set.toArrayMap<Principal, Entry>(__.custodians, toEntry);
            case (?false, null) filtered := ?Map.getEntriesFilterMap<Principal, Nominee, Entry>(
                __.nominees,
                func(i, e) = Base.ternary<Principal, ?Entry>(Set.get(__.custodians, Val(i)), null, ?(i, e)),
            );
            case (?true, ?prev) filtered := ?Array.filter<Entry>(prev, func(i, _) = Set.includes(__.custodians, Val(i)));
            case (?false, ?prev) filtered := ?Array.filter<Entry>(prev, func(i, _) = not Set.includes(__.custodians, Val(i)))
        };

        let unsorted : Sharable = switch (filtered) {
            case (null) Map.getEntriesMap<Principal, Nominee, SharableNominee>(__.nominees, toSharable);
            case (?filtered) Array.map<Entry, SharableNominee>(filtered, toSharable)
        };

        switch (sort.by, sort.order) {
            case (#voter, order) Array.sort<SharableNominee>(unsorted, _voter(order));
            case (#token, order) Array.sort<SharableNominee>(unsorted, _token(order))
        }
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNomineeFound(__ : Self, principal : Principal) {
        if (nomineeFound(__, principal)) return;
        E.f(#NOT_EXISTED("Nominee"), "Nominee " # debug_show principal # " not found")
    };
    public func expectNomineeNotFound(__ : Self, principal : Principal) {
        if (not nomineeFound(__, principal)) return;
        E.f(#ALREADY_EXISTED("Nominee"), "Nominee " # debug_show principal # " already exists")
    };
    public func expectCustodianFound(__ : Self, principal : Principal) {
        if (custodianFound(__, principal)) return;
        E.f(#NOT_EXISTED("Custodian"), "Custodian " # debug_show principal # " not found")
    };
    public func expectCustodianNotFound(__ : Self, principal : Principal) {
        if (not custodianFound(__, principal)) return;
        E.f(#ALREADY_EXISTED("Custodian"), "Custodian " # debug_show principal # " already exists")
    };

    public func expectTitleValid(title : Text, configs : Configs) : () {
        if (titleValid(title, configs)) return;
        E.f(#NOT_VALID("Nominee Title"), "Nominee Title " # debug_show title # " is invalid")
    }
}
