import Format "../../../library/Format";

import E "../../../common/Errors";

import BinaryVotes "../../../library/votes/BinaryVotes";
import List "../../../library/List";

import Time "mo:base/Time";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type BinaryVote = BinaryVotes.Vote;
    private type BinaryChoice = BinaryVotes.Choice;
    private type SharableBinaryVotes = BinaryVotes.Sharable;
    private type BinaryVotes = BinaryVotes.Votes;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Format = {
        #Picture : Format.Picture;
        #Hyperlink : Format.Hyperlink;
        #Note : Format.Note
    };

    public type Form = [Format];

    /// AXIOMS ////// EVIDENCE ////////////

    private type Self = Evidence;

    public type Evidence = {
        form : Form;
        publisher : Principal;
        publishDate : Int;
        hypothesisId : Nat;
        votes : BinaryVotes;
        choice : BinaryChoice;
        repliedTo : ?Nat;
        var replies : List<Nat>
    };
    public type Sharable = {
        id : Nat;
        form : Form;
        publisher : Principal;
        publishDate : Int;
        hypothesisId : Nat;
        votes : SharableBinaryVotes;
        choice : BinaryChoice;
        callerVote : ?BinaryVote;
        repliedTo : ?Nat;
        replies : [Nat]
    };

    public func init(form : Form, publisher : Principal, hypothesisId : Nat, choice : BinaryChoice, repliedTo : ?Nat, getNow : () -> Int) : Self = {
        form;
        publisher;
        hypothesisId;
        choice;
        publishDate = getNow();
        votes = BinaryVotes.new();
        repliedTo;
        var replies = List.nil()
    };

    /// PUBLIC ////// MODIFIERS ////////////

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

    public func addReply(__ : Self, replyId : Nat) {
        __.replies := List.push(replyId, __.replies)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func containsPattern(__ : Self, pattern : { #text : Text }) : Bool {
        label searching for (format in __.form.vals()) {
            switch (format) {
                case (#Note({ content })) if (Text.contains(Text.toLowercase(content), pattern)) return true;
                case (#Hyperlink({ anchorText })) if (Text.contains(Text.toLowercase(anchorText), pattern)) return true;
                case (_) {}
            }
        };
        false
    };

    public func toSharable(__ : Self, id : Nat, getCallerVote : (Nat) -> ?BinaryVote) : Sharable = {
        __ with
        id;
        votes = BinaryVotes.toSharable(__.votes);
        replies = List.toArray(__.replies);
        callerVote = getCallerVote(id)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPublishedIn(__ : Self, id : Nat) {
        if (__.hypothesisId == id) return;
        E.f(#NOT_VALID("Evidence"), "Evidence " # debug_show id # " not published in " # debug_show (__.hypothesisId) # ".")
    }
}
