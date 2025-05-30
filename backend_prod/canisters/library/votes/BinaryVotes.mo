import Iter "../Iter";
import Set "../Set";

import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Set<T> = Set.Set<T>;
    private type Iter<T> = Iter.Iter<T>;

    private func _choiceToIndex(choice : Choice) : Nat {
        switch (choice) {
            case (#Positive) 0;
            case (#Negative) 1
        }
    };

    private let Val = Set.PrincipalVal;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Choice = { #Positive; #Negative };
    public type Vote = { choice : Choice; value : Nat };
    public type OneSideSharable = (Nat, Nat);

    /// LIBRARY ////// VOTES ////////////

    private type Self = Votes;

    public type Votes = {
        counts : [var Nat];
        agents : [Set<Principal>]
    };
    public type Sharable = {
        powered : OneSideSharable;
        regular : OneSideSharable
    };

    public func new() : Self = {
        counts = [var 0, 0];
        agents = [Set.new<Principal>(), Set.new<Principal>()]
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, principal : Principal, vote : Vote) {
        let index : Nat = _choiceToIndex(vote.choice);
        __.counts[index] := __.counts[index] + vote.value;
        Set.put(__.agents[index], Val(principal))
    };

    public func remove(__ : Self, principal : Principal, vote : Vote) {
        let index : Nat = _choiceToIndex(vote.choice);
        switch (__.counts[index] > vote.value) {
            case (true) __.counts[index] := __.counts[index] - vote.value;
            case (false) __.counts[index] := 0
        };
        Set.delete(__.agents[index], Val(principal))
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func voters(__ : Self) : Iter<Principal> {
        Iter.concat([Set.vals(__.agents[0]), Set.vals(__.agents[1])])
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getValue(__ : Self) : Nat = __.counts[0] + __.counts[1];

    public func getRegularValue(__ : Self) : Nat = Set.size(__.agents[0]) + Set.size(__.agents[1]);
    public func getPoweredValue(__ : Self) : Nat = __.counts[0] + __.counts[1];

    public func getRegularPositiveValue(__ : Self) : Nat = Set.size(__.agents[0]);
    public func getRegularNegativeValue(__ : Self) : Nat = Set.size(__.agents[1]);

    public func getPoweredPositiveValue(__ : Self) : Nat = __.counts[0];
    public func getPoweredNegativeValue(__ : Self) : Nat = __.counts[1];

    public func getRegularPositiveDiffValue(__ : Self) : Int = Set.size(__.agents[0]) - Set.size(__.agents[1]);
    public func getPoweredPositiveDiffValue(__ : Self) : Int = __.counts[0] - __.counts[1];

    public func getRegularSharable(__ : Self) : OneSideSharable = (Set.size(__.agents[0]), Set.size(__.agents[1]));
    public func getPoweredSharable(__ : Self) : OneSideSharable = (__.counts[0], __.counts[1]);

    public func toSharable(__ : Self) : Sharable = {
        powered = getPoweredSharable(__);
        regular = getRegularSharable(__)
    }
}
