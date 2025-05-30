import Double "Double";
import DoubleRank "DoubleRank";
import DoubleRankTree "DoubleRankTree";

import Base "../Base";
import ClusterTree "../ClusterTree";
import Tree "../Tree";

import List "mo:base/List";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Float "mo:base/Float";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Compare<T> = Base.Compare<T>;
    private type Key<T> = Tree.Key<T>;
    private type List<T> = List.List<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type SharableDouble<T> = Double.Sharable<T>;
    private type Double<T> = Double.Sharable<T>;
    private type Variant<T> = Double.Variant<T>;
    private type Cluster<V> = ClusterTree.Cluster<V>;
    private type ClusterTree<K, V> = ClusterTree.ClusterTree<K, V>;
    private type Ranking<T> = DoubleRankTree.Ranking<T>;
    private type Entry = DoubleRank.Entry;

    private let { IntKey } = Tree;

    /// PUBLIC ////// DECLARATIONS ////////////

    public func getAverageRankTreeFromArray<T>(arr : [T], scores : T -> (Int, Int), compare : Compare<T>) : ClusterTree<Float, Ranking<T>> {
        let __ : Self<T> = new<T>();
        for (key in arr.vals()) {
            let (a, b) = scores(key);
            put(__, a, b, key)
        };
        getAverageRankTree(__, compare)
    };
    public func getAverageRankTreeFromList<T>(list : List<T>, scores : T -> ?(Int, Int), compare : Compare<T>) : ClusterTree<Float, Ranking<T>> {
        let __ : Self<T> = new<T>();
        for (key in List.toIter(list)) {
            switch (scores(key)) {
                case (?(a, b)) put(__, a, b, key);
                case (null) {}
            }
        };
        getAverageRankTree(__, compare)
    };
    public func getAverageRankTreeFromIter<T>(iter : Iter<T>, scores : T -> ?(Int, Int), compare : Compare<T>) : ClusterTree<Float, Ranking<T>> {
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

    private type Self<T> = Double<ClusterTree<Int, T>>;

    public type DoubleClusterTree<T> = Self<T>;
    public func new<T>() : Self<T> = {
        a = ClusterTree.new<Int, T>();
        b = ClusterTree.new<Int, T>()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func put<T>(__ : Self<T>, value1 : Int, value2 : Int, key : T) {
        ClusterTree.put(__.a, IntKey(value1), key);
        ClusterTree.put(__.b, IntKey(value2), key)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getAverageRankTree<T>(__ : Self<T>, compare : Compare<T>) : ClusterTree<Float, Ranking<T>> {
        let a : [(Int, Cluster<T>)] = ClusterTree.getCompressedEntries(__.a, #descending);
        let b : [(Int, Cluster<T>)] = ClusterTree.getCompressedEntries(__.b, #descending);
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
