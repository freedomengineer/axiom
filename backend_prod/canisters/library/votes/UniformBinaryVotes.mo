import Iter "../Iter";
import Proportion "../Proportion";
import Set "../Set";

import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Set<T> = Set.Set<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type Proportion = Proportion.Proportion;

    private func _choiceToIndex(choice : Choice) : Nat {
        switch (choice) {
            case (#Positive) 0;
            case (#Negative) 1;
            case (#Delegated) 2
        }
    };

    private let Val = Set.PrincipalVal;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Choice = { #Positive; #Negative; #Delegated };
    public type Vote = { choice : Choice };

    /// LIBRARY ////// VOTES ////////////

    private type Self = Votes;

    public type Votes = { agents : [Set<Principal>] };
    public type Sharable = ([Principal], [Principal], [Principal]);

    public func new() : Self = {
        agents = [Set.new<Principal>(), Set.new<Principal>(), Set.new<Principal>()]
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, principal : Principal, vote : Vote) {
        let index : Nat = _choiceToIndex(vote.choice);
        Set.put(__.agents[index], Val(principal))
    };

    public func remove(__ : Self, principal : Principal, vote : Vote) {
        let index : Nat = _choiceToIndex(vote.choice);
        Set.delete(__.agents[index], Val(principal))
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func voters(__ : Self) : Iter<Principal> {
        Iter.concat([Set.vals(__.agents[0]), Set.vals(__.agents[1]), Set.vals(__.agents[2])])
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func positiveVoters(__ : Self) : Set<Principal> = __.agents[0];
    public func negativeVoters(__ : Self) : Set<Principal> = __.agents[1];
    public func delegatedVoters(__ : Self) : Set<Principal> = __.agents[2];

    public func getPositiveVotes(__ : Self) : [Principal] = Set.toArray(__.agents[0]);
    public func getNegativeVotes(__ : Self) : [Principal] = Set.toArray(__.agents[1]);
    public func getDelegatedVotes(__ : Self) : [Principal] = Set.toArray(__.agents[2]);

    public func getPositiveProportion(__ : Self) : Proportion {
        let (positiveValue, negativeValue) = (Set.size(__.agents[0]), Set.size(__.agents[1]));
        Proportion.make(positiveValue, positiveValue + negativeValue)
    };
    public func getNegativeProportion(__ : Self) : Proportion {
        let (positiveValue, negativeValue) = (Set.size(__.agents[0]), Set.size(__.agents[1]));
        Proportion.make(negativeValue, positiveValue + negativeValue)
    };

    public func getValue(__ : Self) : Nat = Set.size(__.agents[0]) + Set.size(__.agents[1]);

    public func getPositiveValue(__ : Self) : Nat = Set.size(__.agents[0]);
    public func getNegativeValue(__ : Self) : Nat = Set.size(__.agents[1]);

    public func toSharable(__ : Self) : Sharable = (Set.toArray(__.agents[0]), Set.toArray(__.agents[1]), Set.toArray(__.agents[2]))
}
