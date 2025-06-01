import E "../../../common/Errors";

import AxiomFlag "../../../core/axioms/flags/Flag";

import Format "../../../library/Format";
import List "../../../library/List";

import BinaryVotes "../../../library/votes/BinaryVotes";
import TernaryVotes "../../../library/votes/TernaryVotes";

import Time "mo:base/Time";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type BinaryChoice = BinaryVotes.Choice;
    private type TernaryChoice = TernaryVotes.Choice;
    private type List<T> = List.List<T>;

    private type Hyperlink = Format.Hyperlink;

    private type FlagHeader = AxiomFlag.Header;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type ProposalResultData = {
        proposalId : Nat;
        result : { #Approved; #Rejected; #Expired };
        claimable : Nat;
        timestamp : Time
    };
    public type ProposalDelegatedData = {
        proposalId : Nat;
        delegator : Principal;
        timestamp : Time
    };
    public type ProposalRejectedData = { proposalId : Nat; timestamp : Time };
    public type ProposalOpenedData = {
        proposalId : Nat;
        proposer : Principal;
        retried : Nat;
        timestamp : Time
    };

    public type NewEvidencesToHypothesisData = {
        evidenceId : Nat;
        publisher : Principal;
        side : BinaryChoice;
        timestamp : Time
    };
    public type NewAxiomsToHypothesisData = { user : Principal; timestamp : Time };
    public type NewRepliesToEvidenceData = {
        evidenceId : Nat;
        publisher : Principal;
        timestamp : Time
    };
    public type NewVotesToHypothesisData = {
        voter : Principal;
        choice : TernaryChoice;
        timestamp : Time
    };
    public type NewVotesToEvidenceData = {
        voter : Principal;
        choice : BinaryChoice;
        timestamp : Time
    };
    public type NewVotesToProposalData = {
        voter : Principal;
        choice : BinaryChoice;
        timestamp : Time
    };
    public type NewHypothesesFromFollowingsData = {
        publisher : Principal;
        hypothesisId : Nat;
        timestamp : Time
    };
    public type NewEvidencesFromFollowingsData = {
        publisher : Principal;
        evidenceId : Nat;
        timestamp : Time
    };
    public type NewReferralsData = {
        principal : Principal;
        claimable : Nat;
        timestamp : Time
    };
    public type NewFollowersData = {
        principal : Principal;
        timestamp : Time
    };

    public type UserVariantParam = {
        #ProposalResult : ProposalResultData;
        #ProposalDelegated : ProposalDelegatedData;
        #ProposalRejected : ProposalRejectedData;
        #ProposalOpened : ProposalOpenedData;

        #NewHypothesesFromFollowings : { data : NewHypothesesFromFollowingsData };
        #NewEvidencesFromFollowings : { data : NewEvidencesFromFollowingsData };
        #NewReferrals : { data : NewReferralsData };
        #NewFollowers : { data : NewFollowersData };

        #NewEvidencesToHypothesis : { id : Nat; data : NewEvidencesToHypothesisData };
        #NewAxiomsToHypothesis : { id : Nat; data : NewAxiomsToHypothesisData };
        #NewRepliesToEvidence : { id : Nat; data : NewRepliesToEvidenceData };
        #NewVotesToHypothesis : { id : Nat; data : NewVotesToHypothesisData };
        #NewVotesToEvidence : { id : Nat; data : NewVotesToEvidenceData };
        #NewVotesToProposal : { id : Nat; data : NewVotesToProposalData };

    };
    public type UserVariant = {
        #ProposalResult : ProposalResultData;
        #ProposalDelegated : ProposalDelegatedData;
        #ProposalRejected : ProposalRejectedData;
        #ProposalOpened : ProposalOpenedData;

        #NewHypothesesFromFollowings : {
            var capacity : List<NewHypothesesFromFollowingsData>;
            var total : Nat
        };
        #NewEvidencesFromFollowings : {
            var capacity : List<NewEvidencesFromFollowingsData>;
            var total : Nat
        };
        #NewReferrals : {
            var capacity : List<NewReferralsData>;
            var total : Nat
        };
        #NewFollowers : {
            var capacity : List<NewFollowersData>;
            var total : Nat
        };

        #NewEvidencesToHypothesis : {
            id : Nat;
            var capacity : List<NewEvidencesToHypothesisData>;
            var total : Nat
        };
        #NewAxiomsToHypothesis : {
            id : Nat;
            var capacity : List<NewAxiomsToHypothesisData>;
            var total : Nat
        };
        #NewRepliesToEvidence : {
            id : Nat;
            var capacity : List<NewRepliesToEvidenceData>;
            var total : Nat
        };
        #NewVotesToHypothesis : {
            id : Nat;
            var capacity : List<NewVotesToHypothesisData>;
            var total : Nat
        };
        #NewVotesToEvidence : {
            id : Nat;
            var capacity : List<NewVotesToEvidenceData>;
            var total : Nat
        };
        #NewVotesToProposal : {
            id : Nat;
            var capacity : List<NewVotesToProposalData>;
            var total : Nat
        }
    };
    public type SharableUserVariant = {
        #ProposalResult : ProposalResultData;
        #ProposalDelegated : ProposalDelegatedData;
        #ProposalRejected : ProposalRejectedData;
        #ProposalOpened : ProposalOpenedData;

        #NewHypothesesFromFollowings : {
            capacity : [NewHypothesesFromFollowingsData];
            total : Nat
        };
        #NewEvidencesFromFollowings : {
            capacity : [NewEvidencesFromFollowingsData];
            total : Nat
        };
        #NewReferrals : {
            capacity : [NewReferralsData];
            total : Nat
        };
        #NewFollowers : {
            capacity : [NewFollowersData];
            total : Nat
        };

        #NewEvidencesToHypothesis : {
            id : Nat;
            capacity : [NewEvidencesToHypothesisData];
            total : Nat
        };
        #NewAxiomsToHypothesis : {
            id : Nat;
            capacity : [NewAxiomsToHypothesisData];
            total : Nat
        };
        #NewRepliesToEvidence : {
            id : Nat;
            capacity : [NewRepliesToEvidenceData];
            total : Nat
        };
        #NewVotesToHypothesis : {
            id : Nat;
            capacity : [NewVotesToHypothesisData];
            total : Nat
        };
        #NewVotesToEvidence : {
            id : Nat;
            capacity : [NewVotesToEvidenceData];
            total : Nat
        };
        #NewVotesToProposal : {
            id : Nat;
            capacity : [NewVotesToProposalData];
            total : Nat
        }
    };

    public type SystemVariantParam = SystemVariant;
    public type SystemVariant = {
        #SystemGeneric : { message : Text; link : ?Hyperlink; timestamp : Time };
        #FlagRequested : { header : FlagHeader; timestamp : Time };
        #FlagResult : {
            header : FlagHeader;
            result : { #Approved; #Rejected; #Expired };
            timestamp : Time
        };
        #ElectionResult : {
            newCustodians : [Principal];
            removedCustodians : [Principal];
            unchangedCustodians : [Principal];
            timestamp : Time
        };
        #ProposalExecuted : { proposalId : Nat; proposer : Principal; timestamp : Time }
    };
    public type SharableSystemVariant = SystemVariant;

    /// FACADE ////// NOTIFICATION ////////////

    private type Self<T> = Notification<T>;

    public type Notification<T> = {
        var notification : List<T>
    };

    public func init<T>() : Self<T> = {
        var notification = List.nil<T>()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func pushSystemNotification(__ : Self<SystemVariant>, data : SystemVariantParam, maxNotificationSize : Nat) {
        __.notification := List.smartPush<SystemVariant>(__.notification, data, func(x) = false, maxNotificationSize).0
    };

    public func pushUserNotification(__ : Self<UserVariant>, data : UserVariantParam, maxNotificationSize : Nat, maxNotificationCapacity : Nat) {
        var group : ?UserVariant = List.find<UserVariant>(
            __.notification,
            func(current) = switch (current, data) {
                // grouped with ids
                case (#NewEvidencesToHypothesis(a), #NewEvidencesToHypothesis(b)) a.id == b.id;
                case (#NewAxiomsToHypothesis(a), #NewAxiomsToHypothesis(b)) a.id == b.id;
                case (#NewRepliesToEvidence(a), #NewRepliesToEvidence(b)) a.id == b.id;
                case (#NewVotesToHypothesis(a), #NewVotesToHypothesis(b)) a.id == b.id;
                case (#NewVotesToEvidence(a), #NewVotesToEvidence(b)) a.id == b.id;
                case (#NewVotesToProposal(a), #NewVotesToProposal(b)) a.id == b.id;

                // grouped without ids
                case (#NewHypothesesFromFollowings(_), #NewHypothesesFromFollowings(_)) true;
                case (#NewEvidencesFromFollowings(_), #NewEvidencesFromFollowings(_)) true;
                case (#NewReferrals(_), #NewReferrals(_)) true;
                case (#NewFollowers(_), #NewFollowers(_)) true;

                // not grouped
                case (_, _) false
            },
        );

        var notification : UserVariant = switch (group, data) {
            // grouped with ids
            case (null, #NewEvidencesToHypothesis(data)) #NewEvidencesToHypothesis({
                id = data.id;
                var capacity = List.make<NewEvidencesToHypothesisData>(data.data);
                var total = 1
            });
            case (null, #NewAxiomsToHypothesis(data)) #NewAxiomsToHypothesis({
                id = data.id;
                var capacity = List.make<NewAxiomsToHypothesisData>(data.data);
                var total = 1
            });
            case (null, #NewRepliesToEvidence(data)) #NewRepliesToEvidence({
                id = data.id;
                var capacity = List.make<NewRepliesToEvidenceData>(data.data);
                var total = 1
            });
            case (null, #NewVotesToHypothesis(data)) #NewVotesToHypothesis({
                id = data.id;
                var capacity = List.make<NewVotesToHypothesisData>(data.data);
                var total = 1
            });
            case (null, #NewVotesToEvidence(data)) #NewVotesToEvidence({
                id = data.id;
                var capacity = List.make<NewVotesToEvidenceData>(data.data);
                var total = 1
            });
            case (null, #NewVotesToProposal(data)) #NewVotesToProposal({
                id = data.id;
                var capacity = List.make<NewVotesToProposalData>(data.data);
                var total = 1
            });

            // grouped without ids
            case (null, #NewHypothesesFromFollowings(data)) #NewHypothesesFromFollowings({
                var capacity = List.make<NewHypothesesFromFollowingsData>(data.data);
                var total = 1
            });
            case (null, #NewEvidencesFromFollowings(data)) #NewEvidencesFromFollowings({
                var capacity = List.make<NewEvidencesFromFollowingsData>(data.data);
                var total = 1
            });
            case (null, #NewReferrals(data)) #NewReferrals({
                var capacity = List.make<NewReferralsData>(data.data);
                var total = 1
            });
            case (null, #NewFollowers(data)) #NewFollowers({
                var capacity = List.make<NewFollowersData>(data.data);
                var total = 1
            });

            // grouped with ids
            case (? #NewEvidencesToHypothesis(group), #NewEvidencesToHypothesis(data)) {
                let (res, pushType) = List.smartPush<NewEvidencesToHypothesisData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewEvidencesToHypothesis(group)
            };
            case (? #NewAxiomsToHypothesis(group), #NewAxiomsToHypothesis(data)) {
                let (res, pushType) = List.smartPush<NewAxiomsToHypothesisData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewAxiomsToHypothesis(group)
            };
            case (? #NewRepliesToEvidence(group), #NewRepliesToEvidence(data)) {
                let (res, pushType) = List.smartPush<NewRepliesToEvidenceData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewRepliesToEvidence(group)
            };
            case (? #NewVotesToHypothesis(group), #NewVotesToHypothesis(data)) {
                let (res, pushType) = List.smartPush<NewVotesToHypothesisData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewVotesToHypothesis(group)
            };
            case (? #NewVotesToEvidence(group), #NewVotesToEvidence(data)) {
                let (res, pushType) = List.smartPush<NewVotesToEvidenceData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewVotesToEvidence(group)
            };
            case (? #NewVotesToProposal(group), #NewVotesToProposal(data)) {
                let (res, pushType) = List.smartPush<NewVotesToProposalData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewVotesToProposal(group)
            };

            // grouped without ids
            case (? #NewHypothesesFromFollowings(group), #NewHypothesesFromFollowings(data)) {
                let (res, pushType) = List.smartPush<NewHypothesesFromFollowingsData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewHypothesesFromFollowings(group)
            };
            case (? #NewEvidencesFromFollowings(group), #NewEvidencesFromFollowings(data)) {
                let (res, pushType) = List.smartPush<NewEvidencesFromFollowingsData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewEvidencesFromFollowings(group)
            };
            case (? #NewReferrals(group), #NewReferrals(data)) {
                let (res, pushType) = List.smartPush<NewReferralsData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewReferrals(group)
            };
            case (? #NewFollowers(group), #NewFollowers(data)) {
                let (res, pushType) = List.smartPush<NewFollowersData>(group.capacity, data.data, func(x) = false, maxNotificationCapacity);
                group.capacity := res;
                switch (pushType) {
                    case (#replaced) {};
                    case (_) group.total := group.total + 1
                };
                #NewFollowers(group)
            };

            // not grouped
            case (_, #ProposalResult(data)) #ProposalResult(data);
            case (_, #ProposalDelegated(data)) #ProposalDelegated(data);
            case (_, #ProposalRejected(data)) #ProposalRejected(data);
            case (_, #ProposalOpened(data)) #ProposalOpened(data);

            // unreachable
            case (_, _) E.unreachable()
        };

        __.notification := List.smartPush<UserVariant>(
            __.notification,
            notification,
            func(current) = switch (group, current, notification) {
                // not grouped
                case (null, _, _) false;

                // grouped without ids
                case (_, #NewHypothesesFromFollowings(_), #NewHypothesesFromFollowings(_)) true;
                case (_, #NewEvidencesFromFollowings(_), #NewEvidencesFromFollowings(_)) true;
                case (_, #NewReferrals(_), #NewReferrals(_)) true;
                case (_, #NewFollowers(_), #NewFollowers(_)) true;

                // grouped with ids
                case (_, #NewEvidencesToHypothesis(a), #NewEvidencesToHypothesis(b)) a.id == b.id;
                case (_, #NewAxiomsToHypothesis(a), #NewAxiomsToHypothesis(b)) a.id == b.id;
                case (_, #NewRepliesToEvidence(a), #NewRepliesToEvidence(b)) a.id == b.id;
                case (_, #NewVotesToHypothesis(a), #NewVotesToHypothesis(b)) a.id == b.id;
                case (_, #NewVotesToEvidence(a), #NewVotesToEvidence(b)) a.id == b.id;
                case (_, #NewVotesToProposal(a), #NewVotesToProposal(b)) a.id == b.id;

                // other cases
                case (_, _, _) false
            },
            maxNotificationSize,
        ).0
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func toSharableUser(__ : Self<UserVariant>) : [SharableUserVariant] {
        List.toArrayMap<UserVariant, SharableUserVariant>(
            __.notification,
            func(x) = switch (x) {
                // not grouped
                case (#ProposalResult(data)) #ProposalResult(data);
                case (#ProposalDelegated(data)) #ProposalDelegated(data);
                case (#ProposalRejected(data)) #ProposalRejected(data);
                case (#ProposalOpened(data)) #ProposalOpened(data);

                // grouped without ids
                case (#NewHypothesesFromFollowings(group)) #NewHypothesesFromFollowings({
                    capacity = List.toArray<NewHypothesesFromFollowingsData>(group.capacity);
                    total = group.total
                });
                case (#NewEvidencesFromFollowings(group)) #NewEvidencesFromFollowings({
                    capacity = List.toArray<NewEvidencesFromFollowingsData>(group.capacity);
                    total = group.total
                });
                case (#NewReferrals(group)) #NewReferrals({
                    capacity = List.toArray<NewReferralsData>(group.capacity);
                    total = group.total
                });
                case (#NewFollowers(group)) #NewFollowers({
                    capacity = List.toArray<NewFollowersData>(group.capacity);
                    total = group.total
                });

                // grouped with ids
                case (#NewEvidencesToHypothesis(group)) #NewEvidencesToHypothesis({
                    id = group.id;
                    capacity = List.toArray<NewEvidencesToHypothesisData>(group.capacity);
                    total = group.total
                });
                case (#NewAxiomsToHypothesis(group)) #NewAxiomsToHypothesis({
                    id = group.id;
                    capacity = List.toArray<NewAxiomsToHypothesisData>(group.capacity);
                    total = group.total
                });
                case (#NewRepliesToEvidence(group)) #NewRepliesToEvidence({
                    id = group.id;
                    capacity = List.toArray<NewRepliesToEvidenceData>(group.capacity);
                    total = group.total
                });
                case (#NewVotesToHypothesis(group)) #NewVotesToHypothesis({
                    id = group.id;
                    capacity = List.toArray<NewVotesToHypothesisData>(group.capacity);
                    total = group.total
                });
                case (#NewVotesToEvidence(group)) #NewVotesToEvidence({
                    id = group.id;
                    capacity = List.toArray<NewVotesToEvidenceData>(group.capacity);
                    total = group.total
                });
                case (#NewVotesToProposal(group)) #NewVotesToProposal({
                    id = group.id;
                    capacity = List.toArray<NewVotesToProposalData>(group.capacity);
                    total = group.total
                })
            },
        )
    };

    public func toSharableSystem(__ : Self<SystemVariant>) : [SharableSystemVariant] {
        List.toArray(__.notification)
    }
}
