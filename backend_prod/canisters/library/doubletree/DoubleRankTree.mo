import Double "Double";
import DoubleRank "DoubleRank";

import ClusterTree "../ClusterTree";
import Base "../Base";
import Tree "../Tree";

import Float "mo:base/Float";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Compare<T> = Base.Compare<T>;
    private type Tree<K, V> = Tree.Tree<K, V>;
    private type Key<T> = Tree.Key<T>;

    private type Variant<T> = Double.Variant<T>;
    private type Entry = DoubleRank.Entry;
    private type DoubleRank = DoubleRank.DoubleRank;
    private type ClusterTree<K, V> = ClusterTree.ClusterTree<K, V>;

    private let { FloatKey } = Tree;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Take = { #trim : Nat; #all };
    public type Ranking<T> = { key : T } and DoubleRank.Sharable;

    /// LIBRARY ////// DOUBLE RANK TREE ////////////

    private type Self<T> = Tree<T, DoubleRank>;

    public type DoubleRankTree<T> = Self<T>;
    public func new<T>() : Self<T> = Tree.new<T, DoubleRank>();

    /// PUBLIC ////// MODIFIERS ////////////

    public func put<T>(__ : Self<T>, key : Key<T>, value : Variant<Entry>) {
        switch (Tree.get(__, key)) {
            case (null) Tree.put(__, key, DoubleRank.make(value));
            case (?e) DoubleRank.add(e, value)
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getAverageRankTree<T>(__ : Self<T>) : ClusterTree<Float, Ranking<T>> {
        let tree = ClusterTree.new<Float, Ranking<T>>();
        for ((key, doubleRank) in Tree.entries(__)) {
            let averageRank : Float = DoubleRank.getAverageRank(doubleRank);
            let doubleRanking : Ranking<T> = {
                DoubleRank.toSharable(doubleRank) with key
            };
            ClusterTree.put(tree, FloatKey(averageRank), doubleRanking)
        };
        tree
    }
}
