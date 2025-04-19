import Format "../../../library/Format";

import BinaryVotes "../../../library/votes/BinaryVotes";
import List "../../../library/List";

import E "../../../common/Errors";

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
        choice : BinaryChoice
    };
    public type Sharable = {
        id : Nat;
        form : Form;
        publisher : Principal;
        publishDate : Int;
        hypothesisId : Nat;
        votes : SharableBinaryVotes;
        choice : BinaryChoice;
        callerVote : ?BinaryVote
    };

    public func init(form : Form, publisher : Principal, hypothesisId : Nat, choice : BinaryChoice, getNow : () -> Int) : Self = {
        form;
        publisher;
        hypothesisId;
        choice;
        publishDate = getNow();
        votes = BinaryVotes.new()
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
        callerVote = getCallerVote(id)
    }
}
