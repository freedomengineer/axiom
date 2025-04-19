import Actor "../../../periphery/indicator/actors/Actor";

import E "../../../common/Errors";

import E8S "../../../library/E8S";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;

    private type ActorVariant = Actor.Variant;

    /// TREASURY ////// ALLOCATIONS ////////////

    public type Self = Allocation;

    public type Allocation = {
        allocated : E8S;
        balance : E8S
    };
    public type Sharable = {
        actorVariant : ActorVariant;
        allocated : Nat;
        balance : Nat
    };

    public func init(allocated : E8S, balance : E8S) : Self = {
        allocated;
        balance
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func mint(__ : Self, mintAmount : E8S) {
        E8S.sub(__.allocated, mintAmount)
    };
    public func withdraw(__ : Self, withdrawAmount : E8S) {
        E8S.sub(__.balance, withdrawAmount)
    };
    public func deposit(__ : Self, depositAmount : E8S) {
        E8S.add(__.balance, depositAmount)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func positiveBalance(__ : Self) : E8S {
        expectPositiveBalance(__);
        __.balance
    };
    public func positiveAllocated(__ : Self) : E8S {
        expectPositiveAllocated(__);
        __.allocated
    };

    public func getBalance(__ : Self) : SharableE8S = E8S.toSharable(__.balance);
    public func getAllocated(__ : Self) : SharableE8S = E8S.toSharable(__.allocated);

    public func toSharable(__ : Self, actorVariant : ActorVariant) : Sharable = {
        actorVariant;
        allocated = E8S.toSharable(__.allocated);
        balance = E8S.toSharable(__.balance)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPositiveBalance(__ : Self) {
        if (not E8S.isZero(__.balance)) return;
        E.f(#NOT_VALID("Allocation Balance"), "Actor " # debug_show __ # " has zero balance")
    };
    public func expectPositiveAllocated(__ : Self) {
        if (not E8S.isZero(__.allocated)) return;
        E.f(#NOT_VALID("Allocation Allocated"), "Actor " # debug_show __ # " has zero allocated")
    };
    public func expectBalanceGreaterEqual(__ : Self, amount : E8S) {
        if (E8S.gte(__.balance, amount)) return;
        E.f(#NOT_VALID("Allocation Balance"), "Actor " # debug_show __ # " has " # debug_show __.balance.val # " balance, but trying to withdraw " # debug_show amount.val)
    };
    public func expectAllocatedGreaterEqual(__ : Self, amount : E8S) {
        if (E8S.gte(__.allocated, amount)) return;
        E.f(#NOT_VALID("Allocation Allocated"), "Actor " # debug_show __ # " has " # debug_show __.allocated.val # " allocated, but trying to mint " # debug_show amount.val)
    }
}
