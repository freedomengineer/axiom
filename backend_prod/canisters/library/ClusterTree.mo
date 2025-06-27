import Base "Base";
import Tree "Tree";
import Iter "Iter";

import List "mo:base/List";
import Array "mo:base/Array";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type Order = Base.Order;

    private type Compare<T> = Base.Compare<T>;
    private type Tree<K, V> = Tree.Tree<K, V>;
    private type Key<K> = Tree.Key<K>;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Take = { #trim : Nat; #all };
    public type Cluster<V> = List<V>;

    /// LIBRARY ////// ORDER MAP ////////////

    private type Self<K, V> = ClusterTree<K, V>;

    public type ClusterTree<K, V> = Tree<K, Cluster<V>>;
    public func new<K, V>() : Self<K, V> = Tree.new<K, Cluster<V>>();

    /// PUBLIC ////// MODIFIERS ////////////

    public func put<K, V>(__ : Self<K, V>, keyUtil : Key<K>, value : V) {
        switch (Tree.get(__, keyUtil)) {
            case (null) Tree.put(__, keyUtil, List.make(value));
            case (?e) Tree.put(__, keyUtil, List.push<V>(value, e))
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getCompressedVals<K, V>(__ : Self<K, V>, order : Order) : [Cluster<V>] {
        switch (order) {
            case (#ascending) Tree.getVals(__);
            case (#descending) Tree.getValsRev(__)
        }
    };
    public func getCompressedEntries<K, V>(__ : Self<K, V>, order : Order) : [(K, Cluster<V>)] {
        switch (order) {
            case (#ascending) Tree.getEntries(__);
            case (#descending) Tree.getEntriesRev(__)
        }
    };

    public func getFlattenVals<K, V>(__ : Self<K, V>, take : Take, order : Order) : [V] {
        let e : Iter<Cluster<V>> = switch (order) {
            case (#ascending) Tree.vals(__);
            case (#descending) Tree.valsRev(__)
        };
        let f : Cluster<V> = List.flatten(Iter.toList<Cluster<V>>(e));
        switch (take) {
            case (#trim(n)) Array.take(List.toArray(f), -n);
            case (#all) List.toArray(f)
        }
    };
    public func getFlattenEntries<K, V>(__ : Self<K, V>, take : Take, order : Order) : [(K, V)] {
        // flip the order of the entries instead of reversing the List
        let e : Iter<(K, Cluster<V>)> = switch (order) {
            case (#ascending) Tree.entriesRev(__);
            case (#descending) Tree.entries(__)
        };
        var f : Cluster<(K, V)> = List.nil<(K, V)>();
        for ((k, v) in e) {
            List.iterate<V>(List.reverse(v), func(e) = f := List.push((k, e), f))
        };
        switch (take) {
            case (#trim(n)) Array.take(List.toArray(f), -n);
            case (#all) List.toArray(f)
        }
    }
}
