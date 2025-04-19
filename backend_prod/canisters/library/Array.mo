/// Provides extended utility functions on Arrays.
///
/// Note the difference between mutable and non-mutable arrays below.
///
/// WARNING: If you are looking for a list that can grow and shrink in size,
/// it is recommended you use either the Buffer class or the List class for
/// those purposes. Arrays must be created with a fixed size.
///
/// Import from the base library to use this module.
/// ```motoko name=import
/// import Array "mo:base/Array";
/// ```

import I "mo:base/IterType";
import Option "mo:base/Option";
import Order "mo:base/Order";
import Prim "mo:⛔";
import Result "mo:base/Result";

module {
    public func init<X>(size : Nat, initValue : X) : [var X] = Prim.Array_init<X>(size, initValue);

    public func tabulate<X>(size : Nat, generator : Nat -> X) : [X] = Prim.Array_tabulate<X>(size, generator);

    public func tabulateVar<X>(size : Nat, generator : Nat -> X) : [var X] {
        // FIXME add this as a primitive in the RTS
        if (size == 0) { return [var] };
        let array = Prim.Array_init<X>(size, generator 0);
        var i = 1;
        while (i < size) {
            array[i] := generator i;
            i += 1
        };
        array
    };

    public func freeze<X>(varArray : [var X]) : [X] = Prim.Array_tabulate<X>(varArray.size(), func i = varArray[i]);

    public func thaw<A>(array : [A]) : [var A] {
        let size = array.size();
        if (size == 0) {
            return [var]
        };
        let newArray = Prim.Array_init<A>(size, array[0]);
        var i = 0;
        while (i < size) {
            newArray[i] := array[i];
            i += 1
        };
        newArray
    };

    public func equal<X>(array1 : [X], array2 : [X], equal : (X, X) -> Bool) : Bool {
        let size1 = array1.size();
        let size2 = array2.size();
        if (size1 != size2) {
            return false
        };
        var i = 0;
        while (i < size1) {
            if (not equal(array1[i], array2[i])) {
                return false
            };
            i += 1
        };
        return true
    };

    public func find<X>(array : [X], predicate : X -> Bool) : ?X {
        for (element in array.vals()) {
            if (predicate element) {
                return ?element
            }
        };
        return null
    };

    public func append<X>(array1 : [X], array2 : [X]) : [X] {
        let size1 = array1.size();
        let size2 = array2.size();
        Prim.Array_tabulate<X>(
            size1 + size2,
            func i {
                if (i < size1) {
                    array1[i]
                } else {
                    array2[i - size1]
                }
            },
        )
    };

    // FIXME this example stack overflows. Should test with new implementation of sortInPlace
    public func sort<X>(array : [X], compare : (X, X) -> Order.Order) : [X] {
        let temp : [var X] = thaw(array);
        sortInPlace(temp, compare);
        freeze(temp)
    };

    public func sortInPlace<X>(array : [var X], compare : (X, X) -> Order.Order) {
        // Stable merge sort in a bottom-up iterative style. Same algorithm as the sort in Buffer.
        let size = array.size();
        if (size == 0) {
            return
        };
        let scratchSpace = Prim.Array_init<X>(size, array[0]);

        let sizeDec = size - 1 : Nat;
        var currSize = 1; // current size of the subarrays being merged
        // when the current size == size, the array has been merged into a single sorted array
        while (currSize < size) {
            var leftStart = 0; // selects the current left subarray being merged
            while (leftStart < sizeDec) {
                let mid : Nat = if (leftStart + currSize - 1 : Nat < sizeDec) {
                    leftStart + currSize - 1
                } else { sizeDec };
                let rightEnd : Nat = if (leftStart + (2 * currSize) - 1 : Nat < sizeDec) {
                    leftStart + (2 * currSize) - 1
                } else { sizeDec };

                // Merge subarrays elements[leftStart...mid] and elements[mid+1...rightEnd]
                var left = leftStart;
                var right = mid + 1;
                var nextSorted = leftStart;
                while (left < mid + 1 and right < rightEnd + 1) {
                    let leftElement = array[left];
                    let rightElement = array[right];
                    switch (compare(leftElement, rightElement)) {
                        case (#less or #equal) {
                            scratchSpace[nextSorted] := leftElement;
                            left += 1
                        };
                        case (#greater) {
                            scratchSpace[nextSorted] := rightElement;
                            right += 1
                        }
                    };
                    nextSorted += 1
                };
                while (left < mid + 1) {
                    scratchSpace[nextSorted] := array[left];
                    nextSorted += 1;
                    left += 1
                };
                while (right < rightEnd + 1) {
                    scratchSpace[nextSorted] := array[right];
                    nextSorted += 1;
                    right += 1
                };

                // Copy over merged elements
                var i = leftStart;
                while (i < rightEnd + 1) {
                    array[i] := scratchSpace[i];
                    i += 1
                };

                leftStart += 2 * currSize
            };
            currSize *= 2
        }
    };

    public func reverse<X>(array : [X]) : [X] {
        let size = array.size();
        Prim.Array_tabulate<X>(size, func i = array[size - i - 1])
    };

    public func map<X, Y>(array : [X], f : X -> Y) : [Y] = Prim.Array_tabulate<Y>(array.size(), func i = f(array[i]));

    public func filter<X>(array : [X], predicate : X -> Bool) : [X] {
        var count = 0;
        let keep = Prim.Array_tabulate<Bool>(
            array.size(),
            func i {
                if (predicate(array[i])) {
                    count += 1;
                    true
                } else {
                    false
                }
            },
        );
        var nextKeep = 0;
        Prim.Array_tabulate<X>(
            count,
            func _ {
                while (not keep[nextKeep]) {
                    nextKeep += 1
                };
                nextKeep += 1;
                array[nextKeep - 1]
            },
        )
    };

    // FIXME the arguments ordering to the higher order function are flipped
    // between this and the buffer class
    // probably can't avoid breaking changes at some point
    public func mapEntries<X, Y>(array : [X], f : (X, Nat) -> Y) : [Y] = Prim.Array_tabulate<Y>(array.size(), func i = f(array[i], i));

    public func mapFilter<X, Y>(array : [X], f : X -> ?Y) : [Y] {
        var count = 0;
        let options = Prim.Array_tabulate<?Y>(
            array.size(),
            func i {
                let result = f(array[i]);
                switch (result) {
                    case (?element) {
                        count += 1;
                        result
                    };
                    case null {
                        null
                    }
                }
            },
        );

        var nextSome = 0;
        Prim.Array_tabulate<Y>(
            count,
            func _ {
                while (Option.isNull(options[nextSome])) {
                    nextSome += 1
                };
                nextSome += 1;
                switch (options[nextSome - 1]) {
                    case (?element) element;
                    case null {
                        Prim.trap "Malformed array in mapFilter"
                    }
                }
            },
        )
    };

    public func mapResult<X, Y, E>(array : [X], f : X -> Result.Result<Y, E>) : Result.Result<[Y], E> {
        let size = array.size();

        var error : ?Result.Result<[Y], E> = null;
        let results = Prim.Array_tabulate<?Y>(
            size,
            func i {
                switch (f(array[i])) {
                    case (#ok element) {
                        ?element
                    };
                    case (#err e) {
                        switch (error) {
                            case null {
                                // only take the first error
                                error := ?(#err e)
                            };
                            case _ {}
                        };
                        null
                    }
                }
            },
        );

        switch error {
            case null {
                // unpack the option
                #ok(
                    map<?Y, Y>(
                        results,
                        func element {
                            switch element {
                                case (?element) {
                                    element
                                };
                                case null {
                                    Prim.trap "Malformed array in mapResults"
                                }
                            }
                        },
                    )
                )
            };
            case (?error) {
                error
            }
        }
    };

    public func chain<X, Y>(array : [X], k : X -> [Y]) : [Y] {
        var flatSize = 0;
        let arrays = Prim.Array_tabulate<[Y]>(
            array.size(),
            func i {
                let subArray = k(array[i]);
                flatSize += subArray.size();
                subArray
            },
        );

        // could replace with a call to flatten,
        // but it would require an extra pass (to compute `flatSize`)
        var outer = 0;
        var inner = 0;
        Prim.Array_tabulate<Y>(
            flatSize,
            func _ {
                while (inner == arrays[outer].size()) {
                    inner := 0;
                    outer += 1
                };
                let element = arrays[outer][inner];
                inner += 1;
                element
            },
        )
    };

    public func foldLeft<X, A>(array : [X], base : A, combine : (A, X) -> A) : A {
        var accumulation = base;

        for (element in array.vals()) {
            accumulation := combine(accumulation, element)
        };

        accumulation
    };

    // FIXME the type arguments are reverse order from Buffer
    public func foldRight<X, A>(array : [X], base : A, combine : (X, A) -> A) : A {
        var accumulation = base;
        let size = array.size();

        var i = size;
        while (i > 0) {
            i -= 1;
            accumulation := combine(array[i], accumulation)
        };

        accumulation
    };

    public func flatten<X>(arrays : [[X]]) : [X] {
        var flatSize = 0;
        for (subArray in arrays.vals()) {
            flatSize += subArray.size()
        };

        var outer = 0;
        var inner = 0;
        Prim.Array_tabulate<X>(
            flatSize,
            func _ {
                while (inner == arrays[outer].size()) {
                    inner := 0;
                    outer += 1
                };
                let element = arrays[outer][inner];
                inner += 1;
                element
            },
        )
    };

    public func make<X>(element : X) : [X] = [element];

    public func vals<X>(array : [X]) : I.Iter<X> = array.vals();

    public func keys<X>(array : [X]) : I.Iter<Nat> = array.keys();

    public func entries<X>(array : [X]) : I.Iter<(Nat, X)> {
        object {
            var i = 0;

            public func next() : ?(Nat, X) {
                if (i >= array.size()) return null;
                let result = (i, array[i]);
                i += 1;
                return ?result
            }
        }
    };

    public func size<X>(array : [X]) : Nat = array.size();

    public func subArray<X>(array : [X], start : Nat, length : Nat) : [X] {
        if (start + length > array.size()) { Prim.trap("Array.subArray") };
        tabulate<X>(
            length,
            func(i) {
                array[start + i]
            },
        )
    };

    public func indexOf<X>(element : X, array : [X], equal : (X, X) -> Bool) : ?Nat = nextIndexOf<X>(element, array, 0, equal);

    public func nextIndexOf<X>(element : X, array : [X], fromInclusive : Nat, equal : (X, X) -> Bool) : ?Nat {
        var i = fromInclusive;
        let n = array.size();
        while (i < n) {
            if (equal(array[i], element)) {
                return ?i
            } else {
                i += 1
            }
        };
        null
    };

    public func lastIndexOf<X>(element : X, array : [X], equal : (X, X) -> Bool) : ?Nat = prevIndexOf<X>(element, array, array.size(), equal);

    public func prevIndexOf<T>(element : T, array : [T], fromExclusive : Nat, equal : (T, T) -> Bool) : ?Nat {
        var i = fromExclusive;
        while (i > 0) {
            i -= 1;
            if (equal(array[i], element)) {
                return ?i
            }
        };
        null
    };

    public func slice<X>(array : [X], fromInclusive : Nat, toExclusive : Nat) : I.Iter<X> = object {
        var i = fromInclusive;

        public func next() : ?X {
            if (i >= toExclusive) {
                return null
            };
            let result = array[i];
            i += 1;
            return ?result
        }
    };

    public func take<T>(array : [T], length : Int) : [T] {
        let len = Prim.abs(length);
        let size = array.size();
        let resSize = if (len < size) { len } else { size };
        let start : Nat = if (length > 0) 0 else size - resSize;
        subArray(array, start, resSize)
    };

    /// MODIFIED AREA /////////////////////////////////////////////////

    public func mapRev<X, Y>(array : [X], f : X -> Y) : [Y] {
        let size = array.size();
        Prim.Array_tabulate<Y>(size, func i = f(array[size - i - 1]))
    }
}
