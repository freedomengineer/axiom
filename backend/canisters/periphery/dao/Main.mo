import Proposal "proposals/Proposal";
import Proposals "proposals/Proposals";
import Nominees "nominees/Nominees";
import Nominee "nominees/Nominee";
import Users "users/Users";
import User "users/User";
import Detachment "detachments/Detachment";
import Commitments "../indicator/commitments/Commitments";
import Installation "../indicator/installations/Installation";
import Notification "../facade/notifications/Notification";

import IndicatorInterface "../indicator/Interface";
import FacadeInterface "../facade/Interface";
import EscrowInterface "../../core/escrow/Interface";
import SplitInterface "../../core/split/Interface";
import TreasuryInterface "../../core/treasury/Interface";
import AxiomsInterface "../../core/axioms/Interface";

import C "../../common/Constants";
import E "../../common/Errors";

import Base "../../library/Base";
import Configs "../../library/Configs";
import Count "../../library/Count";
import Delegable "../../library/Delegable";
import E8S "../../library/E8S";
import Earning "../../library/Earning";
import Iter "../../library/Iter";
import List "../../library/List";
import Pagination "../../library/Pagination";
import Proportion "../../library/Proportion";
import Set "../../library/Set";

import UniformBinaryVotes "../../library/votes/UniformBinaryVotes";
import Version "../../library/Version";

import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Timer "mo:base/Timer";

shared ({ caller = indicator }) actor class DAO() = this {
    ////// TEMPORARY IMPLEMENTATION ////////////
    private stable var shiftedTime : Int = 0;
    private func getNow() : Int = shiftedTime + Time.now();
    public shared func shiftToMidnight(days : Nat) : async () {
        for (i in Iter.range(1, days)) {
            shiftedTime += C.ONE_DAY - getNow() % C.ONE_DAY;
            await _dailyExecution()
        }
    };
    ////// TEMPORARY IMPLEMENTATION ////////////

    private stable let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    private stable let proposals : Proposals.Proposals = Proposals.init();
    private stable let users : Users.Users = Users.init();
    private stable let nominees : Nominees.Nominees = Nominees.init();
    private stable let daysInPeriod : Count.Count = Count.new();

    private stable let configs : Configs.Configs = Configs.make([
        /// Election Configs
        ("PERIOD_DURATION", #Duration(21)), // Duration (in days) of each period (current: 21 days)
        ("PERIOD_PROFIT_SHARE", #E8S(E8S.fromFloat(0.1))), // Profit share (in 10^8) for each user (current: 0.1 * 10^8)
        ("PERIOD_CUSTODIAN_PAYOUT", #E8S(E8S.fromFloat(500.0))), // Payout (in 10^8) for each custodian (current: 500.0 * 10^8)

        ("BALLOT_AVAILABILITY_DURATION", #Duration(200)), // Duration (in days) of user's nominee ballots valid for tallying (current: 200 days)
        ("MAX_BALLOTS", #Nat(5)), // Maximum number of nominee ballots for user (current: 5)
        ("MAX_CUSTODIANS", #Nat(5)), // Maximum number of custodians (current: 5)

        ("MIN_NOMINEE_TITLE_LENGTH", #Nat(3)), // Minimum nominee's title text length (current: 3)
        ("MAX_NOMINEE_TITLE_LENGTH", #Nat(200)), // Maximum nominee's title text length (current: 200)

        /// General Proposal Configs
        ("PROPOSAL_VOTE_AVAILABILITY_DURATION", #Duration(7)), // Duration (in days) of a proposal available for voting (current: 7 days)
        ("CUSTODIAN_PROPOSAL_APPROVAL_REFUND", #Proportion(Proportion.make(1, 1))), // Proportion (in %) of the fee refunded for custodian proposal (current: 100%)
        ("PROPOSAL_DRAFT_CANCELLATION_REFUND", #Proportion(Proportion.make(4, 5))), // Proportion (in %) of the fee refunded for draft cancellation/expiration (current: 80%)
        ("PROPOSAL_RETRY_FEE_DEDUCTION", #Proportion(Proportion.make(4, 5))), // Proportion (in %) of the fee deducted for each retry (current: 80%)
        ("MAX_PROPOSAL_RETRIES", #Nat(2)), // Maximum number of attempts for a proposal to retry with modifications (current: 3)

        /// Code Proposal Configs
        ("CODE_PROPOSAL_OPEN_FEE", #E8S(E8S.fromFloat(1_000.0))), // Fee (in 10^8) for each proposal (current: 1,000 * 10^8)
        ("CODE_PROPOSAL_APPROVAL_THRESHOLD", #Proportion(Proportion.make(4, 5))), // Proportion (in %) of the positive vote threshold for approval (current: 80%)
        ("CODE_PROPOSAL_APPROVAL_REFUND", #Proportion(Proportion.make(0, 1))), // Proportion (in %) of the fee refunded for approval (current: 0%)

        /// Worker Proposal Configs
        ("WORKER_PROPOSAL_OPEN_FEE", #E8S(E8S.fromFloat(100.0))), // Fee (in 10^8) for each proposal (current: 100 * 10^8)
        ("WORKER_PROPOSAL_APPROVAL_THRESHOLD", #Proportion(Proportion.make(3, 5))), // Proportion (in %) of the positive vote threshold for approval (current: 60%)
        ("WORKER_PROPOSAL_APPROVAL_REFUND", #Proportion(Proportion.make(0, 1))), // Proportion (in %) of the fee refunded for approval (current: 0%)

        /// Configs Proposal Configs
        ("CONFIGS_PROPOSAL_OPEN_FEE", #E8S(E8S.fromFloat(100.0))), // Fee (in 10^8) for each proposal (current: 100 * 10^8)
        ("CONFIGS_PROPOSAL_APPROVAL_THRESHOLD", #Proportion(Proportion.make(4, 5))), // Proportion (in %) of the positive vote threshold for approval (current: 80%)
        ("CONFIGS_PROPOSAL_APPROVAL_REFUND", #Proportion(Proportion.make(0, 1))), // Proportion (in %) of the fee refunded for approval (current: 0%)

        /// Field Proposal Configs
        ("FIELD_PROPOSAL_OPEN_FEE", #E8S(E8S.fromFloat(50.0))), // Fee (in 10^8) for each proposal (current: 100 * 10^8)
        ("FIELD_PROPOSAL_APPROVAL_THRESHOLD", #Proportion(Proportion.make(3, 5))), // Proportion (in %) of the positive vote threshold for approval (current: 60%)
        ("FIELD_PROPOSAL_APPROVAL_REFUND", #Proportion(Proportion.make(1, 1))), // Proportion (in %) of the fee refunded for approval (current: 0%)
        ("FIELD_PROPOSAL_FIXED_ACORN_REWARD", #E8S(E8S.fromFloat(10.0))), // Fixed reward (in 10^8) for each proposal (current: 10 * 10^8)
        ("FIELD_PROPOSAL_FIXED_ICP_REWARD", #E8S(E8S.fromFloat(0.0))), // Fixed reward (in 10^8) for each proposal (current: 0 * 10^8)

        /// Referendum Configs
        ("REFERENDUM_OPEN_FEE", #E8S(E8S.fromFloat(10_000.0))), // Fee (in 10^8) for each launch (current: 10,000 * 10^8)
        ("REFERENDUM_APPROVAL_THRESHOLD", #Proportion(Proportion.make(4, 5))), // Proportion (in %) of the positive vote threshold for approval (current: 80%)
        ("REFERENDUM_APPROVAL_REFUND", #Proportion(Proportion.make(0, 1))), // Proportion (in %) of the fee refunded for approval (current: 0%)
    ]);

    /// PRIVATE ////// MODIFIERS ////////////

    private func _executeFieldProposal(proposal : Proposal.Proposal) : async ?Nat {
        try {
            let detachment : Detachment.Field = Detachment.field(proposal.detachment);
            let Axioms : AxiomsInterface.Axioms = await Indicator.Axioms();
            await Axioms.createField(detachment.name, detachment.description);

            let FIELD_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "FIELD_PROPOSAL_OPEN_FEE");
            let FIELD_PROPOSAL_APPROVAL_REFUND : Proportion.Proportion = switch (Nominees.custodianFound(nominees, proposal.proposer)) {
                case (true) Configs.Proportion(configs, "CUSTODIAN_PROPOSAL_APPROVAL_REFUND");
                case (false) Configs.Proportion(configs, "FIELD_PROPOSAL_APPROVAL_REFUND")
            };
            let refund : E8S.E8S = E8S.getScaleBy(FIELD_PROPOSAL_OPEN_FEE, FIELD_PROPOSAL_APPROVAL_REFUND);
            let proposer : User.User = Users.user(users, proposal.proposer);
            User.depositAcornTransfer(proposer, refund);
            Proposal.executed(proposal, getNow);
            ?refund.val
        } catch (error) {
            Proposal.failed(proposal, Error.message(error), getNow);
            null
        }
    };
    private func _executeWorkerProposal(proposal : Proposal.Proposal) : async ?Nat {
        let WORKER_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "WORKER_PROPOSAL_OPEN_FEE");
        let WORKER_PROPOSAL_APPROVAL_REFUND : Proportion.Proportion = switch (Nominees.custodianFound(nominees, proposal.proposer)) {
            case (true) Configs.Proportion(configs, "CUSTODIAN_PROPOSAL_APPROVAL_REFUND");
            case (false) Configs.Proportion(configs, "WORKER_PROPOSAL_APPROVAL_REFUND")
        };
        let refund : E8S.E8S = E8S.getScaleBy(WORKER_PROPOSAL_OPEN_FEE, WORKER_PROPOSAL_APPROVAL_REFUND);
        let proposer : User.User = Users.user(users, proposal.proposer);
        User.depositAcornTransfer(proposer, refund);
        Proposal.executed(proposal, getNow);
        ?refund.val
    };
    private func _executeConfigsProposal(proposal : Proposal.Proposal) : async ?Nat {
        try {
            let detachment : Detachment.Configs = Detachment.configs(proposal.detachment);
            await Indicator.setActorsConfigs(detachment.actorsConfigs);

            let CONFIGS_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "CONFIGS_PROPOSAL_OPEN_FEE");
            let CONFIGS_PROPOSAL_APPROVAL_REFUND : Proportion.Proportion = switch (Nominees.custodianFound(nominees, proposal.proposer)) {
                case (true) Configs.Proportion(configs, "CUSTODIAN_PROPOSAL_APPROVAL_REFUND");
                case (false) Configs.Proportion(configs, "CONFIGS_PROPOSAL_APPROVAL_REFUND")
            };
            let refund : E8S.E8S = E8S.getScaleBy(CONFIGS_PROPOSAL_OPEN_FEE, CONFIGS_PROPOSAL_APPROVAL_REFUND);
            let proposer : User.User = Users.user(users, proposal.proposer);
            User.depositAcornTransfer(proposer, refund);
            Proposal.executed(proposal, getNow);
            ?refund.val
        } catch (error) {
            Proposal.failed(proposal, Error.message(error), getNow);
            null
        }
    };
    private func _executeApprovedProposals() : async List.List<(Nat, ?Nat, Principal)> {
        var successProposals : List.List<(Nat, ?Nat, Principal)> = List.nil();
        label executing for ((id, proposal) in Proposals.lockedProposals(proposals)) {
            let claimable : ?Nat = switch (Proposal.variant(proposal)) {
                case (#Code) continue executing; // unreachable
                case (#Field) await _executeFieldProposal(proposal);
                case (#Worker) await _executeWorkerProposal(proposal);
                case (#Configs) await _executeConfigsProposal(proposal)
            };
            let proposer : User.User = Users.user(users, proposal.proposer);
            User.depositAcornMint(proposer, proposal.acornReward);
            User.depositIcp(proposer, proposal.icpReward);

            successProposals := List.push((id, claimable, proposal.proposer), successProposals)
        };
        Proposals.cleanUpLockedProposals(proposals);
        successProposals
    };
    private func _executeCleanUpExpiredProposals() : List.List<(Nat, Principal)> {
        let PROPOSAL_VOTE_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "PROPOSAL_VOTE_AVAILABILITY_DURATION");
        Proposals.cleanUpExpiredProposals(proposals, PROPOSAL_VOTE_AVAILABILITY_DURATION, getNow)
    };
    private func _executePayoutCustodians() : Nat {
        let PERIOD_CUSTODIAN_PAYOUT : E8S.E8S = Configs.E8S(configs, "PERIOD_CUSTODIAN_PAYOUT");
        for (custodian in Nominees.custodians(nominees)) {
            let user : User.User = Users.user(users, custodian);
            User.depositAcornMint(user, PERIOD_CUSTODIAN_PAYOUT)
        };
        PERIOD_CUSTODIAN_PAYOUT.val
    };
    private func _executeTallyElection() : ([Principal], [Principal], [Principal]) {
        let MAX_CUSTODIANS : Nat = Configs.Nat(configs, "MAX_CUSTODIANS");
        let BALLOT_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "BALLOT_AVAILABILITY_DURATION");

        let hasExpiredBallot : Principal -> Bool = _hasExpiredBallotCallback(BALLOT_AVAILABILITY_DURATION);
        let (removed, unchanged, new) : (Set.Set<Principal>, Set.Set<Principal>, Set.Set<Principal>) = Nominees.tally(nominees, MAX_CUSTODIANS, hasExpiredBallot);

        if (Set.size(removed) == 0) return (Set.toArray(removed), Set.toArray(unchanged), Set.toArray(new));

        for ((id, votableProposal) in Proposals.votableProposals(proposals)) {
            for (custodian in Set.vals(unchanged)) {
                let user : User.User = Users.user(users, custodian);
                switch (User.getProposalVote(user, id)) {
                    case (?(#Delegated(delegatee))) if (Set.includes(removed, Set.PrincipalVal(delegatee))) {
                        User.removeProposalVote(user, id);
                        Proposal.removeVote(votableProposal, custodian, { choice = #Delegated })
                    };
                    case (_) {}
                }
            };
            for (custodian in Set.vals(removed)) {
                let user : User.User = Users.user(users, custodian);
                switch (User.getProposalVote(user, id)) {
                    case (?(#Default(vote))) Proposal.removeVote(votableProposal, custodian, vote);
                    case (?(#Delegated(_))) Proposal.removeVote(votableProposal, custodian, { choice = #Delegated });
                    case (null) {}
                };
                User.removeProposalVote(user, id)
            }
        };
        (Set.toArray(removed), Set.toArray(unchanged), Set.toArray(new))
    };

    private func _dailyExecution() : async () {
        let PERIOD_DURATION : Nat = Configs.Duration(configs, "PERIOD_DURATION");
        Count.increment(daysInPeriod);

        let expiredProposals : List.List<(Nat, Principal)> = _executeCleanUpExpiredProposals();
        let successProposals : List.List<(Nat, ?Nat, Principal)> = await _executeApprovedProposals();

        var systemNotifications : List.List<Notification.SystemVariantParam> = List.nil();
        var usersNotifications : List.List<(Principal, Notification.UserVariantParam)> = List.nil();

        if (daysInPeriod.val >= PERIOD_DURATION) {
            let claimable : Nat = _executePayoutCustodians();
            let (removed, unchanged, new) : ([Principal], [Principal], [Principal]) = _executeTallyElection();
            Count.reset(daysInPeriod);

            systemNotifications := List.push(
                #TallyResult({ removed; unchanged; new; timestamp = getNow() }),
                systemNotifications,
            );
            for (custodian in removed.vals()) {
                usersNotifications := List.push((custodian, #CustodianElectionResult({ result = #Removed; claimable; timestamp = getNow() })), usersNotifications)
            };
            for (custodian in unchanged.vals()) {
                usersNotifications := List.push((custodian, #CustodianElectionResult({ result = #Unchanged; claimable; timestamp = getNow() })), usersNotifications)
            };
            for (custodian in new.vals()) {
                usersNotifications := List.push((custodian, #CustodianElectionResult({ result = #New; claimable; timestamp = getNow() })), usersNotifications)
            }
        };

        for ((proposalId, proposer) in List.toIter(expiredProposals)) {
            usersNotifications := List.push((proposer, #ProposalResult({ proposalId; result = #Expired; timestamp = getNow() })), usersNotifications)
        };
        for ((proposalId, claimable, proposer) in List.toIter(successProposals)) {
            switch (claimable) {
                case (null) {
                    usersNotifications := List.push((proposer, #ProposalExecuted({ proposalId; claimable = 0; result = #Failed; timestamp = getNow() })), usersNotifications);
                    systemNotifications := List.push(#ProposalExecuted({ proposalId; proposer; result = #Failed; timestamp = getNow() }), systemNotifications)
                };
                case (?claimable) {
                    usersNotifications := List.push((proposer, #ProposalExecuted({ proposalId; claimable; result = #Executed; timestamp = getNow() })), usersNotifications);
                    systemNotifications := List.push(#ProposalExecuted({ proposalId; proposer; result = #Executed; timestamp = getNow() }), systemNotifications)
                }
            }
        };

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore (Facade.postSystemNotifications(systemNotifications), Facade.postUsersNotifications(usersNotifications))
            }
        )()
    };

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func initialize() : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        await Indicator.expectUnreleased();

        let founder : Principal = await Indicator.getPrincipal(#Founder);
        Users.addFounder(users, founder, getNow);
        Nominees.addFounder(nominees, founder)
    };
    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func register(principal : Principal) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);
        Users.register(users, principal, getNow)
    };

    public shared ({ caller }) func setCodeProposalFailed(proposalId : Nat, error : Text) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        let proposal : Proposal.Proposal = Proposals.proposal(proposals, proposalId);
        Proposal.expectCode(proposal);

        if (Nominees.custodianFound(nominees, proposal.proposer)) {
            let PROPOSAL_OPEN_FEE : E8S.E8S = switch (Proposal.variant(proposal)) {
                case (#Code) Configs.E8S(configs, "CODE_PROPOSAL_OPEN_FEE");
                case (#Field) Configs.E8S(configs, "FIELD_PROPOSAL_OPEN_FEE");
                case (#Worker) Configs.E8S(configs, "WORKER_PROPOSAL_OPEN_FEE");
                case (#Configs) Configs.E8S(configs, "CONFIGS_PROPOSAL_OPEN_FEE")
            };
            let CUSTODIAN_REFUND : Proportion.Proportion = Configs.Proportion(configs, "CUSTODIAN_PROPOSAL_APPROVAL_REFUND");
            let refund : E8S.E8S = E8S.getScaleBy(PROPOSAL_OPEN_FEE, CUSTODIAN_REFUND);
            let proposer : User.User = Users.user(users, proposal.proposer);
            User.depositAcornTransfer(proposer, refund)
        };
        Proposal.failed(proposal, error, getNow);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore (
                    Facade.postUserNotification(proposal.proposer, #ProposalExecuted({ proposalId; result = #Failed; claimable = 0; timestamp = getNow() })),
                    Facade.postSystemNotification(#ProposalExecuted({ proposalId; proposer = proposal.proposer; result = #Failed; timestamp = getNow() })),
                )
            }
        )()
    };
    public shared ({ caller }) func setCodeProposalExecuted(proposalId : Nat) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        let proposal : Proposal.Proposal = Proposals.proposal(proposals, proposalId);
        Proposal.expectCode(proposal);

        let CODE_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "CODE_PROPOSAL_OPEN_FEE");
        let CODE_PROPOSAL_APPROVAL_REFUND : Proportion.Proportion = switch (Nominees.custodianFound(nominees, proposal.proposer)) {
            case (true) Configs.Proportion(configs, "CUSTODIAN_PROPOSAL_APPROVAL_REFUND");
            case (false) Configs.Proportion(configs, "CODE_PROPOSAL_APPROVAL_REFUND")
        };
        let refund : E8S.E8S = E8S.getScaleBy(CODE_PROPOSAL_OPEN_FEE, CODE_PROPOSAL_APPROVAL_REFUND);
        let proposer : User.User = Users.user(users, proposal.proposer);
        User.depositAcornTransfer(proposer, refund);
        Proposal.executed(proposal, getNow);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore (
                    Facade.postUserNotification(proposal.proposer, #ProposalExecuted({ proposalId; result = #Executed; claimable = refund.val; timestamp = getNow() })),
                    Facade.postSystemNotification(#ProposalExecuted({ proposalId; proposer = proposal.proposer; result = #Executed; timestamp = getNow() })),
                )
            }
        )()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func initializeCodeUploadSession(commitHash : Text, updateLevel : Version.UpdateLevel, releaseNotes : Installation.ReleaseNotes, commitments : Commitments.Sharable) : async () {
        let CODE_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "CODE_PROPOSAL_OPEN_FEE");
        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, CODE_PROPOSAL_OPEN_FEE.val);
        await Indicator.initializeSession(caller, commitHash, updateLevel, releaseNotes, commitments)
    };
    public shared ({ caller }) func cancelCodeUpload() : async () {
        await Indicator.deleteSession(caller);
        let CODE_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "CODE_PROPOSAL_OPEN_FEE");
        let PROPOSAL_DRAFT_CANCELLATION_REFUND : Proportion.Proportion = Configs.Proportion(configs, "PROPOSAL_DRAFT_CANCELLATION_REFUND");
        let refund : E8S.E8S = E8S.getDeductBy(CODE_PROPOSAL_OPEN_FEE, PROPOSAL_DRAFT_CANCELLATION_REFUND);
        let user : User.User = Users.user(users, caller);
        User.depositAcornTransfer(user, refund)
    };
    public shared ({ caller }) func openCodeProposal(content : Text, acornReward : Nat, icpReward : Nat, actorsConfigs : Installation.ActorsConfigs) : async Nat {
        let PROPOSAL_VOTE_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "PROPOSAL_VOTE_AVAILABILITY_DURATION");
        let user : User.User = Users.user(users, caller);

        await Indicator.extendInstallationExpiryDate(caller, PROPOSAL_VOTE_AVAILABILITY_DURATION);
        let (installation, title) : (Installation.Sharable, Text) = await Indicator.getInstallationWithTitle(caller);
        Proposals.openCodeProposal(proposals, caller, title, content, acornReward, icpReward, actorsConfigs, installation, getNow);

        let proposalId = Proposals.lastId(proposals);
        User.proposeProposal(user, proposalId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(Iter.toList(Set.vals(nominees.custodians)), #CustodianProposalOpened({ proposalId; proposer = caller; retried = 0; timestamp = getNow() }))
            }
        )();

        proposalId
    };
    public shared ({ caller }) func openConfigsProposal(content : Text, acornReward : Nat, icpReward : Nat, actorsConfigs : Installation.ActorsConfigs) : async Nat {
        let WORKER_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "CONFIGS_PROPOSAL_OPEN_FEE");
        let user : User.User = Users.user(users, caller);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, WORKER_PROPOSAL_OPEN_FEE.val);
        Proposals.openConfigsProposal(proposals, caller, content, acornReward, icpReward, actorsConfigs, getNow);

        let proposalId = Proposals.lastId(proposals);
        User.proposeProposal(user, proposalId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(Iter.toList(Set.vals(nominees.custodians)), #CustodianProposalOpened({ proposalId; proposer = caller; retried = 0; timestamp = getNow() }))
            }
        )();

        proposalId
    };
    public shared ({ caller }) func openWorkerProposal(title : Text, content : Text, acornReward : Nat, icpReward : Nat) : async Nat {
        let WORKER_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "WORKER_PROPOSAL_OPEN_FEE");
        let user : User.User = Users.user(users, caller);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, WORKER_PROPOSAL_OPEN_FEE.val);
        Proposals.openWorkerProposal(proposals, caller, title, content, acornReward, icpReward, getNow);

        let proposalId = Proposals.lastId(proposals);
        User.proposeProposal(user, proposalId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(Iter.toList(Set.vals(nominees.custodians)), #CustodianProposalOpened({ proposalId; proposer = caller; retried = 0; timestamp = getNow() }))
            }
        )();

        proposalId
    };
    public shared ({ caller }) func openFieldProposal(content : Text, name : Text, description : Text) : async Nat {
        let FIELD_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "FIELD_PROPOSAL_OPEN_FEE");
        let FIELD_PROPOSAL_FIXED_ACORN_REWARD : E8S.E8S = Configs.E8S(configs, "FIELD_PROPOSAL_FIXED_ACORN_REWARD");
        let FIELD_PROPOSAL_FIXED_ICP_REWARD : E8S.E8S = Configs.E8S(configs, "FIELD_PROPOSAL_FIXED_ICP_REWARD");
        let user : User.User = Users.user(users, caller);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, FIELD_PROPOSAL_OPEN_FEE.val);
        Proposals.openFieldProposal(proposals, caller, content, FIELD_PROPOSAL_FIXED_ACORN_REWARD.val, FIELD_PROPOSAL_FIXED_ICP_REWARD.val, name, description, getNow);

        let proposalId = Proposals.lastId(proposals);
        User.proposeProposal(user, proposalId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(Iter.toList(Set.vals(nominees.custodians)), #CustodianProposalOpened({ proposalId; proposer = caller; retried = 0; timestamp = getNow() }))
            }
        )();

        proposalId
    };

    // No retires for Code Proposals
    public shared ({ caller }) func retryConfigsProposal(proposalId : Nat, updatedContent : Text, updatedAcornReward : Nat, updatedIcpReward : Nat, updatedActorsConfigs : Installation.ActorsConfigs) : async () {
        let MAX_PROPOSAL_RETRIES : Nat = Configs.Nat(configs, "MAX_PROPOSAL_RETRIES");
        let CONFIGS_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "CONFIGS_PROPOSAL_OPEN_FEE");
        let PROPOSAL_RETRY_FEE_DEDUCTION : Proportion.Proportion = Configs.Proportion(configs, "PROPOSAL_RETRY_FEE_DEDUCTION");

        let proposal : Proposal.Proposal = Proposals.proposal(proposals, proposalId);
        Proposal.expectProposer(proposal, caller);
        Proposal.expectRetriable(proposal, MAX_PROPOSAL_RETRIES);
        Proposal.expectConfigs(proposal);

        let retryFee : E8S.E8S = E8S.getDeductBy(CONFIGS_PROPOSAL_OPEN_FEE, PROPOSAL_RETRY_FEE_DEDUCTION);
        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, retryFee.val);

        for (voter in UniformBinaryVotes.voters(proposal.votes)) {
            let user : User.User = Users.user(users, voter);
            User.removeProposalVote(user, proposalId)
        };
        Proposal.retryConfigs(proposal, updatedContent, updatedAcornReward, updatedIcpReward, updatedActorsConfigs, getNow);
        Proposals.retry(proposals, proposalId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(Iter.toList(Set.vals(nominees.custodians)), #CustodianProposalOpened({ proposalId; proposer = caller; retried = Proposal.retries(proposal); timestamp = getNow() }))
            }
        )()
    };
    public shared ({ caller }) func retryWorkerProposal(proposalId : Nat, updatedContent : Text, updatedAcornReward : Nat, updatedIcpReward : Nat) : async () {
        let MAX_PROPOSAL_RETRIES : Nat = Configs.Nat(configs, "MAX_PROPOSAL_RETRIES");
        let WORKER_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "WORKER_PROPOSAL_OPEN_FEE");
        let PROPOSAL_RETRY_FEE_DEDUCTION : Proportion.Proportion = Configs.Proportion(configs, "PROPOSAL_RETRY_FEE_DEDUCTION");

        let proposal : Proposal.Proposal = Proposals.proposal(proposals, proposalId);
        Proposal.expectProposer(proposal, caller);
        Proposal.expectRetriable(proposal, MAX_PROPOSAL_RETRIES);
        Proposal.expectWorker(proposal);

        let retryFee : E8S.E8S = E8S.getDeductBy(WORKER_PROPOSAL_OPEN_FEE, PROPOSAL_RETRY_FEE_DEDUCTION);
        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, retryFee.val);

        for (voter in UniformBinaryVotes.voters(proposal.votes)) {
            let user : User.User = Users.user(users, voter);
            User.removeProposalVote(user, proposalId)
        };
        Proposal.retryWorker(proposal, updatedContent, updatedAcornReward, updatedIcpReward, getNow);
        Proposals.retry(proposals, proposalId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(Iter.toList(Set.vals(nominees.custodians)), #CustodianProposalOpened({ proposalId; proposer = caller; retried = Proposal.retries(proposal); timestamp = getNow() }))
            }
        )()
    };
    public shared ({ caller }) func retryFieldProposal(proposalId : Nat, updatedContent : Text, updatedName : Text, updatedDescription : Text) : async () {
        let MAX_PROPOSAL_RETRIES : Nat = Configs.Nat(configs, "MAX_PROPOSAL_RETRIES");
        let FIELD_PROPOSAL_OPEN_FEE : E8S.E8S = Configs.E8S(configs, "FIELD_PROPOSAL_OPEN_FEE");
        let PROPOSAL_RETRY_FEE_DEDUCTION : Proportion.Proportion = Configs.Proportion(configs, "PROPOSAL_RETRY_FEE_DEDUCTION");

        let proposal : Proposal.Proposal = Proposals.proposal(proposals, proposalId);
        Proposal.expectProposer(proposal, caller);
        Proposal.expectRetriable(proposal, MAX_PROPOSAL_RETRIES);
        Proposal.expectField(proposal);

        let retryFee : E8S.E8S = E8S.getDeductBy(FIELD_PROPOSAL_OPEN_FEE, PROPOSAL_RETRY_FEE_DEDUCTION);
        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, retryFee.val);

        for (voter in UniformBinaryVotes.voters(proposal.votes)) {
            let user : User.User = Users.user(users, voter);
            User.removeProposalVote(user, proposalId)
        };
        Proposal.retryField(proposal, updatedContent, updatedName, updatedDescription, getNow);
        Proposals.retry(proposals, proposalId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(Iter.toList(Set.vals(nominees.custodians)), #CustodianProposalOpened({ proposalId; proposer = caller; retried = Proposal.retries(proposal); timestamp = getNow() }))
            }
        )()
    };

    public shared ({ caller }) func voteProposal(proposalId : Nat, choice : Delegable.Delegable<UniformBinaryVotes.Choice>) : async () {
        let user : User.User = Users.user(users, caller);
        let proposal : Proposal.Proposal = Proposals.proposal(proposals, proposalId);

        Proposal.expectVotable(proposal);
        Nominees.expectCustodianFound(nominees, caller);

        var usersNotifications : List.List<(Principal, Notification.UserVariantParam)> = List.nil();

        let delegableVote : Delegable.Delegable<UniformBinaryVotes.Vote> = switch (choice) {
            case (#Delegated(delegatee)) {
                if (delegatee == caller) E.f(#NOT_VALID("Proposal Vote"), "Delegatee cannot be yourself");
                switch (User.getProposalVote(Users.user(users, delegatee), proposalId)) {
                    case (?delegateeVote) {
                        switch (delegateeVote) {
                            case (#Default({ choice })) {
                                switch (choice) {
                                    case (#Delegated) {};
                                    case (#Positive) usersNotifications := List.push((proposal.proposer, #NewVotesToProposal({ id = proposalId; data = { voter = caller; choice = #Positive; timestamp = getNow() } })), usersNotifications);
                                    case (#Negative) usersNotifications := List.push((proposal.proposer, #NewVotesToProposal({ id = proposalId; data = { voter = caller; choice = #Negative; timestamp = getNow() } })), usersNotifications)
                                }
                            };
                            case (#Delegated(delegatee)) usersNotifications := List.push((delegatee, #CustodianProposalDelegated({ proposalId; delegator = caller; timestamp = getNow() })), usersNotifications)
                        };
                        delegateeVote
                    };
                    case (null) {
                        usersNotifications := List.push((delegatee, #CustodianProposalDelegated({ proposalId; delegator = caller; timestamp = getNow() })), usersNotifications);
                        #Delegated(delegatee)
                    }
                }
            };
            case (#Default(choice)) #Default({ choice })
        };
        switch (delegableVote) {
            case (#Delegated(_)) {
                switch (User.getProposalVote(user, proposalId)) {
                    /// old (default) vote -> new (delegated) vote
                    case (?(#Default(existedVote))) Proposal.updateVote(proposal, caller, existedVote, { choice = #Delegated });
                    /// old (none / delegated) vote -> new (delegated) vote
                    case (?(#Delegated(_))) {};
                    /// old (none) vote -> new (delegated) vote
                    case (null) Proposal.addVote(proposal, caller, { choice = #Delegated })
                };
                /// override old (none / delegated / default) vote to new (delegated) vote
                User.voteProposal(user, proposalId, delegableVote);

                label custodianIterating for (custodian in Nominees.custodians(nominees)) {
                    if (custodian != caller) {
                        /// update votes for delegating custodian
                        let custodianUser : User.User = Users.user(users, custodian);
                        switch (User.getProposalVote(custodianUser, proposalId)) {
                            case (?(#Delegated(delegatee))) if (delegatee == caller) User.voteProposal(custodianUser, proposalId, delegableVote);
                            case (_) {}
                        }
                    }
                }
            };
            case (#Default(vote)) {
                switch (User.getProposalVote(user, proposalId)) {
                    /// old (default) vote -> new (default) vote
                    case (?(#Default(existedVote))) Proposal.updateVote(proposal, caller, existedVote, vote);
                    /// old (delegated) vote -> new (default) vote
                    case (?(#Delegated(_))) Proposal.updateVote(proposal, caller, { choice = #Delegated }, vote);
                    /// old (none) vote -> new (default) vote
                    case (null) Proposal.addVote(proposal, caller, vote)
                };
                /// override old (none / delegated / default) vote to new (default) vote
                User.voteProposal(user, proposalId, delegableVote);

                label custodianIterating for (custodian in Nominees.custodians(nominees)) {
                    if (custodian != caller) {
                        /// update votes for delegating custodian
                        let custodianUser : User.User = Users.user(users, custodian);
                        switch (User.getProposalVote(custodianUser, proposalId)) {
                            case (?(#Delegated(delegatee))) if (delegatee == caller) {
                                Proposal.updateVote(proposal, custodian, { choice = #Delegated }, vote);
                                User.voteProposal(custodianUser, proposalId, delegableVote)
                            };
                            case (_) {}
                        }
                    }
                };

                let (positiveProportion, negativeProportion) : (Proportion.Proportion, Proportion.Proportion) = Proposal.getVoteProportions(proposal, Set.size(nominees.custodians));
                let APPROVAL_THRESHOLD : Proportion.Proportion = switch (Proposal.variant(proposal)) {
                    case (#Code) Configs.Proportion(configs, "CODE_PROPOSAL_APPROVAL_THRESHOLD");
                    case (#Field) Configs.Proportion(configs, "FIELD_PROPOSAL_APPROVAL_THRESHOLD");
                    case (#Worker) Configs.Proportion(configs, "WORKER_PROPOSAL_APPROVAL_THRESHOLD");
                    case (#Configs) Configs.Proportion(configs, "CONFIGS_PROPOSAL_APPROVAL_THRESHOLD")
                };
                if (Proportion.gte(positiveProportion, APPROVAL_THRESHOLD)) {
                    Proposal.approved(proposal, getNow);
                    Proposals.removeRetry(proposals, proposalId);

                    switch (proposal.detachment) {
                        case (#Code(detachment)) await Indicator.enqueueUpgradeTask(proposalId, proposal.proposer, detachment.actorsConfigs);
                        case (_) Proposals.lock(proposals, proposalId)
                    };

                    usersNotifications := List.push((proposal.proposer, #ProposalResult({ proposalId; result = #Approved; timestamp = getNow() })), usersNotifications);
                    for (custodian in Nominees.custodians(nominees)) {
                        usersNotifications := List.push((custodian, #CustodianProposalResult({ proposalId; proposer = proposal.proposer; result = #Approved; timestamp = getNow() })), usersNotifications)
                    };
                    ignore (
                        func() : async () {
                            let Facade : FacadeInterface.Facade = await Indicator.Facade();
                            ignore Facade.postUsersNotifications(usersNotifications)
                        }
                    )();

                    return
                };
                let REJECTION_THRESHOLD : Proportion.Proportion = Proportion.getComplement(APPROVAL_THRESHOLD);
                if (Proportion.gt(negativeProportion, REJECTION_THRESHOLD)) {
                    Proposal.rejected(proposal, getNow);
                    Proposals.removeRetry(proposals, proposalId);

                    if (Nominees.custodianFound(nominees, proposal.proposer)) {
                        let PROPOSAL_OPEN_FEE : E8S.E8S = switch (Proposal.variant(proposal)) {
                            case (#Code) Configs.E8S(configs, "CODE_PROPOSAL_OPEN_FEE");
                            case (#Field) Configs.E8S(configs, "FIELD_PROPOSAL_OPEN_FEE");
                            case (#Worker) Configs.E8S(configs, "WORKER_PROPOSAL_OPEN_FEE");
                            case (#Configs) Configs.E8S(configs, "CONFIGS_PROPOSAL_OPEN_FEE")
                        };
                        let CUSTODIAN_REFUND : Proportion.Proportion = Configs.Proportion(configs, "CUSTODIAN_PROPOSAL_APPROVAL_REFUND");
                        let refund : E8S.E8S = E8S.getScaleBy(PROPOSAL_OPEN_FEE, CUSTODIAN_REFUND);
                        let proposer : User.User = Users.user(users, proposal.proposer);
                        User.depositAcornTransfer(proposer, refund)
                    };

                    usersNotifications := List.push((proposal.proposer, #ProposalResult({ proposalId; result = #Rejected; timestamp = getNow() })), usersNotifications);
                    for (custodian in Nominees.custodians(nominees)) {
                        usersNotifications := List.push((custodian, #CustodianProposalResult({ proposalId; proposer = proposal.proposer; result = #Rejected; timestamp = getNow() })), usersNotifications)
                    };
                    ignore (
                        func() : async () {
                            let Facade : FacadeInterface.Facade = await Indicator.Facade();
                            ignore Facade.postUsersNotifications(usersNotifications)
                        }
                    )();

                    return
                }
            }
        };

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotifications(usersNotifications)
            }
        )()
    };

    public shared ({ caller }) func enterElection(title : Text) : async () {
        Users.expectFound(users, caller);
        Nominees.expectNomineeNotFound(nominees, caller);
        Nominees.expectTitleValid(title, configs);

        let nominee : Nominee.Nominee = Nominee.init(title);
        Nominees.nominate(nominees, caller, nominee)
    };
    public shared ({ caller }) func leaveElection() : async () {
        let nominee : Nominee.Nominee = Nominees.nominee(nominees, caller);
        for (voter in Nominee.voters(nominee)) {
            let user : User.User = Users.user(users, voter);
            User.withdrawBallot(user, caller)
        };
        Nominees.eliminate(nominees, caller)
    };
    public shared ({ caller }) func updateNomineeTitle(title : Text) : async () {
        let nominee : Nominee.Nominee = Nominees.nominee(nominees, caller);
        Nominees.expectTitleValid(title, configs);
        Nominee.updateTitle(nominee, title)
    };

    public shared ({ caller }) func castBallots(principals : [Principal]) : async () {
        let MAX_BALLOTS : Nat = Configs.Nat(configs, "MAX_BALLOTS");
        let BALLOT_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "BALLOT_AVAILABILITY_DURATION");

        if (principals.size() > MAX_BALLOTS) E.f(#NOT_VALID("Nominee Voting"), "Ballots exceed limit " # debug_show MAX_BALLOTS # ", given " # debug_show principals.size());
        let user : User.User = Users.user(users, caller);

        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
        let value : Nat = await Escrow.getVotingPower(caller);
        if (value == 1) E.f(#NOT_TOBE("Staked User"), "Nominee voting only counts for staked users");

        let hasExpiredBallot : Principal -> Bool = _hasExpiredBallotCallback(BALLOT_AVAILABILITY_DURATION);

        for (ballotToRemove in User.ballotsExcept(user, principals).vals()) {
            let nominee : Nominee.Nominee = Nominees.nominee(nominees, ballotToRemove);
            ignore Nominee.cleanUpExpiredBallots(nominee, hasExpiredBallot);
            Nominee.withdrawBallot(nominee, caller);
            User.withdrawBallot(user, ballotToRemove)
        };
        User.clearBallots(user, getNow);
        for (ballotToCast in principals.vals()) {
            let nominee : Nominee.Nominee = Nominees.nominee(nominees, ballotToCast);
            ignore Nominee.cleanUpExpiredBallots(nominee, hasExpiredBallot);
            Nominee.castBallot(nominee, caller, value);
            User.castBallot(user, ballotToCast)
        };

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                ignore Facade.postUsersNotification(List.fromArray(principals), #NewBallots({ voter = caller; timestamp = getNow() }))
            }
        )()
    };

    public shared ({ caller }) func withdrawAll() : async () {
        let user : User.User = Users.user(users, caller);

        let acornMintBalance : E8S.E8S = Earning.balance(user.acornMintEarning);
        let acornTransferBalance : E8S.E8S = Earning.balance(user.acornTransferEarning);
        let icpBalance : E8S.E8S = Earning.balance(user.icpEarning);

        if (E8S.isZero(acornMintBalance) and E8S.isZero(acornTransferBalance) and E8S.isZero(icpBalance)) {
            Earning.expectPositiveBalance(user.acornMintEarning)
        };

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        let Split : SplitInterface.Split = await Indicator.Split();

        if (not E8S.isZero(acornMintBalance)) {
            await Treasury.externalMint(caller, acornMintBalance.val);
            User.withdrawAcornMint(user, acornMintBalance, getNow)
        };
        if (not E8S.isZero(acornTransferBalance)) {
            await Treasury.externalTransfer(caller, acornTransferBalance.val);
            User.withdrawAcornTransfer(user, acornTransferBalance, getNow)
        };
        if (not E8S.isZero(icpBalance)) {
            await Split.externalTransfer(caller, icpBalance.val);
            User.withdrawIcp(user, icpBalance, getNow)
        }
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _hasExpiredBallotCallback(duration : Nat) : Principal -> Bool = func(principal) = User.hasExpiredBallot(Users.user(users, principal), duration, getNow);
    private func _userBallotCallback(user : Principal) : Principal -> Nat = func(nominee) = Nominee.ballot(Nominees.nominee(nominees, nominee), user);
    private func _getUser(principal : Principal) : User.User = Users.user(users, principal);
    private func _getProposal(id : Nat) : Proposal.Proposal = Proposals.proposal(proposals, id);

    private func _getCallerUser(caller : Principal) : ?(Principal, User.User) = switch (not Principal.isAnonymous(caller)) {
        case (true) switch (Users.userOpt(users, caller)) {
            case (?user) ?(caller, user);
            case (null) null
        };
        case (false) null
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query func getDaysInPeriod() : async Count.Sharable {
        Count.toSharable(daysInPeriod)
    };

    public query ({ caller }) func getNominee(nomineePrincipal : Principal) : async Nominee.Sharable {
        let BALLOT_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "BALLOT_AVAILABILITY_DURATION");
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let hasExpiredBallot : Principal -> Bool = _hasExpiredBallotCallback(BALLOT_AVAILABILITY_DURATION);
        let getCallerBallot : Nominee.Nominee -> ?Nat = Nominee.callerBallotCallback(callerUser, BALLOT_AVAILABILITY_DURATION, getNow);

        Nominees.getNominee(nominees, nomineePrincipal, getCallerBallot, hasExpiredBallot)
    };
    public query ({ caller }) func getNominees(filter : Nominees.Filter, sort : Base.Sort<Nominees.Sort>) : async Nominees.Sharable {
        let BALLOT_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "BALLOT_AVAILABILITY_DURATION");
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let hasExpiredBallot : Principal -> Bool = _hasExpiredBallotCallback(BALLOT_AVAILABILITY_DURATION);
        let getCallerBallot : Nominee.Nominee -> ?Nat = Nominee.callerBallotCallback(callerUser, BALLOT_AVAILABILITY_DURATION, getNow);

        Nominees.getNominees(nominees, filter, sort, getCallerBallot, hasExpiredBallot, _getUser)
    };
    public query ({ caller }) func getNomineesPagination(filter : Nominees.Filter, sort : Base.Sort<Nominees.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<Nominee.Sharable> {
        let BALLOT_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "BALLOT_AVAILABILITY_DURATION");
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let hasExpiredBallot : Principal -> Bool = _hasExpiredBallotCallback(BALLOT_AVAILABILITY_DURATION);
        let getCallerBallot : Nominee.Nominee -> ?Nat = Nominee.callerBallotCallback(callerUser, BALLOT_AVAILABILITY_DURATION, getNow);

        let result : Nominees.Sharable = Nominees.getNominees(nominees, filter, sort, getCallerBallot, hasExpiredBallot, _getUser);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getProposal(proposalId : Nat) : async Proposal.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Proposals.getProposal(proposals, proposalId, nominees.custodians, callerUser)
    };
    public query ({ caller }) func getProposals(filter : Proposals.Filter, sort : Base.Sort<Proposals.Sort>) : async Proposals.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Proposals.getProposals(proposals, filter, sort, nominees.custodians, callerUser, _getUser)
    };
    public query ({ caller }) func getProposalsPagination(filter : Proposals.Filter, sort : Base.Sort<Proposals.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<Proposal.Sharable> {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let result : Proposals.Sharable = Proposals.getProposals(proposals, filter, sort, nominees.custodians, callerUser, _getUser);
        Pagination.paginate(result, page, limit)
    };

    public query func getUser(principal : Principal) : async User.Sharable {
        let BALLOT_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "BALLOT_AVAILABILITY_DURATION");
        let getUserBallot : Principal -> Nat = _userBallotCallback(principal);
        Users.getUser(users, principal, BALLOT_AVAILABILITY_DURATION, getUserBallot, getNow)
    };
    public query func getEarning(principal : Principal) : async (Earning.Sharable, Earning.Sharable) {
        let user : User.User = Users.user(users, principal);
        (User.getAcornEarning(user), User.getIcpEarning(user))
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public query func expectUserNotFound(principal : Principal) : async () {
        Users.expectNotFound(users, principal)
    };

    /// PRIVATE ////// CRON JOBS ////////////

    ignore Timer.setTimer<system>(
        #nanoseconds(C.ONE_DAY - (Int.abs(Time.now()) % C.ONE_DAY)),
        func() : async () {
            await _dailyExecution();
            ignore Timer.recurringTimer<system>(#nanoseconds(C.ONE_DAY), _dailyExecution)
        },
    )
}
