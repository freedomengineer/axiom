import E "../../../common/Errors";

import Set "../../../library/Set";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Set<T> = Set.Set<T>;

    private let { PrincipalVal; NatVal } = Set;

    /// PUBLIC ////// DECLARATIONS ////////////

    // public func callerProposalVoteCallback(callerUser : ?(Principal, User)) : Nat -> ?Delegable<UniformBinaryVote> = switch (callerUser) {
    //     case (?(_, { proposalVotes })) func(proposalId) = Map.get(proposalVotes, NatKey(proposalId));
    //     case (_) func(_) = null
    // };

    /// CHAT ////// USERS ////////////

    private type Self = User;

    public type User = {
        dms : Set<Principal>;
        groups : Set<Nat>
    };
    public type Sharable = {};

    public func init() : Self = {
        dms = Set.new<Principal>();
        groups = Set.new<Nat>()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func addDm(__ : Self, dm : Principal) {
        Set.put(__.dms, PrincipalVal(dm))
    };
    public func joinGroup(__ : Self, group : Nat) {
        Set.put(__.groups, NatVal(group))
    };
    public func leaveGroup(__ : Self, group : Nat) {
        Set.delete(__.groups, NatVal(group))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func hasDmOpened(__ : Self, dm : Principal) : Bool = Set.includes(__.dms, PrincipalVal(dm));
    public func hasGroupJoined(__ : Self, group : Nat) : Bool = Set.includes(__.groups, NatVal(group));

    public func toSharable(__ : Self) : Sharable = {};

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectGroupJoined(__ : Self, group : Nat) {
        if (hasGroupJoined(__, group)) return;
        E.f(#NOT_EXISTED("Group"), "User has not joined group " # debug_show group)
    };
    public func expectGroupNotJoined(__ : Self, group : Nat) {
        if (not hasGroupJoined(__, group)) return;
        E.f(#ALREADY_EXISTED("Group"), "User has already joined group " # debug_show group)
    };
    public func expectDmOpened(__ : Self, dm : Principal) {
        if (not hasDmOpened(__, dm)) return;
        E.f(#NOT_EXISTED("DM"), "User has not opened DM with " # debug_show dm)
    };
    public func expectDmNotOpened(__ : Self, dm : Principal) {
        if (hasDmOpened(__, dm)) return;
        E.f(#ALREADY_EXISTED("DM"), "User has already opened DM with " # debug_show dm)
    }
}
