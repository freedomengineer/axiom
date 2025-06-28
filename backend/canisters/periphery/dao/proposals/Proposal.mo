import Detachment "../detachments/Detachment";
import User "../users/User";
import Installation "../../../periphery/indicator/installations/Installation";

import E "../../../common/Errors";

import Base "../../../library/Base";
import Date "../../../library/Date";
import Delegable "../../../library/Delegable";
import E8S "../../../library/E8S";
import List "../../../library/List";
import Proportion "../../../library/Proportion";
import Set "../../../library/Set";
import UniformBinaryVotes "../../../library/votes/UniformBinaryVotes";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;
    private type Delegable<T> = Delegable.Delegable<T>;
    private type Time = Time.Time;
    private type E8S = E8S.E8S;

    private type Proportion = Proportion.Proportion;
    private type UniformBinaryVotes = UniformBinaryVotes.Votes;
    private type UniformBinaryVote = UniformBinaryVotes.Vote;
    private type SharableUniformBinaryVotes = UniformBinaryVotes.Sharable;

    private type ActorsConfigs = Installation.ActorsConfigs;
    private type SharableInstallation = Installation.Sharable;
    private type Detachment = Detachment.Detachment;
    private type SharableDetachment = Detachment.Sharable;
    private type CodeDetachment = Detachment.Code;
    private type WorkerDetachment = Detachment.Worker;
    private type ConfigsDetachment = Detachment.Configs;
    private type User = User.User;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type StatusVariant = {
        #Retried;
        #Proposed;
        #Approved;
        #Executed;
        #Failed;
        #Rejected;
        #Expired
    };
    public type Status = {
        #Retried;
        #Proposed;
        #Approved;
        #Executed;
        #Failed : Text;
        #Rejected;
        #Expired
    };

    public type Milestone = {
        status : Status;
        date : Time
    };

    /// DAO ////// PROPOSAL ////////////

    private type Self = Proposal;

    public type Proposal = {
        proposer : Principal;
        title : Text;
        var content : Text;
        var timeline : [Milestone];
        var acornReward : E8S;
        var icpReward : E8S;
        var votes : UniformBinaryVotes;
        var detachment : Detachment
    };
    public type Sharable = {
        id : Nat;
        proposer : Principal;
        title : Text;
        content : Text;
        timeline : [Milestone];
        acornReward : Nat;
        icpReward : Nat;
        votes : ([Principal], [Principal], [Principal], [Principal]);
        detachment : SharableDetachment;
        callerVote : ?Delegable<UniformBinaryVote>
    };

    public func initCode(proposer : Principal, title : Text, content : Text, acornReward : Nat, icpReward : Nat, actorsConfigs : ActorsConfigs, installation : SharableInstallation, getNow : () -> Int) : Self = {
        proposer;
        title;
        var content;
        var timeline = [{ status = #Proposed; date = getNow() }];
        var acornReward = E8S.make(acornReward);
        var icpReward = E8S.make(icpReward);
        var votes = UniformBinaryVotes.new();
        var detachment = Detachment.initCode(actorsConfigs, installation)
    };
    public func initField(proposer : Principal, content : Text, acornReward : Nat, icpReward : Nat, name : Text, description : Text, getNow : () -> Int) : Self = {
        proposer;
        title = "Propose to create " # name # " Field";
        var content;
        var timeline = [{ status = #Proposed; date = getNow() }];
        var acornReward = E8S.make(acornReward);
        var icpReward = E8S.make(icpReward);
        var votes = UniformBinaryVotes.new();
        var detachment = Detachment.initField(name, description)
    };
    public func initWorker(proposer : Principal, title : Text, content : Text, acornReward : Nat, icpReward : Nat, getNow : () -> Int) : Self = {
        proposer;
        title;
        var content;
        var timeline = [{ status = #Proposed; date = getNow() }];
        var acornReward = E8S.make(acornReward);
        var icpReward = E8S.make(icpReward);
        var votes = UniformBinaryVotes.new();
        var detachment = Detachment.initWorker()
    };
    public func initConfigs(proposer : Principal, content : Text, acornReward : Nat, icpReward : Nat, actorsConfigs : ActorsConfigs, getNow : () -> Int) : Self {
        var totalConfigs : Nat = 0;
        for ((_, configs) in actorsConfigs.vals()) totalConfigs += configs.size();
        let title : Text = "Update " # debug_show totalConfigs # " Configuration Variables with " # debug_show actorsConfigs.size() # " Actors affected";
        {
            proposer;
            title;
            var content;
            var timeline = [{ status = #Proposed; date = getNow() }];
            var acornReward = E8S.make(acornReward);
            var icpReward = E8S.make(icpReward);
            var votes = UniformBinaryVotes.new();
            var detachment = Detachment.initConfigs(actorsConfigs)
        }
    };

    /// PUBLIC ////// MODIFIERS ////////////

    // public func retryCode(__ : Self, updatedContent : Text, updatedReward : Nat, updatedInstallation : SharableInstallation, getNow : () -> Int) {
    //     retried(__, getNow);
    //     __.content := updatedContent;
    //     __.reward := E8S.make(updatedReward);
    //     __.detachment := Detachment.initCode(updatedInstallation);
    // };
    public func retryField(__ : Self, updatedContent : Text, updatedName : Text, updatedDescription : Text, getNow : () -> Int) {
        retried(__, getNow);
        __.content := updatedContent;
        __.votes := UniformBinaryVotes.new();
        __.detachment := Detachment.initField(updatedName, updatedDescription)
    };
    public func retryWorker(__ : Self, updatedContent : Text, updatedAcornReward : Nat, updatedIcpReward : Nat, getNow : () -> Int) {
        retried(__, getNow);
        __.content := updatedContent;
        __.votes := UniformBinaryVotes.new();
        __.acornReward := E8S.make(updatedAcornReward);
        __.icpReward := E8S.make(updatedIcpReward)
    };
    public func retryConfigs(__ : Self, updatedContent : Text, updatedAcornReward : Nat, updatedIcpReward : Nat, updatedActorsConfigs : ActorsConfigs, getNow : () -> Int) {
        retried(__, getNow);
        __.content := updatedContent;
        __.votes := UniformBinaryVotes.new();
        __.acornReward := E8S.make(updatedAcornReward);
        __.icpReward := E8S.make(updatedIcpReward);
        __.detachment := Detachment.initConfigs(updatedActorsConfigs)
    };

    public func retried(__ : Self, getNow : () -> Int) {
        let milestone : Milestone = { status = #Retried; date = getNow() };
        __.timeline := Array.append(__.timeline, [milestone])
    };
    public func approved(__ : Self, getNow : () -> Int) {
        let milestone : Milestone = { status = #Approved; date = getNow() };
        __.timeline := Array.append(__.timeline, [milestone])
    };
    public func rejected(__ : Self, getNow : () -> Int) {
        let milestone : Milestone = { status = #Rejected; date = getNow() };
        __.timeline := Array.append(__.timeline, [milestone])
    };
    public func executed(__ : Self, getNow : () -> Int) {
        let milestone : Milestone = { status = #Executed; date = getNow() };
        __.timeline := Array.append(__.timeline, [milestone])
    };
    public func failed(__ : Self, error : Text, getNow : () -> Int) {
        let milestone : Milestone = { status = #Failed(error); date = getNow() };
        __.timeline := Array.append(__.timeline, [milestone])
    };
    public func expired(__ : Self, getNow : () -> Int) {
        let milestone : Milestone = { status = #Expired; date = getNow() };
        __.timeline := Array.append(__.timeline, [milestone])
    };

    public func addVote(__ : Self, voter : Principal, vote : UniformBinaryVote) {
        UniformBinaryVotes.add(__.votes, voter, vote)
    };
    public func removeVote(__ : Self, voter : Principal, vote : UniformBinaryVote) {
        UniformBinaryVotes.remove(__.votes, voter, vote)
    };
    public func updateVote(__ : Self, voter : Principal, oldVote : UniformBinaryVote, newVote : UniformBinaryVote) {
        UniformBinaryVotes.remove(__.votes, voter, oldVote);
        UniformBinaryVotes.add(__.votes, voter, newVote)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func retries(__ : Self) : Nat {
        var retries : Nat = 0;
        for (milestone in __.timeline.vals()) {
            if (milestone.status == #Retried) retries += 1
        };
        retries
    };

    public func variant(__ : Self) : Detachment.Variant = Detachment.variant(__.detachment);

    public func status(__ : Self) : Status = __.timeline[__.timeline.size() - 1].status;
    public func getStatus(__ : Self) : StatusVariant = switch (status(__)) {
        case (#Retried) #Retried;
        case (#Proposed) #Proposed;
        case (#Approved) #Approved;
        case (#Executed) #Executed;
        case (#Failed(_)) #Failed;
        case (#Rejected) #Rejected;
        case (#Expired) #Expired
    };

    public func proposeDate(__ : Self) : Time = __.timeline[0].date;
    public func lastUpdatedDate(__ : Self) : Time = __.timeline[__.timeline.size() - 1].date;

    public func isExpired(__ : Self, duration : Nat, getNow : () -> Int) : Bool = Date.getMidnightsElapsed(getNow(), lastUpdatedDate(__)) >= duration;

    public func votable(__ : Self) : Bool = (status(__) == #Proposed or status(__) == #Retried);
    public func retriable(__ : Self, retryLimit : Nat) : Bool = switch (status(__), retries(__) < retryLimit) {
        case (#Failed(_), true) true;
        case (#Rejected, true) true;
        case (#Expired, true) true;
        case (_, _) false
    };

    public func getVoteProportions(__ : Self, custodianSize : Nat) : (Proportion, Proportion) {
        let (positiveValue, negativeValue) : (Nat, Nat) = (UniformBinaryVotes.getPositiveValue(__.votes), UniformBinaryVotes.getNegativeValue(__.votes));
        (Proportion.make(positiveValue, custodianSize), Proportion.make(negativeValue, custodianSize))
    };
    public func getSharableVotes(__ : Self, custodians : Set<Principal>) : ([Principal], [Principal], [Principal], [Principal]) {
        let positiveVoters : Set<Principal> = UniformBinaryVotes.positiveVoters(__.votes);
        let negativeVoters : Set<Principal> = UniformBinaryVotes.negativeVoters(__.votes);
        let delegatedVoters : Set<Principal> = UniformBinaryVotes.delegatedVoters(__.votes);

        let awaitingVoters : [Principal] = switch (votable(__)) {
            case (false)[];
            case (true) {
                let until = { hash = Principal.hash; equal = Principal.equal };
                let voters : Set<Principal> = Set.union(Set.union(positiveVoters, negativeVoters, until), delegatedVoters, until);
                let awaitingVoters : Set<Principal> = Set.difference(custodians, voters, until);
                Set.toArray(awaitingVoters)
            }
        };
        (Set.toArray(positiveVoters), Set.toArray(negativeVoters), Set.toArray(delegatedVoters), awaitingVoters)
    };

    public func toSharable(__ : Self, id : Nat, custodians : Set<Principal>, getCallerVote : (Nat) -> ?Delegable<UniformBinaryVote>) : Sharable = {
        id;
        proposer = __.proposer;
        title = __.title;
        content = __.content;
        timeline = __.timeline;
        acornReward = E8S.toSharable(__.acornReward);
        icpReward = E8S.toSharable(__.icpReward);
        votes = getSharableVotes(__, custodians);
        detachment = Detachment.toSharable(__.detachment);
        callerVote = getCallerVote(id)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectProposer(__ : Self, caller : Principal) {
        if (caller == __.proposer) return;
        E.f(#NOT_VALID("Proposer"), "The caller is not the proposer of the Code Proposal")
    };

    public func expectVotable(__ : Self) {
        if (votable(__)) return;
        E.f(#ALREADY_OVER("Proposed Status"), "The Code Proposal is not in the Proposed status, please vote only on the Proposed proposals")
    };
    public func expectRetriable(__ : Self, retryLimit : Nat) {
        if (retriable(__, retryLimit)) return;
        E.f(#ALREADY_OVER("Retried Limit"), "The Code Proposal is not retriable, please vote only on the Retriable proposals")
    };

    public func expectCode(__ : Self) {
        if (variant(__) == #Code) return;
        E.f(#NOT_VALID("Code Proposal"), "Attempted to retrieve a Code Proposal but found " # debug_show variant(__) # "Proposal")
    };
    public func expectField(__ : Self) {
        if (variant(__) == #Field) return;
        E.f(#NOT_VALID("Field Proposal"), "Attempted to retrieve a Field Proposal but found " # debug_show variant(__) # "Proposal")
    };
    public func expectWorker(__ : Self) {
        if (variant(__) == #Worker) return;
        E.f(#NOT_VALID("Worker Proposal"), "Attempted to retrieve a Worker Proposal but found " # debug_show variant(__) # "Proposal")
    };
    public func expectConfigs(__ : Self) {
        if (variant(__) == #Configs) return;
        E.f(#NOT_VALID("Configs Proposal"), "Attempted to retrieve a Configs Proposal but found " # debug_show variant(__) # "Proposal")
    }
}
