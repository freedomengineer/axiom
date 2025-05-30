import E "../../../common/Errors";

import AxiomFlag "../../../core/axioms/flags/Flag";

import Format "../../../library/Format";
import BinaryVotes "../../../library/votes/BinaryVotes";
import CircularBuffer "../../../library/CircularBuffer";
import TernaryVotes "../../../library/votes/TernaryVotes";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Hyperlink = Format.Hyperlink;
    private type BinaryChoice = BinaryVotes.Choice;
    private type TernaryChoice = TernaryVotes.Choice;
    private type CircularBuffer<T> = CircularBuffer.CircularBuffer<T>;

    private type FlagHeader = AxiomFlag.Header;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type UserVariant = {
        #AcornDrop : { claimable : Nat };
        #EvidenceAddedToYourHypothesis : {
            evidenceId : Nat;
            hypothesisId : Nat;
            publisher : Principal;
            side : BinaryChoice
        };
        #HypothesisVoted : { hypothesisId : Nat; voter : Principal; choice : TernaryChoice };
        #EvidenceVoted : { evidenceId : Nat; voter : Principal; choice : BinaryChoice };
        #ProposalVoted : { proposalId : Nat; voter : Principal; choice : TernaryChoice };

        #NewReferral : { principal : Principal; claimable : Nat };

        #ProposalResult : {
            proposalId : Nat;
            proposer : Principal;
            result : { #Approved; #Rejected; #Expired };
            claimable : Nat
        };
        #ProposalDelegated : { proposalId : Nat; delegator : Principal };
        #ProposalRejected : { proposalId : Nat }
    };
    public type SystemVariant = {
        #FlagRequested : { header : FlagHeader };
        #FlagResult : { header : FlagHeader; result : { #Approved; #Rejected; #Expired } };
        #SystemGeneric : { title : Text; message : Text; link : ?Text };
        #ElectionResult : {
            newCustodians : [Principal];
            removedCustodians : [Principal];
            unchangedCustodians : [Principal]
        };
        #ProposalExecuted : { proposalId : Nat; proposer : Principal }
    };
    public type CustodianVariant = {
        #ProposalOpened : { proposalId : Nat; proposer : Principal; retried : Nat }
    };
    public type FollowingVariant = {
        #HypothesisPublished : { hypothesisId : Nat }
    };

    public type SharableUserVariant = UserVariant;
    public type SharableSystemVariant = SystemVariant;
    public type SharableCustodianVariant = CustodianVariant;
    public type SharableFollowingVariant = {
        #HypothesisPublished : { hypothesisId : Nat; publisher : Principal }
    };

    /// FACADE ////// NOTIFICATION ////////////

    private type Self<T> = Notification<T>;

    public type Notification<T> = CircularBuffer<(Time, T)>;

    public func init<T>() : Self<T> = CircularBuffer.new<(Time, T)>(100);

    /// PUBLIC ////// MODIFIERS ////////////

    public func push<T>(__ : Self<T>, data : T) {
        CircularBuffer.push(__, (Time.now(), data))
    }
}
