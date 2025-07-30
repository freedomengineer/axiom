import Hypothesis "Hypothesis";
import Age "../ages/Age";
import Field "../fields/Field";
import User "../users/User";
import UserConfigs "../user_configs/UserConfigs";

import E "../../../common/Errors";

import Base "../../../library/Base";
import ClusterTree "../../../library/ClusterTree";
import Date "../../../library/Date";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";
import Vector "../../../library/Vector";

import TernaryVotes "../../../library/votes/TernaryVotes";

import DoubleClusterTree "../../../library/doubletree/DoubleClusterTree";
import DoubleRankTree "../../../library/doubletree/DoubleRankTree";

import Hash "mo:base/Hash";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Hash = Hash.Hash;
    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;
    private type Vector<T> = Vector.Vector<T>;

    private type ClusterTree<K, V> = ClusterTree.ClusterTree<K, V>;
    private type DoubleRankTree<T> = DoubleRankTree.DoubleRankTree<T>;
    private type Ranking<T> = DoubleRankTree.Ranking<T>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;
    private type TernaryVote = TernaryVotes.Vote;

    private type Hypothesis = Hypothesis.Hypothesis;
    private type SharableHypothesis = Hypothesis.Sharable;
    private type Age = Age.Age;
    private type Field = Field.Field;
    private type User = User.User;

    private type Entry = (Nat, Hypothesis);
    private type Scores = Entry -> (Nat, Nat);
    private type Ordering = ClusterTree<Float, Ranking<Entry>>;

    private let { PrincipalVal } = Set;
    private let { TextVal } = Set;

    private func _id() : Compare<Entry> = func((i1, _), (i2, _)) = Nat.compare(i1, i2);
    private func _recent(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(a.publishDate, b.publishDate);
        case (#descending) func((_, a), (_, b)) = Int.compare(b.publishDate, a.publishDate)
    };
    private func _controversy(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Nat.compare(List.size(a.evidenceIds), List.size(b.evidenceIds));
        case (#descending) func((_, a), (_, b)) = Nat.compare(List.size(b.evidenceIds), List.size(a.evidenceIds))
    };
    private func _scores(sortedBy : Sort) : Scores = switch (sortedBy) {
        case (#popularity) func(_, e) = (TernaryVotes.getRegularValue(e.votes), TernaryVotes.getPoweredValue(e.votes));
        case (#positivity) func(_, e) = (TernaryVotes.getRegularPositiveValue(e.votes), TernaryVotes.getPoweredPositiveValue(e.votes));
        case (#neutrality) func(_, e) = (TernaryVotes.getRegularNeutralValue(e.votes), TernaryVotes.getPoweredNeutralValue(e.votes));
        case (#negativity) func(_, e) = (TernaryVotes.getRegularNegativeValue(e.votes), TernaryVotes.getPoweredNegativeValue(e.votes));
        case (_) E.unreachable()
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        age : ?Nat;
        agoStart : ?Nat;
        agoEnd : ?Nat;
        field : ?Text;
        publisher : ?Principal;
        voter : ?Principal;
        axiomsFrom : ?Principal;
        bookmarksFrom : ?Principal;
        userJoinedFields : ?Principal;
        userFollowedPublishers : ?Principal;
        q : ?Text
    };
    public type Sort = {
        #recent;
        #controversy;
        #popularity;
        #positivity;
        #neutrality;
        #negativity
    };

    /// AXIOMS ////// HYPOTHESES ////////////

    private type Self = Hypotheses;

    public type Hypotheses = Vector<?Hypothesis>;
    public type Sharable = [SharableHypothesis];

    public func init() : Self = Vector.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal, getNow : () -> Int) {
        Vector.add(__, ?Hypothesis.fromFounder(founder, getNow))
    };

    public func publish(__ : Self, hypothesis : Hypothesis) : Nat {
        let id : Nat = Vector.size(__);
        Vector.add(__, ?hypothesis);
        id
    };
    public func remove(__ : Self, id : Nat) {
        Vector.put(__, id, null)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size(__ : Self) : Nat = Vector.size(__);
    public func nextId(__ : Self) : Nat = Vector.size(__);
    public func lastId(__ : Self) : Nat = Vector.size(__) - 1;

    public func found(__ : Self, id : Nat) : Bool = switch (Vector.getOpt(__, id)) {
        case (?_) true;
        case (null) false
    };

    public func hypothesis(__ : Self, id : Nat) : Hypothesis {
        switch (Vector.getOpt(__, id)) {
            case (?hypothesis) switch (hypothesis) {
                case (?hypothesis) hypothesis;
                case (null) E.f(#NOT_EXISTED("Hypothesis"), "Attempted to get a removed hypothesis id " # debug_show (id) # " by flagging")
            };
            case (null) E.f(#NOT_EXISTED("Hypothesis"), "Attempted to get a non-existent hypothesis id " # debug_show (id) # ". Max id available is " # debug_show (lastId(__)))
        }
    };
    public func hypothesisRemovedOpt(__ : Self, id : Nat) : ?Hypothesis {
        switch (Vector.getOpt(__, id)) {
            case (?hypothesis) hypothesis;
            case (null) E.f(#NOT_EXISTED("Hypothesis"), "Attempted to get a non-existent hypothesis id " # debug_show (id) # ". Max id available is " # debug_show (lastId(__)))
        }
    };
    public func getHypothesis(__ : Self, id : Nat, callerUser : ?(Principal, User)) : SharableHypothesis {
        let getCallerVote : (Nat) -> ?TernaryVote = User.callerHypothesisVoteCallback(callerUser);
        let getCallerAxiom : (Nat) -> ?Bool = User.callerAxiomCallback(callerUser);
        let getCallerBookmark : (Nat) -> ?Bool = User.callerBookmarkCallback(callerUser);
        Hypothesis.toSharable(hypothesis(__, id), id, getCallerVote, getCallerAxiom, getCallerBookmark)
    };
    public func getHypotheses(__ : Self, filter : Filter, sort : Sorted<Sort>, callerUser : ?(Principal, User), getUser : Principal -> User, getField : Text -> Field, getAge : Nat -> Age, getNow : () -> Int) : Sharable {
        let getCallerVote : Nat -> ?TernaryVote = User.callerHypothesisVoteCallback(callerUser);
        let getCallerAxiom : Nat -> ?Bool = User.callerAxiomCallback(callerUser);
        let getCallerBookmark : Nat -> ?Bool = User.callerBookmarkCallback(callerUser);

        let now : Int = getNow();

        var filtered : ?[Entry] = null;
        let toEntry : Nat -> ?Entry = switch (callerUser) {
            case (null) func(i) = switch (hypothesisRemovedOpt(__, i)) {
                case (?hypothesis) ?(i, hypothesis);
                case (null) null
            };
            case (?(_, user)) {
                let excludedPublishers : ?Set<Principal> = UserConfigs.ExcludedPublishers(user.configs);
                let excludedFields : ?Set<Text> = UserConfigs.ExcludedFields(user.configs);

                switch (excludedPublishers, excludedFields) {
                    case (null, null) func(i) = switch (hypothesisRemovedOpt(__, i)) {
                        case (?hypothesis) ?(i, hypothesis);
                        case (null) null
                    };
                    case (?excludedPublishers, null) func(i) = switch (hypothesisRemovedOpt(__, i)) {
                        case (?hypothesis) switch (Set.includes(excludedPublishers, PrincipalVal(hypothesis.publisher))) {
                            case (false) ?(i, hypothesis);
                            case (true) null
                        };
                        case (null) null
                    };
                    case (null, ?excludedFields) func(i) = switch (hypothesisRemovedOpt(__, i)) {
                        case (?hypothesis) switch (Set.includes(excludedFields, TextVal(hypothesis.fieldId))) {
                            case (false) ?(i, hypothesis);
                            case (true) null
                        };
                        case (null) null
                    };
                    case (?excludedPublishers, ?excludedFields) func(i) = switch (hypothesisRemovedOpt(__, i)) {
                        case (?hypothesis) switch (Set.includes(excludedPublishers, PrincipalVal(hypothesis.publisher)) or Set.includes(excludedFields, TextVal(hypothesis.fieldId))) {
                            case (false) ?(i, hypothesis);
                            case (true) null
                        };
                        case (null) null
                    }
                }
            }
        };
        let toFilter : Entry -> ?Entry = switch (callerUser) {
            case (null) func(i, e) = ?(i, e);
            case (?(_, user)) {
                let excludedPublishers : ?Set<Principal> = UserConfigs.ExcludedPublishers(user.configs);
                let excludedFields : ?Set<Text> = UserConfigs.ExcludedFields(user.configs);

                switch (excludedPublishers, excludedFields) {
                    case (null, null) func(i, e) = ?(i, e);
                    case (?excludedPublishers, null) func(i, e) = switch (Set.includes(excludedPublishers, PrincipalVal(e.publisher))) {
                        case (false) ?(i, e);
                        case (true) null
                    };
                    case (null, ?excludedFields) func(i, e) = switch (Set.includes(excludedFields, TextVal(e.fieldId))) {
                        case (false) ?(i, e);
                        case (true) null
                    };
                    case (?excludedPublishers, ?excludedFields) func(i, e) = switch (Set.includes(excludedPublishers, PrincipalVal(e.publisher)) or Set.includes(excludedFields, TextVal(e.fieldId))) {
                        case (false) ?(i, e);
                        case (true) null
                    }
                }
            }
        };
        let toSharable : Entry -> SharableHypothesis = func(i, e) = Hypothesis.toSharable(e, i, getCallerVote, getCallerAxiom, getCallerBookmark);

        switch (filter.axiomsFrom) {
            case (null) {};
            case (?user) filtered := ?Set.toArrayFilterMap<Nat, Entry>(getUser(user).axioms, toEntry)
        };
        switch (filter.bookmarksFrom, filtered) {
            case (null, _) {};
            case (?user, null) filtered := ?Set.toArrayFilterMap<Nat, Entry>(getUser(user).bookmarks, toEntry);
            case (?user, ?prev) {
                let userIns : User = getUser(user);
                filtered := ?Array.filter<Entry>(prev, func((i, _)) = User.bookmarkFound(userIns, i))
            }
        };
        switch (filter.userJoinedFields, filtered) {
            case (null, _) {};
            case (?user, null) {
                var list : List<Nat> = List.nil();
                for (fieldId in Set.vals(getUser(user).joinedFields)) {
                    list := List.revAppend(getField(fieldId).hypothesisIds, list)
                };
                filtered := ?List.toArrayFilterMap<Nat, Entry>(list, toEntry)
            };
            case (?user, ?prev) {
                let userIns : User = getUser(user);
                filtered := ?Array.filter<Entry>(prev, func((_, e)) = User.joinedFieldFound(userIns, e.fieldId))
            }
        };
        switch (filter.userFollowedPublishers, filtered) {
            case (null, _) {};
            case (?user, null) {
                var list : List<Nat> = List.nil();
                for (following in Set.vals(getUser(user).followings)) {
                    list := List.revAppend(getUser(following).hypotheses, list)
                };
                filtered := ?List.toArrayFilterMap<Nat, Entry>(list, toEntry)
            };
            case (?user, ?prev) {
                let userIns : User = getUser(user);
                filtered := ?Array.filter<Entry>(prev, func((_, e)) = User.followingsFound(userIns, e.publisher))
            }
        };
        switch (filter.voter, filtered) {
            case (null, _) {};
            case (?user, null) filtered := ?Map.getKeysFilterMap(getUser(user).votedHypotheses, toEntry);
            case (?user, ?prev) {
                let userIns : User = getUser(user);
                filtered := ?Array.filter<Entry>(prev, func((i, _)) = User.hasHypothesisVoted(userIns, i))
            }
        };
        switch (filter.publisher, filtered) {
            case (null, _) {};
            case (?user, null) filtered := ?List.toArrayFilterMap<Nat, Entry>(getUser(user).hypotheses, toEntry);
            case (?user, ?prev) filtered := ?Array.filter<Entry>(prev, func(_, e) = e.publisher == user)
        };
        switch (filter.field, filtered) {
            case (null, _) {};
            case (?field, null) filtered := ?List.toArrayFilterMap<Nat, Entry>(getField(field).hypothesisIds, toEntry);
            case (?field, ?prev) filtered := ?Array.filter<Entry>(prev, func(_, e) = e.fieldId == field)
        };
        switch (filter.age, filtered) {
            case (null, _) {};
            case (?age, null) {
                let nextPaidId : Nat = getAge(age).nextPaidId.val;
                switch (nextPaidId < nextId(__)) {
                    case (false) filtered := ?[];
                    case (true) filtered := ?Iter.toArrayFilterMap<Nat, Entry>(Iter.range(nextPaidId, lastId(__)), toEntry)
                }
            };
            case (?age, ?prev) {
                let nextPaidId : Nat = getAge(age).nextPaidId.val;
                switch (nextPaidId < Vector.size(__)) {
                    case (false) filtered := ?[];
                    case (true) filtered := ?Array.filter<Entry>(prev, func(i, _) = i >= nextPaidId)
                }
            }
        };
        switch (filter.agoStart, filter.agoEnd, filtered) {
            case (null, null, _) {};
            case (?agoStart, null, null) filtered := ?Vector.toEntriesFilterMap<?Hypothesis, Entry>(
                __,
                func(i, e) = switch (e) {
                    case (?e) switch (Date.getMidnightsElapsed(now, e.publishDate) >= agoStart) {
                        case (true) ?(i, e);
                        case (false) null
                    };
                    case (null) null
                },
            );
            case (null, ?agoEnd, null) {
                filtered := ?Vector.toEntriesFilterMap<?Hypothesis, Entry>(
                    __,
                    func(i, e) = switch (e) {
                        case (?e) switch (Date.getMidnightsElapsed(now, e.publishDate) <= agoEnd) {
                            case (true) toFilter(i, e);
                            case (false) null
                        };
                        case (null) null
                    },
                )
            };
            case (?agoStart, null, ?prev) filtered := ?Array.filter<Entry>(prev, func(_, e) = Date.getMidnightsElapsed(now, e.publishDate) >= agoStart);
            case (null, ?agoEnd, ?prev) filtered := ?Array.filter<Entry>(prev, func(_, e) = Date.getMidnightsElapsed(now, e.publishDate) <= agoEnd);
            case (?agoStart, ?agoEnd, null) {
                filtered := ?Vector.toEntriesFilterMap<?Hypothesis, Entry>(
                    __,
                    func(i, e) = switch (e) {
                        case (?e) {
                            let elapsed : Nat = Date.getMidnightsElapsed(now, e.publishDate);
                            switch (elapsed >= agoStart and elapsed <= agoEnd) {
                                case (true) toFilter(i, e);
                                case (false) null
                            }
                        };
                        case (null) null
                    },
                )
            };
            case (?agoStart, ?agoEnd, ?prev) {
                filtered := ?Array.filter<Entry>(
                    prev,
                    func(_, e) {
                        let elapsed : Nat = Date.getMidnightsElapsed(now, e.publishDate);
                        elapsed >= agoStart and elapsed <= agoEnd
                    },
                )
            }
        };
        switch (filter.q, filtered) {
            case (null, _) {};
            case (?pattern, null) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Vector.toEntriesFilterMap<?Hypothesis, Entry>(
                    __,
                    func(i, e) = switch (e) {
                        case (?e) switch (Hypothesis.containsPattern(e, patternIns)) {
                            case (true) toFilter(i, e);
                            case (false) null
                        };
                        case (null) null
                    },
                )
            };
            case (?pattern, ?prev) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Array.filter<Entry>(prev, func(_, e) = Hypothesis.containsPattern(e, patternIns))
            }
        };

        let default : ?[Entry] -> [Entry] = func(unsorted) = switch (unsorted) {
            case (null) Vector.toEntriesFilterMap<?Hypothesis, Entry>(__, func(i, e) = switch (e) { case (?e) toFilter(i, e); case (null) null });
            case (?unsorted) unsorted
        };

        switch (sort.by, sort.order, filtered) {
            case (#recent, #descending, null) Vector.toEntriesFilterMapRev<?Hypothesis, SharableHypothesis>(__, func(i, e) = switch (e) { case (?e) ?toSharable(i, e); case (null) null });
            case (#recent, #ascending, null) Vector.toEntriesFilterMap<?Hypothesis, SharableHypothesis>(__, func(i, e) = switch (e) { case (?e) ?toSharable(i, e); case (null) null });
            case (#recent, order, ?unsorted) Array.map<Entry, SharableHypothesis>(Array.sort(unsorted, _recent(order)), toSharable);
            case (#controversy, order, unsorted) Array.map<Entry, SharableHypothesis>(Array.sort(default(unsorted), _controversy(order)), toSharable);
            case (sortedBy, order, unsorted) {
                let ordering : Ordering = DoubleClusterTree.getAverageRankTreeFromArray(default(unsorted), _scores(sortedBy), _id());
                // Should sort by score, higher score -> lower rank
                let flippedOrder : Order = switch (order) {
                    case (#ascending) #descending;
                    case (#descending) #ascending
                };
                let ranking : [Ranking<Entry>] = ClusterTree.getFlattenVals(ordering, #all, flippedOrder);
                Array.map<Ranking<Entry>, SharableHypothesis>(ranking, func({ key }) = toSharable(key))
            }
        }
    };

    /// PUBLIC ////// ASSERTIONS ////////////

    public func expectFound(__ : Self, id : Nat) {
        if (found(__, id)) return;
        E.f(#NOT_EXISTED("Hypothesis"), "Hypothesis " # debug_show id # " not found")
    };
    public func expectNotFound(__ : Self, id : Nat) {
        if (not found(__, id)) return;
        E.f(#ALREADY_EXISTED("Hypothesis"), "Hypothesis " # debug_show id # " already exists")
    }
}
