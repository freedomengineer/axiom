import Set "../../../library/Set";
import List "../../../library/List";
import Count "../../../library/Count";

import TernaryVotes "../../../library/votes/TernaryVotes";

import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Val<T> = Set.Val<T>;
    private type Hash = Hash.Hash;

    private type Count = Count.Count;
    private type SharableCount = Count.Sharable;
    private type TernaryVotes = TernaryVotes.Votes;
    private type TernaryVote = TernaryVotes.Vote;
    private type SharableTernaryVotes = TernaryVotes.Sharable;

    /// AXIOMS ////// HYPOTHESES ////////////

    private type Self = Hypothesis;

    public type Hypothesis = {
        content : Text;
        publisher : Principal;
        var publishDate : Int;
        fieldId : Text;
        votes : TernaryVotes;
        var evidenceIds : List<Nat>;
        axioms : Count
    };
    public type Sharable = {
        id : Nat;
        content : Text;
        publisher : Principal;
        publishDate : Int;
        fieldId : Text;
        votes : SharableTernaryVotes;
        evidenceIds : [Nat];
        axioms : SharableCount;
        callerVote : ?TernaryVote;
        callerAxiom : ?Bool;
        callerBookmark : ?Bool
    };

    public func init(content : Text, publisher : Principal, fieldId : Text, getNow : () -> Int) : Self = {
        content;
        publisher;
        var publishDate = getNow();
        fieldId;
        votes = TernaryVotes.new();
        var evidenceIds = List.nil();
        axioms = Count.new()
    };
    public func fromFounder(founder : Principal, getNow : () -> Int) : Self = {
        content = "Axiom is a decentralized protocol";
        publisher = founder;
        var publishDate = getNow();
        fieldId = "Axiom governance";
        votes = TernaryVotes.new();
        var evidenceIds = List.nil();
        axioms = Count.new()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func addVote(__ : Self, voter : Principal, vote : TernaryVote) {
        TernaryVotes.add(__.votes, voter, vote)
    };
    public func updateVote(__ : Self, voter : Principal, oldVote : TernaryVote, newVote : TernaryVote) {
        TernaryVotes.remove(__.votes, voter, oldVote);
        TernaryVotes.add(__.votes, voter, newVote)
    };
    public func removeVote(__ : Self, voter : Principal, vote : TernaryVote) {
        TernaryVotes.remove(__.votes, voter, vote)
    };

    public func addedToAxiom(__ : Self) {
        Count.increment(__.axioms)
    };
    public func removedFromAxiom(__ : Self) {
        Count.decrement(__.axioms)
    };

    public func addEvidence(__ : Self, id : Nat) {
        __.evidenceIds := List.push(id, __.evidenceIds)
    };
    public func removeEvidence(__ : Self, id : Nat) {
        __.evidenceIds := List.filter<Nat>(__.evidenceIds, func(x) = x != id)
    };

    public func refreshPublishDate(__ : Self, getNow : () -> Int) {
        __.publishDate := getNow()
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func containsPattern(__ : Self, pattern : { #text : Text }) : Bool = Text.contains(Text.toLowercase(__.content), pattern);

    public func toSharable(__ : Self, id : Nat, getCallerVote : Nat -> ?TernaryVote, getCallerAxiom : Nat -> ?Bool, getCallerBookmark : Nat -> ?Bool) : Sharable = {
        __ with
        id;
        publishDate = __.publishDate;
        votes = TernaryVotes.toSharable(__.votes);
        axioms = Count.toSharable(__.axioms);
        evidenceIds = List.toArray(__.evidenceIds);
        callerVote = getCallerVote(id);
        callerAxiom = getCallerAxiom(id);
        callerBookmark = getCallerBookmark(id)
    }
}
