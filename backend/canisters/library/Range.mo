import Order "mo:base/Order";
import Char "mo:base/Char";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Int8 "mo:base/Int8";
import Int16 "mo:base/Int16";
import Int32 "mo:base/Int32";
import Int64 "mo:base/Int64";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";

module {

    /// PRIVATE ////// DECLARATIONS ////////////

    private type Order = Order.Order;

    private func _lte<T>(a : T, b : T, compare : (T, T) -> Order) : Bool = compare(a, b) != #greater;
    private func _gte<T>(a : T, b : T, compare : (T, T) -> Order) : Bool = compare(a, b) != #less;
    private func _lt<T>(a : T, b : T, compare : (T, T) -> Order) : Bool = compare(a, b) == #less;
    private func _gt<T>(a : T, b : T, compare : (T, T) -> Order) : Bool = compare(a, b) == #greater;
    private func _eq<T>(a : T, b : T, compare : (T, T) -> Order) : Bool = compare(a, b) == #equal;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type ValueProp<T> = {
        #inclusive : T;
        #exclusive : T
    };
    public type Value<T> = {
        #value : ValueProp<T>;
        #infinity
    };
    public type Index<T> = {
        index : T;
        compare : (T, T) -> Order
    };

    public func CharKey(index : Char) : Index<Char> = {
        index;
        compare = Char.compare
    };
    public func FloatKey(index : Float) : Index<Float> = {
        index;
        compare = Float.compare
    };

    public func IntKey(index : Int) : Index<Int> = {
        index;
        compare = Int.compare
    };
    public func Int8Key(index : Int8) : Index<Int8> = {
        index;
        compare = Int8.compare
    };
    public func Int16Key(index : Int16) : Index<Int16> = {
        index;
        compare = Int16.compare
    };
    public func Int32Key(index : Int32) : Index<Int32> = {
        index;
        compare = Int32.compare
    };
    public func Int64Key(index : Int64) : Index<Int64> = {
        index;
        compare = Int64.compare
    };

    public func NatKey(index : Nat) : Index<Nat> = {
        index;
        compare = Nat.compare
    };
    public func Nat8Key(index : Nat8) : Index<Nat8> = {
        index;
        compare = Nat8.compare
    };
    public func Nat16Key(index : Nat16) : Index<Nat16> = {
        index;
        compare = Nat16.compare
    };
    public func Nat32Key(index : Nat32) : Index<Nat32> = {
        index;
        compare = Nat32.compare
    };
    public func Nat64Key(index : Nat64) : Index<Nat64> = {
        index;
        compare = Nat64.compare
    };

    /// LIBRARY ////// RANGE ////////////

    private type Self<T> = Range<T>;

    public type Range<T> = [var Value<T>];
    public type Sharable<T> = (Value<T>, Value<T>);

    public func new<T>() : Self<T> = [var #infinity, #infinity];
    public func make<T>(start : Value<T>, end : Value<T>) : Self<T> = [var start, end];

    /// PUBLIC ////// ACCESSORS ////////////

    public func includes<T>(__ : Self<T>, { index; compare } : Index<T>) : Bool = switch (__[0], __[1]) {
        case (#value(#inclusive(start)), #value(#inclusive(end))) _gte(index, start, compare) and _lte(index, end, compare);
        case (#value(#inclusive(start)), #value(#exclusive(end))) _gte(index, start, compare) and _lt(index, end, compare);
        case (#value(#exclusive(start)), #value(#inclusive(end))) _gt(index, start, compare) and _lte(index, end, compare);
        case (#value(#exclusive(start)), #value(#exclusive(end))) _gt(index, start, compare) and _lt(index, end, compare);
        case (#infinity, #value(_)) true;
        case (#value(_), #infinity) true;
        case (#infinity, #infinity) true
    };

    public func exclude<T>(__ : Self<T>, { index; compare } : Index<T>) : Bool = not includes(__, { index; compare });

    public func toSharable<T>(__ : Self<T>) : Sharable<T> = (__[0], __[1])
}
