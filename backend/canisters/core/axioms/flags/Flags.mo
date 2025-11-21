import Flag "Flag";
import User "../users/User";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Base "../../../library/Base";
import Count "../../../library/Count";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Map "../../../library/Map";

import BinaryVotes "../../../library/votes/BinaryVotes";

import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;

    private type Map<K, V> = Map.Map<K, V>;
    private type List<T> = List.List<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;

    private type BinaryVote = BinaryVotes.Vote;
    private type BinaryChoice = BinaryVotes.Choice;
    private type SharableBinaryVotes = BinaryVotes.Sharable;
    private type BinaryVotes = BinaryVotes.Votes;
    private type Count = Count.Count;

    private type Flag = Flag.Flag;
    private type SharableFlag = Flag.Sharable;
    private type Category = Flag.Category;
    private type Status = Flag.Status;
    private type Header = Flag.Header;
    private type User = User.User;

    private let { Key } = Flag;

    private func _voter((h, _) : Entry, x : User) : Bool = User.hasFlagVoted(x, h);
    private func _requester(x : Principal) : Entry -> Bool = func(_, e) = e.requester == x;
    private func _category(x : Category) : Entry -> Bool = func(h, _) = h.category == x;
    private func _status(x : Status) : Entry -> Bool = func(_, e) = e.status == x;

    private func _recent(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(a.requestDate, b.requestDate);
        case (#descending) func((_, a), (_, b)) = Int.compare(b.requestDate, a.requestDate)
    };
    private func _difference(orderBy : Order) : Compare<SharableFlag> = switch (orderBy) {
        case (#ascending) func(a, b) = Nat.compare(a.votes.powered.0 - a.votes.powered.1, b.votes.powered.0 - b.votes.powered.1);
        case (#descending) func(a, b) = Nat.compare(b.votes.powered.0 - b.votes.powered.1, a.votes.powered.0 - a.votes.powered.1)
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        requester : ?Principal;
        voter : ?Principal;
        category : ?Category;
        status : ?Status
    };
    public type Sort = {
        #recent;
        #difference
    };

    private type Entry = (Header, Flag);

    /// AXIOMS ////// FLAGS ////////////

    private type Self = Flags;

    public type Flags = {
        requests : Map<Header, Flag>;
        var requesting : List<Header>
    };
    public type Sharable = [SharableFlag];

    public func init() : Self = {
        requests = Map.new();
        var requesting = List.nil()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func request(__ : Self, header : Header, requester : Principal, reason : Text, getUser : Principal -> User, getNow : () -> Int) : Flag {
        let flag : Flag = Flag.init(requester, reason, getNow);
        __.requesting := List.push(header, __.requesting);
        switch (Map.get(__.requests, Key(header))) {
            case (?existed) {
                for (voter in BinaryVotes.voters(existed.votes)) {
                    let user : User = getUser(voter);
                    User.removeFlagVote(user, header)
                };
                Map.delete(__.requests, Key(header))
            };
            case (null) {}
        };
        Map.put(__.requests, Key(header), flag);
        flag
    };

    public func finalize(__ : Self, header : Header) {
        __.requesting := List.filter<Header>(
            __.requesting,
            func({ id; category }) = id != header.id or category != header.category,
        )
    };

    public func cleanUpExpiredFlags(__ : Self, duration : Nat, getNow : () -> Int) : List<Header> {
        var expired : List<Header> = List.nil();
        __.requesting := List.filter<Header>(
            __.requesting,
            func(e) {
                let x : Flag = flag(__, e);
                switch (Flag.isExpired(x, duration, getNow)) {
                    case (true) {
                        Flag.expired(x);
                        expired := List.push(e, expired);
                        false
                    };
                    case (false) true
                }
            },
        );
        expired
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size(__ : Self) : Nat = Map.size(__.requests);

    public func found(__ : Self, header : Header) : Bool = Map.includes(__.requests, Key(header));

    public func flag(__ : Self, header : Header) : Flag = switch (Map.get(__.requests, Key(header))) {
        case (?flag) flag;
        case (null) E.f(#NOT_EXISTED("Flag"), "Attempted to retrieve a non-existent " # debug_show (header.category) # " flag with id " # debug_show (header.id))
    };
    public func getFlag(__ : Self, header : Header, callerUser : ?(Principal, User)) : SharableFlag {
        let getCallerVote : Header -> ?BinaryVote = User.callerFlagVoteCallback(callerUser);
        Flag.toSharable(flag(__, header), header, getCallerVote)
    };
    public func getFlags(__ : Self, filter : Filter, sort : Sorted<Sort>, callerUser : ?(Principal, User), getUser : Principal -> User) : Sharable {
        let getCallerVote : Header -> ?BinaryVote = User.callerFlagVoteCallback(callerUser);

        var filtered : ?[Entry] = null;
        let toEntry : Header -> Entry = func(h) = (h, flag(__, h));
        let toSharable : Entry -> SharableFlag = func(h, entry) = Flag.toSharable(entry, h, getCallerVote);

        switch (filter.voter) {
            case (null) {};
            case (?voter) filtered := ?Map.getKeysMap(getUser(voter).votedFlags, toEntry)
        };
        switch (filter.requester, filtered) {
            case (null, _) {};
            case (?requester, null) filtered := ?Map.getEntriesFilterMap<Header, Flag, Entry>(__.requests, func(x) = switch (_requester(requester)(x)) { case (true) ?x; case (false) null });
            case (?requester, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _requester(requester))
        };
        switch (filter.category, filtered) {
            case (null, _) {};
            case (?category, null) filtered := ?Map.getEntriesFilterMap<Header, Flag, Entry>(__.requests, func(x) = switch (_category(category)(x)) { case (true) ?x; case (false) null });
            case (?category, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _category(category))
        };
        switch (filter.status, filtered) {
            case (null, _) {};
            case (?status, null) filtered := ?Map.getEntriesFilterMap<Header, Flag, Entry>(__.requests, func(x) = switch (_status(status)(x)) { case (true) ?x; case (false) null });
            case (?status, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _status(status))
        };

        switch (sort.by, sort.order, filtered) {
            case (#recent, #ascending, null) Map.getEntriesMap<Header, Flag, SharableFlag>(__.requests, toSharable);
            case (#recent, #descending, null) Map.getEntriesRevMap<Header, Flag, SharableFlag>(__.requests, toSharable);
            case (#recent, #ascending, ?unsorted) Array.map<Entry, SharableFlag>(unsorted, toSharable);
            case (#recent, #descending, ?unsorted) Array.mapRev<Entry, SharableFlag>(unsorted, toSharable);
            case (#difference, order, null) Array.sort<SharableFlag>(Map.getEntriesMap<Header, Flag, SharableFlag>(__.requests, toSharable), _difference(order));
            case (#difference, order, ?unsorted) Array.sort<SharableFlag>(Array.map<Entry, SharableFlag>(unsorted, toSharable), _difference(order))
        }
    };

    /// PUBLIC ////// ASSERTIONS ////////////

    public func expectFound(__ : Self, header : Header) {
        if (found(__, header)) return;
        E.f(#NOT_EXISTED("Flag Request"), debug_show (header.category) # " flag with id " # debug_show (header.id) # " not found")
    };
    public func expectNotFound(__ : Self, header : Header) {
        if (not found(__, header)) return;
        E.f(#ALREADY_EXISTED("Flag Request"), debug_show (header.category) # " flag with id " # debug_show (header.id) # " already exists")
    };

    public func expectNotFoundOrRetriable(__ : Self, header : Header) {
        if ((not found(__, header) or Flag.retriable(flag(__, header)))) return;
        E.f(#ALREADY_EXISTED("Flag Request"), debug_show (header.category) # " flag with id " # debug_show (header.id) # " already exists or not retriable")
    }
}
