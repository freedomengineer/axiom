import Age "ages/Age";
import Ages "ages/Ages";
import Evidence "evidences/Evidence";
import Evidences "evidences/Evidences";
import Field "fields/Field";
import Fields "fields/Fields";
import Hypothesis "hypotheses/Hypothesis";
import Hypotheses "hypotheses/Hypotheses";
import Payout "payouts/Payout";
import Payouts "payouts/Payouts";
import Ranks "ranks/Ranks";
import User "users/User";
import Users "users/Users";
import Flag "flags/Flag";
import Flags "flags/Flags";

import Notification "../../periphery/facade/notifications/Notification";

import EscrowInterface "../escrow/Interface";
import TreasuryInterface "../treasury/Interface";
import FacadeInterface "../../periphery/facade/Interface";
import IndicatorInterface "../../periphery/indicator/Interface";

import C "../../common/Constants";
import E "../../common/Errors";

import Array "../../library/Array";
import Base "../../library/Base";
import Configs "../../library/Configs";
import ClusterTree "../../library/ClusterTree";
import Count "../../library/Count";
import Date "../../library/Date";
import DoubleClusterTree "../../library/doubletree/DoubleClusterTree";
import DoubleRankTree "../../library/doubletree/DoubleRankTree";
import E8S "../../library/E8S";
import Earning "../../library/Earning";
import Format "../../library/Format";
import Iter "../../library/Iter";
import List "../../library/List";
import Map "../../library/Map";
import Pagination "../../library/Pagination";
import Proportion "../../library/Proportion";
import Set "../../library/Set";

import BinaryVotes "../../library/votes/BinaryVotes";
import TernaryVotes "../../library/votes/TernaryVotes";

import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Timer "mo:base/Timer";
import Float "mo:base/Float";
import Debug "mo:base/Debug";

shared ({ caller = indicator }) actor class Axioms() = this {
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

    private stable let ages : Ages.Ages = Ages.init();
    private stable let users : Users.Users = Users.init();
    private stable let fields : Fields.Fields = Fields.init();
    private stable let hypotheses : Hypotheses.Hypotheses = Hypotheses.init();
    private stable let evidences : Evidences.Evidences = Evidences.init();
    private stable let flags : Flags.Flags = Flags.init();

    private stable let configs : Configs.Configs = Configs.make([
        /// Age payout
        ("AGE_1_PAYOUT", #E8S(E8S.fromFloat(4_000.0))),
        ("AGE_2_PAYOUT", #E8S(E8S.fromFloat(4_000.0))),
        ("AGE_3_PAYOUT", #E8S(E8S.fromFloat(4_000.0))),

        ("AGE_1_HYPOTHESIS_PAYOUT_DECAY_PROPORTION", #Proportion(Proportion.make(90, 100))),
        ("AGE_2_HYPOTHESIS_PAYOUT_DECAY_PROPORTION", #Proportion(Proportion.make(95, 100))),
        ("AGE_3_HYPOTHESIS_PAYOUT_DECAY_PROPORTION", #Proportion(Proportion.make(99, 100))),

        ("PUBLISHER_PAYOUT_PROPORTION", #Proportion(Proportion.make(20, 100))),
        ("EVIDENCES_PAYOUT_PROPORTION", #Proportion(Proportion.make(50, 100))),
        ("REGULAR_VOTERS_PAYOUT_PROPORTION", #Proportion(Proportion.make(15, 100))),
        ("POWERED_VOTERS_PAYOUT_PROPORTION", #Proportion(Proportion.make(15, 100))),

        /// Activity costs
        ("HYPOTHESIS_PUBLISH_FEE", #E8S(E8S.fromFloat(20.0))),
        ("EVIDENCE_NOTE_FEE", #E8S(E8S.fromFloat(1.0))),
        ("EVIDENCE_EXTENDED_NOTE_FEE", #E8S(E8S.fromFloat(3.0))),
        ("EVIDENCE_PICTURE_FEE", #E8S(E8S.fromFloat(10.0))),
        ("EVIDENCE_HYPERLINK_FEE", #E8S(E8S.fromFloat(10.0))),

        /// Flagging
        ("FLAG_REQUEST_AVAILABILITY_DURATION", #Duration(2)),
        ("FLAG_REQUEST_FEE", #E8S(E8S.fromFloat(100.0))),
        ("FLAG_REQUEST_ACCEPTANCE_THRESHOLD", #E8S(E8S.fromFloat(100_000.0))),
        ("FLAG_REQUEST_ACCEPTANCE_REFUND", #Proportion(Proportion.make(1, 1))),

        /// Evidence Form
        ("EVIDENCE_NOTE_LIMIT", #Nat(333)),
        ("EVIDENCE_EXTENDED_NOTE_LIMIT", #Nat(2000)),
        ("MIN_ANCHOR_LENGTH", #Nat(3)),
        ("MAX_ANCHOR_LENGTH", #Nat(21)),
        ("MIN_URL_LENGTH", #Nat(11)),
        ("MAX_URL_LENGTH", #Nat(1000)),

        /// New Configs
        ("MAX_HYPOTHESIS_LENGTH", #Nat(2000)),
        ("EVIDENCE_PAYOUT_DECAY_PROPORTION", #Proportion(Proportion.make(50, 100))),
        ("HYPOTHESIS_EDIT_FEE", #E8S(E8S.fromFloat(10.0))),
    ]);

    /// PRIVATE ////// MODIFIERS ////////////

    private func _payout() : async () {
        let PUBLISHER_PAYOUT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "PUBLISHER_PAYOUT_PROPORTION");
        let EVIDENCES_PAYOUT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "EVIDENCES_PAYOUT_PROPORTION");
        let REGULAR_VOTERS_PAYOUT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "REGULAR_VOTERS_PAYOUT_PROPORTION");
        let POWERED_VOTERS_PAYOUT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "POWERED_VOTERS_PAYOUT_PROPORTION");

        let now : Time.Time = getNow();
        let lastId = Hypotheses.lastId(hypotheses);

        label agePaying for ((i, { interval; maxHypotheses; nextPaidId; payouts }) in Array.entries(ages)) {
            let start = nextPaidId.val;
            if (start > lastId) {
                Payouts.skip(payouts);
                continue agePaying
            };
            label shifting while (nextPaidId.val <= lastId) {
                switch (Hypotheses.hypothesisRemovedOpt(hypotheses, nextPaidId.val)) {
                    case (null) {};
                    case (?hypothesis) if (Date.getMidnightsElapsed(now, hypothesis.publishDate) < interval) break shifting
                };
                Count.increment(nextPaidId)
            };

            let scores : (Nat) -> ?(Nat, Nat) = func(i) {
                switch (Hypotheses.hypothesisRemovedOpt(hypotheses, i)) {
                    case (?{ votes }) ?(TernaryVotes.getRegularValue(votes), TernaryVotes.getPoweredValue(votes));
                    case (null) null
                }
            };
            let paidRange : Iter.Iter<Nat> = Iter.range(start, lastId);
            let hypothesisOrdering : ClusterTree.ClusterTree<Float, DoubleRankTree.Ranking<Nat>> = DoubleClusterTree.getAverageRankTreeFromIter(paidRange, scores, Nat.compare);
            let paidHypotheses : [(Float, DoubleRankTree.Ranking<Nat>)] = ClusterTree.getFlattenEntries(hypothesisOrdering, #trim(maxHypotheses), #ascending);

            /// n
            let totalHypotheses : Nat = paidHypotheses.size();
            if (totalHypotheses == 0) {
                Payouts.skip(payouts);
                continue agePaying
            };

            /// a
            let HYPOTHESIS_PAYOUT_DECAY_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "AGE_" # debug_show (i +1) # "_HYPOTHESIS_PAYOUT_DECAY_PROPORTION");
            /// y
            let AGE_PAYOUT : E8S.E8S = Configs.E8S(configs, "AGE_" # debug_show (i + 1) # "_PAYOUT");

            /// r = (1 - a) * (1 - a^n)^-1
            let distributionFactor : Proportion.Proportion = Proportion.getMul(
                Proportion.getComplement(HYPOTHESIS_PAYOUT_DECAY_PROPORTION),
                Proportion.getInverse(
                    Proportion.getComplement(
                        Proportion.getPow(HYPOTHESIS_PAYOUT_DECAY_PROPORTION, totalHypotheses)
                    )
                ),
            );
            /// P_1 = y * r
            let currentHypothesisPayout : E8S.E8S = E8S.getScaleBy(AGE_PAYOUT, distributionFactor);

            Debug.print("Payouts for age " # debug_show (i + 1));
            Debug.print(debug_show ({ n = totalHypotheses; r = distributionFactor; P_1 = currentHypothesisPayout }));

            var ranks : Ranks.Ranks = List.nil();
            let recipients = Map.new<Principal, E8S.E8S>();
            let onExistedRecipient = func(a : E8S.E8S, b : E8S.E8S) : E8S.E8S = E8S.getAdd(a, b);

            label hypothesesPaying for ((averageRank, { key = hypothesisId; a = regularEntry; b = poweredEntry }) in paidHypotheses.vals()) {
                ranks := List.push({ hypothesisId; regularEntry; poweredEntry; averageRank }, ranks);
                let hypothesis : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, hypothesisId);
                Debug.print(debug_show ({ hypothesisId; averageRank; regularEntry; poweredEntry; P_k = currentHypothesisPayout }));

                // Publisher
                let publisherPayout : E8S.E8S = E8S.getScaleBy(currentHypothesisPayout, PUBLISHER_PAYOUT_PROPORTION);
                Debug.print(debug_show ({ publisherPayout }));
                Map.putOnCollision(recipients, Map.PrincipalKey(hypothesis.publisher), publisherPayout, onExistedRecipient);

                // Evidences
                let evidencesSize : Nat = List.size(hypothesis.evidenceIds);
                if (evidencesSize > 0) {
                    let evidenceScores : (Nat) -> ?(Int, Int) = func(i) {
                        switch (Evidences.evidenceRemovedOpt(evidences, i)) {
                            case (?{ votes }) ?(BinaryVotes.getRegularPositiveDiffValue(votes), BinaryVotes.getPoweredPositiveDiffValue(votes));
                            case (null) null
                        }
                    };
                    let evidenceOrdering : ClusterTree.ClusterTree<Float, DoubleRankTree.Ranking<Nat>> = DoubleClusterTree.getAverageRankTreeFromList(hypothesis.evidenceIds, evidenceScores, Nat.compare);
                    let paidEvidences : [(Float, DoubleRankTree.Ranking<Nat>)] = ClusterTree.getFlattenEntries(evidenceOrdering, #all, #ascending);

                    /// a
                    let EVIDENCE_PAYOUT_DECAY_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "EVIDENCE_PAYOUT_DECAY_PROPORTION");
                    /// y
                    let evidencesProportion : Proportion.Proportion = Proportion.getMul(EVIDENCES_PAYOUT_PROPORTION, Proportion.make(1, evidencesSize));
                    let evidencesPayout : E8S.E8S = E8S.getScaleBy(currentHypothesisPayout, evidencesProportion);

                    /// r = (1 - a) * (1 - a^n)^-1
                    let evidenceDistributionFactor : Proportion.Proportion = Proportion.getMul(
                        Proportion.getComplement(EVIDENCE_PAYOUT_DECAY_PROPORTION),
                        Proportion.getInverse(
                            Proportion.getComplement(
                                Proportion.getPow(EVIDENCE_PAYOUT_DECAY_PROPORTION, evidencesSize)
                            )
                        ),
                    );
                    /// P_1 = y * r
                    let currentEvidencePayout : E8S.E8S = E8S.getScaleBy(evidencesPayout, evidenceDistributionFactor);

                    label evidencesPaying for ((averageRank, { key = evidenceId }) in paidEvidences.vals()) {
                        let evidence : Evidence.Evidence = Evidences.evidence(evidences, evidenceId);
                        let evidencePayout : E8S.E8S = E8S.getScaleBy(currentEvidencePayout, EVIDENCES_PAYOUT_PROPORTION);
                        Map.putOnCollision(recipients, Map.PrincipalKey(evidence.publisher), evidencePayout, onExistedRecipient)
                    }
                };

                // Voters
                var poweredVoters : List.List<Principal> = List.nil();
                let regularVotersSize : Nat = TernaryVotes.getRegularValue(hypothesis.votes);
                if (regularVotersSize > 0) {
                    let regularVotersProportion : Proportion.Proportion = Proportion.getMul(REGULAR_VOTERS_PAYOUT_PROPORTION, Proportion.make(1, regularVotersSize));
                    let regularVotersPayout : E8S.E8S = E8S.getScaleBy(currentHypothesisPayout, regularVotersProportion);
                    for (voter in TernaryVotes.voters(hypothesis.votes)) {
                        Map.putOnCollision(recipients, Map.PrincipalKey(voter), regularVotersPayout, onExistedRecipient);

                        let user : User.User = Users.user(users, voter);
                        if (User.isPoweredVoter(user, hypothesisId)) poweredVoters := List.push(voter, poweredVoters)
                    }
                };

                let poweredVotersSize : Nat = List.size(poweredVoters);
                if (poweredVotersSize > 0) {
                    let poweredVotersProportion : Proportion.Proportion = Proportion.getMul(POWERED_VOTERS_PAYOUT_PROPORTION, Proportion.make(1, poweredVotersSize));
                    let poweredVotersPayout : E8S.E8S = E8S.getScaleBy(currentHypothesisPayout, poweredVotersProportion);
                    for (poweredVoter in List.toIter(poweredVoters)) {
                        Map.putOnCollision(recipients, Map.PrincipalKey(poweredVoter), poweredVotersPayout, onExistedRecipient)
                    }
                };

                Debug.print(debug_show ({ regularVoters = regularVotersSize; poweredVoters = poweredVotersSize }));

                /// P_{k+1} = P_k * a
                E8S.scaleBy(currentHypothesisPayout, HYPOTHESIS_PAYOUT_DECAY_PROPORTION)
            };

            for ((recipient, payout) in Map.entries(recipients)) {
                let user : User.User = Users.user(users, recipient);
                User.depositMint(user, payout)
            };

            let payout : Payout.Payout = { ranks; recipients };
            Payouts.paid(payouts, payout)
        }
    };
    private func _remove(header : Flag.Header, flag : Flag.Flag) {
        let HYPOTHESIS_PUBLISH_FEE : E8S.E8S = Configs.E8S(configs, "HYPOTHESIS_PUBLISH_FEE");
        let EVIDENCE_NOTE_FEE : E8S.E8S = Configs.E8S(configs, "EVIDENCE_NOTE_FEE");
        let EVIDENCE_EXTENDED_NOTE_FEE : E8S.E8S = Configs.E8S(configs, "EVIDENCE_EXTENDED_NOTE_FEE");
        let EVIDENCE_PICTURE_FEE : E8S.E8S = Configs.E8S(configs, "EVIDENCE_PICTURE_FEE");
        let EVIDENCE_HYPERLINK_FEE : E8S.E8S = Configs.E8S(configs, "EVIDENCE_HYPERLINK_FEE");

        let FLAG_REQUEST_FEE : E8S.E8S = Configs.E8S(configs, "FLAG_REQUEST_FEE");
        let FLAG_REQUEST_ACCEPTANCE_REFUND : Proportion.Proportion = Configs.Proportion(configs, "FLAG_REQUEST_ACCEPTANCE_REFUND");

        switch (header.category) {
            case (#Hypothesis) {
                switch (Hypotheses.hypothesisRemovedOpt(hypotheses, header.id)) {
                    case (null) {};
                    case (?hypothesis) {
                        for (evidenceId in List.toIter(hypothesis.evidenceIds)) {
                            switch (Evidences.evidenceRemovedOpt(evidences, evidenceId)) {
                                case (null) {};
                                case (?evidence) {
                                    let publishFee : E8S.E8S = E8S.new();
                                    for (format in evidence.form.vals()) {
                                        switch (format) {
                                            case (#Picture(_)) E8S.add(publishFee, EVIDENCE_PICTURE_FEE);
                                            case (#Hyperlink(_)) E8S.add(publishFee, EVIDENCE_HYPERLINK_FEE);
                                            case (#Note(x)) switch (x.extended) {
                                                case (false) E8S.add(publishFee, EVIDENCE_NOTE_FEE);
                                                case (true) E8S.add(publishFee, EVIDENCE_EXTENDED_NOTE_FEE)
                                            }
                                        }
                                    };
                                    let publisherUser : User.User = Users.user(users, evidence.publisher);
                                    User.depositTransfer(publisherUser, publishFee);
                                    Evidences.remove(evidences, evidenceId)
                                }
                            }
                        };

                        let requesterRefund : E8S.E8S = E8S.getScaleBy(FLAG_REQUEST_FEE, FLAG_REQUEST_ACCEPTANCE_REFUND);
                        let requesterUser : User.User = Users.user(users, flag.requester);
                        User.depositTransfer(requesterUser, requesterRefund);
                        Hypotheses.remove(hypotheses, header.id)
                    }
                }
            };
            case (#Evidence) {
                switch (Evidences.evidenceRemovedOpt(evidences, header.id)) {
                    case (null) {};
                    case (?evidence) {
                        switch (Hypotheses.hypothesisRemovedOpt(hypotheses, evidence.hypothesisId)) {
                            case (null) {};
                            case (?hypothesis) {
                                Hypothesis.removeEvidence(hypothesis, header.id);

                                let requesterRefund : E8S.E8S = E8S.getScaleBy(FLAG_REQUEST_FEE, FLAG_REQUEST_ACCEPTANCE_REFUND);
                                let requesterUser : User.User = Users.user(users, flag.requester);
                                User.depositTransfer(requesterUser, requesterRefund);
                                Evidences.remove(evidences, header.id)
                            }
                        }
                    }
                }
            }
        }
    };
    private func _cleanUpExpiredFlagRequests() : List.List<Flag.Header> {
        let FLAG_REQUEST_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "FLAG_REQUEST_AVAILABILITY_DURATION");
        Flags.cleanUpExpiredFlags(flags, FLAG_REQUEST_AVAILABILITY_DURATION, getNow)
    };
    private func _dailyExecution() : async () {
        let expired : List.List<Flag.Header> = _cleanUpExpiredFlagRequests();
        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                let systemNotifications : List.List<Notification.SystemVariantParam> = List.map<Flag.Header, Notification.SystemVariantParam>(
                    expired,
                    func(header) = #FlagResult({ header; result = #Expired; timestamp = getNow() }),
                );
                await Facade.postSystemNotifications(systemNotifications)
            }
        )();
        await _payout()
    };

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func initialize() : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        await Indicator.expectUnreleased();

        let founder : Principal = await Indicator.getPrincipal(#Founder);
        Users.addFounder(users, founder, getNow);
        Fields.addFounder(fields, founder, getNow);
        Hypotheses.addFounder(hypotheses, founder, getNow)
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
        Users.expectNotFound(users, principal);
        Users.register(users, principal, getNow)
    };

    public shared ({ caller }) func createField(name : Text, description : Text) : async () {
        await Indicator.expectAuthorized(caller, [#DAO]);
        Fields.create(fields, name, description, getNow)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func joinField(fieldId : Text) : async () {
        let user : User.User = Users.user(users, caller);
        let field : Field.Field = Fields.field(fields, fieldId);
        Field.expectNotMember(field, caller);
        Field.addMember(field, caller);
        User.joinField(user, fieldId)
    };
    public shared ({ caller }) func leaveField(fieldId : Text) : async () {
        let user : User.User = Users.user(users, caller);
        let field : Field.Field = Fields.field(fields, fieldId);
        Field.expectMember(field, caller);
        Field.removeMember(field, caller);
        User.leaveField(user, fieldId)
    };

    public shared ({ caller }) func publishHypothesis(fieldId : Text, content : Text) : async Nat {
        let MAX_HYPOTHESIS_LENGTH : Nat = Configs.Nat(configs, "MAX_HYPOTHESIS_LENGTH");
        let HYPOTHESIS_PUBLISH_FEE : E8S.E8S = Configs.E8S(configs, "HYPOTHESIS_PUBLISH_FEE");

        let contentLength : Nat = Text.size(content);
        if (contentLength > MAX_HYPOTHESIS_LENGTH) E.f(#NOT_VALID("Hypothesis"), "The hypothesis content has " # debug_show contentLength # " characters, exceeds the limit of " # debug_show MAX_HYPOTHESIS_LENGTH # " characters");
        if (contentLength == 0) E.f(#NOT_VALID("Hypothesis"), "The hypothesis content is empty");

        let user : User.User = Users.user(users, caller);
        let field : Field.Field = Fields.field(fields, fieldId);
        Field.expectMember(field, caller);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.delegatedClaim(#DAO, caller, HYPOTHESIS_PUBLISH_FEE.val);

        let hypothesis : Hypothesis.Hypothesis = Hypothesis.init(content, caller, fieldId, getNow);
        let hypothesisId : Nat = Hypotheses.publish(hypotheses, hypothesis);
        Field.addHypothesis(field, hypothesisId);
        User.publishHypothesis(user, hypothesisId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postUsersNotification(Iter.toList(Set.vals(user.followers)), #NewHypothesesFromFollowings({ publisher = caller; hypothesisId; timestamp = getNow() }))
            }
        )();
        hypothesisId
    };
    public shared ({ caller }) func editHypothesis(hypothesisId : Nat, content : Text) : async () {
        let MAX_HYPOTHESIS_LENGTH : Nat = Configs.Nat(configs, "MAX_HYPOTHESIS_LENGTH");
        let HYPOTHESIS_EDIT_FEE : E8S.E8S = Configs.E8S(configs, "HYPOTHESIS_EDIT_FEE");

        let contentLength : Nat = Text.size(content);
        if (contentLength > MAX_HYPOTHESIS_LENGTH) E.f(#NOT_VALID("Hypothesis"), "The hypothesis content has " # debug_show contentLength # " characters, exceeds the limit of " # debug_show MAX_HYPOTHESIS_LENGTH # " characters");
        if (contentLength == 0) E.f(#NOT_VALID("Hypothesis"), "The hypothesis content is empty");

        let hypothesis : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, hypothesisId);
        Hypothesis.expectPublisher(hypothesis, caller);

        var evidencesSize : Nat = 0;
        var isOnlyEvidencePublisher : Bool = true;
        label evidencesChecking for (evidenceId in List.toIter(hypothesis.evidenceIds)) {
            evidencesSize += 1;
            if (Evidences.evidence(evidences, evidenceId).publisher != caller) {
                isOnlyEvidencePublisher := false;
                break evidencesChecking
            }
        };
        switch (evidencesSize, isOnlyEvidencePublisher) {
            case (0, _) {};
            case (_, true) {};
            case (_, false) E.f(#NOT_VALID("Hypothesis"), "Attempted to edit a hypothesis with evidences already published by other users")
        };

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.delegatedClaim(#DAO, caller, HYPOTHESIS_EDIT_FEE.val);

        Hypothesis.updateContent(hypothesis, content)
    };
    public shared ({ caller }) func publishEvidence(hypothesisId : Nat, form : Evidence.Form, choice : BinaryVotes.Choice, repliedTo : ?Nat) : async Nat {
        let repliedEvidence : ?Evidence.Evidence = switch (repliedTo) {
            case (null) null;
            case (?id) {
                let evidence : Evidence.Evidence = Evidences.evidence(evidences, id);
                Evidence.expectPublishedIn(evidence, hypothesisId);
                ?evidence
            }
        };

        let publishFee : E8S.E8S = E8S.new();
        var deduplicated : List.List<Format.FormatVariant> = List.nil();
        label deduplicating for (format in form.vals()) {
            switch (format) {
                case (#Picture(x)) {
                    Format.validatePicture(x);
                    if (List.some<Format.FormatVariant>(deduplicated, func(e) = e == #Picture)) E.f(#NOT_VALID("Evidence Form"), "Evidence Form has duplicated field: Picture");

                    deduplicated := List.push(#Picture, deduplicated);
                    E8S.add(publishFee, Configs.E8S(configs, "EVIDENCE_PICTURE_FEE"))
                };
                case (#Hyperlink(x)) {
                    Format.validateHyperlink(x, configs);
                    if (List.some<Format.FormatVariant>(deduplicated, func(e) = e == #Hyperlink)) E.f(#NOT_VALID("Evidence Form"), "Evidence Form has duplicated field: Hyperlink");

                    deduplicated := List.push(#Hyperlink, deduplicated);
                    E8S.add(publishFee, Configs.E8S(configs, "EVIDENCE_HYPERLINK_FEE"))
                };
                case (#Note(x)) {
                    Format.validateNote(x, Configs.Nat(configs, "EVIDENCE_NOTE_LIMIT"), Configs.Nat(configs, "EVIDENCE_EXTENDED_NOTE_LIMIT"));
                    if (List.some<Format.FormatVariant>(deduplicated, func(e) = e == #Note)) E.f(#NOT_VALID("Evidence Form"), "Evidence Form has duplicated field: Note");

                    deduplicated := List.push(#Note, deduplicated);
                    switch (x.extended) {
                        case (false) E8S.add(publishFee, Configs.E8S(configs, "EVIDENCE_NOTE_FEE"));
                        case (true) E8S.add(publishFee, Configs.E8S(configs, "EVIDENCE_EXTENDED_NOTE_FEE"))
                    }
                }
            }
        };
        if (E8S.isZero(publishFee)) E.f(#NOT_VALID("Evidence Form"), "Evidence Form is blank");

        let user : User.User = Users.user(users, caller);
        let hypothesis : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, hypothesisId);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.delegatedClaim(#DAO, caller, publishFee.val);

        let evidence : Evidence.Evidence = Evidence.init(form, caller, hypothesisId, choice, repliedTo, getNow);
        let evidenceId : Nat = Evidences.publish(evidences, evidence);
        switch (repliedEvidence) {
            case (null) {};
            case (?repliedEvidence) Evidence.addReply(repliedEvidence, evidenceId)
        };
        Hypothesis.addEvidence(hypothesis, evidenceId);
        User.publishEvidence(user, evidenceId);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                var usersNotifications : List.List<(Principal, Notification.UserVariantParam)> = List.make((hypothesis.publisher, #NewEvidencesToHypothesis({ id = hypothesisId; data = { evidenceId; side = choice; publisher = caller; timestamp = getNow() } })));
                for (follower in Set.vals(user.followers)) {
                    usersNotifications := List.push((follower, #NewEvidencesFromFollowings({ evidenceId; publisher = caller; timestamp = getNow() })), usersNotifications)
                };
                switch (repliedTo, repliedEvidence) {
                    case (?id, ?{ publisher }) {
                        usersNotifications := List.push((publisher, #NewRepliesToEvidence({ id; data = { evidenceId; publisher = caller; timestamp = getNow() } })), usersNotifications)
                    };
                    case (_, _) {}
                };
                await Facade.postUsersNotifications(usersNotifications)
            }
        )();
        evidenceId
    };
    public shared ({ caller }) func requestFlag(header : Flag.Header, reason : Text) : async () {
        let FLAG_REQUEST_FEE : E8S.E8S = Configs.E8S(configs, "FLAG_REQUEST_FEE");
        let FLAG_REQUEST_ACCEPTANCE_THRESHOLD : E8S.E8S = Configs.E8S(configs, "FLAG_REQUEST_ACCEPTANCE_THRESHOLD");
        let voterUser : User.User = Users.user(users, caller);

        Flags.expectNotFoundOrRetriable(flags, header);
        switch (header.category) {
            case (#Hypothesis) Hypotheses.expectFound(hypotheses, header.id);
            case (#Evidence) Evidences.expectFound(evidences, header.id)
        };

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.delegatedClaim(#DAO, caller, FLAG_REQUEST_FEE.val);
        let flag : Flag.Flag = Flags.request(flags, header, caller, reason, getNow);

        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
        let value : Nat = await Escrow.getVotingPower(caller);
        let vote : BinaryVotes.Vote = { choice = #Positive; value };

        Flag.addVote(flag, caller, vote);
        User.voteFlag(voterUser, header, vote);

        var systemNotifications : List.List<Notification.SystemVariantParam> = List.make(#FlagRequested({ header; timestamp = getNow() }));

        let poweredValueDifference : Int = Flag.getPoweredValuesDifference(flag);
        if (Int.abs(poweredValueDifference) >= FLAG_REQUEST_ACCEPTANCE_THRESHOLD.val) {
            let result : { #Approved; #Rejected; #Expired } = switch (poweredValueDifference >= 0) {
                case (true) {
                    Flag.approved(flag);
                    #Approved
                };
                case (false) {
                    Flag.rejected(flag);
                    #Rejected
                }
            };
            Flags.finalize(flags, header);
            _remove(header, flag);

            systemNotifications := List.push(#FlagResult({ header; result; timestamp = getNow() }), systemNotifications)
        };

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postSystemNotifications(systemNotifications)
            }
        )()
    };

    public shared ({ caller }) func voteHypothesis(hypothesisId : Nat, choice : TernaryVotes.Choice) : async () {
        let user : User.User = Users.user(users, caller);
        let hypothesis : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, hypothesisId);

        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
        let value : Nat = await Escrow.getVotingPower(caller);
        let vote : TernaryVotes.Vote = { choice; value };
        switch (User.getHypothesisVote(user, hypothesisId)) {
            case (null) Hypothesis.addVote(hypothesis, caller, vote);
            case (?existedVote) Hypothesis.updateVote(hypothesis, caller, existedVote, vote)
        };
        User.voteHypothesis(user, hypothesisId, vote);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postUserNotification((hypothesis.publisher, #NewVotesToHypothesis({ id = hypothesisId; data = { voter = caller; choice; timestamp = getNow() } })))
            }
        )()
    };
    public shared ({ caller }) func voteEvidence(evidenceId : Nat, choice : BinaryVotes.Choice) : async () {
        let user : User.User = Users.user(users, caller);
        let evidence : Evidence.Evidence = Evidences.evidence(evidences, evidenceId);

        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
        let value : Nat = await Escrow.getVotingPower(caller);
        let vote : BinaryVotes.Vote = { choice; value };
        switch (User.getEvidenceVote(user, evidenceId)) {
            case (null) Evidence.addVote(evidence, caller, vote);
            case (?existedVote) Evidence.updateVote(evidence, caller, existedVote, vote)
        };
        User.voteEvidence(user, evidenceId, vote);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postUserNotification((evidence.publisher, #NewVotesToEvidence({ id = evidenceId; data = { voter = caller; choice; timestamp = getNow() } })))
            }
        )()
    };
    public shared ({ caller }) func voteFlag(header : Flag.Header, choice : BinaryVotes.Choice) : async () {
        let FLAG_REQUEST_ACCEPTANCE_THRESHOLD : E8S.E8S = Configs.E8S(configs, "FLAG_REQUEST_ACCEPTANCE_THRESHOLD");
        let user : User.User = Users.user(users, caller);
        let flag : Flag.Flag = Flags.flag(flags, header);

        Flag.expectVotable(flag);

        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
        let value : Nat = await Escrow.getVotingPower(caller);
        let vote : BinaryVotes.Vote = { choice; value };
        switch (User.getFlagVote(user, header)) {
            case (null) Flag.addVote(flag, caller, vote);
            case (?existedVote) Flag.updateVote(flag, caller, existedVote, vote)
        };
        User.voteFlag(user, header, vote);

        let poweredValueDifference : Int = Flag.getPoweredValuesDifference(flag);
        if (Int.abs(poweredValueDifference) >= FLAG_REQUEST_ACCEPTANCE_THRESHOLD.val) {
            let result : { #Approved; #Rejected; #Expired } = switch (poweredValueDifference >= 0) {
                case (true) {
                    Flag.approved(flag);
                    #Approved
                };
                case (false) {
                    Flag.rejected(flag);
                    #Rejected
                }
            };
            Flags.finalize(flags, header);
            _remove(header, flag);

            ignore (
                func() : async () {
                    let Facade : FacadeInterface.Facade = await Indicator.Facade();
                    await Facade.postSystemNotification(#FlagResult({ header; result; timestamp = getNow() }))
                }
            )()
        }
    };

    public shared ({ caller }) func removeHypothesisVote(hypothesisId : Nat) : async () {
        let user : User.User = Users.user(users, caller);
        let hypothesis : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, hypothesisId);
        let vote : TernaryVotes.Vote = User.hypothesisVote(user, hypothesisId);
        Hypothesis.removeVote(hypothesis, caller, vote);
        User.removeHypothesisVote(user, hypothesisId)
    };
    public shared ({ caller }) func removeEvidenceVote(evidenceId : Nat) : async () {
        let user : User.User = Users.user(users, caller);
        let evidence : Evidence.Evidence = Evidences.evidence(evidences, evidenceId);
        let vote : BinaryVotes.Vote = User.evidenceVote(user, evidenceId);
        Evidence.removeVote(evidence, caller, vote);
        User.removeEvidenceVote(user, evidenceId)
    };
    public shared ({ caller }) func removeFlagVote(header : Flag.Header) : async () {
        let user : User.User = Users.user(users, caller);
        let flag : Flag.Flag = Flags.flag(flags, header);
        let vote : BinaryVotes.Vote = User.flagVote(user, header);
        Flag.expectVotable(flag);
        Flag.removeVote(flag, caller, vote);
        User.removeFlagVote(user, header)
    };

    public shared ({ caller }) func addToAxioms(hypothesisId : Nat) : async () {
        let user : User.User = Users.user(users, caller);
        let hypothesis : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, hypothesisId);
        User.expectAxiomNotFound(user, hypothesisId);
        User.addAxiom(user, hypothesisId);
        Hypothesis.addedToAxiom(hypothesis);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postUserNotification((hypothesis.publisher, #NewAxiomsToHypothesis({ id = hypothesisId; data = { user = caller; timestamp = getNow() } })))
            }
        )()
    };
    public shared ({ caller }) func addToBookmarks(hypothesisId : Nat) : async () {
        let user : User.User = Users.user(users, caller);
        Hypotheses.expectFound(hypotheses, hypothesisId);
        User.expectBookmarkNotFound(user, hypothesisId);
        User.addBookmark(user, hypothesisId)
    };

    public shared ({ caller }) func removeFromAxioms(hypothesisId : Nat) : async () {
        let user : User.User = Users.user(users, caller);
        let hypothesis : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, hypothesisId);
        User.expectAxiomFound(user, hypothesisId);
        User.removeAxiom(user, hypothesisId);
        Hypothesis.removedFromAxiom(hypothesis)
    };
    public shared ({ caller }) func removeFromBookmarks(hypothesisId : Nat) : async () {
        let user : User.User = Users.user(users, caller);
        Hypotheses.expectFound(hypotheses, hypothesisId);
        User.expectBookmarkFound(user, hypothesisId);
        User.removeBookmark(user, hypothesisId)
    };

    public shared ({ caller }) func follow(principal : Principal) : async () {
        if (caller == principal) E.f(#NOT_VALID("Follow"), "You cannot follow yourself");

        let follower : User.User = Users.user(users, caller);
        let following : User.User = Users.user(users, principal);
        User.addFollowing(follower, principal);
        User.addFollower(following, caller);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postUserNotification((principal, #NewFollowers({ user = caller; timestamp = getNow() })))
            }
        )()
    };
    public shared ({ caller }) func unfollow(principal : Principal) : async () {
        if (caller == principal) E.f(#NOT_VALID("Follow"), "You cannot unfollow yourself");

        let follower : User.User = Users.user(users, caller);
        let following : User.User = Users.user(users, principal);
        User.removeFollowing(follower, principal);
        User.removeFollower(following, caller)
    };

    public shared ({ caller }) func withdrawAll() : async () {
        let user : User.User = Users.user(users, caller);
        let transferBalance : E8S.E8S = Earning.balance(user.transferEarning);
        let mintBalance : E8S.E8S = Earning.balance(user.mintEarning);

        if (E8S.isZero(transferBalance) and E8S.isZero(mintBalance)) {
            Earning.expectPositiveBalance(user.mintEarning)
        };
        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();

        if (not E8S.isZero(transferBalance)) {
            await Treasury.delegatedExternalTransfer(#DAO, caller, transferBalance.val);
            User.withdrawTransfer(user, transferBalance, getNow)
        };
        if (not E8S.isZero(mintBalance)) {
            await Treasury.externalMint(caller, mintBalance.val);
            User.withdrawMint(user, mintBalance, getNow)
        }
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _getUser(principal : Principal) : User.User = Users.user(users, principal);
    private func _getField(id : Text) : Field.Field = Fields.field(fields, id);
    private func _getAge(age : Nat) : Age.Age = Ages.age(ages, age);
    private func _getHypothesis(id : Nat) : Hypothesis.Hypothesis = Hypotheses.hypothesis(hypotheses, id);

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

    public query ({ caller }) func getField(name : Text) : async Field.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Fields.getField(fields, name, callerUser)
    };
    public query ({ caller }) func getFields(filter : Fields.Filter, sort : Base.Sort<Fields.Sort>) : async Fields.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Fields.getFields(fields, filter, sort, callerUser, _getUser)
    };
    public query ({ caller }) func getFieldsPagination(filter : Fields.Filter, sort : Base.Sort<Fields.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<Field.Sharable> {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let result : Fields.Sharable = Fields.getFields(fields, filter, sort, callerUser, _getUser);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getHypothesis(hypothesisId : Nat) : async Hypothesis.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Hypotheses.getHypothesis(hypotheses, hypothesisId, callerUser)
    };
    public query ({ caller }) func getHypotheses(filter : Hypotheses.Filter, sort : Base.Sort<Hypotheses.Sort>) : async Hypotheses.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Hypotheses.getHypotheses(hypotheses, filter, sort, callerUser, _getUser, _getField, _getAge)
    };
    public query ({ caller }) func getHypothesesPagination(filter : Hypotheses.Filter, sort : Base.Sort<Hypotheses.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<Hypothesis.Sharable> {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let result : Hypotheses.Sharable = Hypotheses.getHypotheses(hypotheses, filter, sort, callerUser, _getUser, _getField, _getAge);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getEvidence(evidenceId : Nat) : async Evidence.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Evidences.getEvidence(evidences, evidenceId, callerUser)
    };
    public query ({ caller }) func getEvidences(filter : Evidences.Filter, sort : Base.Sort<Evidences.Sort>) : async Evidences.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Evidences.getEvidences(evidences, filter, sort, callerUser, _getUser, _getHypothesis)
    };
    public query ({ caller }) func getEvidencesPagination(filter : Evidences.Filter, sort : Base.Sort<Evidences.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<Evidence.Sharable> {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let result : Evidences.Sharable = Evidences.getEvidences(evidences, filter, sort, callerUser, _getUser, _getHypothesis);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getFlag(header : Flag.Header) : async Flag.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Flags.getFlag(flags, header, callerUser)
    };
    public query ({ caller }) func getFlags(filter : Flags.Filter, sort : Base.Sort<Flags.Sort>) : async Flags.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Flags.getFlags(flags, filter, sort, callerUser, _getUser)
    };
    public query ({ caller }) func getFlagsPagination(filter : Flags.Filter, sort : Base.Sort<Flags.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<Flag.Sharable> {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        let result : Flags.Sharable = Flags.getFlags(flags, filter, sort, callerUser, _getUser);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getTop(category : { #HypothesisPublishers; #EvidencePublishers; #HypothesisVoters; #EvidenceVoters; #AcornEarners }) : async Pagination.TopNonPagination {
        let result : Pagination.TopResult = Users.getTop(users, category);
        Pagination.topNonPaginate(result, caller)
    };
    public query ({ caller }) func getTopPagination(category : { #HypothesisPublishers; #EvidencePublishers; #HypothesisVoters; #EvidenceVoters; #AcornEarners }, page : Nat, limit : Nat) : async Pagination.TopPagination {
        let result : Pagination.TopResult = Users.getTop(users, category);
        Pagination.topPaginate(result, page, limit, caller)
    };

    public query ({ caller }) func getAgePayout(ageId : Nat, ago : Nat) : async Payout.Sharable {
        let age : Age.Age = Ages.age(ages, ageId);
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Age.getPayout(age, ago, callerUser)
    };
    public query ({ caller }) func getAgePayouts(ageId : Nat) : async Payouts.Sharable {
        let age : Age.Age = Ages.age(ages, ageId);
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Age.getPayouts(age, callerUser)
    };
    public query ({ caller }) func getAgesPayout(ago : Nat) : async Payouts.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Ages.getPayout(ages, ago, callerUser)
    };
    public query ({ caller }) func getAgesPayouts() : async [Payouts.Sharable] {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Ages.getPayouts(ages, callerUser)
    };

    public query ({ caller }) func getUser(principal : Principal) : async User.Sharable {
        let callerUser : ?(Principal, User.User) = _getCallerUser(caller);
        Users.getUser(users, principal, callerUser)
    };
    public query func getEarning(principal : Principal) : async Earning.Sharable {
        let user : User.User = Users.user(users, principal);
        User.getEarning(user)
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
