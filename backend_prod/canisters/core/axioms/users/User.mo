import Flag "../flags/Flag";

import E "../../../common/Errors";

import Base "../../../library/Base";
import E8S "../../../library/E8S";
import Earning "../../../library/Earning";
import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";

import BinaryVotes "../../../library/votes/BinaryVotes";
import TernaryVotes "../../../library/votes/TernaryVotes";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Set<T> = Set.Set<T>;
    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type E8S = E8S.E8S;
    private type Callback = Base.Callback;
    private type Earning = Earning.Earning;
    private type SharableEarning = Earning.Sharable;
    private type BinaryVote = BinaryVotes.Vote;
    private type TernaryVote = TernaryVotes.Vote;

    private type FlagHeader = Flag.Header;

    private let { NatKey } = Map;
    private let { NatVal; TextVal; PrincipalVal } = Set;
    private let { Key = FlagKey } = Flag;

    /// PUBLIC ////// DECLARATIONS ////////////

    public func callerAxiomCallback(callerUser : ?(Principal, User)) : Nat -> ?Bool = switch (callerUser) {
        case (?(_, { axioms })) func(id) = ?Set.includes(axioms, NatVal(id));
        case (_) func(_) = null
    };
    public func callerBookmarkCallback(callerUser : ?(Principal, User)) : Nat -> ?Bool = switch (callerUser) {
        case (?(_, { bookmarks })) func(id) = ?Set.includes(bookmarks, NatVal(id));
        case (_) func(_) = null
    };
    public func callerHypothesisVoteCallback(callerUser : ?(Principal, User)) : Nat -> ?TernaryVote = switch (callerUser) {
        case (?(_, { votedHypotheses })) func(id) = Map.get(votedHypotheses, NatKey(id));
        case (_) func(_) = null
    };
    public func callerEvidenceVoteCallback(callerUser : ?(Principal, User)) : Nat -> ?BinaryVote = switch (callerUser) {
        case (?(_, { votedEvidences })) func(id) = Map.get(votedEvidences, NatKey(id));
        case (_) func(_) = null
    };
    public func callerFlagVoteCallback(callerUser : ?(Principal, User)) : FlagHeader -> ?BinaryVote = switch (callerUser) {
        case (?(_, { votedFlags })) func(header) = Map.get(votedFlags, FlagKey(header));
        case (_) func(_) = null
    };
    public func callerFollowingCallback(callerUser : ?(Principal, User)) : Principal -> ?Bool = switch (callerUser) {
        case (?(_, { followings })) func(following) = ?Set.includes(followings, PrincipalVal(following));
        case (_) func(_) = null
    };
    public func callerFollowerCallback(callerUser : ?(Principal, User)) : Principal -> ?Bool = switch (callerUser) {
        case (?(_, { followers })) func(follower) = ?Set.includes(followers, PrincipalVal(follower));
        case (_) func(_) = null
    };

    /// AXIOMS ////// USERS ////////////

    private type Self = User;

    public type User = {
        mintEarning : Earning;
        transferEarning : Earning;
        followers : Set<Principal>;
        followings : Set<Principal>;
        axioms : Set<Nat>;
        bookmarks : Set<Nat>;
        joinedFields : Set<Text>;
        var hypotheses : List<Nat>;
        var evidences : List<Nat>;
        votedHypotheses : Map<Nat, TernaryVote>;
        votedEvidences : Map<Nat, BinaryVote>;
        votedFlags : Map<FlagHeader, BinaryVote>
    };
    public type Sharable = {
        principal : Principal;
        earning : SharableEarning;
        followers : [Principal];
        followings : [Principal];
        axioms : [Nat];
        bookmarks : [Nat];
        joinedFields : [Text];
        hypotheses : [Nat];
        evidences : [Nat];
        votedHypotheses : [(Nat, TernaryVote)];
        votedEvidences : [(Nat, BinaryVote)];
        callerFollowing : ?Bool;
        callerFollower : ?Bool
    };

    public func init() : Self = {
        mintEarning = Earning.new();
        transferEarning = Earning.new();
        followers = Set.new<Principal>();
        followings = Set.new<Principal>();
        axioms = Set.new<Nat>();
        bookmarks = Set.new<Nat>();
        joinedFields = Set.new();
        var hypotheses = List.nil();
        var evidences = List.nil();
        votedHypotheses = Map.new<Nat, TernaryVote>();
        votedEvidences = Map.new<Nat, BinaryVote>();
        votedFlags = Map.new<FlagHeader, BinaryVote>()
    };
    public func fromFounder() : Self = {
        mintEarning = Earning.new();
        transferEarning = Earning.new();
        followers = Set.new<Principal>();
        followings = Set.new<Principal>();
        axioms = Set.new<Nat>();
        bookmarks = Set.new<Nat>();
        joinedFields = Set.make(TextVal("Axiom governance"));
        var hypotheses = List.make(0);
        var evidences = List.nil();
        votedHypotheses = Map.new<Nat, TernaryVote>();
        votedEvidences = Map.new<Nat, BinaryVote>();
        votedFlags = Map.new<FlagHeader, BinaryVote>()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFollower(__ : Self, follower : Principal) {
        Set.put(__.followers, PrincipalVal(follower))
    };
    public func removeFollower(__ : Self, follower : Principal) {
        Set.delete(__.followers, PrincipalVal(follower))
    };
    public func addFollowing(__ : Self, followings : Principal) {
        Set.put(__.followings, PrincipalVal(followings))
    };
    public func removeFollowing(__ : Self, followings : Principal) {
        Set.delete(__.followings, PrincipalVal(followings))
    };

    public func addAxiom(__ : Self, hypothesisId : Nat) {
        Set.put(__.axioms, NatVal(hypothesisId))
    };
    public func removeAxiom(__ : Self, hypothesisId : Nat) {
        Set.delete(__.axioms, NatVal(hypothesisId))
    };
    public func addBookmark(__ : Self, hypothesisId : Nat) {
        Set.put(__.bookmarks, NatVal(hypothesisId))
    };
    public func removeBookmark(__ : Self, hypothesisId : Nat) {
        Set.delete(__.bookmarks, NatVal(hypothesisId))
    };

    public func publishHypothesis(__ : Self, hypothesisId : Nat) {
        __.hypotheses := List.push(hypothesisId, __.hypotheses)
    };
    public func publishEvidence(__ : Self, evidenceId : Nat) {
        __.evidences := List.push(evidenceId, __.evidences)
    };
    public func removeHypothesis(__ : Self, hypothesisId : Nat) {
        __.hypotheses := List.filter<Nat>(__.hypotheses, func(id) = id != hypothesisId)
    };
    public func removeEvidence(__ : Self, evidenceId : Nat) {
        __.evidences := List.filter<Nat>(__.evidences, func(id) = id != evidenceId)
    };

    public func voteHypothesis(__ : Self, hypothesisId : Nat, vote : TernaryVote) {
        Map.put(__.votedHypotheses, NatKey(hypothesisId), vote)
    };
    public func voteEvidence(__ : Self, evidenceId : Nat, vote : BinaryVote) {
        Map.put(__.votedEvidences, NatKey(evidenceId), vote)
    };
    public func removeHypothesisVote(__ : Self, hypothesisId : Nat) {
        Map.delete(__.votedHypotheses, NatKey(hypothesisId))
    };
    public func removeEvidenceVote(__ : Self, evidenceId : Nat) {
        Map.delete(__.votedEvidences, NatKey(evidenceId))
    };

    public func voteFlag(__ : Self, header : FlagHeader, vote : BinaryVote) {
        Map.put(__.votedFlags, FlagKey(header), vote)
    };
    public func removeFlagVote(__ : Self, header : FlagHeader) {
        Map.delete(__.votedFlags, FlagKey(header))
    };

    public func joinField(__ : Self, field : Text) {
        Set.put(__.joinedFields, TextVal(field))
    };
    public func leaveField(__ : Self, field : Text) {
        Set.delete(__.joinedFields, TextVal(field))
    };

    public func depositMint(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.mintEarning, depositAmount)
    };
    public func withdrawMint(__ : Self, withdrawAmount : E8S) {
        Earning.withdraw(__.mintEarning, withdrawAmount)
    };
    public func depositTransfer(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.transferEarning, depositAmount)
    };
    public func withdrawTransfer(__ : Self, withdrawAmount : E8S) {
        Earning.withdraw(__.transferEarning, withdrawAmount)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func positiveMintBalance(__ : Self) : E8S {
        Earning.expectPositiveBalance(__.mintEarning);
        Earning.balance(__.mintEarning)
    };
    public func positiveTransferBalance(__ : Self) : E8S {
        Earning.expectPositiveBalance(__.transferEarning);
        Earning.balance(__.transferEarning)
    };

    public func mintEarning(__ : Self) : Earning = __.mintEarning;
    public func transferEarning(__ : Self) : Earning = __.transferEarning;

    public func getEarning(__ : Self) : SharableEarning {
        let mintSharable = Earning.toSharable(__.mintEarning);
        let transferSharable = Earning.toSharable(__.transferEarning);
        {
            revenue = mintSharable.revenue + transferSharable.revenue;
            balance = mintSharable.balance + transferSharable.balance;
            lastWithdrawAt = Int.max(mintSharable.lastWithdrawAt, transferSharable.lastWithdrawAt)
        }
    };

    public func isPoweredVoter(__ : Self, id : Nat) : Bool = Map.unwrap(__.votedHypotheses, NatKey(id)).value > 1;
    public func followerFound(__ : Self, follower : Principal) : Bool = Set.includes(__.followers, PrincipalVal(follower));
    public func followingsFound(__ : Self, followings : Principal) : Bool = Set.includes(__.followings, PrincipalVal(followings));
    public func joinedFieldFound(__ : Self, field : Text) : Bool = Set.includes(__.joinedFields, TextVal(field));
    public func axiomFound(__ : Self, hypothesisId : Nat) : Bool = Set.includes(__.axioms, NatVal(hypothesisId));
    public func bookmarkFound(__ : Self, hypothesisId : Nat) : Bool = Set.includes(__.bookmarks, NatVal(hypothesisId));

    public func hasHypothesisVoted(__ : Self, id : Nat) : Bool = Map.includes(__.votedHypotheses, NatKey(id));
    public func hasEvidenceVoted(__ : Self, id : Nat) : Bool = Map.includes(__.votedEvidences, NatKey(id));
    public func hasFlagVoted(__ : Self, header : FlagHeader) : Bool = Map.includes(__.votedFlags, FlagKey(header));

    public func hypothesisVote(__ : Self, id : Nat) : TernaryVote = switch (Map.get(__.votedHypotheses, NatKey(id))) {
        case (null) E.f(#NOT_EXISTED("Hypothesis Vote"), "User vote for Hypothesis id " # debug_show id # " does not exist");
        case (?e) e
    };
    public func evidenceVote(__ : Self, id : Nat) : BinaryVote = switch (Map.get(__.votedEvidences, NatKey(id))) {
        case (null) E.f(#NOT_EXISTED("Evidence Vote"), "User vote for Evidence id " # debug_show id # " does not exist");
        case (?e) e
    };
    public func flagVote(__ : Self, header : FlagHeader) : BinaryVote = switch (Map.get(__.votedFlags, FlagKey(header))) {
        case (null) E.f(#NOT_EXISTED("Flag Vote"), "User vote for " # debug_show (header.category) # " Flag with id " # debug_show header.id # " does not exist");
        case (?e) e
    };

    public func getHypothesisVote(__ : Self, id : Nat) : ?TernaryVote = Map.get(__.votedHypotheses, NatKey(id));
    public func getEvidenceVote(__ : Self, id : Nat) : ?BinaryVote = Map.get(__.votedEvidences, NatKey(id));
    public func getFlagVote(__ : Self, header : FlagHeader) : ?BinaryVote = Map.get(__.votedFlags, FlagKey(header));

    public func toSharable(__ : Self, principal : Principal, getCallerFollowing : Principal -> ?Bool, getCallerFollower : Principal -> ?Bool) : Sharable = {
        principal;
        earning = getEarning(__);
        followers = Set.toArray(__.followers);
        followings = Set.toArray(__.followings);
        axioms = Set.toArray(__.axioms);
        bookmarks = Set.toArray(__.bookmarks);
        joinedFields = Set.toArray(__.joinedFields);
        hypotheses = List.toArray(__.hypotheses);
        evidences = List.toArray(__.evidences);
        votedHypotheses = Map.getEntries(__.votedHypotheses);
        votedEvidences = Map.getEntries(__.votedEvidences);
        callerFollowing = getCallerFollowing(principal);
        callerFollower = getCallerFollower(principal)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectFollowerFound(__ : Self, follower : Principal) {
        if (followerFound(__, follower)) return;
        E.f(#NOT_EXISTED("Follower"), "Follower " # debug_show follower # " has not existed in User")
    };
    public func expectFollowerNotFound(__ : Self, follower : Principal) {
        if (not followerFound(__, follower)) return;
        E.f(#ALREADY_EXISTED("Follower"), "Follower " # debug_show follower # " has already existed in User")
    };
    public func expectFollowingFound(__ : Self, followings : Principal) {
        if (followingsFound(__, followings)) return;
        E.f(#NOT_EXISTED("Following"), "Following " # debug_show followings # " has not existed in User")
    };
    public func expectFollowingNotFound(__ : Self, followings : Principal) {
        if (not followingsFound(__, followings)) return;
        E.f(#ALREADY_EXISTED("Following"), "Following " # debug_show followings # " has already existed in User")
    };
    public func expectAxiomFound(__ : Self, hypothesisId : Nat) {
        if (axiomFound(__, hypothesisId)) return;
        E.f(#NOT_EXISTED("Axiom"), "Axiom " # debug_show hypothesisId # " has not existed in User")
    };
    public func expectAxiomNotFound(__ : Self, hypothesisId : Nat) {
        if (not axiomFound(__, hypothesisId)) return;
        E.f(#ALREADY_EXISTED("Axiom"), "Axiom " # debug_show hypothesisId # " has already existed in User")
    };
    public func expectBookmarkFound(__ : Self, hypothesisId : Nat) {
        if (bookmarkFound(__, hypothesisId)) return;
        E.f(#NOT_EXISTED("Bookmark"), "Bookmark " # debug_show hypothesisId # " has not existed in User")
    };
    public func expectBookmarkNotFound(__ : Self, hypothesisId : Nat) {
        if (not bookmarkFound(__, hypothesisId)) return;
        E.f(#ALREADY_EXISTED("Bookmark"), "Bookmark " # debug_show hypothesisId # " has already existed in User")
    };
    public func expectPositiveBalance(__ : Self) {
        if (Earning.isPositiveBalance(__.mintEarning) or Earning.isPositiveBalance(__.transferEarning)) return;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "User has zero balance")
    }
}
