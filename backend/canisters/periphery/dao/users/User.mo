import E "../../../common/Errors";

import Date "../../../library/Date";
import Delegable "../../../library/Delegable";
import E8S "../../../library/E8S";
import Earning "../../../library/Earning";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";

import TernaryVotes "../../../library/votes/TernaryVotes";
import UniformBinaryVotes "../../../library/votes/UniformBinaryVotes";

import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Int "mo:base/Int";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Delegable<T> = Delegable.Delegable<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Set<T> = Set.Set<T>;
    private type List<T> = List.List<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type Time = Time.Time;

    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;
    private type Earning = Earning.Earning;
    private type SharableEarning = Earning.Sharable;
    private type TernaryVote = TernaryVotes.Vote;
    private type TernaryVotes = TernaryVotes.Votes;
    private type UniformBinaryVote = UniformBinaryVotes.Vote;
    private type UniformBinaryVotes = UniformBinaryVotes.Votes;

    private let { NatKey } = Map;
    private let { PrincipalVal } = Set;

    /// PUBLIC ////// DECLARATIONS ////////////

    public func callerProposalVoteCallback(callerUser : ?(Principal, User)) : Nat -> ?Delegable<UniformBinaryVote> = switch (callerUser) {
        case (?(_, { proposalVotes })) func(proposalId) = Map.get(proposalVotes, NatKey(proposalId));
        case (_) func(_) = null
    };

    /// DAO ////// USERS ////////////

    private type Self = User;

    public type User = {
        acornMintEarning : Earning;
        acornTransferEarning : Earning;
        icpEarning : Earning;
        var proposals : List<Nat>;
        var referendums : List<Nat>;
        proposalVotes : Map<Nat, Delegable<UniformBinaryVote>>;
        referendumVotes : Map<Nat, TernaryVote>;
        ballots : Set<Principal>;
        var lastUpdateBallot : Time
    };
    public type Sharable = {
        acornEarning : SharableEarning;
        icpEarning : SharableEarning;
        proposals : List<Nat>;
        referendums : List<Nat>;
        proposalVotes : [(Nat, Delegable<UniformBinaryVote>)];
        referendumVotes : [(Nat, TernaryVote)];
        ballots : [(Principal, Nat)];
        lastUpdateBallot : Time
    };

    public func init(getNow : () -> Int) : Self = {
        acornMintEarning = Earning.new(getNow);
        acornTransferEarning = Earning.new(getNow);
        icpEarning = Earning.new(getNow);
        var proposals = List.nil();
        var referendums = List.nil();
        proposalVotes = Map.new<Nat, Delegable<UniformBinaryVote>>();
        referendumVotes = Map.new<Nat, TernaryVote>();
        ballots = Set.new<Principal>();
        var lastUpdateBallot = getNow()
    };
    public func fromFounder(founder : Principal, getNow : () -> Int) : Self = {
        acornMintEarning = Earning.new(getNow);
        acornTransferEarning = Earning.new(getNow);
        icpEarning = Earning.new(getNow);
        var proposals = List.nil();
        var referendums = List.nil();
        proposalVotes = Map.new<Nat, Delegable<UniformBinaryVote>>();
        referendumVotes = Map.new<Nat, TernaryVote>();
        ballots = Set.make<Principal>(PrincipalVal(founder));
        var lastUpdateBallot = getNow()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func proposeProposal(__ : Self, proposalId : Nat) {
        __.proposals := List.push(proposalId, __.proposals)
    };
    public func proposeReferendum(__ : Self, referendumId : Nat) {
        __.referendums := List.push(referendumId, __.referendums)
    };

    public func voteProposal(__ : Self, proposalId : Nat, vote : Delegable<UniformBinaryVote>) {
        Map.put(__.proposalVotes, NatKey(proposalId), vote)
    };
    public func voteReferendum(__ : Self, referendumId : Nat, vote : TernaryVote) {
        Map.put(__.referendumVotes, NatKey(referendumId), vote)
    };
    public func removeProposalVote(__ : Self, proposalId : Nat) {
        Map.delete(__.proposalVotes, NatKey(proposalId))
    };
    public func removeReferendumVote(__ : Self, referendumId : Nat) {
        Map.delete(__.referendumVotes, NatKey(referendumId))
    };

    public func castBallot(__ : Self, nominee : Principal) {
        Set.put(__.ballots, PrincipalVal(nominee))
    };
    public func withdrawBallot(__ : Self, nominee : Principal) {
        Set.delete(__.ballots, PrincipalVal(nominee))
    };
    public func clearBallots(__ : Self, getNow : () -> Int) {
        Set.clear(__.ballots);
        __.lastUpdateBallot := getNow()
    };

    public func depositAcornMint(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.acornMintEarning, depositAmount)
    };
    public func depositAcornTransfer(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.acornTransferEarning, depositAmount)
    };
    public func depositIcp(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.icpEarning, depositAmount)
    };
    public func withdrawAcornMint(__ : Self, withdrawAmount : E8S, getNow : () -> Int) {
        Earning.withdraw(__.acornMintEarning, withdrawAmount, getNow)
    };
    public func withdrawAcornTransfer(__ : Self, withdrawAmount : E8S, getNow : () -> Int) {
        Earning.withdraw(__.acornTransferEarning, withdrawAmount, getNow)
    };
    public func withdrawIcp(__ : Self, withdrawAmount : E8S, getNow : () -> Int) {
        Earning.withdraw(__.icpEarning, withdrawAmount, getNow)
    };

    /// PUBLIC ////// ITERATORS ////////////

    public func ballotsExcept(__ : Self, exception : [Principal]) : [Principal] {
        Array.filter<Principal>(
            Set.toArray(__.ballots),
            func(nominee) {
                for (e in exception.vals()) if (e == nominee) return false;
                true
            },
        )
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func positiveAcornMintBalance(__ : Self) : E8S {
        Earning.expectPositiveBalance(__.acornMintEarning);
        Earning.balance(__.icpEarning)
    };
    public func positiveAcornTransferBalance(__ : Self) : E8S {
        Earning.expectPositiveBalance(__.acornTransferEarning);
        Earning.balance(__.icpEarning)
    };
    public func positiveIcpBalance(__ : Self) : E8S {
        Earning.expectPositiveBalance(__.icpEarning);
        Earning.balance(__.icpEarning)
    };

    public func acornMintEarning(__ : Self) : Earning = __.acornMintEarning;
    public func acornTransferEarning(__ : Self) : Earning = __.acornTransferEarning;
    public func icpEarning(__ : Self) : Earning = __.icpEarning;
    public func getAcornEarning(__ : Self) : SharableEarning {
        let mintSharable = Earning.toSharable(__.acornMintEarning);
        let transferSharable = Earning.toSharable(__.acornTransferEarning);
        {
            revenue = mintSharable.revenue + transferSharable.revenue;
            balance = mintSharable.balance + transferSharable.balance;
            lastWithdrawAt = Int.max(mintSharable.lastWithdrawAt, transferSharable.lastWithdrawAt)
        }
    };
    public func getIcpEarning(__ : Self) : SharableEarning = Earning.toSharable(__.icpEarning);

    public func hasProposalVoted(__ : Self, id : Nat) : Bool = Map.includes(__.proposalVotes, NatKey(id));
    public func hasReferendumVoted(__ : Self, id : Nat) : Bool = Map.includes(__.referendumVotes, NatKey(id));
    public func hasBallotCasted(__ : Self, id : Principal) : Bool = Set.includes(__.ballots, PrincipalVal(id));
    public func hasExpiredBallot(__ : Self, duration : Nat, getNow : () -> Int) : Bool = Date.getMidnightsElapsed(__.lastUpdateBallot, getNow()) >= duration;

    public func proposalVote(__ : Self, id : Nat) : Delegable<UniformBinaryVote> = switch (Map.get(__.proposalVotes, NatKey(id))) {
        case (null) E.f(#NOT_EXISTED("Proposal Vote"), "User Vote for Proposal id " # debug_show id # " does not exist");
        case (?e) e
    };
    public func referendumVote(__ : Self, id : Nat) : TernaryVote = switch (Map.get(__.referendumVotes, NatKey(id))) {
        case (null) E.f(#NOT_EXISTED("Referendum Vote"), "User Vote for Referendum id " # debug_show id # " does not exist");
        case (?e) e
    };

    public func getProposalVote(__ : Self, id : Nat) : ?Delegable<UniformBinaryVote> = Map.get(__.proposalVotes, NatKey(id));
    public func getReferendumVote(__ : Self, id : Nat) : ?TernaryVote = Map.get(__.referendumVotes, NatKey(id));

    public func toSharable(__ : Self, duration : Nat, getBallot : Principal -> Nat, getNow : () -> Int) : Sharable = {
        proposals = __.proposals;
        referendums = __.referendums;
        acornEarning = getAcornEarning(__);
        icpEarning = Earning.toSharable(__.icpEarning);
        proposalVotes = Map.getEntries(__.proposalVotes);
        referendumVotes = Map.getEntries(__.referendumVotes);
        ballots = switch (hasExpiredBallot(__, duration, getNow)) {
            case (false) Set.toArrayMap<Principal, (Principal, Nat)>(__.ballots, func(e) = (e, getBallot(e)));
            case (true)[]
        };
        lastUpdateBallot = __.lastUpdateBallot
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPositiveAcornBalance(__ : Self) {
        Earning.expectPositiveBalance(__.acornMintEarning)
    };
    public func expectPositiveIcpBalance(__ : Self) {
        Earning.expectPositiveBalance(__.icpEarning)
    }
}
