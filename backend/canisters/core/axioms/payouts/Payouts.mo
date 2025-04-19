import Payout "Payout";

import E "../../../common/Errors";

import CircularBuffer "../../../library/CircularBuffer";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type CircularBuffer<T> = CircularBuffer.CircularBuffer<T>;

    private type Payout = Payout.Payout;
    private type SharablePayout = Payout.Sharable;

    /// AXIOMS ////// PAYOUTS ////////////

    private type Self = Payouts;

    public type Payouts = CircularBuffer<?Payout>;
    public type Sharable = [SharablePayout];

    public func init(limit : Nat) : Self = CircularBuffer.new<?Payout>(limit);

    /// PUBLIC ////// MODIFIERS ////////////

    public func skip(__ : Self) = CircularBuffer.push<?Payout>(__, null);
    public func paid(__ : Self, payout : Payout) = CircularBuffer.push<?Payout>(__, ?payout);

    /// PUBLIC ////// ACCESSORS ////////////

    public func payout(__ : Self, ago : Nat) : ?Payout {
        switch (CircularBuffer.getRev<?Payout>(__, ago)) {
            case (?payout) payout;
            case (null) E.f(#NOT_AVAILABLE("Payout"), "Cannot get the payout history older than available days")
        }
    };
    public func getPayout(__ : Self, ago : Nat, getCallerRevenue : Payout -> ?Nat) : SharablePayout {
        switch (payout(__, ago)) {
            case (null)({ ranks = []; callerRevenue = null });
            case (?payout) Payout.toSharable(payout, getCallerRevenue)
        }
    };
    public func getPayouts(__ : Self, getCallerRevenue : Payout -> ?Nat) : Sharable {
        CircularBuffer.toArrayMap<?Payout, SharablePayout>(
            __,
            func(payout) = switch (payout) {
                case (null)({ ranks = []; callerRevenue = null });
                case (?payout) Payout.toSharable(payout, getCallerRevenue)
            },
        )
    }
}
