import Hypothesis "../hypotheses/Hypothesis";
import User "../users/User";

import E "../../../common/Errors";

import Set "../../../library/Set";
import Tree "../../../library/Tree";
import List "../../../library/List";

import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Tree<K, V> = Tree.Tree<K, V>;
    private type Set<T> = Set.Set<T>;
    private type List<T> = List.List<T>;

    private type User = User.User;
    private type Hypothesis = Hypothesis.Hypothesis;
    private type SharableHypothesis = Hypothesis.Sharable;

    private let { PrincipalVal } = Set;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Role = {
        #Member;
        #Guest
    };
    public func callerRoleCallback(callerUser : ?(Principal, User)) : Self -> ?Role = switch (callerUser) {
        case (?(caller, _)) func(field) = ?getRole(field, caller);
        case (_) func(_) = null
    };

    /// AXIOMS ////// FIELD ////////////

    private type Self = Field;

    public type Field = {
        var description : Text;
        creationDate : Time;
        members : Set<Principal>;
        var hypothesisIds : List<Nat>
    };
    public type Sharable = {
        name : Text;
        description : Text;
        creationDate : Time;
        members : [Principal];
        hypothesisIds : [Nat];
        callerRole : ?Role
    };

    public func init(description : Text) : Self = {
        var description;
        creationDate = Time.now();
        members = Set.new<Principal>();
        var hypothesisIds = List.nil()
    };
    public func fromFounder(founder : Principal) : Self = {
        var description = "The governance of the Axiom protocol";
        creationDate = Time.now();
        members = Set.make<Principal>(PrincipalVal(founder));
        var hypothesisIds = List.make(0)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func updateDescription(__ : Self, description : Text) {
        __.description := description
    };

    public func addHypothesis(__ : Self, hypothesisId : Nat) {
        __.hypothesisIds := List.push(hypothesisId, __.hypothesisIds)
    };
    public func addMember(__ : Self, principal : Principal) {
        Set.put<Principal>(__.members, PrincipalVal(principal))
    };

    public func removeMember(__ : Self, principal : Principal) {
        Set.delete(__.members, PrincipalVal(principal))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func containsPattern(__ : Self, pattern : { #text : Text }) : Bool = Text.contains(Text.toLowercase(__.description), pattern);

    public func getRole(__ : Self, principal : Principal) : Role = switch (isMember(__, principal)) {
        case (true) #Member;
        case (false) #Guest
    };

    public func isMember(__ : Self, principal : Principal) : Bool = Set.includes(__.members, PrincipalVal(principal));

    public func toSharable(__ : Self, name : Text, getCallerRole : (Self) -> ?Role) : Sharable = {
        name;
        creationDate = __.creationDate;
        description = __.description;
        members = Set.toArray(__.members);
        hypothesisIds = List.toArray(__.hypothesisIds);
        callerRole = getCallerRole(__)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectMember(__ : Self, principal : Principal) {
        if (isMember(__, principal)) return;
        E.f(#NOT_TOBE("Field Member"), "User " # debug_show principal # " is not a member of field")
    };
    public func expectNotMember(__ : Self, principal : Principal) {
        if (not isMember(__, principal)) return;
        E.f(#NOT_TOBE("Field Member"), "User " # debug_show principal # " is already a member of field")
    }
}
