import Prim "mo:⛔";

import List "List";
import Iter "Iter";
import Array "Array";

import Nat "mo:base/Nat";
import Option "mo:base/Option";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;

    private func _createEmptyNode<T>(dimensions : [Nat], level : Nat) : Node<T> {
        if (level == 0) {
            #Leaf(Array.init<?T>(dimensions[0], null))
        } else {
            #Branch(Array.init<?Node<T>>(dimensions[level], null))
        }
    };

    private func _getLeaf<T>(dimensions : [Nat], root : [var ?Node<T>], leafIndex : Nat) : ?[var ?T] {
        let depth = dimensions.size();
        var cap = 1;
        var i = 1;
        while (i < depth) {
            cap *= dimensions[i];
            i += 1
        };
        let topCap = cap;

        let topIndex = leafIndex / topCap;
        if (topIndex >= root.size()) return null;

        var currentNode = root[topIndex];
        if (Option.isNull(currentNode)) return null;

        var rem = leafIndex % topCap;
        var l = depth - 1;
        while (l > 0) {
            cap /= dimensions[l];
            let idx = rem / cap;
            rem %= cap;
            switch (currentNode) {
                case (? #Branch(arr)) { currentNode := arr[idx] };
                case (_) Prim.trap("MultiDimArray logic error: expected Branch")
            };
            if (Option.isNull(currentNode)) return null;
            l -= 1
        };

        switch (currentNode) {
            case (? #Leaf(arr)) return ?arr;
            case (_) return null
        }
    };

    /// LIBRARY ////// MULTI-DIMENSIONAL ARRAY ////////////

    public type Node<T> = {
        #Leaf : [var ?T];
        #Branch : [var ?Node<T>]
    };

    private type Self<T> = MultiDimArray<T>;

    public type MultiDimArray<T> = {
        dimensions : [Nat];
        var root : [var ?Node<T>];
        var totalChunks : Nat;
        var lastChunkSize : Nat
    };

    public func new<T>(dimensions : [Nat]) : Self<T> {
        if (dimensions.size() == 0) Prim.trap("MultiDimArray: dimensions must not be empty");
        for (dimension in dimensions.vals()) {
            if (dimension == 0) Prim.trap("MultiDimArray: dimensions must not be zero")
        };
        {
            dimensions;
            var root = [var];
            var totalChunks = 0;
            var lastChunkSize = 0
        }
    };

    /// PRIVATE ////// MODIFIERS ////////////

    private func _setLeaf<T>(__ : Self<T>, leafIndex : Nat, leaf : ?[var ?T]) {
        let dimensions = __.dimensions;
        let depth = dimensions.size();
        var cap = 1;
        var i = 1;
        while (i < depth) {
            cap *= dimensions[i];
            i += 1
        };
        let topCap = cap;

        let topIndex = leafIndex / topCap;

        // Ensure root capacity only when inserting (not deleting)
        if (topIndex >= __.root.size()) {
            if (Option.isNull(leaf)) return;
            var newSize = __.root.size() * 2;
            if (newSize <= topIndex) newSize := topIndex + 1;
            let newRoot = Array.init<?Node<T>>(newSize, null);
            var j = 0;
            while (j < __.root.size()) {
                newRoot[j] := __.root[j];
                j += 1
            };
            __.root := newRoot
        };

        if (Option.isNull(__.root[topIndex])) {
            if (Option.isNull(leaf)) return;
            __.root[topIndex] := ?_createEmptyNode<T>(dimensions, depth - 1)
        };

        var parentArr : [var ?Node<T>] = switch (__.root[topIndex]) {
            case (? #Branch(a)) a;
            case (? #Leaf(_)) {
                // Special case: depth == 1, root directly holds leaves
                switch (leaf) {
                    case (?l) __.root[topIndex] := ? #Leaf(l);
                    case (null) __.root[topIndex] := null
                };
                return
            };
            case (null) Prim.trap("MultiDimArray logic error: missing top node")
        };

        var rem = leafIndex % topCap;
        var l = depth - 1;

        while (l > 1) {
            cap /= dimensions[l];
            let idx = rem / cap;
            rem %= cap;

            if (Option.isNull(parentArr[idx])) {
                if (Option.isNull(leaf)) return;
                parentArr[idx] := ?_createEmptyNode<T>(dimensions, l - 1)
            };

            parentArr := switch (parentArr[idx]) {
                case (? #Branch(a)) a;
                case (_) Prim.trap("MultiDimArray logic error: expected Branch")
            };
            l -= 1
        };

        let leafIdx = rem;
        switch (leaf) {
            case (?l) parentArr[leafIdx] := ? #Leaf(l);
            case (null) parentArr[leafIdx] := null
        }
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func push<T>(__ : Self<T>, item : T) {
        let chunkSize = __.dimensions[0];
        if (__.lastChunkSize == chunkSize) {
            __.totalChunks += 1;
            __.lastChunkSize := 0
        };

        let leafNodeOpt = _getLeaf(__.dimensions, __.root, __.totalChunks);
        let leafArr : [var ?T] = switch (leafNodeOpt) {
            case (null) {
                let newArr = Array.init<?T>(chunkSize, null);
                _setLeaf(__, __.totalChunks, ?newArr);
                newArr
            };
            case (?arr) arr
        };

        leafArr[__.lastChunkSize] := ?item;
        __.lastChunkSize += 1
    };

    public func deleteFirstChunks<T>(__ : Self<T>, firstLevelChunks : Nat) {
        if (firstLevelChunks == 0) return;

        let totalLeaves = if (__.lastChunkSize > 0) __.totalChunks + 1 else __.totalChunks;

        if (firstLevelChunks >= totalLeaves) {
            clear(__);
            return
        };

        // Physically shift leaves to the left
        var i = firstLevelChunks;
        while (i < totalLeaves) {
            let leafOpt = _getLeaf(__.dimensions, __.root, i);
            _setLeaf(__, i - firstLevelChunks, leafOpt);
            i += 1
        };

        // Nullify trailing leaves correctly to free internal memory
        i := totalLeaves - firstLevelChunks;
        while (i < totalLeaves) {
            _setLeaf(__, i, null);
            i += 1
        };

        // Update exact state matching the shift
        if (__.totalChunks >= firstLevelChunks) {
            __.totalChunks -= firstLevelChunks
        } else {
            __.totalChunks := 0;
            __.lastChunkSize := 0
        };

        // Clean up empty top-level roots bounds completely
        let depth = __.dimensions.size();
        var topCap = 1;
        var j = 1;
        while (j < depth) {
            topCap *= __.dimensions[j];
            j += 1
        };

        let newTotalLeaves = if (__.lastChunkSize > 0) __.totalChunks + 1 else __.totalChunks;
        let requiredTopNodes = (newTotalLeaves + topCap - 1) / topCap;

        j := requiredTopNodes;
        while (j < __.root.size()) {
            __.root[j] := null;
            j += 1
        }
    };

    public func clear<T>(__ : Self<T>) {
        __.root := [var];
        __.totalChunks := 0;
        __.lastChunkSize := 0
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size<T>(__ : Self<T>) : Nat {
        __.totalChunks * __.dimensions[0] + __.lastChunkSize
    };

    public func isEmpty<T>(__ : Self<T>) : Bool {
        size(__) == 0
    };

    public func get<T>(__ : Self<T>, index : Nat) : ?T {
        let chunkSize = __.dimensions[0];
        let leafIndex = index / chunkSize;
        let itemIndex = index % chunkSize;

        if (leafIndex > __.totalChunks or (leafIndex == __.totalChunks and itemIndex >= __.lastChunkSize)) {
            return null
        };

        let leafNodeOpt = _getLeaf(__.dimensions, __.root, leafIndex);
        switch (leafNodeOpt) {
            case (null) return null;
            case (?arr) return arr[itemIndex]
        }
    };

    public func toArray<T>(__ : Self<T>) : [T] {
        let total = size(__);
        Prim.Array_tabulate<T>(
            total,
            func(i) = switch (get(__, i)) {
                case (?v) v;
                case (null) Prim.trap("MultiDimArray logic error: item missing")
            },
        )
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func valsRange<T>(__ : Self<T>, start : Nat, end : Nat) : Iter.Iter<T> {
        var currentIndex = start;
        let total = size(__);
        let actualEnd = if (end < total) end else (if (total > 0) total - 1 else 0);
        let valid = start < total and start <= actualEnd;

        object {
            public func next() : ?T {
                if (not valid or currentIndex > actualEnd) return null;
                let val = get(__, currentIndex);
                currentIndex += 1;
                return val
            }
        }
    };

    public func entriesRange<T>(__ : Self<T>, start : Nat, end : Nat) : Iter.Iter<(Nat, T)> {
        var currentIndex = start;
        let total = size(__);
        let actualEnd = switch (end < total) {
            case (true) end;
            case (false) switch (total > 0) {
                case (true) total - 1;
                case (false) 0
            }
        };
        let valid = start < total and start <= actualEnd;

        object {
            public func next() : ?(Nat, T) {
                if (not valid or currentIndex > actualEnd) return null;
                let val = (currentIndex, get(__, currentIndex));
                currentIndex += 1;
                switch (val) {
                    case (i, ?v) ?(i, v);
                    case (_, null) null
                }
            }
        }
    };

    public func vals<T>(__ : Self<T>) : Iter.Iter<T> {
        let total = size(__);
        if (total == 0) return valsRange(__, 0, 0);
        valsRange(__, 0, total - 1)
    }
}
