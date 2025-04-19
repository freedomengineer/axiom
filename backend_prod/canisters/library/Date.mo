import C "../common/Constants";

import Int "mo:base/Int";
import Time "mo:base/Time";

module {

    /// PUBLIC ////// DECLARATIONS ////////////

    public type DateInput = {
        day : Nat;
        month : Nat;
        year : Nat
    };

    /// LIBRARY ////// DATE ////////////

    private type Self = Date;
    public type Sharable = Nat;

    public type Date = Int;

    public func new() : Self = make(Time.now());
    public func make(time : Int) : Self = time;

    /// PUBLIC ////// ACCESSORS ////////////

    public func getMidnightsElapsed(__ : Self, x : Self) : Nat = Int.abs(__ / C.ONE_DAY - x / C.ONE_DAY);
    public func getFullDaysElapsed(__ : Self, x : Self) : Nat = Int.abs((__ - x) / C.ONE_DAY);

    public func getNextYears(__ : Self, years : Nat) : Self = make(__ + Int.abs(years) * C.DAYS_IN_YEAR * C.ONE_DAY);
    public func getNextDays(__ : Self, days : Nat) : Self = make(__ + Int.abs(days) * C.ONE_DAY);

    public func gt(__ : Self, x : Self) : Bool = __ > x;
    public func gte(__ : Self, x : Self) : Bool = __ >= x;
    public func lt(__ : Self, x : Self) : Bool = __ < x;
    public func lte(__ : Self, x : Self) : Bool = __ <= x;

    public func daysGt(__ : Self, x : Self) : Bool = __ / C.ONE_DAY > x / C.ONE_DAY;
    public func daysGte(__ : Self, x : Self) : Bool = __ / C.ONE_DAY >= x / C.ONE_DAY;
    public func daysLt(__ : Self, x : Self) : Bool = __ / C.ONE_DAY < x / C.ONE_DAY;
    public func daysLte(__ : Self, x : Self) : Bool = __ / C.ONE_DAY <= x / C.ONE_DAY;

    public func toSharable(__ : Self) : Sharable = Int.abs(__)
}
