import Coupon "Coupon";
import User "../users/User";
import Actor "../../../periphery/indicator/actors/Actor";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Base "../../../library/Base";
import Earning "../../../library/Earning";
import List "../../../library/List";
import Map "../../../library/Map";
import SHA256 "../../../library/SHA256";

import Int "mo:base/Int";
import Nat "mo:base/Nat";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;

    private type ActorVariant = Actor.Variant;
    private type User = User.User;
    private type Coupon = Coupon.Coupon;
    private type Earning = Earning.Earning;
    private type SharableEarning = Earning.Sharable;
    private type SharableCoupon = Coupon.Sharable;
    private type PrivateSharableCoupon = Coupon.PrivateSharable;
    private type StatusVariant = Coupon.StatusVariant;

    private let { TextKey = Key } = Map;

    private func _capitalRaised(x : Nat) : Entry -> Bool = func(_, e) = e.capitalRaised == x;
    private func _status(x : StatusVariant) : Entry -> Bool = func(_, e) = Coupon.variant(e) == x;

    private func _recent(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(a.creationDate, b.creationDate);
        case (#descending) func((_, a), (_, b)) = Int.compare(b.creationDate, a.creationDate)
    };
    private func _icpPaidNormal(orderBy : Order) : Compare<SharableCoupon> = switch (orderBy) {
        case (#ascending) func(a, b) = Nat.compare(a.icpPaid, b.icpPaid);
        case (#descending) func(a, b) = Nat.compare(b.icpPaid, a.icpPaid)
    };
    private func _icpPaidPrivate(orderBy : Order) : Compare<PrivateSharableCoupon> = switch (orderBy) {
        case (#ascending) func(a, b) = Nat.compare(a.icpPaid, b.icpPaid);
        case (#descending) func(a, b) = Nat.compare(b.icpPaid, a.icpPaid)
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        creator : ?Principal;
        capitalRaised : ?Nat;
        status : ?StatusVariant
    };
    public type Sort = {
        #recent;
        #icpPaid
    };

    public type PrivateFilter = {
        capitalRaised : ?Nat;
        status : ?StatusVariant
    };
    public type PrivateSort = Sort;

    private type Entry = (Text, Coupon);

    /// SALES ////// COUPONS ////////////

    private type Self = Coupons;

    public type Coupons = Map<Text, Coupon>;
    public type Sharable = [SharableCoupon];
    public type PrivateSharable = [PrivateSharableCoupon];
    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func create(__ : Self, key : Text, creator : Principal, capitalRaised : Nat, icpPaid : Nat, code : [Nat8]) : Coupon {
        let coupon : Coupon = Coupon.init(creator, capitalRaised, icpPaid, code);
        Map.put(__, Key(key), coupon);
        coupon
    };

    public func lock(__ : Self, key : Text, by : Principal) {
        Coupon.locked(coupon(__, key), by)
    };
    public func fail(__ : Self, key : Text, by : Principal, reason : Text) {
        Coupon.failed(coupon(__, key), by, reason)
    };
    public func redeem(__ : Self, key : Text, by : Principal) {
        Coupon.redeemed(coupon(__, key), by)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func found(__ : Self, key : Text) : Bool = Map.includes(__, Key(key));

    public func foundByCode(__ : Self, code : [Nat8]) : Bool = Map.includes(__, Key(SHA256.fromBytes(code)));

    public func coupon(__ : Self, key : Text) : Coupon = switch (Map.get(__, Key(key))) {
        case (?coupon) coupon;
        case (null) E.f(#NOT_EXISTED("Coupon"), "Attempted to retrieve a non-existent coupon with key " # key)
    };
    public func getCoupon(__ : Self, key : Text) : SharableCoupon {
        Coupon.toSharable(coupon(__, key), key)
    };
    public func getCoupons(__ : Self, filter : Filter, sort : Sorted<Sort>, getUserCoupons : (Principal) -> List<Text>) : Sharable {
        var filtered : ?[Entry] = null;
        let toEntry : (Text) -> Entry = func(key) = (key, coupon(__, key));
        let toSharable : (Entry) -> SharableCoupon = func(i, e) = Coupon.toSharable(e, i);

        switch (filter.creator) {
            case (null) {};
            case (?creator) filtered := ?List.toArrayMap<Text, Entry>(getUserCoupons(creator), toEntry)
        };
        switch (filter.status, filtered) {
            case (null, _) {};
            case (?status, null) filtered := ?Map.getEntriesFilterMap<Text, Coupon, Entry>(__, func(x) = switch (_status(status)(x)) { case (true) ?x; case (false) null });
            case (?status, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _status(status))
        };
        switch (filter.capitalRaised, filtered) {
            case (null, _) {};
            case (?capitalRaised, null) filtered := ?Map.getEntriesFilterMap<Text, Coupon, Entry>(__, func(x) = switch (_capitalRaised(capitalRaised)(x)) { case (true) ?x; case (false) null });
            case (?capitalRaised, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _capitalRaised(capitalRaised))
        };

        switch (sort.by, sort.order, filtered) {
            case (#recent, #ascending, null) Map.getEntriesMap<Text, Coupon, SharableCoupon>(__, toSharable);
            case (#recent, #descending, null) Map.getEntriesRevMap<Text, Coupon, SharableCoupon>(__, toSharable);
            case (#icpPaid, order, null) Array.sort<SharableCoupon>(Map.getEntriesMap<Text, Coupon, SharableCoupon>(__, toSharable), _icpPaidNormal(order));
            case (#recent, #ascending, ?unsorted) Array.map<Entry, SharableCoupon>(unsorted, toSharable);
            case (#recent, #descending, ?unsorted) Array.mapRev<Entry, SharableCoupon>(unsorted, toSharable);
            case (#icpPaid, order, ?unsorted) Array.sort<SharableCoupon>(Array.map<Entry, SharableCoupon>(unsorted, toSharable), _icpPaidNormal(order))
        }
    };

    public func getPrivateCoupon(__ : Self, key : Text) : PrivateSharableCoupon {
        Coupon.toPrivateSharable(coupon(__, key), key)
    };
    public func getPrivateCoupons(__ : Self, filter : PrivateFilter, sort : Sorted<PrivateSort>, userCoupons : List<Text>) : PrivateSharable {
        let toEntry : (Text) -> Entry = func(key) = (key, coupon(__, key));
        let toSharable : (Entry) -> PrivateSharableCoupon = func(i, e) = Coupon.toPrivateSharable(e, i);

        var filtered : [Entry] = List.toArrayMap<Text, Entry>(userCoupons, toEntry);

        switch (filter.status) {
            case (null) {};
            case (?status) filtered := Array.filter<Entry>(filtered, _status(status))
        };
        switch (filter.capitalRaised) {
            case (null) {};
            case (?capitalRaised) filtered := Array.filter<Entry>(filtered, _capitalRaised(capitalRaised))
        };

        switch (sort.by, sort.order) {
            case (#recent, #ascending) Array.map<Entry, PrivateSharableCoupon>(filtered, toSharable);
            case (#recent, #descending) Array.mapRev<Entry, PrivateSharableCoupon>(filtered, toSharable);
            case (#icpPaid, order) Array.sort<PrivateSharableCoupon>(Array.map<Entry, PrivateSharableCoupon>(filtered, toSharable), _icpPaidPrivate(order))
        }
    };

}
