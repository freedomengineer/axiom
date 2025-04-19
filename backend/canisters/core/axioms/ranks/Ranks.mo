import Rank "Rank";

import List "../../../library/List";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;

    private type Rank = Rank.Rank;
    private type SharableRank = Rank.Sharable;

    /// AXIOMS ////// RANKS ////////////

    private type Self = Ranks;

    public type Ranks = List<Rank>;
    public type Sharable = [SharableRank];

    public func init() : Self = List.nil();

    /// PUBLIC ////// ACCESSORS ////////////

    public func toSharable(__ : Self) : Sharable = List.toArrayMap<Rank, SharableRank>(__, Rank.toSharable)
}
