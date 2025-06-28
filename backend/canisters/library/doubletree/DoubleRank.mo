import Double "Double";

import Float "mo:base/Float";

module {
    private type SharableDouble<T> = Double.Sharable<T>;
    private type Double<T> = Double.Double<T>;
    private type Variant<T> = Double.Variant<T>;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Entry = { rank : Int; score : Int };

    /// LIBRARY ////// DOUBLE RANK ////////////

    private type Self = Double<Entry>;

    public type DoubleRank = Self;
    public func make(init : Variant<Entry>) : Self = {
        var a = switch (init) {
            case (#a(a)) a;
            case (_) { { rank = 0; score = 0 } }
        };
        var b = switch (init) {
            case (#b(b)) b;
            case (_) { { rank = 0; score = 0 } }
        }
    };

    public type Sharable = SharableDouble<Entry>;

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, rank : Variant<Entry>) {
        switch (rank) {
            case (#a(a)) __.a := a;
            case (#b(b)) __.b := b
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getAverageRank(__ : Self) : Float = (Float.fromInt(__.a.rank) + Float.fromInt(__.b.rank)) / 2;
    public func toSharable(__ : Self) : Sharable = { a = __.a; b = __.b }
}
