import List "List";

import Debug "mo:base/Debug";
import Order "mo:base/Order";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Order = { #ascending; #descending };
    public type Sort<T> = { by : T; order : Order };
    public type Compare<T> = (T, T) -> Order.Order;
    public type Equal<T> = (T, T) -> Bool;
    public type Callback = () -> ();

    /// PUBLIC ////// ACCESSOR ////////////

    public func unwrap<T>(x : ?T) : T = switch (x) {
        case (?x) x;
        case (null) Debug.trap("Unreachable")
    };

    public func binary<T, V>(x : ?T, isSome : V) : V = switch (x) {
        case (?x) isSome;
        case (null) Debug.trap("Unreachable")
    };
    public func binaryMap<T, V>(x : ?T, someMap : T -> V) : V = switch (x) {
        case (?x) someMap(x);
        case (null) Debug.trap("Unreachable")
    };

    public func ternary<T, V>(x : ?T, isSome : V, isNull : V) : V = switch (x) {
        case (?x) isSome;
        case (null) isNull
    };
    public func ternaryMap<T, V>(x : ?T, someMap : T -> V, nullMap : () -> V) : V = switch (x) {
        case (?x) someMap(x);
        case (null) nullMap()
    };

    public func ceil(x : Nat, max : Nat) : Nat = if (x > max) max else x;
    public func floor(x : Nat, min : Nat) : Nat = if (x < min) min else x;

    ///

    public func deduplicate<T>(arr : [T], compare : Equal<T>) : [T] {
        var deduplicated : List<T> = List.nil();
        for (e in arr.vals()) {
            let existed : Bool = List.some<T>(deduplicated, func(x) = compare(e, x));
            if (not existed) {
                deduplicated := List.push(e, deduplicated)
            }
        };
        List.toArray(deduplicated)
    };
    public func isDuplicated<T>(arr : [T], isEqual : Equal<T>) : Bool {
        var deduplicated : List<T> = List.nil();
        var size : Nat = 0;
        for (e in arr.vals()) {
            let existed : Bool = List.some<T>(deduplicated, func(x) = isEqual(e, x));
            if (not existed) {
                deduplicated := List.push(e, deduplicated);
                size += 1
            }
        };
        size != arr.size()
    }
}
