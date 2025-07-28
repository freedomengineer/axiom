import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import List "mo:base/List";
import Order "mo:base/Order";

module {
    public type Iter<T> = { next : () -> ?T };

    public class range(x : Nat, y : Int) {
        var i = x;
        public func next() : ?Nat {
            if (i > y) { null } else { let j = i; i += 1; ?j }
        }
    };

    public class revRange(x : Int, y : Int) {
        var i = x;
        public func next() : ?Int {
            if (i < y) { null } else { let j = i; i -= 1; ?j }
        }
    };

    public func iterate<A>(
        xs : Iter<A>,
        f : (A, Nat) -> (),
    ) {
        var i = 0;
        label l loop {
            switch (xs.next()) {
                case (?next) {
                    f(next, i)
                };
                case (null) {
                    break l
                }
            };
            i += 1;
            continue l
        }
    };

    public func size<A>(xs : Iter<A>) : Nat {
        var len = 0;
        iterate<A>(xs, func(x, i) { len += 1 });
        len
    };

    public func map<A, B>(xs : Iter<A>, f : A -> B) : Iter<B> = object {
        public func next() : ?B {
            switch (xs.next()) {
                case (?next) {
                    ?f(next)
                };
                case (null) {
                    null
                }
            }
        }
    };

    public func filter<A>(xs : Iter<A>, f : A -> Bool) : Iter<A> = object {
        public func next() : ?A {
            loop {
                switch (xs.next()) {
                    case (null) {
                        return null
                    };
                    case (?x) {
                        if (f(x)) {
                            return ?x
                        }
                    }
                }
            };
            null
        }
    };

    public func make<A>(x : A) : Iter<A> = object {
        public func next() : ?A {
            ?x
        }
    };

    public func fromArray<A>(xs : [A]) : Iter<A> {
        var ix : Nat = 0;
        let size = xs.size();
        object {
            public func next() : ?A {
                if (ix >= size) {
                    return null
                } else {
                    let res = ?(xs[ix]);
                    ix += 1;
                    return res
                }
            }
        }
    };

    public func fromArrayMut<A>(xs : [var A]) : Iter<A> {
        fromArray<A>(Array.freeze<A>(xs))
    };

    public let fromList = List.toIter;

    public func toArray<A>(xs : Iter<A>) : [A] {
        let buffer = Buffer.Buffer<A>(8);
        iterate(xs, func(x : A, ix : Nat) { buffer.add(x) });
        return Buffer.toArray(buffer)
    };

    public func toArrayMut<A>(xs : Iter<A>) : [var A] {
        Array.thaw<A>(toArray<A>(xs))
    };

    public func toList<A>(xs : Iter<A>) : List.List<A> {
        var result = List.nil<A>();
        iterate<A>(
            xs,
            func(x, _i) {
                result := List.push<A>(x, result)
            },
        );
        List.reverse<A>(result)
    };

    public func sort<A>(xs : Iter<A>, compare : (A, A) -> Order.Order) : Iter<A> {
        let a = toArrayMut<A>(xs);
        Array.sortInPlace<A>(a, compare);
        fromArrayMut<A>(a)
    };

    /// MODIFIED AREA /////////////////////////////////////////////////

    public func toArrayMap<A, B>(xs : Iter<A>, f : A -> B) : [B] {
        let buffer = Buffer.Buffer<B>(8);
        iterate(xs, func(x : A, _ : Nat) { buffer.add(f(x)) });
        return Buffer.toArray(buffer)
    };
    public func toArrayFilter<A>(xs : Iter<A>, f : A -> Bool) : [A] {
        let buffer = Buffer.Buffer<A>(8);
        iterate(xs, func(x : A, _ : Nat) { if (f(x)) buffer.add(x) });
        return Buffer.toArray(buffer)
    };
    public func toArrayFilterMap<A, B>(xs : Iter<A>, f : A -> ?B) : [B] {
        let buffer = Buffer.Buffer<B>(8);
        iterate(
            xs,
            func(x : A, _ : Nat) {
                switch (f(x)) { case (?y) buffer.add(y); case (null) {} }
            },
        );
        return Buffer.toArray(buffer)
    };

    public func toListMap<A, B>(xs : Iter<A>, f : A -> B) : List.List<B> {
        var result = List.nil<B>();
        iterate<A>(
            xs,
            func(x, _i) {
                result := List.push<B>(f(x), result)
            },
        );
        List.reverse<B>(result)
    };

    public func concat<A>(arr : [Iter<A>]) : Iter<A> {
        var i = 0;
        var cur = arr[i];
        var len = arr.size();

        object {
            public func next() : ?A = switch (cur.next()) {
                case (?next) ?next;
                case (null) {
                    i += 1;
                    switch (i < len) {
                        case (true) { cur := arr[i]; cur.next() };
                        case (false) null
                    }
                }
            }
        }
    }
}
