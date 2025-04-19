module {
    /// LIBRARY ////// COUNT ////////////

    private type Self = Count;

    public type Count = { var val : Nat };
    public type Sharable = Nat;

    public func new() : Self = { var val = 0 };
    public func make(val : Nat) : Self = { var val };

    /// PUBLIC ////// MODIFIERS ////////////

    public func skip(__ : Self, n : Nat) = __.val += n;
    public func reset(__ : Self) = __.val := 0;

    public func increment(__ : Self) = __.val += 1;
    public func decrement(__ : Self) = __.val -= 1;

    /// PUBLIC ////// ACCESSORS ////////////

    public func toSharable(__ : Self) : Sharable = __.val
}
