import Payout "../payouts/Payout";
import Payouts "../payouts/Payouts";
import Hypothesis "../hypotheses/Hypothesis";
import User "../users/User";

import Count "../../../library/Count";
import TernaryVotes "../../../library/votes/TernaryVotes";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Count = Count.Count;
    private type TernaryVote = TernaryVotes.Vote;

    private type User = User.User;
    private type Hypothesis = Hypothesis.Hypothesis;
    private type Payout = Payout.Payout;
    private type SharablePayout = Payout.Sharable;
    private type Payouts = Payouts.Payouts;
    private type SharablePayouts = Payouts.Sharable;

    /// AXIOMS ////// AGE ////////////

    private type Self = Age;

    public type Age = {
        interval : Nat;
        maxHypotheses : Nat;
        nextPaidId : Count;
        payouts : Payouts
    };
    public func init(interval : Nat, maxHypotheses : Nat) : Self = {
        interval;
        maxHypotheses;
        nextPaidId = Count.new();
        payouts = Payouts.init(21)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    /// PUBLIC ////// ACCESSORS ////////////

    public func getPayout(__ : Self, ago : Nat, callerUser : ?(Principal, User)) : SharablePayout {
        let getCallerRevenue : (Payout) -> ?Nat = Payout.callerRevenueCallback(callerUser);
        Payouts.getPayout(__.payouts, ago, getCallerRevenue)
    };

    public func getPayouts(__ : Self, callerUser : ?(Principal, User)) : SharablePayouts {
        let getCallerRevenue : (Payout) -> ?Nat = Payout.callerRevenueCallback(callerUser);
        Payouts.getPayouts(__.payouts, getCallerRevenue)
    }
}
