import Evidence "Evidence";
import Hypothesis "../hypotheses/Hypothesis";
import User "../users/User";

import E "../../../common/Errors";

import Base "../../../library/Base";
import ClusterTree "../../../library/ClusterTree";
import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";
import Vector "../../../library/Vector";

import BinaryVotes "../../../library/votes/BinaryVotes";
import DoubleClusterTree "../../../library/doubletree/DoubleClusterTree";
import DoubleRankTree "../../../library/doubletree/DoubleRankTree";

import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Vector<T> = Vector.Vector<T>;
    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;
    private type ClusterTree<K, V> = ClusterTree.ClusterTree<K, V>;
    private type Ranking<T> = DoubleRankTree.Ranking<T>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;
    private type BinaryVote = BinaryVotes.Vote;
    private type BinaryChoice = BinaryVotes.Choice;

    private type Evidence = Evidence.Evidence;
    private type SharableEvidence = Evidence.Sharable;
    private type Format = Evidence.Format;
    private type Hypothesis = Hypothesis.Hypothesis;
    private type User = User.User;

    private type Entry = (Nat, Evidence);
    private type Scores = Entry -> (Nat, Nat);
    private type Ordering = ClusterTree<Float, Ranking<Entry>>;

    private func _id() : Compare<Entry> = func((i1, _), (i2, _)) = Nat.compare(i1, i2);
    private func _recent(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(a.publishDate, b.publishDate);
        case (#descending) func((_, a), (_, b)) = Int.compare(b.publishDate, a.publishDate)
    };
    private func _scores(sortedBy : Sort) : Scores = switch (sortedBy) {
        case (#recent) func(_, e) = E.unreachable();
        case (#popularity) func(_, e) = (BinaryVotes.getRegularValue(e.votes), BinaryVotes.getPoweredValue(e.votes));
        case (#positivity) func(_, e) = (BinaryVotes.getRegularPositiveValue(e.votes), BinaryVotes.getPoweredPositiveValue(e.votes));
        case (#negativity) func(_, e) = (BinaryVotes.getRegularNegativeValue(e.votes), BinaryVotes.getPoweredNegativeValue(e.votes))
    };

    private func _buildRepliesContextOptimized(__ : Self, parentEvidence : Evidence, depthLimit : Nat, currentDepth : Nat, callerUser : ?(Principal, User), getCallerVote : Nat -> ?BinaryVote) : SharableContext {
        if (currentDepth >= depthLimit) {
            return []
        };
        var contextRepliesList : List.List<(SharableEvidence, SharableContext)> = List.nil();
        for (replyId in List.toIter(parentEvidence.replies)) {
            switch (evidenceRemovedOpt(__, replyId)) {
                case (?replyEvidence) {
                    let sharableReply = Evidence.toSharable(replyEvidence, replyId, getCallerVote);
                    let subRepliesContext = _buildRepliesContextOptimized(__, replyEvidence, depthLimit, currentDepth + 1, callerUser, getCallerVote);

                    let currentEntry : (SharableEvidence, SharableContext) = (sharableReply, subRepliesContext);
                    contextRepliesList := List.push(currentEntry, contextRepliesList)
                };
                case (null) {}
            }
        };
        return List.toArray(contextRepliesList)
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        hypothesis : ?Nat;
        publisher : ?Principal;
        voter : ?Principal;
        side : ?BinaryChoice;
        q : ?Text
    };
    public type Sort = {
        #recent;
        #popularity;
        #positivity;
        #negativity
    };

    public type Context = List<((Nat, Evidence), Context)>;
    public type SharableContext = [(SharableEvidence, SharableContext)];

    /// AXIOMS ////// EVIDENCES ////////////

    private type Self = Evidences;

    public type Evidences = Vector<?Evidence>;
    public type Sharable = [SharableEvidence];

    public func init() : Self = Vector.new<?Evidence>();

    /// PUBLIC ////// MODIFIERS ////////////

    public func publish(__ : Self, e : Evidence) : Nat {
        let id : Nat = Vector.size(__);
        Vector.add(__, ?e);
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

    public func evidence(__ : Self, id : Nat) : Evidence = switch (Vector.getOpt(__, id)) {
        case (?evidence) switch (evidence) {
            case (?evidence) evidence;
            case (null) E.f(#NOT_EXISTED("Evidence"), "Attempted to get a removed evidence id " # debug_show (id) # " by flagging")
        };
        case (null) E.f(#NOT_EXISTED("Evidence"), "Attempted to get a non-existent evidence id " # debug_show (id) # ". Max id available is " # debug_show (lastId(__)))
    };
    public func evidenceRemovedOpt(__ : Self, id : Nat) : ?Evidence = switch (Vector.getOpt(__, id)) {
        case (?evidence) evidence;
        case (null) E.f(#NOT_EXISTED("Evidence"), "Attempted to get a non-existent evidence id " # debug_show (id) # ". Max id available is " # debug_show (lastId(__)))
    };
    public func getEvidence(__ : Self, id : Nat, callerUser : ?(Principal, User)) : SharableEvidence {
        let getCallerVote : Nat -> ?BinaryVote = User.callerEvidenceVoteCallback(callerUser);
        Evidence.toSharable(evidence(__, id), id, getCallerVote)
    };
    public func getEvidences(__ : Self, filter : Filter, sort : Sorted<Sort>, callerUser : ?(Principal, User), getUser : Principal -> User, getHypothesis : Nat -> Hypothesis) : Sharable {
        let getCallerVote : Nat -> ?BinaryVote = User.callerEvidenceVoteCallback(callerUser);

        var filtered : ?[Entry] = null;
        let toEntry : Nat -> ?Entry = func(i) = switch (evidenceRemovedOpt(__, i)) {
            case (?evidence) ?(i, evidence);
            case (null) null
        };
        let toSharable : Entry -> SharableEvidence = func(id, entry) = Evidence.toSharable(entry, id, getCallerVote);

        switch (filter.voter) {
            case (null) {};
            case (?user) filtered := ?Map.getKeysFilterMap(getUser(user).votedEvidences, toEntry)
        };
        switch (filter.publisher, filtered) {
            case (null, _) {};
            case (?user, null) filtered := ?List.toArrayFilterMap<Nat, Entry>(getUser(user).evidences, toEntry);
            case (?user, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, func(_, e) = e.publisher == user)
        };
        switch (filter.hypothesis, filtered) {
            case (null, _) {};
            case (?hypothesis, null) filtered := ?List.toArrayFilterMap<Nat, Entry>(getHypothesis(hypothesis).evidenceIds, toEntry);
            case (?hypothesis, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, func(_, e) = e.hypothesisId == hypothesis)
        };
        switch (filter.side, filtered) {
            case (null, _) {};
            case (?side, null) filtered := ?Vector.toEntriesFilterMap<?Evidence, Entry>(
                __,
                func(i, e) = switch (e) {
                    case (?e) switch (e.choice == side) {
                        case (true) ?(i, e);
                        case (false) null
                    };
                    case (null) null
                },
            );
            case (?side, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, func(_, e) = e.choice == side)
        };
        switch (filter.q, filtered) {
            case (null, _) {};
            case (?pattern, null) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Vector.toEntriesFilterMap<?Evidence, Entry>(
                    __,
                    func(i, e) = switch (e) {
                        case (?e) switch (Evidence.containsPattern(e, patternIns)) {
                            case (true) ?(i, e);
                            case (false) null
                        };
                        case (null) null
                    },
                )
            };
            case (?pattern, ?prev) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Array.filter<Entry>(prev, func(_, e) = Evidence.containsPattern(e, patternIns))
            }
        };

        let default : ?[Entry] -> [Entry] = func(unsorted) = switch (unsorted) {
            case (null) Vector.toEntriesFilterMap<?Evidence, Entry>(__, func(i, e) = switch (e) { case (?e) ?(i, e); case (null) null });
            case (?unsorted) unsorted
        };

        switch (sort.by, sort.order, filtered) {
            case (#recent, #descending, null) Vector.toEntriesFilterMapRev<?Evidence, SharableEvidence>(__, func(i, e) = switch (e) { case (?e) ?toSharable(i, e); case (null) null });
            case (#recent, #ascending, null) Vector.toEntriesFilterMap<?Evidence, SharableEvidence>(__, func(i, e) = switch (e) { case (?e) ?toSharable(i, e); case (null) null });
            case (#recent, order, ?unsorted) Array.map<Entry, SharableEvidence>(Array.sort(unsorted, _recent(order)), toSharable);
            case (sortedBy, order, unsorted) {
                let ordering : Ordering = DoubleClusterTree.getAverageRankTreeFromArray(default(unsorted), _scores(sortedBy), _id());
                // Should sort by score, higher score -> lower rank
                let flippedOrder : Order = switch (order) {
                    case (#ascending) #descending;
                    case (#descending) #ascending
                };
                let ranking : [Ranking<Entry>] = ClusterTree.getFlattenVals(ordering, #all, flippedOrder);
                Array.map<Ranking<Entry>, SharableEvidence>(ranking, func({ key }) = toSharable(key))
            }
        }
    };

    public func getEvidenceContext(__ : Self, evidenceId : Nat, depthLimit : Nat, callerUser : ?(Principal, User)) : SharableContext {
        let getCallerVote : Nat -> ?BinaryVote = User.callerEvidenceVoteCallback(callerUser);

        var currentId = evidenceId;
        var rootEvidenceOpt : ?Evidence = null;
        var rootId : Nat = evidenceId;

        var safetyCounter = 0;
        let maxHops = 100;

        label rootFinding while (safetyCounter < maxHops) {
            switch (evidenceRemovedOpt(__, currentId)) {
                case (?e) {
                    rootEvidenceOpt := ?e;
                    rootId := currentId;

                    switch (e.repliedTo) {
                        case (?parentIdInLoop) switch (evidenceRemovedOpt(__, parentIdInLoop)) {
                            case (?_) currentId := parentIdInLoop;
                            case (null) break rootFinding
                        };
                        case (null) break rootFinding
                    }
                };
                case (null) {
                    rootEvidenceOpt := null;
                    break rootFinding
                }
            };
            safetyCounter += 1
        };

        switch (rootEvidenceOpt) {
            case (null) return [];
            case (?rootEvidence) {
                let sharableRoot = Evidence.toSharable(rootEvidence, rootId, getCallerVote);
                let repliesContext = _buildRepliesContextOptimized(__, rootEvidence, depthLimit, 1, callerUser, getCallerVote);
                return [(sharableRoot, repliesContext)]
            }
        }
    };

    /// PUBLIC ////// ASSERTIONS ////////////

    public func expectFound(__ : Self, id : Nat) {
        if (found(__, id)) return;
        E.f(#NOT_EXISTED("Evidence"), "Evidence " # debug_show id # " not found")
    };
    public func expectNotFound(__ : Self, id : Nat) {
        if (not found(__, id)) return;
        E.f(#ALREADY_EXISTED("Evidence"), "Evidence " # debug_show id # " already exists")
    }
}
