import Group "Group";
import Channel "../channels/Channel";
import Message "../messages/Message";
import Messages "../messages/Messages";
import User "../users/User";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Base "../../../library/Base";
import List "../../../library/List";
import Set "../../../library/Set";
import Vector "../../../library/Vector";

import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Vector<T> = Vector.Vector<T>;
    private type Set<T> = Set.Set<T>;

    private type Group = Group.Group;
    private type GroupInfo = Group.Info;
    private type SharableGroup = Group.Sharable;
    private type Messages = Messages.Messages;
    private type Tier = Messages.Tier;
    private type User = User.User;

    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;

    private type Entry = (Nat, Group);

    private func _lastCreated(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(a.creationDate, b.creationDate);
        case (#descending) func((_, a), (_, b)) = Int.compare(b.creationDate, a.creationDate)
    };
    private func _lastActive(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(Messages.lastActive(a.messages), Messages.lastActive(b.messages));
        case (#descending) func((_, a), (_, b)) = Int.compare(Messages.lastActive(b.messages), Messages.lastActive(a.messages))
    };
    private func _name(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Text.compare(a.name, b.name);
        case (#descending) func((_, a), (_, b)) = Text.compare(b.name, a.name)
    };
    private func _tier(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Nat.compare(Messages.messagesLimitPerTier(a.tier), Messages.messagesLimitPerTier(b.tier));
        case (#descending) func((_, a), (_, b)) = Nat.compare(Messages.messagesLimitPerTier(b.tier), Messages.messagesLimitPerTier(a.tier))
    };
    private func _members(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Nat.compare(Set.size(a.members), Set.size(b.members));
        case (#descending) func((_, a), (_, b)) = Nat.compare(Set.size(b.members), Set.size(a.members))
    };
    private func _messages(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Nat.compare(Messages.size(a.messages), Messages.size(b.messages));
        case (#descending) func((_, a), (_, b)) = Nat.compare(Messages.size(b.messages), Messages.size(a.messages))
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Category = {
        #Public;
        #Private
    };

    public type Filter = {
        tier : ?Tier;
        creator : ?Principal;
        admin : ?Principal;
        member : ?Principal;
        category : ?Category;
        q : ?Text
    };
    public type Sort = {
        #lastCreated;
        #lastActive;
        #name;
        #tier;
        #members;
        #messages
    };

    /// CHAT ////// CHANNELS ////////////

    private type Self = Groups;

    public type Groups = Vector<Group>;
    public type Sharable = [SharableGroup];

    public func init() : Self = Vector.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func create(__ : Self, name : Text, disableLogs : Bool, isPublic : Bool, creator : Principal, getNow : () -> Int) : Nat {
        let id : Nat = nextId(__);

        Vector.add(__, Group.init(name, disableLogs, isPublic, creator, getNow));

        id
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size(__ : Self) : Nat = Vector.size(__);
    public func nextId(__ : Self) : Nat = Vector.size(__);
    public func lastId(__ : Self) : Nat = Vector.size(__) - 1;

    public func group(__ : Self, id : Nat) : Group = switch (Vector.getOpt(__, id)) {
        case (?e) e;
        case (null) E.f(#NOT_EXISTED("Group"), "Attempted to retrieve a non-existent group with id " # debug_show (id))
    };
    public func getGroup(__ : Self, id : Nat, caller : ?Principal) : SharableGroup {
        Group.toSharable(group(__, id), id, caller)
    };
    public func getGroups(__ : Self, filter : Filter, sort : Sorted<Sort>, callerUser : ?(Principal, User), getUserGroups : (Principal) -> Set<Nat>) : Sharable {
        var filtered : ?[Entry] = null;
        let toEntry : Nat -> ?Entry = switch (callerUser) {
            case (null) func(i) {
                let e = group(__, i);
                switch (Group.isPrivate(e)) {
                    case (true) null;
                    case (false) ?(i, e)
                }
            };
            case (?(caller, _)) func(i) {
                let e = group(__, i);
                switch (Group.isPrivateNotMember(e, caller)) {
                    case (true) null;
                    case (false) ?(i, e)
                }
            }
        };
        let toFilter : Entry -> ?Entry = switch (callerUser) {
            case (null) func(i, e) = switch (Group.isPrivate(e)) {
                case (true) null;
                case (false) ?(i, e)
            };
            case (?(caller, _)) func(i, e) = switch (Group.isPrivateNotMember(e, caller)) {
                case (true) null;
                case (false) ?(i, e)
            }
        };
        let toSharable : Entry -> SharableGroup = switch (callerUser) {
            case (null) func(i, e) = Group.toSharable(e, i, null);
            case (?(caller, _)) func(i, e) = Group.toSharable(e, i, ?caller)
        };

        switch (filter.member) {
            case (null) {};
            case (?member) filtered := ?Set.toArrayFilterMap<Nat, Entry>(getUserGroups(member), toEntry)
        };
        switch (filter.creator, filtered) {
            case (null, _) {};
            case (?creator, null) filtered := ?Set.toArrayFilterMap<Nat, Entry>(
                getUserGroups(creator),
                func(i) = switch (toEntry(i)) {
                    case (?(i, e)) switch (Group.isCreator(e, creator)) {
                        case (true) ?(i, e);
                        case (false) null
                    };
                    case (null) null
                },
            );
            case (?creator, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, func((_, e)) = Group.isCreator(e, creator))
        };
        switch (filter.admin, filtered) {
            case (null, _) {};
            case (?admin, null) filtered := ?Set.toArrayFilterMap<Nat, Entry>(
                getUserGroups(admin),
                func(i) = switch (toEntry(i)) {
                    case (?(i, e)) switch (Group.isAdmin(e, admin)) {
                        case (true) ?(i, e);
                        case (false) null
                    };
                    case (null) null
                },
            );
            case (?admin, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, func((_, e)) = Group.isAdmin(e, admin))
        };
        switch (filter.tier, filtered) {
            case (null, _) {};
            case (?tier, null) filtered := ?Vector.toEntriesFilterMap<Group, Entry>(
                __,
                func(i, e) = switch (callerUser) {
                    case (null) switch (Group.isTier(e, tier) and not Group.isPrivate(e)) {
                        case (true) ?(i, e);
                        case (false) null
                    };
                    case (?(caller, _)) switch (Group.isTier(e, tier) and not Group.isPrivateNotMember(e, caller)) {
                        case (true) ?(i, e);
                        case (false) null
                    }
                },
            );
            case (?tier, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, func((_, e)) = Group.isTier(e, tier))
        };
        switch (filter.category, filtered) {
            case (null, _) {};
            case (?category, null) filtered := ?Vector.toEntriesFilterMap<Group, Entry>(
                __,
                func(i, e) = switch (category, Group.isPrivate(e)) {
                    case (#Private, true) toFilter(i, e);
                    case (#Public, false) toFilter(i, e);
                    case (_, _) null
                },
            );
            case (?category, ?prevResult) filtered := ?Array.filter<Entry>(
                prevResult,
                func((_, e)) = switch (category, Group.isPrivate(e)) {
                    case (#Private, true) true;
                    case (#Public, false) true;
                    case (_, _) false
                },
            )
        };
        switch (filter.q, filtered) {
            case (null, _) {};
            case (?pattern, null) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Vector.toEntriesFilterMap<Group, Entry>(
                    __,
                    func(i, e) = switch (Group.containsPattern(e, patternIns)) {
                        case (true) toFilter(i, e);
                        case (false) null
                    },
                )
            };
            case (?pattern, ?prev) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Array.filter<Entry>(prev, func(_, e) = Group.containsPattern(e, patternIns))
            }
        };

        let default : ?[Entry] -> [Entry] = func(unsorted) = switch (unsorted) {
            case (null) Vector.toEntriesFilterMap<Group, Entry>(__, toFilter);
            case (?unsorted) unsorted
        };

        switch (sort.by, sort.order, filtered) {
            case (#lastCreated, #descending, null) Vector.toEntriesFilterMapRev<Group, SharableGroup>(__, func(i, e) = switch (toFilter(i, e)) { case (?(_, e)) ?toSharable(i, e); case (null) null });
            case (#lastCreated, #ascending, null) Vector.toEntriesFilterMap<Group, SharableGroup>(__, func(i, e) = switch (toFilter(i, e)) { case (?(_, e)) ?toSharable(i, e); case (null) null });
            case (#lastCreated, order, ?unsorted) Array.map<Entry, SharableGroup>(Array.sort(unsorted, _lastCreated(order)), toSharable);
            case (#lastActive, order, unsorted) Array.map<Entry, SharableGroup>(Array.sort(default(unsorted), _lastActive(order)), toSharable);
            case (#name, order, unsorted) Array.map<Entry, SharableGroup>(Array.sort(default(unsorted), _name(order)), toSharable);
            case (#tier, order, unsorted) Array.map<Entry, SharableGroup>(Array.sort(default(unsorted), _tier(order)), toSharable);
            case (#members, order, unsorted) Array.map<Entry, SharableGroup>(Array.sort(default(unsorted), _members(order)), toSharable);
            case (#messages, order, unsorted) Array.map<Entry, SharableGroup>(Array.sort(default(unsorted), _messages(order)), toSharable)
        }
    }
}
