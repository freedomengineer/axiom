import E "../common/Errors";

import Base "Base";

import RBTree "mo:base/RBTree";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
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
import Prim "mo:⛔";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Hash = Hash.Hash;
    private type RBTree<K, V> = RBTree.RBTree<K, V>;
    private type Compare<T> = Base.Compare<T>;
    private type Iter<T> = Iter.Iter<T>;

    private let DATA = 0;
    private let FRONT = 0;
    private let BACK = 1;
    private let SIZE = 2;
    private let NULL = 0x3fffffff;
    private let MAX_CAPACITY = 0x3fffffff : Nat32;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key<K> = { key : K; equal : (K, K) -> Bool; hash : K -> Hash };

    public func TextKey(key : Text) : Key<Text> = {
        key;
        equal = Text.equal;
        hash = Text.hash
    };
    public func CharKey(key : Char) : Key<Char> = {
        key;
        equal = Char.equal;
        hash = func(x) = Text.hash(Char.toText(x))
    };
    public func PrincipalKey(key : Principal) : Key<Principal> = {
        key;
        equal = Principal.equal;
        hash = Principal.hash
    };
    public func FloatKey(key : Float) : Key<Float> = {
        key;
        equal = Float.equal;
        hash = func(x) = Text.hash(Float.toText(x))
    };

    public func IntKey(key : Int) : Key<Int> = {
        key;
        equal = Int.equal;
        hash = Int.hash
    };
    public func Int8Key(key : Int8) : Key<Int8> = {
        key;
        equal = Int8.equal;
        hash = func(x) = Text.hash(Int8.toText(x))
    };
    public func Int16Key(key : Int16) : Key<Int16> = {
        key;
        equal = Int16.equal;
        hash = func(x) = Text.hash(Int16.toText(x))
    };
    public func Int32Key(key : Int32) : Key<Int32> = {
        key;
        equal = Int32.equal;
        hash = func(x) = Text.hash(Int32.toText(x))
    };
    public func Int64Key(key : Int64) : Key<Int64> = {
        key;
        equal = Int64.equal;
        hash = func(x) = Text.hash(Int64.toText(x))
    };

    public func NatKey(key : Nat) : Key<Nat> = {
        key;
        equal = Nat.equal;
        hash = Hash.hash
    };
    public func Nat8Key(key : Nat8) : Key<Nat8> = {
        key;
        equal = Nat8.equal;
        hash = func(x) = Text.hash(Nat8.toText(x))
    };
    public func Nat16Key(key : Nat16) : Key<Nat16> = {
        key;
        equal = Nat16.equal;
        hash = func(x) = Text.hash(Nat16.toText(x))
    };
    public func Nat32Key(key : Nat32) : Key<Nat32> = {
        key;
        equal = Nat32.equal;
        hash = func(x) = Text.hash(Nat32.toText(x))
    };
    public func Nat64Key(key : Nat64) : Key<Nat64> = {
        key;
        equal = Nat64.equal;
        hash = func(x) = Text.hash(Nat64.toText(x))
    };

    /// LIBRARY ////// MAP ////////////

    private type Self<K, V> = Map<K, V>;

    public type Map<K, V> = [var ?(keys : [var ?K], values : [var ?V], indices : [var Nat], bounds : [var Nat32])];

    public func new<K, V>() : Self<K, V> = [var null];
    public func make<K, V>({ key; equal; hash } : Key<K>, value : V) : Self<K, V> = [
        var ?(
            [var ?key, null],
            [var ?value, null],
            if (hash(key) % 2 == 0)[var NULL, NULL, 0, NULL] else [var NULL, NULL, NULL, 0],
            [var 1, 1, 1],
        )
    ];
    public func fromEntries<K, V>(entries : [(Key<K>, V)]) : Self<K, V> {
        let __ = new<K, V>();
        putBatch(__, entries);
        __
    };

    /// PRIVATE ////// MODIFIERS ////////////

    private func _make<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>, value : V) {
        __[DATA] := ?(
            [var ?key, null],
            [var ?value, null],
            if (hash(key) % 2 == 0)[var NULL, NULL, 0, NULL] else [var NULL, NULL, NULL, 0],
            [var 1, 1, 1],
        )
    };

    private func _rehash<K, V>(__ : Self<K, V>, equal : (K, K) -> Bool, hash : K -> Hash) {
        let data = switch (__[DATA]) { case (?data) data; case (_) return };
        let bounds = data.3;
        let size = bounds[SIZE];
        if (size == 0) return __[DATA] := null;
        let newCapacity = 2 **% (32 -% Prim.clzNat32(Prim.nat64ToNat32(Prim.nat32ToNat64(size) *% 8 / 7)));
        let newCapacityNat = Prim.nat32ToNat(newCapacity);

        if (newCapacity >= MAX_CAPACITY) E.f(#INTERNAL_FAILURE("Map rehashing"), "Map capacity limit reached (2 ** 30)");

        let newKeys = Prim.Array_init<?K>(newCapacityNat, null);
        let newValues = Prim.Array_init<?V>(newCapacityNat, null);
        let newIndexes = Prim.Array_init<Nat>(Prim.nat32ToNat(newCapacity *% 2), NULL);
        var newIndex = 0 : Nat32;
        let values = data.1;
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let lastIndex = (bounds[BACK] -% 1) % capacity;
        var index = bounds[FRONT];
        loop {
            index := (index +% 1) % capacity;
            let indexNat = Prim.nat32ToNat(index);
            let key = keys[indexNat];
            switch (key) {
                case (?someKey) {
                    let newIndexNat = Prim.nat32ToNat(newIndex);
                    let hashIndex = Prim.nat32ToNat(hash(someKey) % newCapacity +% newCapacity);
                    newKeys[newIndexNat] := key;
                    newValues[newIndexNat] := values[indexNat];
                    newIndexes[newIndexNat] := newIndexes[hashIndex];
                    newIndexes[hashIndex] := newIndexNat;
                    newIndex +%= 1
                };
                case (_) {}
            }
        } while (index != lastIndex);

        __[DATA] := ?(newKeys, newValues, newIndexes, bounds);
        bounds[BACK] := newIndex;
        bounds[FRONT] := newCapacity -% 1
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _unwrap<T>(x : ?T) : T = switch (x) {
        case (?x) x;
        case (_) E.unreachable()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func put<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>, value : V) {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) return _make(__, { key; equal; hash }, value)
        };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let hashIndex = Prim.nat32ToNat(hash(key) % capacity +% capacity);
        let indices = data.2;
        let firstIndex = indices[hashIndex];
        var index = firstIndex;
        loop if (index == NULL) {
            let bounds = data.3;
            let back = bounds[BACK];
            let backNat = Prim.nat32ToNat(back);
            bounds[BACK] := (back +% 1) % capacity;
            bounds[SIZE] +%= 1;
            keys[backNat] := ?key;
            data.1 [backNat] := ?value;
            indices[backNat] := firstIndex;
            indices[hashIndex] := backNat;
            if (back == bounds[FRONT]) _rehash(__, equal, hash);
            return
        } else if (equal(_unwrap(keys[index]), key)) {
            data.1 [index] := ?value;
            return
        } else {
            index := indices[index]
        }
    };
    public func putBatch<K, V>(__ : Self<K, V>, entries : [(Key<K>, V)]) {
        for (entry in entries.vals()) put(__, entry.0, entry.1)
    };
    public func putOnCollision<K, V>(__ : Self<K, V>, keyUtil : Key<K>, value : V, onCollision : (V, V) -> V) {
        switch (get(__, keyUtil)) {
            case (null) put(__, keyUtil, value);
            case (?oldValue) put(__, keyUtil, onCollision(oldValue, value))
        }
    };
    public func replace<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>, value : V) : ?V {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) { _make(__, { key; equal; hash }, value); return null }
        };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let hashIndex = Prim.nat32ToNat(hash(key) % capacity +% capacity);
        let indices = data.2;
        let firstIndex = indices[hashIndex];
        var index = firstIndex;
        loop if (index == NULL) {
            let bounds = data.3;
            let back = bounds[BACK];
            let backNat = Prim.nat32ToNat(back);
            bounds[BACK] := (back +% 1) % capacity;
            bounds[SIZE] +%= 1;
            keys[backNat] := ?key;
            data.1 [backNat] := ?value;
            indices[backNat] := firstIndex;
            indices[hashIndex] := backNat;
            if (back == bounds[FRONT]) _rehash(__, equal, hash);
            return null
        } else if (equal(_unwrap(keys[index]), key)) {
            let prevValue = data.1 [index];
            data.1 [index] := ?value;
            return prevValue
        } else {
            index := indices[index]
        }
    };

    public func delete<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>) {
        let data = switch (__[DATA]) { case (?data) data; case (_) return };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let hashIndex = Prim.nat32ToNat(hash(key) % capacity +% capacity);
        let indices = data.2;
        var index = indices[hashIndex];
        var prevIndex = NULL;
        loop if (index == NULL) {
            return
        } else if (equal(_unwrap(keys[index]), key)) {
            let bounds = data.3;
            let newSize = bounds[SIZE] -% 1;
            bounds[SIZE] := newSize;
            keys[index] := null;
            data.1 [index] := null;
            if (prevIndex == NULL) {
                indices[hashIndex] := indices[index]
            } else {
                indices[prevIndex] := indices[index]
            };
            if (newSize < (capacity *% 3 +% 2) / 8) {
                _rehash(__, equal, hash)
            } else {
                var front = bounds[FRONT];
                let prevFront = (front +% 1) % capacity;
                let index32 = Prim.natToNat32(index);
                if (index32 == prevFront) {
                    front := prevFront;
                    if (newSize != 0) {
                        while (switch (keys[Prim.nat32ToNat((front +% 1) % capacity)]) { case (null) true; case (_) false }) {
                            front := (front +% 1) % capacity
                        }
                    };
                    bounds[FRONT] := front
                } else {
                    var back = bounds[BACK];
                    let prevBack = (back -% 1) % capacity;
                    if (index32 == prevBack) {
                        back := prevBack;
                        if (newSize != 0) {
                            while (switch (keys[Prim.nat32ToNat((back -% 1) % capacity)]) { case (null) true; case (_) false }) {
                                back := (back -% 1) % capacity
                            }
                        };
                        bounds[BACK] := back
                    }
                }
            };
            return
        } else {
            prevIndex := index;
            index := indices[index]
        }
    };
    public func remove<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>) : ?V {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let hashIndex = Prim.nat32ToNat(hash(key) % capacity +% capacity);
        let indices = data.2;
        var index = indices[hashIndex];
        var prevIndex = NULL;
        loop if (index == NULL) {
            return null
        } else if (equal(_unwrap(keys[index]), key)) {
            let value = data.1 [index];
            let bounds = data.3;
            let newSize = bounds[SIZE] -% 1;
            bounds[SIZE] := newSize;
            keys[index] := null;
            data.1 [index] := null;
            if (prevIndex == NULL) {
                indices[hashIndex] := indices[index]
            } else {
                indices[prevIndex] := indices[index]
            };
            if (newSize < (capacity *% 3 +% 2) / 8) {
                _rehash(__, equal, hash)
            } else {
                var front = bounds[FRONT];
                let prevFront = (front +% 1) % capacity;
                let index32 = Prim.natToNat32(index);
                if (index32 == prevFront) {
                    front := prevFront;
                    if (newSize != 0) {
                        while (switch (keys[Prim.nat32ToNat((front +% 1) % capacity)]) { case (null) true; case (_) false }) {
                            front := (front +% 1) % capacity
                        }
                    };
                    bounds[FRONT] := front
                } else {
                    var back = bounds[BACK];
                    let prevBack = (back -% 1) % capacity;
                    if (index32 == prevBack) {
                        back := prevBack;
                        if (newSize != 0) {
                            while (switch (keys[Prim.nat32ToNat((back -% 1) % capacity)]) { case (null) true; case (_) false }) {
                                back := (back -% 1) % capacity
                            }
                        };
                        bounds[BACK] := back
                    }
                }
            };
            return value
        } else {
            prevIndex := index;
            index := indices[index]
        }
    };
    public func clear<K, V>(__ : Self<K, V>) {
        __[DATA] := null
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func keys<K, V>(__ : Self<K, V>) : Iter<K> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.3 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.3 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = front;
        object {
            public func next() : ?K {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == back) (front +% 1) % capacity else (iterIndex +% 1) % capacity;
                        switch (data.0 [Prim.nat32ToNat(iterIndex)]) {
                            case (null) if (iterIndex == back) return null;
                            case (key) return key
                        }
                    };
                    case (_) null
                }
            }
        }
    };
    public func keysRev<K, V>(__ : Self<K, V>) : Iter<K> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.3 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.3 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = back;
        object {
            public func next() : ?K {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == front) (back -% 1) % capacity else (iterIndex -% 1) % capacity;
                        switch (data.0 [Prim.nat32ToNat(iterIndex)]) {
                            case (null) if (iterIndex == front) return null;
                            case (key) return key
                        }
                    };
                    case (_) null
                }
            }
        }
    };
    public func vals<K, V>(__ : Self<K, V>) : Iter<V> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.3 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.3 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = front;
        object {
            public func next() : ?V {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == back) (front +% 1) % capacity else (iterIndex +% 1) % capacity;
                        switch (data.1 [Prim.nat32ToNat(iterIndex)]) {
                            case (null) if (iterIndex == back) return null;
                            case (value) return value
                        }
                    };
                    case (_) null
                }
            }
        }
    };
    public func valsRev<K, V>(__ : Self<K, V>) : Iter<V> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.3 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.3 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = back;
        object {
            public func next() : ?V {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == front) (back -% 1) % capacity else (iterIndex -% 1) % capacity;
                        switch (data.1 [Prim.nat32ToNat(iterIndex)]) {
                            case (null) if (iterIndex == front) return null;
                            case (value) return value
                        }
                    };
                    case (_) null
                }
            }
        }
    };
    public func entries<K, V>(__ : Self<K, V>) : Iter<(K, V)> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.3 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.3 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = front;
        object {
            public func next() : ?(K, V) {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == back) (front +% 1) % capacity else (iterIndex +% 1) % capacity;
                        let iterIndexNat = Prim.nat32ToNat(iterIndex);
                        switch (data.0 [iterIndexNat]) {
                            case (?key) return ?(key, _unwrap(data.1 [iterIndexNat]));
                            case (_) if (iterIndex == back) return null
                        }
                    };
                    case (_) null
                }
            }
        }
    };
    public func entriesRev<K, V>(__ : Self<K, V>) : Iter<(K, V)> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.3 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.3 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = back;
        object {
            public func next() : ?(K, V) {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == front) (back -% 1) % capacity else (iterIndex -% 1) % capacity;
                        let iterIndexNat = Prim.nat32ToNat(iterIndex);
                        switch (data.0 [iterIndexNat]) {
                            case (?key) return ?(key, _unwrap(data.1 [iterIndexNat]));
                            case (_) if (iterIndex == front) return null
                        }
                    };
                    case (_) null
                }
            }
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size<K, V>(__ : Self<K, V>) : Nat {
        switch (__[DATA]) {
            case (?data) Prim.nat32ToNat(data.3 [SIZE]);
            case (_) 0
        }
    };
    public func empty<K, V>(__ : Self<K, V>) : Bool {
        switch (__[DATA]) {
            case (null) true;
            case (_) false
        }
    };
    public func get<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>) : ?V {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };

        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        var index = data.2 [Prim.nat32ToNat(hash(key) % capacity +% capacity)];

        loop if (index == NULL) {
            return null
        } else if (equal(_unwrap(keys[index]), key)) {
            return data.1 [index]
        } else {
            index := data.2 [index]
        }
    };
    public func getOrDefault<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>, default : V) : V {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) return default
        };

        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        var index = data.2 [Prim.nat32ToNat(hash(key) % capacity +% capacity)];

        loop if (index == NULL) {
            return default
        } else if (equal(_unwrap(keys[index]), key)) {
            return _unwrap(data.1 [index])
        } else {
            index := data.2 [index]
        }
    };
    public func getEntry<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : ?(K, V) {
        switch (get(__, keyUtil)) {
            case (?v) ?(keyUtil.key, v);
            case (null) null
        }
    };
    public func unwrap<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : V {
        switch (get(__, keyUtil)) {
            case (?v) v;
            case (null) E.unreachable()
        }
    };
    public func unwrapEntry<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : (K, V) {
        switch (getEntry(__, keyUtil)) {
            case (?entry) entry;
            case (null) E.unreachable()
        }
    };
    public func findKey<K, V>(__ : Self<K, V>, predicate : K -> Bool) : ?K {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat]) {
                case (?someKey) if (predicate(someKey)) return ?someKey;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        null
    };
    public func findVal<K, V>(__ : Self<K, V>, predicate : V -> Bool) : ?V {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };
        let values = data.1;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (values[indexNat]) {
                case (?someValue) if (predicate(someValue)) return ?someValue;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        null
    };
    public func findEntry<K, V>(__ : Self<K, V>, predicate : (K, V) -> Bool) : ?(K, V) {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };
        let keys = data.0;
        let values = data.1;
        let capacity = Prim.natToNat32(keys.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat]) {
                case (?someKey) switch (values[indexNat]) {
                    case (?someValue) if (predicate(someKey, someValue)) return ?(someKey, someValue);
                    case (_) {}
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        null
    };

    public func includes<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>) : Bool {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) return false
        };

        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        var index = data.2 [Prim.nat32ToNat(hash(key) % capacity +% capacity)];

        loop if (index == NULL) {
            return false
        } else if (equal(_unwrap(keys[index]), key)) {
            return true
        } else {
            index := data.2 [index]
        }
    };
    public func excludes<K, V>(__ : Self<K, V>, keyUtil : Key<K>) : Bool {
        not includes(__, keyUtil)
    };
    public func everyKey<K, V>(__ : Self<K, V>, predicate : K -> Bool) : Bool {
        let data = switch (__[DATA]) { case (?data) data; case (_) return true };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat]) {
                case (?someKey) if (not predicate(someKey)) return false;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        true
    };
    public func everyVal<K, V>(__ : Self<K, V>, predicate : V -> Bool) : Bool {
        let data = switch (__[DATA]) { case (?data) data; case (_) return true };
        let values = data.1;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (values[indexNat]) {
                case (?someValue) if (not predicate(someValue)) return false;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        true
    };
    public func someKey<K, V>(__ : Self<K, V>, predicate : K -> Bool) : Bool {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) return false
        };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat]) {
                case (?someKey) if (predicate(someKey)) return true;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        false
    };
    public func someVal<K, V>(__ : Self<K, V>, predicate : V -> Bool) : Bool {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) return false
        };
        let values = data.1;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (values[indexNat]) {
                case (?someValue) if (predicate(someValue)) return true;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        false
    };

    public func foldKeys<K, V, T>(__ : Self<K, V>, base : T, combine : (T, K) -> T) : T {
        let data = switch (__[DATA]) { case (?data) data; case (_) return base };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        var acc = base;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat]) {
                case (?someKey) acc := combine(acc, someKey);
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        acc
    };
    public func foldVals<K, V, T>(__ : Self<K, V>, base : T, combine : (T, V) -> T) : T {
        let data = switch (__[DATA]) { case (?data) data; case (_) return base };
        let values = data.1;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        var acc = base;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (values[indexNat]) {
                case (?someValue) acc := combine(acc, someValue);
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        acc
    };
    public func foldEntriesWhile<K, V, T>(__ : Self<K, V>, base : T, combine : (T, (K, V)) -> T, predicate : (K, V) -> Bool) : T {
        let data = switch (__[DATA]) { case (?data) data; case (_) return base };
        let keys = data.0;
        let values = data.1;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        var acc = base;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat], values[indexNat]) {
                case (?someKey, ?someValue) {
                    switch (predicate(someKey, someValue)) {
                        case (true) acc := combine(acc, (someKey, someValue));
                        case (false) return acc
                    }
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        acc
    };
    public func nextEntry<K, V>(__ : Self<K, V>, { key; equal; hash } : Key<K>) : ?(K, V) {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };
        let keys = data.0;
        let values = data.1;
        let capacity = Prim.natToNat32(keys.size());
        var index = data.2 [Prim.nat32ToNat(hash(key) % capacity +% capacity)];
        loop if (index == NULL) {
            return null
        } else {
            switch (keys[index], values[index]) {
                case (?someKey, ?someValue) return ?(someKey, someValue);
                case (_) {}
            };
            index := data.2 [index]
        }
    };

    public func getKeys<K, V>(__ : Self<K, V>) : [K] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.3 [FRONT];
        Prim.Array_tabulate<K>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index +% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?key) return key;
                    case (_) {}
                }
            },
        )
    };
    public func getKeysMap<K, V, T>(__ : Self<K, V>, f : K -> T) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.3 [FRONT];
        Prim.Array_tabulate<T>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index +% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?key) return f(key);
                    case (_) {}
                }
            },
        )
    };
    public func getVals<K, V>(__ : Self<K, V>) : [V] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.1.size());
        var index = data.3 [FRONT];
        Prim.Array_tabulate<V>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index +% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.1 [indexNat]) {
                    case (?value) return value;
                    case (_) {}
                }
            },
        )
    };
    public func getValsMap<K, V, T>(__ : Self<K, V>, f : V -> T) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.1.size());
        var index = data.3 [FRONT];
        Prim.Array_tabulate<T>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index +% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.1 [indexNat]) {
                    case (?value) return f(value);
                    case (_) {}
                }
            },
        )
    };
    public func getEntries<K, V>(__ : Self<K, V>) : [(K, V)] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.3 [FRONT];
        Prim.Array_tabulate<(K, V)>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index +% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?key) return (key, _unwrap(data.1 [indexNat]));
                    case (_) {}
                }
            },
        )
    };
    public func getEntriesMap<K, V, T>(__ : Self<K, V>, f : ((K, V)) -> T) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.3 [FRONT];
        Prim.Array_tabulate<T>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index +% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?key) return f((key, _unwrap(data.1 [indexNat])));
                    case (_) {}
                }
            },
        )
    };

    public func getKeysFilter<K, V>(__ : Self<K, V>, predicate : K -> Bool) : [K] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        var array = [var null, null] : [var ?K];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat]) {
                case (?someKey) {
                    switch (predicate(someKey)) {
                        case (true) {
                            if (arrayIndex == arraySize) {
                                let prevArray = array;
                                arraySize *%= 2;
                                array := Prim.Array_init<?K>(Prim.nat32ToNat(arraySize), null);
                                arrayIndex := 0;
                                for (key in prevArray.vals()) {
                                    array[Prim.nat32ToNat(arrayIndex)] := key;
                                    arrayIndex +%= 1
                                }
                            };
                            array[Prim.nat32ToNat(arrayIndex)] := ?someKey;
                            arrayIndex +%= 1
                        };
                        case (false) {}
                    }
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<K>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };
    public func getValsFilter<K, V>(__ : Self<K, V>, predicate : V -> Bool) : [V] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let values = data.1;
        let capacity = Prim.natToNat32(values.size());
        var array = [var null, null] : [var ?V];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (values[indexNat]) {
                case (?someValue) {
                    switch (predicate(someValue)) {
                        case (true) {
                            if (arrayIndex == arraySize) {
                                let prevArray = array;
                                arraySize *%= 2;
                                array := Prim.Array_init<?V>(Prim.nat32ToNat(arraySize), null);
                                arrayIndex := 0;
                                for (value in prevArray.vals()) {
                                    array[Prim.nat32ToNat(arrayIndex)] := value;
                                    arrayIndex +%= 1
                                }
                            };
                            array[Prim.nat32ToNat(arrayIndex)] := ?someValue;
                            arrayIndex +%= 1
                        };
                        case (false) {}
                    }
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<V>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };
    public func getEntriesFilter<K, V>(__ : Self<K, V>, predicate : (K, V) -> Bool) : [(K, V)] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let keys = data.0;
        let values = data.1;
        let capacity = Prim.natToNat32(keys.size());
        var array = [var null, null] : [var ?(K, V)];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat], values[indexNat]) {
                case (?someKey, ?someValue) {
                    switch (predicate(someKey, someValue)) {
                        case (true) {
                            if (arrayIndex == arraySize) {
                                let prevArray = array;
                                arraySize *%= 2;
                                array := Prim.Array_init<?(K, V)>(Prim.nat32ToNat(arraySize), null);
                                arrayIndex := 0;
                                for (entry in prevArray.vals()) {
                                    array[Prim.nat32ToNat(arrayIndex)] := entry;
                                    arrayIndex +%= 1
                                }
                            };
                            array[Prim.nat32ToNat(arrayIndex)] := ?(someKey, someValue);
                            arrayIndex +%= 1
                        };
                        case (false) {}
                    }
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<(K, V)>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };
    public func getKeysFilterMap<K, V, T>(__ : Self<K, V>, f : K -> ?T) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let keys = data.0;
        let capacity = Prim.natToNat32(keys.size());
        var array = [var null, null] : [var ?T];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat]) {
                case (?someKey) {
                    switch (f(someKey)) {
                        case (?mapped) {
                            if (arrayIndex == arraySize) {
                                let prevArray = array;
                                arraySize *%= 2;
                                array := Prim.Array_init<?T>(Prim.nat32ToNat(arraySize), null);
                                arrayIndex := 0;
                                for (key in prevArray.vals()) {
                                    array[Prim.nat32ToNat(arrayIndex)] := key;
                                    arrayIndex +%= 1
                                }
                            };
                            array[Prim.nat32ToNat(arrayIndex)] := ?mapped;
                            arrayIndex +%= 1
                        };
                        case (null) {}
                    }
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<T>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };
    public func getValsFilterMap<K, V, T>(__ : Self<K, V>, f : V -> ?T) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let values = data.1;
        let capacity = Prim.natToNat32(values.size());
        var array = [var null, null] : [var ?T];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (values[indexNat]) {
                case (?someValue) {
                    switch (f(someValue)) {
                        case (?mapped) {
                            if (arrayIndex == arraySize) {
                                let prevArray = array;
                                arraySize *%= 2;
                                array := Prim.Array_init<?T>(Prim.nat32ToNat(arraySize), null);
                                arrayIndex := 0;
                                for (value in prevArray.vals()) {
                                    array[Prim.nat32ToNat(arrayIndex)] := value;
                                    arrayIndex +%= 1
                                }
                            };
                            array[Prim.nat32ToNat(arrayIndex)] := ?mapped;
                            arrayIndex +%= 1
                        };
                        case (null) {}
                    }
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<T>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };
    public func getEntriesFilterMap<K, V, T>(__ : Self<K, V>, f : (K, V) -> ?T) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let keys = data.0;
        let values = data.1;
        let capacity = Prim.natToNat32(keys.size());
        var array = [var null, null] : [var ?T];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.3 [BACK];
        var index = (data.3 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            let indexNat = Prim.nat32ToNat(index);
            switch (keys[indexNat], values[indexNat]) {
                case (?someKey, ?someValue) {
                    switch (f((someKey, someValue))) {
                        case (?mapped) {
                            if (arrayIndex == arraySize) {
                                let prevArray = array;
                                arraySize *%= 2;
                                array := Prim.Array_init<?T>(Prim.nat32ToNat(arraySize), null);
                                arrayIndex := 0;
                                for (entry in prevArray.vals()) {
                                    array[Prim.nat32ToNat(arrayIndex)] := entry;
                                    arrayIndex +%= 1
                                }
                            };
                            array[Prim.nat32ToNat(arrayIndex)] := ?mapped;
                            arrayIndex +%= 1
                        };
                        case (null) {}
                    }
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<T>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };

    public func getKeysRev<K, V>(__ : Self<K, V>) : [K] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.3 [BACK];
        Prim.Array_tabulate<K>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index -% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?key) return key;
                    case (_) {}
                }
            },
        )
    };
    public func getValsRev<K, V>(__ : Self<K, V>) : [V] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.1.size());
        var index = data.3 [BACK];
        Prim.Array_tabulate<V>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index -% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.1 [indexNat]) {
                    case (?value) return value;
                    case (_) {}
                }
            },
        )
    };
    public func getEntriesRev<K, V>(__ : Self<K, V>) : [(K, V)] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.3 [BACK];
        Prim.Array_tabulate<(K, V)>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index -% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?key) return (key, _unwrap(data.1 [indexNat]));
                    case (_) {}
                }
            },
        )
    };
    public func getEntriesRevMap<K, V, T>(__ : Self<K, V>, f : ((K, V)) -> T) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.3 [BACK];
        Prim.Array_tabulate<T>(
            Prim.nat32ToNat(data.3 [SIZE]),
            func(i) = loop {
                index := (index -% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?key) return f((key, _unwrap(data.1 [indexNat])));
                    case (_) {}
                }
            },
        )
    }
}
