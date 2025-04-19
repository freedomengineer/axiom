import Actor "Actor";

import E "../../../common/Errors";

import Iter "../../../library/Iter";
import Map "../../../library/Map";

import Hash "mo:base/Hash";
import Array "mo:base/Array";
import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Hash = Hash.Hash;
    private type Iter<T> = Iter.Iter<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Key<K> = Map.Key<K>;

    private type Actor = Actor.Actor;
    private type Variant = Actor.Variant;

    private let { VariantKey } = Actor;

    /// INDICATOR ////// ACTORS ////////////

    private type Self = Actors;

    public type Actors = {
        founder : Principal;
        actors : Map<Variant, Actor>
    };
    public func init(founder : Principal) : Self = {
        founder;
        actors = Map.new()
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _getAvailableActors(__ : Self) : [Variant] {
        Array.append(Map.getKeys(__.actors), [#Founder])
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func initializeActor(__ : Self, variant : Variant, principal : Principal) {
        Map.put(__.actors, VariantKey(variant), Actor.init(principal))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getActor(__ : Self, variant : Variant) : Actor {
        switch (Map.get(__.actors, VariantKey(variant))) {
            case (null) E.f(#NOT_EXISTED("Indicator Actor"), "Actor " # debug_show variant # " does not exist in Indicator, available actors: " # debug_show _getAvailableActors(__));
            case (?x) x
        }
    };
    public func getVariant(__ : Self, principal : Principal) : Variant {
        for ((actorVariant, { principal = actorPrincipal }) in actors(__)) {
            if (principal == actorPrincipal) return actorVariant
        };
        if (principal == __.founder) return #Founder;
        E.f(#NOT_EXISTED("Indicator Actor"), "Principal " # debug_show principal # " does not match any actor in Indicator")
    };
    public func getPrincipal(__ : Self, variant : Variant) : Principal {
        switch (Map.get(__.actors, VariantKey(variant)), variant == #Founder) {
            case (null, false) E.f(#NOT_EXISTED("Indicator Actor"), "Actor " # debug_show variant # " does not exist in Indicator, available actors: " # debug_show _getAvailableActors(__));
            case (?{ principal }, _) principal;
            case (_, true) __.founder
        }
    };
    public func getPrincipals(__ : Self) : [(Variant, Principal)] {
        let principals : [(Variant, Principal)] = Map.getEntriesMap<Variant, Actor, (Variant, Principal)>(__.actors, func((name, { principal })) = (name, principal));
        return Array.append(principals, [(#Founder, __.founder)])
    };

    public func found(__ : Self, variant : Variant) : Bool = Map.includes(__.actors, VariantKey(variant)) or variant == #Founder;

    /// PUBLIC ////// ITERATORS ////////////

    public func actors(__ : Self) : Iter<(Variant, Actor)> = Map.entries(__.actors);

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectFound(__ : Self, variant : Variant) {
        if (found(__, variant)) return;
        E.f(#NOT_EXISTED("Indicator Actor"), "Actor " # debug_show variant # " does not exist in Indicator, available actors: " # debug_show _getAvailableActors(__))
    };
    public func expectNotFound(__ : Self, variant : Variant) {
        if (not found(__, variant)) return;
        E.f(#ALREADY_EXISTED("Indicator Actor"), "Actor " # debug_show variant # " already exists in Indicator, available actors: " # debug_show _getAvailableActors(__))
    };

    public func expectAuthorized(__ : Self, caller : Principal, toBe : [Variant]) {
        for (variant in toBe.vals()) if (getPrincipal(__, variant) == caller) return;
        E.f(#NOT_TOBE("Authorized Actor"), "This action only allows these actors to proceed: " # debug_show toBe)
    }
}
