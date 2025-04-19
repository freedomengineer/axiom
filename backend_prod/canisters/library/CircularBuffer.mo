import Base "Base";

import Array "mo:base/Array";
import Iter "mo:base/Iter";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Iter<T> = Iter.Iter<T>;

    /// LIBRARY ////// CIRCULAR BUFFER ////////////

    private type Self<T> = CircularBuffer<T>;

    public type CircularBuffer<T> = {
        capacity : Nat;
        buffer : [var ?T];
        var length : Nat;
        var head : Nat
    };
    public func new<T>(capacity : Nat) : Self<T> = {
        capacity;
        buffer = Array.init<?T>(capacity, null);
        var length = 0;
        var head = 0
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func push<T>(__ : Self<T>, value : T) = switch (__.length < __.capacity) {
        case (false) {
            __.buffer[__.head] := ?value;
            __.head := (__.head + 1) % __.capacity
        };
        case (true) {
            __.buffer[__.length] := ?value;
            __.length += 1
        }
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func vals<T>(__ : Self<T>) : Iter<T> = object {
        var i : Nat = 0;
        public func next() : ?T {
            switch (i < __.length) {
                case (false) null;
                case (true) {
                    let v = __.buffer[(__.head + i) % __.capacity];
                    i += 1;
                    v
                }
            }
        }
    };
    public func valsRev<T>(__ : Self<T>) : Iter<T> = object {
        var i : Nat = 0;
        public func next() : ?T {
            switch (i < __.length) {
                case (false) null;
                case (true) {
                    let v = __.buffer[(__.head + __.length - i - 1) % __.capacity];
                    i += 1;
                    v
                }
            }
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func get<T>(__ : Self<T>, i : Nat) : ?T = switch (i < __.length) {
        case (false) null;
        case (true) __.buffer[(__.head + i) % __.capacity]
    };
    public func getRev<T>(__ : Self<T>, i : Nat) : ?T = switch (i < __.length) {
        case (false) null;
        case (true) __.buffer[(__.head + __.length - i - 1) % __.capacity]
    };

    public func size<T>(__ : Self<T>) : Nat = __.length;
    public func capacity<T>(__ : Self<T>) : Nat = __.capacity;

    public func toArray<T>(__ : Self<T>) : [T] = Array.tabulate<T>(
        __.length,
        func(i) = Base.unwrap(__.buffer[(__.head + i) % __.capacity]),
    );
    public func toArrayMap<T, U>(__ : Self<T>, f : T -> U) : [U] = Array.tabulate<U>(
        __.length,
        func(i) = f(Base.unwrap(__.buffer[(__.head + i) % __.capacity])),
    );

    public func toArrayRev<T>(__ : Self<T>) : [T] = Array.tabulate<T>(
        __.length,
        func(i) = Base.unwrap(__.buffer[(__.head + __.length - i - 1) % __.capacity]),
    );
    public func toArrayMapRev<T, U>(__ : Self<T>, f : T -> U) : [U] = Array.tabulate<U>(
        __.length,
        func(i) = f(Base.unwrap(__.buffer[(__.head + __.length - i - 1) % __.capacity])),
    )
}
