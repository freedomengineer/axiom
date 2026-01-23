import Allocation "Allocation";
import Actor "../../../periphery/indicator/actors/Actor";

import E "../../../common/Errors";

import E8S "../../../library/E8S";
import Map "../../../library/Map";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type E8S = E8S.E8S;
    private type Map<K, V> = Map.Map<K, V>;
    private type SharableE8S = E8S.Sharable;

    private type ActorVariant = Actor.Variant;
    private type Allocation = Allocation.Allocation;
    private type SharableAllocation = Allocation.Sharable;

    private let { VariantKey } = Actor;

    /// TREASURY ////// ALLOCATIONS ////////////

    public type Self = Allocations;

    public type Allocations = Map<ActorVariant, Allocation>;
    public type Sharable = [SharableAllocation];

    public func init() : Self = Map.fromEntries<ActorVariant, Allocation>([
        (VariantKey(#Sales), Allocation.init(E8S.fromFloat(100_000_000.0), E8S.new())),
        (VariantKey(#Axioms), Allocation.init(E8S.fromFloat(200_000_000.0), E8S.new())),
        (VariantKey(#Escrow), Allocation.init(E8S.fromFloat(100_000_000.0), E8S.fromFloat(10_000_000.0))), // 16-year contract especially for the Founder
        (VariantKey(#DAO), Allocation.init(E8S.fromFloat(40_000_000.0), E8S.new())),
        (VariantKey(#Facade), Allocation.init(E8S.new(), E8S.new())),
    ]);

    /// PRIVATE ////// QUERIES ////////////

    private func _actors(__ : Self) : [ActorVariant] = Map.getKeys(__);

    /// PUBLIC ////// ACCESSORS ////////////

    public func allocationFound(__ : Self, actorVariant : ActorVariant) : Bool = Map.includes(__, VariantKey(actorVariant));

    public func totalReserve(__ : Self) : E8S {
        Map.foldVals<ActorVariant, Allocation, E8S>(__, E8S.new(), func(acc, cur) = E8S.getAdd(acc, cur.allocated))
    };
    public func getTotalReserve(__ : Self) : SharableE8S {
        E8S.toSharable(totalReserve(__))
    };

    public func allocation(__ : Self, actorVariant : ActorVariant) : Allocation {
        switch (Map.get(__, VariantKey(actorVariant))) {
            case (null) E.f(#NOT_EXISTED("Allocated Actor"), debug_show actorVariant # " has no allocation in Treasury, Allocated Actors: " # debug_show _actors(__));
            case (?x) x
        }
    };
    public func getAllocation(__ : Self, actorVariant : ActorVariant) : SharableAllocation {
        Allocation.toSharable(allocation(__, actorVariant), actorVariant)
    };
    public func getAllocations(__ : Self) : Sharable {
        Map.getEntriesMap<ActorVariant, Allocation, SharableAllocation>(__, func(i, e) = Allocation.toSharable(e, i))
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectFound(__ : Self, actorVariant : ActorVariant) : () {
        if (allocationFound(__, actorVariant)) return;
        E.f(#NOT_EXISTED("Allocated Actor"), debug_show actorVariant # " has no allocation in Treasury, Allocated Actors: " # debug_show _actors(__))
    };
    public func expectNotFound(__ : Self, actorVariant : ActorVariant) : () {
        if (not allocationFound(__, actorVariant)) return;
        E.f(#ALREADY_EXISTED("Allocated Actor"), debug_show actorVariant # " has already existed in Treasury")
    }
}
