import Proportion "Proportion";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Order "mo:base/Order";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Order = Order.Order;

    private type Proportion = Proportion.Proportion;

    private let E8_NAT : Nat = 100_000_000;
    private let E8_FLOAT : Float = 100_000_000.0;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Sharable = Nat;

    /// LIBRARY ////// E8S ////////////

    private type Self = E8S;

    public type E8S = { var val : Nat };

    public func new() : Self = { var val = 0 };
    public func make(x : Nat) : Self = { var val = x };
    public func fromFloat(x : Float) : Self = {
        var val = Int.abs(Float.toInt(x * E8_FLOAT))
    };

    /// PUBLIC ////// MODIFIERS ////////////

    /// A = A + B
    public func add(__ : Self, x : Self) = __.val := __.val + x.val;
    /// A = A - B
    public func sub(__ : Self, x : Self) = __.val := __.val - x.val;
    /// A = A * B
    public func mul(__ : Self, x : Self) = __.val := __.val * x.val;

    /// A = A * P%
    public func scaleBy(__ : Self, x : Proportion) = __.val := __.val * x.part / x.whole;
    /// A = A - A * P%
    public func deductBy(__ : Self, x : Proportion) = __.val := __.val - __.val * x.part / x.whole;
    /// A = A + A * P%
    public func increaseBy(__ : Self, x : Proportion) = __.val := __.val + __.val * x.part / x.whole;

    public func clear(__ : Self) = __.val := 0;

    /// PUBLIC ////// ACCESSORS ////////////

    public func getAdd(__ : Self, x : Self) : Self = make(__.val + x.val);
    public func getSub(__ : Self, x : Self) : Self = make(__.val - x.val);
    public func getMul(__ : Self, x : Self) : Self = make(__.val * x.val);

    public func getScaleBy(__ : Self, x : Proportion) : Self = make(__.val * x.part / x.whole);
    public func getDeductBy(__ : Self, x : Proportion) : Self = make(__.val - __.val * x.part / x.whole);
    public func getIncreaseBy(__ : Self, x : Proportion) : Self = make(__.val + __.val * x.part / x.whole);

    public func isZero(__ : Self) : Bool = __.val == 0;

    public func compare(__ : Self, x : Self) : Order = Nat.compare(__.val, x.val);

    public func lt(__ : Self, x : Self) : Bool = __.val < x.val;
    public func lte(__ : Self, x : Self) : Bool = __.val <= x.val;
    public func gt(__ : Self, x : Self) : Bool = __.val > x.val;
    public func gte(__ : Self, x : Self) : Bool = __.val >= x.val;

    public func toFloat(__ : Self) : Float = Float.fromInt(__.val) / E8_FLOAT;
    public func toSharable(__ : Self) : Sharable = __.val
}
