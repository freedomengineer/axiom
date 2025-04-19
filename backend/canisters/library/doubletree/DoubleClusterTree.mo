import Double "Double";
import DoubleRank "DoubleRank";
import DoubleRankTree "DoubleRankTree";

import Base "../Base";
import ClusterTree "../ClusterTree";
import Tree "../Tree";

import List "mo:base/List";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Float "mo:base/Float";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Compare<T> = Base.Compare<T>;
    private type Key<T> = Tree.Key<T>;

    private type SharableDouble<T> = Double.Sharable<T>;
    private type Double<T> = Double.Sharable<T>;
    private type Variant<T> = Double.Variant<T>;
    private type Cluster<V> = ClusterTree.Cluster<V>;
    private type ClusterTree<K, V> = ClusterTree.ClusterTree<K, V>;
    private type Ranking<T> = DoubleRankTree.Ranking<T>;
    private type Entry = DoubleRank.Entry;

    private let { NatKey } = Tree;

    /// PUBLIC ////// DECLARATIONS ////////////

    public func getAverageRankTreeFromArray<T>(arr : [T], scores : T -> (Nat, Nat), compare : Compare<T>) : ClusterTree<Float, Ranking<T>> {
        let __ : Self<T> = new<T>();
        for (key in arr.vals()) {
            let (a, b) = scores(key);
            put(__, a, b, key)
        };
        getAverageRankTree(__, compare)
    };
    public func getAverageRankTreeFromIter<T>(iter : Iter.Iter<T>, scores : T -> ?(Nat, Nat), compare : Compare<T>) : ClusterTree<Float, Ranking<T>> {
        let __ : Self<T> = new<T>();
        for (key in iter) {
            switch (scores(key)) {
                case (?(a, b)) put(__, a, b, key);
                case (null) {}
            }
        };
        getAverageRankTree(__, compare)
    };

    /// LIBRARY ////// DOUBLE CLUSTER TREE ////////////

    private type Self<T> = Double<ClusterTree<Nat, T>>;

    public type DoubleClusterTree<T> = Self<T>;
    public func new<T>() : Self<T> = {
        a = ClusterTree.new<Nat, T>();
        b = ClusterTree.new<Nat, T>()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func put<T>(__ : Self<T>, value1 : Nat, value2 : Nat, key : T) {
        ClusterTree.put(__.a, NatKey(value1), key);
        ClusterTree.put(__.b, NatKey(value2), key)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getAverageRankTree<T>(__ : Self<T>, compare : Compare<T>) : ClusterTree<Float, Ranking<T>> {
        let a : [(Nat, Cluster<T>)] = ClusterTree.getCompressedEntries(__.a, #descending);
        let b : [(Nat, Cluster<T>)] = ClusterTree.getCompressedEntries(__.b, #descending);
        let s = DoubleRankTree.new<T>();
        for (rank in a.keys()) {
            for (key in List.toIter(a[rank].1)) {
                let entry : Entry = { rank; score = a[rank].0 };
                DoubleRankTree.put(s, { key; compare }, #a(entry))
            }
        };
        for (rank in b.keys()) {
            for (key in List.toIter(b[rank].1)) {
                let entry : Entry = { rank; score = b[rank].0 };
                DoubleRankTree.put(s, { key; compare }, #b(entry))
            }
        };
        DoubleRankTree.getAverageRankTree(s)
    }
}
