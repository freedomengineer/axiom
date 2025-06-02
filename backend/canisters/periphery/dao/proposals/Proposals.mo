import Proposal "Proposal";
import Detachment "../detachments/Detachment";
import User "../users/User";
import Installation "../../../periphery/indicator/installations/Installation";

import E "../../../common/Errors";
import C "../../../common/Constants";

import Base "../../../library/Base";
import Count "../../../library/Count";
import Date "../../../library/Date";
import Delegable "../../../library/Delegable";
import E8S "../../../library/E8S";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Map "../../../library/Map";
import Proportion "../../../library/Proportion";
import Set "../../../library/Set";
import Vector "../../../library/Vector";
import Pagination "../../../library/Pagination";
import UniformBinaryVotes "../../../library/votes/UniformBinaryVotes";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Int "mo:base/Int";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Iter<T> = Iter.Iter<T>;
    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Set<T> = Set.Set<T>;
    private type Vector<T> = Vector.Vector<T>;
    private type Delegable<T> = Delegable.Delegable<T>;
    private type Pagination<T> = Pagination.Pagination<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Compare<T> = Base.Compare<T>;
    private type Order = Base.Order;
    private type Time = Time.Time;

    private type Count = Count.Count;
    private type E8S = E8S.E8S;
    private type Proportion = Proportion.Proportion;
    private type UniformBinaryVote = UniformBinaryVotes.Vote;
    private type UniformBinaryVotes = UniformBinaryVotes.Votes;
    private type SharableUniformBinaryVotes = UniformBinaryVotes.Sharable;

    private type SharableInstallation = Installation.Sharable;
    private type ActorsConfigs = Installation.ActorsConfigs;
    private type Proposal = Proposal.Proposal;
    private type SharableProposal = Proposal.Sharable;
    private type Detachment = Detachment.Detachment;
    private type CodeDetachment = Detachment.Code;
    private type WorkerDetachment = Detachment.Worker;
    private type StatusVariant = Proposal.StatusVariant;
    private type ProposalVariant = Detachment.Variant;
    private type User = User.User;

    private func _voter((i, _) : Entry, x : User) : Bool = User.hasProposalVoted(x, i);
    private func _proposer(x : Principal) : Entry -> Bool = func(_, e) = e.proposer == x;
    private func _category(x : ProposalVariant) : Entry -> Bool = func(_, e) = Proposal.variant(e) == x;
    private func _status(status : StatusVariant) : Entry -> Bool = func(_, e) = Proposal.getStatus(e) == status;

    private func _recent(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(Proposal.proposeDate(a), Proposal.proposeDate(b));
        case (#descending) func((_, a), (_, b)) = Int.compare(Proposal.proposeDate(b), Proposal.proposeDate(a))
    };
    private func _updated(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(Proposal.lastUpdatedDate(a), Proposal.lastUpdatedDate(b));
        case (#descending) func((_, a), (_, b)) = Int.compare(Proposal.lastUpdatedDate(b), Proposal.lastUpdatedDate(a))
    };
    private func _acornReward(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = E8S.compare(a.acornReward, b.acornReward);
        case (#descending) func((_, a), (_, b)) = E8S.compare(b.acornReward, a.acornReward)
    };
    private func _icpReward(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = E8S.compare(a.icpReward, b.icpReward);
        case (#descending) func((_, a), (_, b)) = E8S.compare(b.icpReward, a.icpReward)
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        proposer : ?Principal;
        category : ?ProposalVariant;
        voter : ?Principal;
        status : ?StatusVariant
    };
    public type Sort = {
        #recent;
        #updated;
        #acornReward;
        #icpReward
    };

    public type Entry = (Nat, Proposal);

    /// DAO ////// PROPOSALS ////////////

    private type Self = Proposals;

    public type Proposals = {
        proposals : Vector<Proposal>;
        var lockedIds : List<Nat>;
        var retryingIds : List<Nat>;
        nextExpiredId : Count
    };
    public type Sharable = [SharableProposal];

    public func init() : Self = {
        proposals = Vector.new<Proposal>();
        var lockedIds = List.nil();
        var retryingIds = List.nil();
        nextExpiredId = Count.new()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func openCodeProposal(__ : Self, proposer : Principal, title : Text, content : Text, acornReward : Nat, icpReward : Nat, actorsConfigs : ActorsConfigs, installation : SharableInstallation, getNow : () -> Int) {
        let proposal : Proposal = Proposal.initCode(proposer, title, content, acornReward, icpReward, actorsConfigs, installation, getNow);
        Vector.add(__.proposals, proposal)
    };
    public func openFieldProposal(__ : Self, proposer : Principal, content : Text, acornReward : Nat, icpReward : Nat, name : Text, description : Text, getNow : () -> Int) {
        let proposal : Proposal = Proposal.initField(proposer, content, acornReward, icpReward, name, description, getNow);
        Vector.add(__.proposals, proposal)
    };
    public func openWorkerProposal(__ : Self, proposer : Principal, title : Text, content : Text, acornReward : Nat, icpReward : Nat, getNow : () -> Int) {
        let proposal : Proposal = Proposal.initWorker(proposer, title, content, acornReward, icpReward, getNow);
        Vector.add(__.proposals, proposal)
    };
    public func openConfigsProposal(__ : Self, proposer : Principal, content : Text, acornReward : Nat, icpReward : Nat, actorsConfigs : ActorsConfigs, getNow : () -> Int) {
        let proposal : Proposal = Proposal.initConfigs(proposer, content, acornReward, icpReward, actorsConfigs, getNow);
        Vector.add(__.proposals, proposal)
    };

    public func retry(__ : Self, id : Nat) {
        __.retryingIds := List.push(id, __.retryingIds)
    };
    public func removeRetry(__ : Self, id : Nat) {
        __.retryingIds := List.filter<Nat>(__.retryingIds, func(i) = i != id)
    };
    public func lock(__ : Self, id : Nat) {
        __.lockedIds := List.push(id, __.lockedIds)
    };
    public func cleanUpLockedProposals(__ : Self) {
        __.lockedIds := List.nil()
    };
    public func cleanUpExpiredProposals(__ : Self, duration : Nat, getNow : () -> Int) : List<(Nat, Principal)> {
        let lastId : Nat = switch (nextId(__)) {
            case (0) return List.nil();
            case (_) Vector.size(__.proposals) - 1
        };
        var expired : List<(Nat, Principal)> = List.nil();
        label shifting while (__.nextExpiredId.val <= lastId) {
            let p : Proposal = proposal(__, __.nextExpiredId.val);
            let isExpired : Bool = Proposal.isExpired(p, duration, getNow);
            if (not isExpired) break shifting;
            if (Proposal.getStatus(p) == #Proposed) {
                Proposal.expired(p, getNow);
                expired := List.push((__.nextExpiredId.val, p.proposer), expired)
            };
            Count.increment(__.nextExpiredId)
        };
        let newRetryingIds : List<Nat> = List.filter<Nat>(
            __.retryingIds,
            func(i) {
                let p : Proposal = proposal(__, i);
                let isExpired : Bool = Proposal.isExpired(p, duration, getNow);
                if (isExpired) {
                    Proposal.expired(p, getNow);
                    expired := List.push((i, p.proposer), expired)
                };
                not isExpired
            },
        );
        __.retryingIds := newRetryingIds;
        expired
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func lockedProposals(__ : Self) : Iter<Entry> = List.toIterMap<Nat, Entry>(__.lockedIds, func(i) = (i, proposal(__, i)));

    public func votableProposals(__ : Self) : Iter<Entry> {
        var proposalEntires : List<Entry> = List.nil();
        for (i in Iter.range(nextExpiredId(__).val, lastId(__))) {
            let p : Proposal = proposal(__, i);
            if (Proposal.votable(p)) proposalEntires := List.push((i, p), proposalEntires)
        };
        for (i in List.toIter(__.retryingIds)) {
            let p : Proposal = proposal(__, i);
            if (Proposal.votable(p)) proposalEntires := List.push((i, p), proposalEntires)
        };
        List.toIter(proposalEntires)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func nextExpiredId(__ : Self) : Count = __.nextExpiredId;
    public func nextId(__ : Self) : Nat = Vector.size(__.proposals);
    public func lastId(__ : Self) : Nat = Vector.size(__.proposals) - 1;

    public func proposal(__ : Self, id : Nat) : Proposal {
        switch (Vector.getOpt(__.proposals, id)) {
            case (?proposal) proposal;
            case (null) E.f(#NOT_EXISTED("Proposal"), "Proposal id " # debug_show id # " does not exist.")
        }
    };
    public func getProposal(__ : Self, id : Nat, custodians : Set<Principal>, callerUser : ?(Principal, User)) : SharableProposal {
        let getCallerVote : (Nat) -> ?Delegable<UniformBinaryVote> = User.callerProposalVoteCallback(callerUser);
        Proposal.toSharable(proposal(__, id), id, custodians, getCallerVote)
    };
    public func getProposals(__ : Self, filter : Filter, sort : Sorted<Sort>, custodians : Set<Principal>, callerUser : ?(Principal, User), getUser : (Principal) -> User) : Sharable {
        let getCallerVote : (Nat) -> ?Delegable<UniformBinaryVote> = User.callerProposalVoteCallback(callerUser);

        var filtered : ?[Entry] = null;
        let toEntry : (Nat) -> Entry = func(i) = (i, proposal(__, i));
        let toSharable : (Entry) -> SharableProposal = func(i, e) = Proposal.toSharable(e, i, custodians, getCallerVote);

        switch (filter.proposer) {
            case (null) {};
            case (?proposer) filtered := ?List.toArrayMap<Nat, Entry>(getUser(proposer).proposals, toEntry)
        };
        switch (filter.category, filtered) {
            case (null, _) {};
            case (?category, null) filtered := ?Vector.toEntriesFilter<Proposal>(__.proposals, _category(category));
            case (?category, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _category(category))
        };
        switch (filter.voter, filtered) {
            case (null, _) {};
            case (?voter, null) filtered := ?Map.getKeysMap(getUser(voter).proposalVotes, toEntry);
            case (?voter, ?prevResult) {
                let voterUser : User = getUser(voter);
                filtered := ?Array.filter<Entry>(prevResult, func(e) = _voter(e, voterUser))
            }
        };
        switch (filter.status, filtered) {
            case (null, _) {};
            case (?status, null) filtered := ?Vector.toEntriesFilter<Proposal>(__.proposals, _status(status));
            case (?status, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _status(status))
        };

        let default : ?[Entry] -> [Entry] = func(unsorted) = switch (unsorted) {
            case (null) Vector.toEntriesMap<Proposal, Entry>(__.proposals, func(i, e) = (i, e));
            case (?unsorted) unsorted
        };

        switch (sort.by, sort.order, filtered) {
            case (#recent, #descending, null) Vector.toEntriesMapRev<Proposal, SharableProposal>(__.proposals, toSharable);
            case (#recent, #ascending, null) Vector.toEntriesMap<Proposal, SharableProposal>(__.proposals, toSharable);
            case (#recent, order, ?unsorted) Array.map<Entry, SharableProposal>(Array.sort(unsorted, _recent(order)), toSharable);
            case (#updated, order, unsorted) Array.map<Entry, SharableProposal>(Array.sort(default(unsorted), _updated(order)), toSharable);
            case (#acornReward, order, unsorted) Array.map<Entry, SharableProposal>(Array.sort(default(unsorted), _acornReward(order)), toSharable);
            case (#icpReward, order, unsorted) Array.map<Entry, SharableProposal>(Array.sort(default(unsorted), _icpReward(order)), toSharable)
        }
    }
}
