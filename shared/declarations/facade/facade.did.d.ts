import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BinaryChoice = { 'Negative' : null } |
  { 'Positive' : null };
export type Category = { 'Hypothesis' : null } |
  { 'Evidence' : null };
export interface CouponRedeemedData {
  'key' : string,
  'user' : Principal,
  'timestamp' : Time,
}
export interface CustodianElectionResultData {
  'result' : ElectionResult,
  'claimable' : bigint,
  'timestamp' : Time,
}
export interface CustodianProposalDelegatedData {
  'delegator' : Principal,
  'timestamp' : Time,
  'proposalId' : bigint,
}
export interface CustodianProposalOpenedData {
  'timestamp' : Time,
  'proposer' : Principal,
  'proposalId' : bigint,
  'retried' : bigint,
}
export interface CustodianProposalResultData {
  'result' : Result,
  'timestamp' : Time,
  'proposer' : Principal,
  'proposalId' : bigint,
}
export type ElectionResult = { 'New' : null } |
  { 'Unchanged' : null } |
  { 'Removed' : null };
export type ExecutedResult = { 'Failed' : null } |
  { 'Executed' : null };
export interface Facade {
  'editAvatar' : ActorMethod<[[] | [Picture]], undefined>,
  'editLinks' : ActorMethod<[Array<Hyperlink__1>], undefined>,
  'editLocation' : ActorMethod<[[] | [string]], undefined>,
  'editUsername' : ActorMethod<[string], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__2>,
  'getNotification' : ActorMethod<[], Sharable__1>,
  'getUser' : ActorMethod<[Principal], Sharable>,
  'getUserCapitalRaised' : ActorMethod<[Principal], bigint>,
  'getUserIdentifier' : ActorMethod<[IdentifierVariant], Identifier>,
  'getUsers' : ActorMethod<[Filter, Sort], Array<Sharable>>,
  'getUsersCount' : ActorMethod<[], bigint>,
  'getUsersIdentifier' : ActorMethod<[], Array<Identifier>>,
  'getUsersPagination' : ActorMethod<
    [Filter, Sort, bigint, bigint],
    Pagination
  >,
  'getUsersPrincipal' : ActorMethod<[], Array<Principal>>,
  'initialize' : ActorMethod<[], undefined>,
  'postSystemGenericNotification' : ActorMethod<
    [string, [] | [Hyperlink__1]],
    undefined
  >,
  'postSystemNotification' : ActorMethod<[SystemVariantParam__1], undefined>,
  'postSystemNotifications' : ActorMethod<
    [SystemNotificationsBatch],
    undefined
  >,
  'postUserNotification' : ActorMethod<
    [Principal, UserVariantParam__1],
    undefined
  >,
  'postUserNotifications' : ActorMethod<
    [Principal, UserNotificationsBatch],
    undefined
  >,
  'postUsersNotification' : ActorMethod<
    [UsersBatch, UserVariantParam__1],
    undefined
  >,
  'postUsersNotifications' : ActorMethod<[UsersNotificationsBatch], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[string, bigint, [] | [Principal]], undefined>,
  'registerWithCoupon' : ActorMethod<
    [string, Uint8Array | number[]],
    undefined
  >,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'updateCapitalRaised' : ActorMethod<[Principal, bigint], undefined>,
}
export interface Filter { 'q' : [] | [string], 'capitalRaised' : [] | [bigint] }
export interface FlagHeader { 'id' : bigint, 'category' : Category }
export interface Hyperlink { 'url' : string, 'anchorText' : string }
export interface Hyperlink__1 { 'url' : string, 'anchorText' : string }
export interface Hyperlink__2 { 'url' : string, 'anchorText' : string }
export interface Identifier {
  'principal' : Principal,
  'username' : string,
  'capitalRaised' : bigint,
}
export type IdentifierVariant = { 'Principal' : Principal } |
  { 'Username' : string };
export type Key = string;
export type List = [] | [[[Principal, UserVariantParam], List]];
export type List_1 = [] | [[Principal, List_1]];
export type List_2 = [] | [[UserVariantParam, List_2]];
export type List_3 = [] | [[SystemVariantParam, List_3]];
export interface NewAxiomsToHypothesisData {
  'user' : Principal,
  'timestamp' : Time,
}
export interface NewBallotsData { 'voter' : Principal, 'timestamp' : Time }
export interface NewEvidencesFromFollowingsData {
  'publisher' : Principal,
  'timestamp' : Time,
  'evidenceId' : bigint,
}
export interface NewEvidencesToHypothesisData {
  'publisher' : Principal,
  'side' : BinaryChoice,
  'timestamp' : Time,
  'evidenceId' : bigint,
}
export interface NewFollowersData { 'user' : Principal, 'timestamp' : Time }
export interface NewHypothesesFromFollowingsData {
  'publisher' : Principal,
  'timestamp' : Time,
  'hypothesisId' : bigint,
}
export interface NewReferralsData {
  'user' : Principal,
  'claimable' : bigint,
  'timestamp' : Time,
}
export interface NewRepliesToEvidenceData {
  'publisher' : Principal,
  'timestamp' : Time,
  'evidenceId' : bigint,
}
export interface NewVotesToEvidenceData {
  'voter' : Principal,
  'timestamp' : Time,
  'choice' : BinaryChoice,
}
export interface NewVotesToHypothesisData {
  'voter' : Principal,
  'timestamp' : Time,
  'choice' : TernaryChoice,
}
export interface NewVotesToProposalData {
  'voter' : Principal,
  'timestamp' : Time,
  'choice' : BinaryChoice,
}
export type Order = { 'descending' : null } |
  { 'ascending' : null };
export interface Pagination {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable>,
}
export interface Picture { 'blob' : Uint8Array | number[] }
export interface ProposalExecutedData {
  'result' : ExecutedResult,
  'claimable' : bigint,
  'timestamp' : Time,
  'proposalId' : bigint,
}
export interface ProposalResultData {
  'result' : Result,
  'timestamp' : Time,
  'proposalId' : bigint,
}
export type Result = { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Expired' : null };
export interface Sharable {
  'principal' : Principal,
  'username' : string,
  'links' : Array<Hyperlink__2>,
  'creationDate' : Time__1,
  'capitalRaised' : bigint,
  'location' : string,
  'avatar' : [] | [Picture],
}
export type SharableDate = bigint;
export type SharableE8S = bigint;
export type SharableProportion = [bigint, bigint];
export type SharableRange = [Value, Value];
export type SharableRange_1 = [Value_1, Value_1];
export type SharableRange_2 = [Value_2, Value_2];
export type SharableSystemVariant = {
    'TallyResult' : {
      'new' : Array<Principal>,
      'timestamp' : Time,
      'unchanged' : Array<Principal>,
      'removed' : Array<Principal>,
    }
  } |
  {
    'FlagResult' : {
      'result' : Result,
      'timestamp' : Time,
      'header' : FlagHeader,
    }
  } |
  {
    'ProposalExecuted' : {
      'result' : ExecutedResult,
      'timestamp' : Time,
      'proposer' : Principal,
      'proposalId' : bigint,
    }
  } |
  { 'FlagRequested' : { 'timestamp' : Time, 'header' : FlagHeader } } |
  {
    'SystemGeneric' : {
      'link' : [] | [Hyperlink],
      'message' : string,
      'timestamp' : Time,
    }
  };
export type SharableUserVariant = {
    'NewEvidencesFromFollowings' : {
      'total' : bigint,
      'capacity' : Array<NewEvidencesFromFollowingsData>,
    }
  } |
  {
    'NewAxiomsToHypothesis' : {
      'id' : bigint,
      'total' : bigint,
      'capacity' : Array<NewAxiomsToHypothesisData>,
    }
  } |
  {
    'NewReferrals' : { 'total' : bigint, 'capacity' : Array<NewReferralsData> }
  } |
  { 'CustodianElectionResult' : CustodianElectionResultData } |
  { 'ProposalExecuted' : ProposalExecutedData } |
  { 'NewBallots' : { 'total' : bigint, 'capacity' : Array<NewBallotsData> } } |
  { 'ProposalResult' : ProposalResultData } |
  { 'CustodianProposalResult' : CustodianProposalResultData } |
  {
    'NewEvidencesToHypothesis' : {
      'id' : bigint,
      'total' : bigint,
      'capacity' : Array<NewEvidencesToHypothesisData>,
    }
  } |
  { 'CustodianProposalOpened' : CustodianProposalOpenedData } |
  { 'CustodianProposalDelegated' : CustodianProposalDelegatedData } |
  {
    'NewVotesToHypothesis' : {
      'id' : bigint,
      'total' : bigint,
      'capacity' : Array<NewVotesToHypothesisData>,
    }
  } |
  {
    'NewFollowers' : { 'total' : bigint, 'capacity' : Array<NewFollowersData> }
  } |
  {
    'NewVotesToEvidence' : {
      'id' : bigint,
      'total' : bigint,
      'capacity' : Array<NewVotesToEvidenceData>,
    }
  } |
  {
    'NewHypothesesFromFollowings' : {
      'total' : bigint,
      'capacity' : Array<NewHypothesesFromFollowingsData>,
    }
  } |
  { 'CouponRedeemed' : CouponRedeemedData } |
  {
    'NewVotesToProposal' : {
      'id' : bigint,
      'total' : bigint,
      'capacity' : Array<NewVotesToProposalData>,
    }
  } |
  {
    'NewRepliesToEvidence' : {
      'id' : bigint,
      'total' : bigint,
      'capacity' : Array<NewRepliesToEvidenceData>,
    }
  };
export type SharableValue = { 'E8S' : SharableE8S } |
  { 'Nat' : bigint } |
  { 'Bool' : boolean } |
  { 'Date' : SharableDate } |
  { 'Text' : string } |
  { 'Proportion' : SharableProportion } |
  { 'Float' : number } |
  { 'RangeInt' : SharableRange_1 } |
  { 'RangeNat' : SharableRange_2 } |
  { 'RangeFloat' : SharableRange } |
  { 'Duration' : bigint };
export type Sharable__1 = [
  Array<SharableUserVariant>,
  Array<SharableSystemVariant>,
];
export type Sharable__2 = Array<[Key, SharableValue]>;
export interface Sort { 'by' : Sort__1, 'order' : Order }
export type Sort__1 = { 'alphabetical' : null } |
  { 'capitalRaised' : null } |
  { 'recent' : null };
export type SystemNotificationsBatch = [] | [[SystemVariantParam, List_3]];
export type SystemVariantParam = {
    'TallyResult' : {
      'new' : Array<Principal>,
      'timestamp' : Time,
      'unchanged' : Array<Principal>,
      'removed' : Array<Principal>,
    }
  } |
  {
    'FlagResult' : {
      'result' : Result,
      'timestamp' : Time,
      'header' : FlagHeader,
    }
  } |
  {
    'ProposalExecuted' : {
      'result' : ExecutedResult,
      'timestamp' : Time,
      'proposer' : Principal,
      'proposalId' : bigint,
    }
  } |
  { 'FlagRequested' : { 'timestamp' : Time, 'header' : FlagHeader } } |
  {
    'SystemGeneric' : {
      'link' : [] | [Hyperlink],
      'message' : string,
      'timestamp' : Time,
    }
  };
export type SystemVariantParam__1 = {
    'TallyResult' : {
      'new' : Array<Principal>,
      'timestamp' : Time,
      'unchanged' : Array<Principal>,
      'removed' : Array<Principal>,
    }
  } |
  {
    'FlagResult' : {
      'result' : Result,
      'timestamp' : Time,
      'header' : FlagHeader,
    }
  } |
  {
    'ProposalExecuted' : {
      'result' : ExecutedResult,
      'timestamp' : Time,
      'proposer' : Principal,
      'proposalId' : bigint,
    }
  } |
  { 'FlagRequested' : { 'timestamp' : Time, 'header' : FlagHeader } } |
  {
    'SystemGeneric' : {
      'link' : [] | [Hyperlink],
      'message' : string,
      'timestamp' : Time,
    }
  };
export type TernaryChoice = { 'Negative' : null } |
  { 'Positive' : null } |
  { 'Neutral' : null };
export type Time = bigint;
export type Time__1 = bigint;
export type UserNotificationsBatch = [] | [[UserVariantParam, List_2]];
export type UserVariantParam = {
    'NewEvidencesFromFollowings' : NewEvidencesFromFollowingsData
  } |
  {
    'NewAxiomsToHypothesis' : {
      'id' : bigint,
      'data' : NewAxiomsToHypothesisData,
    }
  } |
  { 'NewReferrals' : NewReferralsData } |
  { 'CustodianElectionResult' : CustodianElectionResultData } |
  { 'ProposalExecuted' : ProposalExecutedData } |
  { 'NewBallots' : NewBallotsData } |
  { 'ProposalResult' : ProposalResultData } |
  { 'CustodianProposalResult' : CustodianProposalResultData } |
  {
    'NewEvidencesToHypothesis' : {
      'id' : bigint,
      'data' : NewEvidencesToHypothesisData,
    }
  } |
  { 'CustodianProposalOpened' : CustodianProposalOpenedData } |
  { 'CustodianProposalDelegated' : CustodianProposalDelegatedData } |
  {
    'NewVotesToHypothesis' : {
      'id' : bigint,
      'data' : NewVotesToHypothesisData,
    }
  } |
  { 'NewFollowers' : NewFollowersData } |
  {
    'NewVotesToEvidence' : { 'id' : bigint, 'data' : NewVotesToEvidenceData }
  } |
  { 'NewHypothesesFromFollowings' : NewHypothesesFromFollowingsData } |
  { 'CouponRedeemed' : CouponRedeemedData } |
  {
    'NewVotesToProposal' : { 'id' : bigint, 'data' : NewVotesToProposalData }
  } |
  {
    'NewRepliesToEvidence' : {
      'id' : bigint,
      'data' : NewRepliesToEvidenceData,
    }
  };
export type UserVariantParam__1 = {
    'NewEvidencesFromFollowings' : NewEvidencesFromFollowingsData
  } |
  {
    'NewAxiomsToHypothesis' : {
      'id' : bigint,
      'data' : NewAxiomsToHypothesisData,
    }
  } |
  { 'NewReferrals' : NewReferralsData } |
  { 'CustodianElectionResult' : CustodianElectionResultData } |
  { 'ProposalExecuted' : ProposalExecutedData } |
  { 'NewBallots' : NewBallotsData } |
  { 'ProposalResult' : ProposalResultData } |
  { 'CustodianProposalResult' : CustodianProposalResultData } |
  {
    'NewEvidencesToHypothesis' : {
      'id' : bigint,
      'data' : NewEvidencesToHypothesisData,
    }
  } |
  { 'CustodianProposalOpened' : CustodianProposalOpenedData } |
  { 'CustodianProposalDelegated' : CustodianProposalDelegatedData } |
  {
    'NewVotesToHypothesis' : {
      'id' : bigint,
      'data' : NewVotesToHypothesisData,
    }
  } |
  { 'NewFollowers' : NewFollowersData } |
  {
    'NewVotesToEvidence' : { 'id' : bigint, 'data' : NewVotesToEvidenceData }
  } |
  { 'NewHypothesesFromFollowings' : NewHypothesesFromFollowingsData } |
  { 'CouponRedeemed' : CouponRedeemedData } |
  {
    'NewVotesToProposal' : { 'id' : bigint, 'data' : NewVotesToProposalData }
  } |
  {
    'NewRepliesToEvidence' : {
      'id' : bigint,
      'data' : NewRepliesToEvidenceData,
    }
  };
export type UsersBatch = [] | [[Principal, List_1]];
export type UsersNotificationsBatch = [] | [
  [[Principal, UserVariantParam], List]
];
export type Value = { 'value' : ValueProp } |
  { 'infinity' : null };
export type ValueProp = { 'inclusive' : number } |
  { 'exclusive' : number };
export type ValueProp_1 = { 'inclusive' : bigint } |
  { 'exclusive' : bigint };
export type ValueProp_2 = { 'inclusive' : bigint } |
  { 'exclusive' : bigint };
export type Value_1 = { 'value' : ValueProp_1 } |
  { 'infinity' : null };
export type Value_2 = { 'value' : ValueProp_2 } |
  { 'infinity' : null };
export interface _SERVICE extends Facade {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
