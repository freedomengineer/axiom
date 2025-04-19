import DoubleRank "../../../library/doubletree/DoubleRank";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    /// AXIOMS ////// RANK ////////////

    public type Rank = {
        hypothesisId : Nat;
        averageRank : Float;
        regularEntry : DoubleRank.Entry;
        poweredEntry : DoubleRank.Entry
    };
    public type Sharable = Rank;

    public func init(hypothesisId : Nat, averageRank : Float, regularEntry : DoubleRank.Entry, poweredEntry : DoubleRank.Entry) : Rank = {
        hypothesisId;
        averageRank;
        regularEntry;
        poweredEntry
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func toSharable(__ : Rank) : Sharable = __
}
