import E "../../../common/Errors";

import Date "../../../library/Date";
import Map "../../../library/Map";

import BinaryVotes "../../../library/votes/BinaryVotes";

import Time "mo:base/Time";
import Hash "mo:base/Hash";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Hash = Hash.Hash;
    private type Key<T> = Map.Key<T>;

    private type BinaryVote = BinaryVotes.Vote;
    private type BinaryChoice = BinaryVotes.Choice;
    private type SharableBinaryVotes = BinaryVotes.Sharable;
    private type BinaryVotes = BinaryVotes.Votes;

    private func _equal(a : Header, b : Header) : Bool = a.id == b.id and a.category == b.category;
    private func _hash(x : Header) : Hash = Text.hash(debug_show (x));

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Header = {
        id : Nat;
        category : Category
    };
    public func Key(__ : Header) : Key<Header> = {
        key = __;
        equal = _equal;
        hash = _hash
    };

    public type Category = { #Hypothesis; #Evidence };
    public type Status = { #Requested; #Approved; #Rejected; #Expired };

    /// AXIOMS ////// FLAG ////////////

    private type Self = Flag;

    public type Flag = {
        requester : Principal;
        requestDate : Time;
        votes : BinaryVotes.Votes;
        reason : Text;
        var status : Status
    };
    public type Sharable = {
        id : Nat;
        requester : Principal;
        requestDate : Time;
        votes : SharableBinaryVotes;
        reason : Text;
        category : Category;
        status : Status;
        callerVote : ?BinaryVote
    };

    public func init(requester : Principal, reason : Text) : Self = {
        requester;
        reason;
        requestDate = Time.now();
        votes = BinaryVotes.new();
        var status = #Requested
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func approved(__ : Self) {
        __.status := #Approved
    };
    public func rejected(__ : Self) {
        __.status := #Rejected
    };
    public func expired(__ : Self) {
        __.status := #Expired
    };

    public func addVote(__ : Self, voter : Principal, vote : BinaryVote) {
        BinaryVotes.add(__.votes, voter, vote)
    };
    public func updateVote(__ : Self, voter : Principal, oldVote : BinaryVote, newVote : BinaryVote) {
        BinaryVotes.remove(__.votes, voter, oldVote);
        BinaryVotes.add(__.votes, voter, newVote)
    };
    public func removeVote(__ : Self, voter : Principal, vote : BinaryVote) {
        BinaryVotes.remove(__.votes, voter, vote)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isExpired(__ : Self, duration : Nat) : Bool = Date.getMidnightsElapsed(__.requestDate, Time.now()) >= duration;

    public func votable(__ : Self) : Bool = (__.status == #Requested);

    public func retriable(__ : Self) : Bool = (__.status == #Rejected or __.status == #Expired);

    public func getPoweredValuesDifference(__ : Self) : Int {
        let (positive, negative) : (Nat, Nat) = BinaryVotes.getPoweredSharable(__.votes);
        positive - negative
    };

    public func toSharable(__ : Self, header : Header, getCallerVote : (Header) -> ?BinaryVote) : Sharable = {
        __ with id = header.id;
        category = header.category;
        status = __.status;
        votes = BinaryVotes.toSharable(__.votes);
        callerVote = getCallerVote(header)
    };

    /// PUBLIC ////// ASSERTIONS ////////////

    public func expectVotable(__ : Self) {
        if (votable(__)) return;
        E.f(#ALREADY_OVER("Requested Status"), "The Flag is not in the Requested status, please vote only on the Requested flags")
    };
    public func expectRetriable(__ : Self) {
        if (retriable(__)) return;
        E.f(#ALREADY_OVER("Requested Status"), "The Flag is not in the retriable status, please retry only on the retriable flags")
    }
}
