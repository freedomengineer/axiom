import E "../common/Errors";

import E8S "E8S";

import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;
    private type Time = Time.Time;

    /// PUBLIC ////// DECLARATIONS ////////////

    /// LIBRARY ////// EARNING ////////////

    private type Self = Earning;

    public type Earning = {
        revenue : E8S;
        lastWithdrawAmount : E8S;
        var lastWithdrawAt : Time
    };
    public type Sharable = {
        revenue : SharableE8S;
        balance : SharableE8S;
        lastWithdrawAt : Time
    };

    public func new(getNow : () -> Int) : Self = {
        revenue = E8S.new();
        lastWithdrawAmount = E8S.new();
        var lastWithdrawAt = getNow()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func deposit(__ : Self, amount : E8S) {
        E8S.add(__.revenue, amount)
    };
    public func depositNat(__ : Self, amount : Nat) {
        E8S.add(__.revenue, E8S.make(amount))
    };

    public func withdraw(__ : Self, amount : E8S, getNow : () -> Int) {
        expectWithdrawable(__, amount);
        E8S.add(__.lastWithdrawAmount, amount);
        __.lastWithdrawAt := getNow()
    };
    public func withdrawAll(__ : Self, getNow : () -> Int) : E8S {
        let amount : E8S = balance(__);
        withdraw(__, amount, getNow);
        amount
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func revenue(__ : Self) : E8S = __.revenue;
    public func balance(__ : Self) : E8S = E8S.getSub(__.revenue, __.lastWithdrawAmount);

    public func getRevenue(__ : Self) : SharableE8S = E8S.toSharable(revenue(__));
    public func getBalance(__ : Self) : SharableE8S = E8S.toSharable(balance(__));

    public func isPositiveBalance(__ : Self) : Bool = not E8S.isZero(balance(__));
    public func isEnoughBalance(__ : Self, amount : E8S) : Bool = E8S.gte(balance(__), amount);
    public func isWithdrawable(__ : Self, amount : E8S) : Bool = isPositiveBalance(__) and isEnoughBalance(__, amount);

    public func toSharable(__ : Self) : Sharable = {
        revenue = getRevenue(__);
        balance = getBalance(__);
        lastWithdrawAt = __.lastWithdrawAt
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPositiveBalance(__ : Self) : () {
        if (isPositiveBalance(__)) return;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "Attempted to withdraw zero balance")
    };
    public func expectEnoughBalance(__ : Self, amount : E8S) : () {
        if (isEnoughBalance(__, amount)) return;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "Attempted to withdraw " # debug_show amount.val # " which is more than current balance " # debug_show balance(__).val)
    };
    public func expectWithdrawable(__ : Self, amount : E8S) : () {
        expectPositiveBalance(__);
        expectEnoughBalance(__, amount)
    }
}
