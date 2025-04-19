import Count "../../../library/Count";
import Earning "../../../library/Earning";
import E8S "../../../library/E8S";
import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Count = Count.Count;
    private type SharableCount = Count.Sharable;
    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;
    private type Earning = Earning.Earning;
    private type SharableEarning = Earning.Sharable;

    /// PUBLIC ////// DECLARATIONS ////////////

    /// AFFILIATE ////// USERS ////////////

    private type Self = User;

    public type User = {
        referrer : ?Principal;
        referrals : Count;
        earning : Earning
    };
    public type Sharable = {
        referrer : ?Principal;
        referrals : SharableCount;
        earning : SharableEarning
    };

    public func init(referrer : ?Principal) : User = {
        referrer;
        referrals = Count.new();
        earning = Earning.new()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func deposit(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.earning, depositAmount)
    };
    public func withdraw(__ : Self, withdrawAmount : E8S) {
        Earning.withdraw(__.earning, withdrawAmount)
    };

    public func referred(__ : Self) : () {
        Count.increment(__.referrals)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func earning(__ : Self) : Earning = __.earning;
    public func getEarning(__ : Self) : SharableEarning = Earning.toSharable(__.earning);

    public func positiveBalance(__ : Self) : E8S {
        Earning.expectPositiveBalance(__.earning);
        Earning.balance(__.earning)
    };

    public func toSharable(__ : Self) : Sharable = {
        __ with
        referrals = Count.toSharable(__.referrals);
        earning = Earning.toSharable(__.earning)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPositiveBalance(__ : Self) : () {
        Earning.expectPositiveBalance(__.earning)
    }
}
