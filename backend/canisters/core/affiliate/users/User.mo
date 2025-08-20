import Count "../../../library/Count";
import Earning "../../../library/Earning";
import E8S "../../../library/E8S";
import List "../../../library/List";

import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
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
        earning : Earning;
        var coupons : List<Text>
    };
    public type Sharable = {
        referrer : ?Principal;
        referrals : SharableCount;
        earning : SharableEarning;
        coupons : [Text]
    };

    public func init(referrer : ?Principal, getNow : () -> Int) : User = {
        referrer;
        referrals = Count.new();
        earning = Earning.new(getNow);
        var coupons = List.nil()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func deposit(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.earning, depositAmount)
    };
    public func withdraw(__ : Self, withdrawAmount : E8S, getNow : () -> Int) {
        Earning.withdraw(__.earning, withdrawAmount, getNow)
    };

    public func referred(__ : Self) : () {
        Count.increment(__.referrals)
    };
    public func couponCreated(__ : Self, key : Text) {
        __.coupons := List.push(key, __.coupons)
    };
    public func assignCoupon(__ : Self, key : List<Text>) {
        __.coupons := key
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func earning(__ : Self) : Earning = __.earning;
    public func getEarning(__ : Self) : SharableEarning = Earning.toSharable(__.earning);

    public func positiveBalance(__ : Self) : E8S {
        Earning.expectPositiveBalance(__.earning);
        Earning.balance(__.earning)
    };
    public func getBalance(__ : Self) : Nat = Earning.getBalance(__.earning);

    public func toSharable(__ : Self) : Sharable = {
        referrer = __.referrer;
        referrals = Count.toSharable(__.referrals);
        earning = Earning.toSharable(__.earning);
        coupons = List.toArray(__.coupons)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPositiveBalance(__ : Self) : () {
        Earning.expectPositiveBalance(__.earning)
    }
}
