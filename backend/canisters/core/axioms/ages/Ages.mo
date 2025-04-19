import Age "Age";
import Payout "../payouts/Payout";
import Payouts "../payouts/Payouts";
import User "../users/User";
import Hypothesis "../hypotheses/Hypothesis";

import E "../../../common/Errors";

import TernaryVotes "../../../library/votes/TernaryVotes";

import Array "mo:base/Array";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type TernaryVote = TernaryVotes.Vote;

    private type User = User.User;
    private type Hypothesis = Hypothesis.Hypothesis;
    private type Payout = Payout.Payout;
    private type SharablePayout = Payout.Sharable;
    private type Payouts = Payouts.Payouts;
    private type SharablePayouts = Payouts.Sharable;

    private type Age = Age.Age;

    /// AXIOMS ////// AGES ////////////

    private type Self = Ages;

    public type Ages = [Age];
    public func init() : Self = [Age.init(1, 10), Age.init(21, 40), Age.init(200, 200)];

    /// PUBLIC ////// ACCESSORS ////////////

    public func validAge(__ : Self, id : Nat) : Bool = id < __.size();

    public func age(__ : Self, id : Nat) : Age {
        expectValidAge(__, id);
        __[id]
    };

    public func getPayout(__ : Self, ago : Nat, callerUser : ?(Principal, User)) : [SharablePayout] {
        let getCallerRevenue : (Payout) -> ?Nat = Payout.callerRevenueCallback(callerUser);
        Array.map<Age, SharablePayout>(__, func({ payouts }) = Payouts.getPayout(payouts, ago, getCallerRevenue))
    };
    public func getPayouts(__ : Self, callerUser : ?(Principal, User)) : [SharablePayouts] {
        let getCallerRevenue : (Payout) -> ?Nat = Payout.callerRevenueCallback(callerUser);
        Array.map<Age, SharablePayouts>(__, func({ payouts }) = Payouts.getPayouts(payouts, getCallerRevenue))
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectValidAge(__ : Self, id : Nat) {
        if (validAge(__, id)) return;
        E.f(#NOT_VALID("Age"), "Attempted to access an invalid Age " # debug_show (id) # ". Expected an Age between 0 and " # debug_show (__.size() - 1))
    }
}
