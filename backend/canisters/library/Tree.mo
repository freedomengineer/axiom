import E "../common/Errors";

import Iter "Iter";

import List "mo:base/List";
import Order "mo:base/Order";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Char "mo:base/Char";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Int8 "mo:base/Int8";
import Int16 "mo:base/Int16";
import Int32 "mo:base/Int32";
import Int64 "mo:base/Int64";
import Nat8 "mo:base/Nat8";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Iter<T> = Iter.Iter<T>;
    private type List<T> = List.List<T>;
    private type Order = Order.Order;

    private type Color = { #R; #B };
    private type Trie<K, V> = {
        #node : (Color, Trie<K, V>, (K, ?V), Trie<K, V>);
        #leaf
    };
    private type Rep<X, Y> = {
        #tr : Trie<X, Y>;
        #xy : (X, ?Y)
    };
    private type IterRep<X, Y> = List<Rep<X, Y>>;

    private func _lbalance<X, Y>(left : Trie<X, Y>, xy : (X, ?Y), right : Trie<X, Y>) : Trie<X, Y> {
        switch (left, right) {
            case (#node(#R, #node(#R, l1, xy1, r1), xy2, r2), r) #node(#R, #node(#B, l1, xy1, r1), xy2, #node(#B, r2, xy, r));
            case (#node(#R, l1, xy1, #node(#R, l2, xy2, r2)), r) #node(#R, #node(#B, l1, xy1, l2), xy2, #node(#B, r2, xy, r));
            case (_) #node(#B, left, xy, right)
        }
    };
    private func _rbalance<X, Y>(left : Trie<X, Y>, xy : (X, ?Y), right : Trie<X, Y>) : Trie<X, Y> {
        switch (left, right) {
            case (l, #node(#R, l1, xy1, #node(#R, l2, xy2, r2))) #node(#R, #node(#B, l, xy, l1), xy1, #node(#B, l2, xy2, r2));
            case (l, #node(#R, #node(#R, l1, xy1, r1), xy2, r2)) #node(#R, #node(#B, l, xy, l1), xy1, #node(#B, r1, xy2, r2));
            case (_) #node(#B, left, xy, right)
        }
    };

    private func _balLeft<X, Y>(left : Trie<X, Y>, xy : (X, ?Y), right : Trie<X, Y>) : Trie<X, Y> {
        switch (left, right) {
            case (#node(#R, l1, xy1, r1), r) #node(#R, #node(#B, l1, xy1, r1), xy, r);
            case (_, #node(#B, l2, xy2, r2)) _rbalance(left, xy, #node(#R, l2, xy2, r2));
            case (_, #node(#R, #node(#B, l2, xy2, r2), xy3, r3)) #node(#R, #node(#B, left, xy, l2), xy2, _rbalance(r2, xy3, _redden r3));
            case (_) E.unreachable()
        }
    };
    private func _balRight<X, Y>(left : Trie<X, Y>, xy : (X, ?Y), right : Trie<X, Y>) : Trie<X, Y> {
        switch (left, right) {
            case (l, #node(#R, l1, xy1, r1)) #node(#R, l, xy, #node(#B, l1, xy1, r1));
            case (#node(#B, l1, xy1, r1), r) _lbalance(#node(#R, l1, xy1, r1), xy, r);
            case (#node(#R, l1, xy1, #node(#B, l2, xy2, r2)), r3) #node(#R, _lbalance(_redden l1, xy1, l2), xy2, #node(#B, r2, xy, r3));
            case (_) E.unreachable()
        }
    };

    private func _redden<X, Y>(trie : Trie<X, Y>) : Trie<X, Y> {
        switch (trie) {
            case (#node(#B, l, xy, r)) #node(#R, l, xy, r);
            case (_) E.unreachable()
        }
    };
    private func _append<X, Y>(left : Trie<X, Y>, right : Trie<X, Y>) : Trie<X, Y> {
        switch (left, right) {
            case (#leaf, _) right;
            case (_, #leaf) left;
            case (#node(#R, l1, xy1, r1), #node(#R, l2, xy2, r2)) {
                switch (_append(r1, l2)) {
                    case (#node(#R, l3, xy3, r3)) #node(#R, #node(#R, l1, xy1, l3), xy3, #node(#R, r3, xy2, r2));
                    case (r1l2) #node(#R, l1, xy1, #node(#R, r1l2, xy2, r2))
                }
            };
            case (t1, #node(#R, l2, xy2, r2)) #node(#R, _append(t1, l2), xy2, r2);
            case (#node(#R, l1, xy1, r1), t2) #node(#R, l1, xy1, _append(r1, t2));
            case (#node(#B, l1, xy1, r1), #node(#B, l2, xy2, r2)) {
                switch (_append(r1, l2)) {
                    case (#node(#R, l3, xy3, r3)) #node(#R, #node(#B, l1, xy1, l3), xy3, #node(#B, r3, xy2, r2));
                    case (r1l2) _balLeft(l1, xy1, #node(#B, r1l2, xy2, r2))
                }
            }
        }
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key<K> = { key : K; compare : (K, K) -> Order };

    public func TextKey(key : Text) : Key<Text> = {
        key;
        compare = Text.compare
    };
    public func CharKey(key : Char) : Key<Char> = {
        key;
        compare = Char.compare
    };
    public func PrincipalKey(key : Principal) : Key<Principal> = {
        key;
        compare = Principal.compare
    };
    public func FloatKey(key : Float) : Key<Float> = {
        key;
        compare = Float.compare
    };

    public func IntKey(key : Int) : Key<Int> = { key; compare = Int.compare };
    public func Int8Key(key : Int8) : Key<Int8> = {
        key;
        compare = Int8.compare
    };
    public func Int16Key(key : Int16) : Key<Int16> = {
        key;
        compare = Int16.compare
    };
    public func Int32Key(key : Int32) : Key<Int32> = {
        key;
        compare = Int32.compare
    };
    public func Int64Key(key : Int64) : Key<Int64> = {
        key;
        compare = Int64.compare
    };

    public func NatKey(key : Nat) : Key<Nat> = { key; compare = Nat.compare };
    public func Nat8Key(key : Nat8) : Key<Nat8> = {
        key;
        compare = Nat8.compare
    };
    public func Nat16Key(key : Nat16) : Key<Nat16> = {
        key;
        compare = Nat16.compare
    };
    public func Nat32Key(key : Nat32) : Key<Nat32> = {
        key;
        compare = Nat32.compare
    };
    public func Nat64Key(key : Nat64) : Key<Nat64> = {
        key;
        compare = Nat64.compare
    };

    /// LIBRARY ////// TREE ////////////

    private type Self<K, V> = Tree<K, V>;

    public type Tree<K, V> = { var trie : Trie<K, V> };

    public func new<K, V>() : Self<K, V> = { var trie = #leaf };
    public func make<K, V>(key : K, value : V) : Self<K, V> = {
        var trie = #node(#B, #leaf, (key, ?value), #leaf)
    };
    public func fromEntries<K, V>(entries : [(Key<K>, V)]) : Self<K, V> {
        let __ = new<K, V>();
        putBatch(__, entries);
        __
    };

    /// PRIVATE ////// MODIFIERS ////////////

    /// PRIVATE ////// ACCESSORS ////////////

    /// PUBLIC ////// MODIFIERS ////////////

    public func put<K, V>(__ : Self<K, V>, { key; compare } : Key<K>, value : V) {
        func ins(trie : Trie<K, V>) : Trie<K, V> {
            switch (trie) {
                case (#leaf) { #node(#R, #leaf, (key, ?value), #leaf) };
                case (#node(#B, left, xy, right)) {
                    switch (compare(key, xy.0)) {
                        case (#less) _lbalance(ins(left), xy, right);
                        case (#greater) _rbalance(left, xy, ins(right));
                        case (#equal) #node(#B, left, (key, ?value), right)
                    }
                };
                case (#node(#R, left, xy, right)) {
                    switch (compare(key, xy.0)) {
                        case (#less) #node(#R, ins(left), xy, right);
                        case (#greater) #node(#R, left, xy, ins(right));
                        case (#equal) #node(#R, left, (key, ?value), right)
                    }
                }
            }
        };
        __.trie := switch (ins(__.trie)) {
            case (#node(#R, left, xy, right)) #node(#B, left, xy, right);
            case (other) other
        }
    };
    public func putBatch<K, V>(__ : Self<K, V>, entries : [(Key<K>, V)]) {
        for ((k, v) in entries.vals()) put(__, k, v)
    };
    public func putOnCollision<K, V>(__ : Self<K, V>, keyUtil : Key<K>, value : V, onCollision : (V, V) -> V) {
        switch (get(__, keyUtil)) {
            case (null) put(__, keyUtil, value);
            case (?oldValue) put(__, keyUtil, onCollision(oldValue, value))
        }
    };
    public func replace<K, V>(__ : Self<K, V>, { key; compare } : Key<K>, value : V) : ?V {
        var y0 : ?V = null;
        func ins(trie : Trie<K, V>) : Trie<K, V> {
            switch (trie) {
                case (#leaf) { #node(#R, #leaf, (key, ?value), #leaf) };
                case (#node(#B, left, xy, right)) {
                    switch (compare(key, xy.0)) {
                        case (#less) _lbalance(ins(left), xy, right);
                        case (#greater) _rbalance(left, xy, ins(right));
                        case (#equal) {
                            y0 := xy.1;
                            #node(#B, left, (key, ?value), right)
                        }
                    }
                };
                case (#node(#R, left, xy, right)) {
                    switch (compare(key, xy.0)) {
                        case (#less) #node(#R, ins(left), xy, right);
                        case (#greater) #node(#R, left, xy, ins(right));
                        case (#equal) {
                            y0 := xy.1;
                            #node(#R, left, (key, ?value), right)
                        }
                    }
                }
            }
        };
        __.trie := switch (ins(__.trie)) {
            case (#node(#R, left, xy, right)) #node(#B, left, xy, right);
            case (other) other
        };
        y0
    };

    public func delete<K, V>(__ : Self<K, V>, { key; compare } : Key<K>) {
        func del(trie : Trie<K, V>) : Trie<K, V> {
            switch (trie) {
                case (#leaf) trie;
                case (#node(_, left, xy, right)) delNode(left, xy, right)
            }
        };
        func delNode(left : Trie<K, V>, xy : (K, ?V), right : Trie<K, V>) : Trie<K, V> {
            switch (compare(key, xy.0)) {
                case (#less) {
                    let newLeft = del(left);
                    switch (left) {
                        case (#node(#B, _, _, _)) _balLeft(newLeft, xy, right);
                        case (_) #node(#R, newLeft, xy, right)
                    }
                };
                case (#greater) {
                    let newRight = del(right);
                    switch (right) {
                        case (#node(#B, _, _, _)) _balRight(left, xy, newRight);
                        case (_) #node(#R, left, xy, newRight)
                    }
                };
                case (#equal) _append(left, right)
            }
        };
        __.trie := switch (del(__.trie)) {
            case (#node(#R, left, xy, right)) #node(#B, left, xy, right);
            case (other) other
        }
    };
    public func remove<K, V>(__ : Self<K, V>, { key; compare } : Key<K>) : ?V {
        var y0 : ?V = null;
        func del(trie : Trie<K, V>) : Trie<K, V> {
            switch (trie) {
                case (#leaf) trie;
                case (#node(_, left, xy, right)) delNode(left, xy, right)
            }
        };
        func delNode(left : Trie<K, V>, xy : (K, ?V), right : Trie<K, V>) : Trie<K, V> {
            switch (compare(key, xy.0)) {
                case (#less) {
                    let newLeft = del(left);
                    switch (left) {
                        case (#node(#B, _, _, _)) _balLeft(newLeft, xy, right);
                        case (_) #node(#R, newLeft, xy, right)
                    }
                };
                case (#greater) {
                    let newRight = del(right);
                    switch (right) {
                        case (#node(#B, _, _, _)) _balRight(left, xy, newRight);
                        case (_) #node(#R, left, xy, newRight)
                    }
                };
                case (#equal) {
                    y0 := xy.1;
                    _append(left, right)
                }
            }
        };
        __.trie := switch (del(__.trie)) {
            case (#node(#R, left, xy, right)) #node(#B, left, xy, right);
            case (other) other
        };
        y0
    };
    public func clear<K, V>(__ : Self<K, V>) {
        __.trie := #leaf
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func keys<K, V>(__ : Self<K, V>) : Iter<K> {
        object {
            var tries : IterRep<K, V> = ?(#tr(__.trie), null);
            public func next() : ?K {
                switch (tries) {
                    case (null) null;
                    case (?(#tr(#leaf), ts)) {
                        tries := ts;
                        next()
                    };
                    case (?(#xy(xy), ts)) {
                        tries := ts;
                        switch (xy.1) {
                            case (null) next();
                            case (_) ?xy.0
                        }
                    };
                    case (?(#tr(#node(_, l, xy, r)), ts)) {
                        tries := ?(#tr(l), ?(#xy(xy), ?(#tr(r), ts)));
                        next()
                    }
                }
            }
        }
    };
    public func keysRev<K, V>(__ : Self<K, V>) : Iter<K> {
        object {
            var tries : IterRep<K, V> = ?(#tr(__.trie), null);
            public func next() : ?K {
                switch (tries) {
                    case (null) null;
                    case (?(#tr(#leaf), ts)) {
                        tries := ts;
                        next()
                    };
                    case (?(#xy(xy), ts)) {
                        tries := ts;
                        switch (xy.1) {
                            case (null) next();
                            case (_) ?xy.0
                        }
                    };
                    case (?(#tr(#node(_, l, xy, r)), ts)) {
                        tries := ?(#tr(r), ?(#xy(xy), ?(#tr(l), ts)));
                        next()
                    }
                }
            }
        }
    };
    public func vals<K, V>(__ : Self<K, V>) : Iter<V> {
        object {
            var tries : IterRep<K, V> = ?(#tr(__.trie), null);
            public func next() : ?V {
                switch (tries) {
                    case (null) null;
                    case (?(#tr(#leaf), ts)) {
                        tries := ts;
                        next()
                    };
                    case (?(#xy(xy), ts)) {
                        tries := ts;
                        switch (xy.1) {
                            case (null) next();
                            case (y) y
                        }
                    };
                    case (?(#tr(#node(_, l, xy, r)), ts)) {
                        tries := ?(#tr(l), ?(#xy(xy), ?(#tr(r), ts)));
                        next()
                    }
                }
            }
        }
    };
    public func valsRev<K, V>(__ : Self<K, V>) : Iter<V> {
        object {
            var tries : IterRep<K, V> = ?(#tr(__.trie), null);
            public func next() : ?V {
                switch (tries) {
                    case (null) null;
                    case (?(#tr(#leaf), ts)) {
                        tries := ts;
                        next()
                    };
                    case (?(#xy(xy), ts)) {
                        tries := ts;
                        switch (xy.1) {
                            case (null) next();
                            case (y) y
                        }
                    };
                    case (?(#tr(#node(_, l, xy, r)), ts)) {
                        tries := ?(#tr(r), ?(#xy(xy), ?(#tr(l), ts)));
                        next()
                    }
                }
            }
        }
    };
    public func entries<K, V>(__ : Self<K, V>) : Iter<(K, V)> {
        object {
            var tries : IterRep<K, V> = ?(#tr(__.trie), null);
            public func next() : ?(K, V) {
                switch (tries) {
                    case (null) null;
                    case (?(#tr(#leaf), ts)) {
                        tries := ts;
                        next()
                    };
                    case (?(#xy(xy), ts)) {
                        tries := ts;
                        switch (xy.1) {
                            case (null) next();
                            case (?y) ?(xy.0, y)
                        }
                    };
                    case (?(#tr(#node(_, l, xy, r)), ts)) {
                        tries := ?(#tr(l), ?(#xy(xy), ?(#tr(r), ts)));
                        next()
                    }
                }
            }
        }
    };
    public func entriesRev<K, V>(__ : Self<K, V>) : Iter<(K, V)> {
        object {
            var tries : IterRep<K, V> = ?(#tr(__.trie), null);
            public func next() : ?(K, V) {
                switch (tries) {
                    case (null) null;
                    case (?(#tr(#leaf), ts)) {
                        tries := ts;
                        next()
                    };
                    case (?(#xy(xy), ts)) {
                        tries := ts;
                        switch (xy.1) {
                            case (null) next();
                            case (?y) ?(xy.0, y)
                        }
                    };
                    case (?(#tr(#node(_, l, xy, r)), ts)) {
                        tries := ?(#tr(r), ?(#xy(xy), ?(#tr(l), ts)));
                        next()
                    }
                }
            }
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size<K, V>(__ : Self<K, V>) : Nat {
        func siz(trie : Trie<K, V>) : Nat {
            switch (trie) {
                case (#leaf) 0;
                case (#node(_, l, xy, r)) siz(l) + siz(r) + (switch (xy.1) { case null 0; case _ 1 })
            }
        };
        siz(__.trie)
    };
    public func empty<K, V>(__ : Self<K, V>) : Bool {
        switch (size(__)) { case (0) true; case (_) false }
    };
    public func get<K, V>(__ : Self<K, V>, { key; compare } : Key<K>) : ?V {
        func ret(t : Trie<K, V>, key : K) : ?V {
            switch (t) {
                case (#leaf) null;
                case (#node(_c, l, xy, r)) {
                    switch (compare(key, xy.0)) {
                        case (#less) ret(l, key);
                        case (#equal) xy.1;
                        case (#greater) ret(r, key)
                    }
                }
            }
        };
        ret(__.trie, key)
    };
    public func getEntry<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : ?(K, V) {
        switch (get(__, keyUtil)) { case (?y) ?(keyUtil.key, y); case (_) null }
    };
    public func unwrap<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : V {
        switch (get(__, keyUtil)) { case (?y) y; case (_) E.unreachable() }
    };
    public func unwrapEntry<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : (K, V) {
        switch (getEntry(__, keyUtil)) {
            case (?xy) xy;
            case (_) E.unreachable()
        }
    };
    public func findKey<K, V>(__ : Self<K, V>, predicate : K -> Bool) : ?K {
        for (key in keys(__)) if (predicate(key)) return ?key;
        null
    };
    public func findVal<K, V>(__ : Self<K, V>, predicate : V -> Bool) : ?(K, V) {
        for (entry in entries(__)) if (predicate(entry.1)) return ?entry;
        null
    };
    public func findEntry<K, V>(__ : Self<K, V>, predicate : (K, V) -> Bool) : ?(K, V) {
        for (entry in entries(__)) if (predicate(entry)) return ?entry;
        null
    };

    public func includes<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : Bool {
        switch (get(__, keyUtil)) { case (?_) true; case (_) false }
    };
    public func excludes<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : Bool {
        switch (get(__, keyUtil)) { case (?_) false; case (_) true }
    };
    public func everyKey<K, V>(__ : Self<K, V>, predicate : K -> Bool) : Bool {
        for (key in keys(__)) if (not predicate(key)) return false;
        true
    };
    public func everyVal<K, V>(__ : Self<K, V>, predicate : V -> Bool) : Bool {
        for (val in vals(__)) if (not predicate(val)) return false;
        true
    };
    public func someKey<K, V>(__ : Self<K, V>, predicate : K -> Bool) : Bool {
        for (key in keys(__)) if (predicate(key)) return true;
        false
    };
    public func someVal<K, V>(__ : Self<K, V>, predicate : V -> Bool) : Bool {
        for (val in vals(__)) if (predicate(val)) return true;
        false
    };

    public func foldKeys<K, V, T>(__ : Self<K, V>, base : T, combine : (T, K) -> T) : T {
        var acc = base;
        for (key in keys(__)) acc := combine(acc, key);
        acc
    };
    public func foldVals<K, V, T>(__ : Self<K, V>, base : T, combine : (T, V) -> T) : T {
        var acc = base;
        for (val in vals(__)) acc := combine(acc, val);
        acc
    };

    public func getKeys<K, V>(__ : Self<K, V>) : [K] {
        Iter.toArray(keys(__))
    };
    public func getVals<K, V>(__ : Self<K, V>) : [V] {
        Iter.toArray(vals(__))
    };
    public func getEntries<K, V>(__ : Self<K, V>) : [(K, V)] {
        Iter.toArray(entries(__))
    };
    public func getEntriesMap<K, V, T>(__ : Self<K, V>, f : ((K, V)) -> T) : [T] {
        Iter.toArrayMap<(K, V), T>(entries(__), f)
    };
    public func getEntriesFilterMap<K, V, T>(__ : Self<K, V>, f : ((K, V)) -> ?T) : [T] {
        Iter.toArrayFilterMap<(K, V), T>(entries(__), f)
    };

    public func getKeysRev<K, V>(__ : Self<K, V>) : [K] {
        Iter.toArray(keysRev(__))
    };
    public func getValsRev<K, V>(__ : Self<K, V>) : [V] {
        Iter.toArray(valsRev(__))
    };
    public func getEntriesRev<K, V>(__ : Self<K, V>) : [(K, V)] {
        Iter.toArray(entriesRev(__))
    };
    public func getEntriesMapRev<K, V, T>(__ : Self<K, V>, f : ((K, V)) -> T) : [T] {
        Iter.toArrayMap<(K, V), T>(entriesRev(__), f)
    }
}
