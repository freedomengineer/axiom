import Installation "../installations/Installation";

import E "../../../common/Errors";

import Iter "../../../library/Iter";
import Map "../../../library/Map";

import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;
    private type Iter<T> = Iter.Iter<T>;
    private type ActorsConfigs = Installation.ActorsConfigs;

    private let { NatKey = Key } = Map;

    /// INDICATOR ////// UPGRADING TASKS ////////////

    private type Self = UpgradeTasks;

    public type UpgradeTasks = Map<Nat, (Principal, ActorsConfigs)>;
    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, proposalId : Nat, issuer : Principal, actorsConfigs : ActorsConfigs) {
        Map.put(__, Key(proposalId), (issuer, actorsConfigs))
    };
    public func remove(__ : Self, proposalId : Nat) {
        Map.delete(__, Key(proposalId))
    };
    public func clear(__ : Self) {
        Map.clear(__)
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func tasks(__ : Self) : Iter<(Nat, (Principal, ActorsConfigs))> = Map.entries(__);

    /// PUBLIC ////// ACCESSORS ////////////

    public func upgradeTask(__ : Self, proposalId : Nat) : (Principal, ActorsConfigs) {
        switch (Map.get(__, Key(proposalId))) {
            case (null) E.f(#NOT_EXISTED("Upgrading Task"), "Upgrading Task for proposal " # debug_show proposalId # " does not exist");
            case (?upgradeTask) upgradeTask
        }
    }
}
