import E "../common/Errors";

import Hash "mo:base/Hash";
import List "mo:base/List";
import Iter "mo:base/Iter";
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
    private type Iter<T> = Iter.Iter<T>;
    private type List<T> = List.List<T>;

    private let DATA = 0;
    private let FRONT = 0;
    private let BACK = 1;
    private let SIZE = 2;
    private let NULL = 0x3fffffff;
    private let MAX_CAPACITY = 0x3fffffff : Nat32;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Val<K> = { value : K; equal : (K, K) -> Bool; hash : K -> Hash };

    public func TextVal(value : Text) : Val<Text> = {
        value;
        equal = Text.equal;
        hash = Text.hash
    };
    public func CharVal(value : Char) : Val<Char> = {
        value;
        equal = Char.equal;
        hash = func(x) = Text.hash(Char.toText(x))
    };
    public func PrincipalVal(value : Principal) : Val<Principal> = {
        value;
        equal = Principal.equal;
        hash = Principal.hash
    };
    public func FloatVal(value : Float) : Val<Float> = {
        value;
        equal = Float.equal;
        hash = func(x) = Text.hash(Float.toText(x))
    };

    public func IntVal(value : Int) : Val<Int> = {
        value;
        equal = Int.equal;
        hash = Int.hash
    };
    public func Int8Val(value : Int8) : Val<Int8> = {
        value;
        equal = Int8.equal;
        hash = func(x) = Text.hash(Int8.toText(x))
    };
    public func Int16Val(value : Int16) : Val<Int16> = {
        value;
        equal = Int16.equal;
        hash = func(x) = Text.hash(Int16.toText(x))
    };
    public func Int32Val(value : Int32) : Val<Int32> = {
        value;
        equal = Int32.equal;
        hash = func(x) = Text.hash(Int32.toText(x))
    };
    public func Int64Val(value : Int64) : Val<Int64> = {
        value;
        equal = Int64.equal;
        hash = func(x) = Text.hash(Int64.toText(x))
    };

    public func NatVal(value : Nat) : Val<Nat> = {
        value;
        equal = Nat.equal;
        hash = Hash.hash
    };
    public func Nat8Val(value : Nat8) : Val<Nat8> = {
        value;
        equal = Nat8.equal;
        hash = func(x) = Text.hash(Nat8.toText(x))
    };
    public func Nat16Val(value : Nat16) : Val<Nat16> = {
        value;
        equal = Nat16.equal;
        hash = func(x) = Text.hash(Nat16.toText(x))
    };
    public func Nat32Val(value : Nat32) : Val<Nat32> = {
        value;
        equal = Nat32.equal;
        hash = func(x) = Text.hash(Nat32.toText(x))
    };
    public func Nat64Val(value : Nat64) : Val<Nat64> = {
        value;
        equal = Nat64.equal;
        hash = func(x) = Text.hash(Nat64.toText(x))
    };

    /// LIBRARY ////// SET ////////////

    private type Self<T> = Set<T>;

    public type Set<T> = [var ?(values : [var ?T], indices : [var Nat], bounds : [var Nat32])];

    public func new<T>() : Self<T> = [var null];
    public func make<T>({ value; hash } : Val<T>) : Self<T> = [
        var ?(
            [var ?value, null],
            if (hash(value) % 2 == 0)[var NULL, NULL, 0, NULL] else [var NULL, NULL, NULL, 0],
            [var 1, 1, 1],
        )
    ];
    public func fromArray<T>(valueUtils : [Val<T>]) : Self<T> {
        let __ = new<T>();
        putBatch(__, valueUtils);
        __
    };
    public func fromIter<T>(valueUtils : Iter<Val<T>>) : Self<T> {
        let __ = new<T>();
        for (elem in valueUtils) put(__, elem);
        __
    };

    /// PRIVATE ////// MODIFIERS ////////////

    private func _make<T>(__ : Self<T>, { value; hash } : Val<T>) {
        __[DATA] := ?(
            [var ?value, null],
            if (hash(value) % 2 == 0)[var NULL, NULL, 0, NULL] else [var NULL, NULL, NULL, 0],
            [var 1, 1, 1],
        )
    };

    private func _rehash<T>(__ : Self<T>, equal : (T, T) -> Bool, hash : T -> Hash) {
        let data = switch (__[DATA]) { case (?data) data; case (_) return };
        let bounds = data.2;
        let size = bounds[SIZE];
        if (size == 0) return __[DATA] := null;
        let newCapacity = 2 **% (32 -% Prim.clzNat32(Prim.nat64ToNat32(Prim.nat32ToNat64(size) *% 8 / 7)));
        let newCapacityNat = Prim.nat32ToNat(newCapacity);

        if (newCapacity >= MAX_CAPACITY) E.f(#INTERNAL_FAILURE("Set rehashing"), "Set capacity limit reached (2 ** 30)");

        let newKeys = Prim.Array_init<?T>(newCapacityNat, null);
        let newIndexes = Prim.Array_init<Nat>(Prim.nat32ToNat(newCapacity *% 2), NULL);
        var newIndex = 0 : Nat32;
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = (bounds[BACK] -% 1) % capacity;
        var index = bounds[FRONT];
        loop {
            index := (index +% 1) % capacity;
            let indexNat = Prim.nat32ToNat(index);
            let value = values[indexNat];

            switch (value) {
                case (?someKey) {
                    let newIndexNat = Prim.nat32ToNat(newIndex);
                    let hashIndex = Prim.nat32ToNat(hash(someKey) % newCapacity +% newCapacity);
                    newKeys[newIndexNat] := value;
                    newIndexes[newIndexNat] := newIndexes[hashIndex];
                    newIndexes[hashIndex] := newIndexNat;
                    newIndex +%= 1
                };
                case (_) {}
            }
        } while (index != lastIndex);

        __[DATA] := ?(newKeys, newIndexes, bounds);
        bounds[BACK] := newIndex;
        bounds[FRONT] := newCapacity -% 1
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _unwrap<T>(x : ?T) : T = switch (x) {
        case (?x) x;
        case (_) E.unreachable()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func put<T>(__ : Self<T>, { value; equal; hash } : Val<T>) {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) { _make(__, { value; equal; hash }); return }
        };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let hashIndex = Prim.nat32ToNat(hash(value) % capacity +% capacity);
        let indices = data.1;
        let firstIndex = indices[hashIndex];
        var index = firstIndex;
        loop if (index == NULL) {
            let bounds = data.2;
            let back = bounds[BACK];
            let backNat = Prim.nat32ToNat(back);
            bounds[BACK] := (back +% 1) % capacity;
            bounds[SIZE] +%= 1;
            values[backNat] := ?value;
            indices[backNat] := firstIndex;
            indices[hashIndex] := backNat;
            if (back == bounds[FRONT]) _rehash(__, equal, hash);
            return
        } else if (equal(_unwrap(values[index]), value)) {
            return
        } else {
            index := indices[index]
        }
    };
    public func putBatch<T>(__ : Self<T>, valueUtils : [Val<T>]) {
        for (valueUtil in valueUtils.vals()) put(__, valueUtil)
    };
    public func putOnCollision<T>(__ : Self<T>, valueUtil : Val<T>, onCollision : (T, T) -> T) {
        switch (get(__, valueUtil)) {
            case (null) put(__, valueUtil);
            case (?oldKey) put(__, { valueUtil with value = onCollision(oldKey, valueUtil.value) })
        }
    };
    public func replace<T>(__ : Self<T>, { value; equal; hash } : Val<T>) : ?T {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) { _make(__, { value; equal; hash }); return null }
        };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let hashIndex = Prim.nat32ToNat(hash(value) % capacity +% capacity);
        let indices = data.1;
        let firstIndex = indices[hashIndex];
        var index = firstIndex;
        loop if (index == NULL) {
            let bounds = data.2;
            let back = bounds[BACK];
            let backNat = Prim.nat32ToNat(back);
            bounds[BACK] := (back +% 1) % capacity;
            bounds[SIZE] +%= 1;
            values[backNat] := ?value;
            indices[backNat] := firstIndex;
            indices[hashIndex] := backNat;
            if (back == bounds[FRONT]) _rehash(__, equal, hash);
            return null
        } else if (equal(_unwrap(values[index]), value)) {
            let prevKey = values[index];
            values[index] := ?value;
            return prevKey
        } else {
            index := indices[index]
        }
    };

    public func remove<T>(__ : Self<T>, { value; equal; hash } : Val<T>) : ?T {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let hashIndex = Prim.nat32ToNat(hash(value) % capacity +% capacity);
        let indices = data.1;
        var index = indices[hashIndex];
        var prevIndex = NULL;
        loop if (index == NULL) {
            return null
        } else if (equal(_unwrap(values[index]), value)) {
            let value = values[index];
            let bounds = data.2;
            let newSize = bounds[SIZE] -% 1;
            bounds[SIZE] := newSize;
            values[index] := null;
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
                        while (switch (values[Prim.nat32ToNat((front +% 1) % capacity)]) { case (null) true; case (_) false }) {
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
                            while (switch (values[Prim.nat32ToNat((back -% 1) % capacity)]) { case (null) true; case (_) false }) {
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
    public func delete<T>(__ : Self<T>, { value; hash; equal } : Val<T>) {
        let data = switch (__[DATA]) { case (?data) data; case (_) return };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let hashIndex = Prim.nat32ToNat(hash(value) % capacity +% capacity);
        let indices = data.1;
        var index = indices[hashIndex];
        var prevIndex = NULL;
        loop if (index == NULL) {
            return
        } else if (equal(_unwrap(values[index]), value)) {
            let bounds = data.2;
            let newSize = bounds[SIZE] -% 1;
            bounds[SIZE] := newSize;
            values[index] := null;
            if (prevIndex == NULL) indices[hashIndex] := indices[index] else indices[prevIndex] := indices[index];
            if (newSize < (capacity *% 3 +% 2) / 8) {
                _rehash(__, equal, hash)
            } else {
                var front = bounds[FRONT];
                let prevFront = (front +% 1) % capacity;
                let index32 = Prim.natToNat32(index);
                if (index32 == prevFront) {
                    front := prevFront;
                    if (newSize != 0) {
                        while (switch (values[Prim.nat32ToNat((front +% 1) % capacity)]) { case (null) true; case (_) false }) {
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
                            while (switch (values[Prim.nat32ToNat((back -% 1) % capacity)]) { case (null) true; case (_) false }) {
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
    public func clear<T>(__ : Self<T>) {
        __[DATA] := null
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func vals<T>(__ : Self<T>) : Iter<T> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.2 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.2 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = front;
        object {
            public func next() : ?T {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == back) (front +% 1) % capacity else (iterIndex +% 1) % capacity;
                        switch (data.0 [Prim.nat32ToNat(iterIndex)]) {
                            case (null) if (iterIndex == back) return null;
                            case (value) return value
                        }
                    };
                    case (_) null
                }
            }
        }
    };
    public func valsRev<T>(__ : Self<T>) : Iter<T> {
        let dataOpt = __[DATA];
        let capacity = switch (dataOpt) {
            case (?data) Prim.natToNat32(data.0.size());
            case (_) 0 : Nat32
        };
        let front = switch (dataOpt) {
            case (?data) data.2 [FRONT];
            case (_) 0 : Nat32
        };
        let back = switch (dataOpt) {
            case (?data) data.2 [BACK];
            case (_) 0 : Nat32
        };
        var iterIndex = back;
        object {
            public func next() : ?T {
                switch (dataOpt) {
                    case (?data) loop {
                        iterIndex := if (iterIndex == front) (back -% 1) % capacity else (iterIndex -% 1) % capacity;
                        switch (data.0 [Prim.nat32ToNat(iterIndex)]) {
                            case (null) if (iterIndex == front) return null;
                            case (value) return value
                        }
                    };
                    case (_) null
                }
            }
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size<T>(__ : Self<T>) : Nat {
        switch (__[DATA]) {
            case (?data) Prim.nat32ToNat(data.2 [SIZE]);
            case (_) 0
        }
    };
    public func empty<T>(__ : Self<T>) : Bool {
        switch (__[DATA]) {
            case (null) true;
            case (_) false
        }
    };
    public func get<T>(__ : Self<T>, { value; hash; equal } : Val<T>) : ?T {
        let data = switch (__[DATA]) { case (?data) data; case (_) return null };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        var index = data.1 [Prim.nat32ToNat(hash(value) % capacity +% capacity)];
        loop if (index == NULL) {
            return null
        } else if (equal(_unwrap(values[index]), value)) {
            return values[index]
        } else {
            index := data.1 [index]
        }
    };
    public func unwrap<T>(__ : Self<T>, valueUtil : Val<T>) : T {
        switch (get(__, valueUtil)) {
            case (?value) value;
            case (_) E.unreachable()
        }
    };

    public func includes<T>(__ : Self<T>, { value; hash; equal } : Val<T>) : Bool {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) return false
        };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        var index = data.1 [Prim.nat32ToNat(hash(value) % capacity +% capacity)];
        loop if (index == NULL) {
            return false
        } else if (equal(_unwrap(values[index]), value)) {
            return true
        } else {
            index := data.1 [index]
        }
    };
    public func excludes<T>(__ : Self<T>, valueUtil : Val<T>) : Bool {
        not includes(__, valueUtil)
    };
    public func every<T>(__ : Self<T>, predicate : T -> Bool) : Bool {
        let data = switch (__[DATA]) { case (?data) data; case (_) return true };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.2 [BACK];
        var index = (data.2 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            switch (values[Prim.nat32ToNat(index)]) {
                case (?someKey) if (not predicate(someKey)) return false;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        true
    };
    public func some<T>(__ : Self<T>, predicate : T -> Bool) : Bool {
        let data = switch (__[DATA]) {
            case (?data) data;
            case (_) return false
        };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.2 [BACK];
        var index = (data.2 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            switch (values[Prim.nat32ToNat(index)]) {
                case (?someKey) if (predicate(someKey)) return true;
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        false
    };

    public func fold<T, U>(__ : Self<T>, f : (U, T) -> U, init : U) : U {
        let data = switch (__[DATA]) { case (?data) data; case (_) return init };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        let lastIndex = data.2 [BACK];
        var index = (data.2 [FRONT] +% 1) % capacity;
        var acc = init;
        while (index != lastIndex) {
            switch (values[Prim.nat32ToNat(index)]) {
                case (?someKey) acc := f(acc, someKey);
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        acc
    };

    public func toArray<T>(__ : Self<T>) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.2 [FRONT];
        Prim.Array_tabulate<T>(
            Prim.nat32ToNat(data.2 [SIZE]),
            func(i) = loop {
                index := (index +% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?value) return value;
                    case (_) {}
                }
            },
        )
    };
    public func toArrayMap<T, U>(__ : Self<T>, f : T -> U) : [U] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        var array = [var null, null] : [var ?U];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.2 [BACK];
        var index = (data.2 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            switch (values[Prim.nat32ToNat(index)]) {
                case (?someKey) {
                    let value = f(someKey);
                    if (arrayIndex == arraySize) {
                        let prevArray = array;
                        arraySize *%= 2;
                        array := Prim.Array_init<?U>(Prim.nat32ToNat(arraySize), null);
                        arrayIndex := 0;
                        for (item in prevArray.vals()) {
                            array[Prim.nat32ToNat(arrayIndex)] := item;
                            arrayIndex +%= 1
                        }
                    };
                    array[Prim.nat32ToNat(arrayIndex)] := ?value;
                    arrayIndex +%= 1
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<U>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };
    public func toArrayFilter<T>(__ : Self<T>, predicate : T -> Bool) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        var array = [var null, null] : [var ?T];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.2 [BACK];
        var index = (data.2 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            switch (values[Prim.nat32ToNat(index)]) {
                case (?someKey) if (predicate(someKey)) {
                    if (arrayIndex == arraySize) {
                        let prevArray = array;
                        arraySize *%= 2;
                        array := Prim.Array_init<?T>(Prim.nat32ToNat(arraySize), null);
                        arrayIndex := 0;
                        for (item in prevArray.vals()) {
                            array[Prim.nat32ToNat(arrayIndex)] := item;
                            arrayIndex +%= 1
                        }
                    };
                    array[Prim.nat32ToNat(arrayIndex)] := ?someKey;
                    arrayIndex +%= 1
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<T>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };
    public func toArrayFilterMap<T, U>(__ : Self<T>, f : T -> ?U) : [U] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let values = data.0;
        let capacity = Prim.natToNat32(values.size());
        var array = [var null, null] : [var ?U];
        var arraySize = 2 : Nat32;
        var arrayIndex = 0 : Nat32;
        let lastIndex = data.2 [BACK];
        var index = (data.2 [FRONT] +% 1) % capacity;
        while (index != lastIndex) {
            switch (values[Prim.nat32ToNat(index)]) {
                case (?someKey) switch (f(someKey)) {
                    case (?value) {
                        if (arrayIndex == arraySize) {
                            let prevArray = array;
                            arraySize *%= 2;
                            array := Prim.Array_init<?U>(Prim.nat32ToNat(arraySize), null);
                            arrayIndex := 0;
                            for (item in prevArray.vals()) {
                                array[Prim.nat32ToNat(arrayIndex)] := item;
                                arrayIndex +%= 1
                            }
                        };
                        array[Prim.nat32ToNat(arrayIndex)] := ?value;
                        arrayIndex +%= 1
                    };
                    case (_) {}
                };
                case (_) {}
            };
            index := (index +% 1) % capacity
        };
        Prim.Array_tabulate<U>(Prim.nat32ToNat(arrayIndex), func(i) = _unwrap(array[i]))
    };

    public func toArrayRev<T>(__ : Self<T>) : [T] {
        let data = switch (__[DATA]) { case (?data) data; case (_) return [] };
        let capacity = Prim.natToNat32(data.0.size());
        var index = data.2 [BACK];
        Prim.Array_tabulate<T>(
            Prim.nat32ToNat(data.2 [SIZE]),
            func(i) = loop {
                index := (index -% 1) % capacity;
                let indexNat = Prim.nat32ToNat(index);
                switch (data.0 [indexNat]) {
                    case (?value) return value;
                    case (_) {}
                }
            },
        )
    };

    ///

    public func intersection<T>(__ : Self<T>, x : Self<T>, { equal : (T, T) -> Bool; hash : T -> Hash }) : Self<T> {
        let result = new<T>();
        switch (__[DATA], x[DATA]) {
            case (null, _) return result;
            case (_, null) return result;
            case (?data1, ?data2) {
                if (data1.2 [SIZE] > data2.2 [SIZE]) return intersection(x, __, { equal; hash });

                let values1 = data1.0;
                let capacity1 = Prim.natToNat32(values1.size());
                let lastIndex1 = data1.2 [BACK];
                var index1 = (data1.2 [FRONT] +% 1) % capacity1;
                while (index1 != lastIndex1) {
                    switch (values1[Prim.nat32ToNat(index1)]) {
                        case (?value) if (includes(x, { value; equal; hash })) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index1 := (index1 +% 1) % capacity1
                }
            }
        };
        result
    };
    public func union<T>(__ : Self<T>, x : Self<T>, { equal : (T, T) -> Bool; hash : T -> Hash }) : Self<T> {
        let result = new<T>();
        switch (__[DATA]) {
            case (null) {};
            case (?data1) {
                let values1 = data1.0;
                let capacity1 = Prim.natToNat32(values1.size());
                let lastIndex1 = data1.2 [BACK];
                var index1 = (data1.2 [FRONT] +% 1) % capacity1;
                while (index1 != lastIndex1) {
                    switch (values1[Prim.nat32ToNat(index1)]) {
                        case (?value) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index1 := (index1 +% 1) % capacity1
                }
            }
        };
        switch (x[DATA]) {
            case (null) {};
            case (?data2) {
                let values2 = data2.0;
                let capacity2 = Prim.natToNat32(values2.size());
                let lastIndex2 = data2.2 [BACK];
                var index2 = (data2.2 [FRONT] +% 1) % capacity2;
                while (index2 != lastIndex2) {
                    switch (values2[Prim.nat32ToNat(index2)]) {
                        case (?value) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index2 := (index2 +% 1) % capacity2
                }
            }
        };
        result
    };
    public func difference<T>(__ : Self<T>, x : Self<T>, { equal : (T, T) -> Bool; hash : T -> Hash }) : Self<T> {
        let result = new<T>();
        switch (__[DATA]) {
            case (null) return result;
            case (?data1) {
                switch (x[DATA]) {
                    case (null) {
                        let values1 = data1.0;
                        let capacity1 = Prim.natToNat32(values1.size());
                        let lastIndex1 = data1.2 [BACK];
                        var index1 = (data1.2 [FRONT] +% 1) % capacity1;
                        while (index1 != lastIndex1) {
                            switch (values1[Prim.nat32ToNat(index1)]) {
                                case (?value) put(result, { value; equal; hash });
                                case (_) {}
                            };
                            index1 := (index1 +% 1) % capacity1
                        };
                        return result
                    };
                    case (?_) {}
                };
                let values1 = data1.0;
                let capacity1 = Prim.natToNat32(values1.size());
                let lastIndex1 = data1.2 [BACK];
                var index1 = (data1.2 [FRONT] +% 1) % capacity1;
                while (index1 != lastIndex1) {
                    switch (values1[Prim.nat32ToNat(index1)]) {
                        case (?value) if (excludes(x, { value; equal; hash })) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index1 := (index1 +% 1) % capacity1
                }
            }
        };
        result
    };
    public func symmetricDifference<T>(__ : Self<T>, x : Self<T>, { equal : (T, T) -> Bool; hash : T -> Hash }) : Self<T> {
        let result = new<T>();
        switch (__[DATA], x[DATA]) {
            case (null, null) return result;
            case (null, ?data2) {
                let values2 = data2.0;
                let capacity2 = Prim.natToNat32(values2.size());
                let lastIndex2 = data2.2 [BACK];
                var index2 = (data2.2 [FRONT] +% 1) % capacity2;
                while (index2 != lastIndex2) {
                    switch (values2[Prim.nat32ToNat(index2)]) {
                        case (?value) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index2 := (index2 +% 1) % capacity2
                };
                return result
            };
            case (?data1, null) {
                let values1 = data1.0;
                let capacity1 = Prim.natToNat32(values1.size());
                let lastIndex1 = data1.2 [BACK];
                var index1 = (data1.2 [FRONT] +% 1) % capacity1;
                while (index1 != lastIndex1) {
                    switch (values1[Prim.nat32ToNat(index1)]) {
                        case (?value) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index1 := (index1 +% 1) % capacity1
                };
                return result
            };
            case (?data1, ?data2) {
                let values1 = data1.0;
                let capacity1 = Prim.natToNat32(values1.size());
                let lastIndex1 = data1.2 [BACK];
                var index1 = (data1.2 [FRONT] +% 1) % capacity1;
                while (index1 != lastIndex1) {
                    switch (values1[Prim.nat32ToNat(index1)]) {
                        case (?value) if (excludes(x, { value; equal; hash })) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index1 := (index1 +% 1) % capacity1
                };
                let values2 = data2.0;
                let capacity2 = Prim.natToNat32(values2.size());
                let lastIndex2 = data2.2 [BACK];
                var index2 = (data2.2 [FRONT] +% 1) % capacity2;
                while (index2 != lastIndex2) {
                    switch (values2[Prim.nat32ToNat(index2)]) {
                        case (?value) if (excludes(__, { value; equal; hash })) put(result, { value; equal; hash });
                        case (_) {}
                    };
                    index2 := (index2 +% 1) % capacity2
                }
            }
        };
        result
    }
}
