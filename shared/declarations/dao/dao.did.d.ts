import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ActorsConfigs = Array<[ConfigurableActorVariant, SharableConfigs]>;
export type Changes = { 'Security' : Array<string> } |
  { 'Fixed' : Array<string> } |
  { 'Changed' : Array<string> } |
  { 'Added' : Array<string> } |
  { 'Removed' : Array<string> };
export type Choice = { 'Delegated' : null } |
  { 'Negative' : null } |
  { 'Positive' : null };
export type Choice__1 = { 'Negative' : null } |
  { 'Positive' : null } |
  { 'Neutral' : null };
export type ConfigurableActorVariant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Chat' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Assets' : null } |
  { 'Treasury' : null } |
  { 'Encyclopedia' : null };
export interface DAO {
  'cancelCodeUpload' : ActorMethod<[], undefined>,
  'castBallots' : ActorMethod<[Array<Principal>], undefined>,
  'enterElection' : ActorMethod<[string], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__8>,
  'getDaysInPeriod' : ActorMethod<[], Sharable__7>,
  'getEarning' : ActorMethod<[Principal], [Sharable__6, Sharable__6]>,
  'getNominee' : ActorMethod<[Principal], Sharable__4>,
  'getNominees' : ActorMethod<[Filter__1, Sort_1], Sharable__5>,
  'getNomineesPagination' : ActorMethod<
    [Filter__1, Sort_1, bigint, bigint],
    Pagination_1
  >,
  'getProposal' : ActorMethod<[bigint], Sharable__2>,
  'getProposals' : ActorMethod<[Filter, Sort], Sharable__3>,
  'getProposalsPagination' : ActorMethod<
    [Filter, Sort, bigint, bigint],
    Pagination
  >,
  'getUser' : ActorMethod<[Principal], Sharable__1>,
  'initialize' : ActorMethod<[], undefined>,
  'initializeCodeUploadSession' : ActorMethod<
    [string, UpdateLevel, ReleaseNotes, Sharable],
    undefined
  >,
  'leaveElection' : ActorMethod<[], undefined>,
  'openCodeProposal' : ActorMethod<
    [string, bigint, bigint, ActorsConfigs],
    bigint
  >,
  'openConfigsProposal' : ActorMethod<
    [string, bigint, bigint, ActorsConfigs],
    bigint
  >,
  'openFieldProposal' : ActorMethod<[string, string, string], bigint>,
  'openWorkerProposal' : ActorMethod<[string, string, bigint, bigint], bigint>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal], undefined>,
  'retryConfigsProposal' : ActorMethod<
    [bigint, string, bigint, bigint, ActorsConfigs],
    undefined
  >,
  'retryFieldProposal' : ActorMethod<
    [bigint, string, string, string],
    undefined
  >,
  'retryWorkerProposal' : ActorMethod<
    [bigint, string, bigint, bigint],
    undefined
  >,
  'setCodeProposalExecuted' : ActorMethod<[bigint], undefined>,
  'setCodeProposalFailed' : ActorMethod<[bigint, string], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'updateNomineeTitle' : ActorMethod<[string], undefined>,
  'voteProposal' : ActorMethod<[bigint, Delegable], undefined>,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export type Delegable = { 'Delegated' : Principal } |
  { 'Default' : Choice };
export type Delegable__1 = { 'Delegated' : Principal } |
  { 'Default' : UniformBinaryVote };
export type DeployableActorVariant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Chat' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Assets' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'Encyclopedia' : null } |
  { 'ICPUSD' : null };
export interface Filter {
  'status' : [] | [StatusVariant],
  'voter' : [] | [Principal],
  'category' : [] | [ProposalVariant],
  'proposer' : [] | [Principal],
}
export interface Filter__1 {
  'voter' : [] | [Principal],
  'isCustodian' : [] | [boolean],
}
export type Key = string;
export interface Milestone { 'status' : Status, 'date' : Time }
export type Order = { 'descending' : null } |
  { 'ascending' : null };
export interface Pagination {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__2>,
}
export interface Pagination_1 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__4>,
}
export type ProposalVariant = { 'Code' : null } |
  { 'Field' : null } |
  { 'Configs' : null } |
  { 'Worker' : null };
export type ReleaseNotes = Array<Changes>;
export type Sharable = Array<SharableCommitment>;
export interface SharableCode {
  'actorsConfigs' : ActorsConfigs,
  'installation' : SharableInstallation,
}
export interface SharableCommitment {
  'moduleHash' : string,
  'args' : Uint8Array | number[],
  'actorVariant' : DeployableActorVariant,
}
export type SharableCommitments = Array<SharableCommitment>;
export type SharableConfigs = Array<[Key, SharableValue]>;
export interface SharableConfigs__1 { 'actorsConfigs' : ActorsConfigs }
export type SharableDate = bigint;
export type SharableDetachment = { 'Code' : SharableCode } |
  { 'Field' : SharableField } |
  { 'Configs' : SharableConfigs__1 } |
  { 'Worker' : SharableWorker };
export type SharableE8S = bigint;
export interface SharableEarning {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S,
  'balance' : SharableE8S,
}
export interface SharableField { 'name' : string, 'description' : string }
export interface SharableInstallation {
  'updateLevel' : UpdateLevel,
  'releaseNotes' : ReleaseNotes,
  'commitments' : SharableCommitments,
  'commitHash' : string,
}
export interface SharableNominee {
  'title' : string,
  'principal' : Principal,
  'ballots' : [bigint, bigint],
  'isCustodian' : boolean,
  'callerBallot' : [] | [bigint],
}
export type SharableProportion = [bigint, bigint];
export interface SharableProposal {
  'id' : bigint,
  'title' : string,
  'icpReward' : bigint,
  'content' : string,
  'callerVote' : [] | [Delegable__1],
  'votes' : [
    Array<Principal>,
    Array<Principal>,
    Array<Principal>,
    Array<Principal>,
  ],
  'acornReward' : bigint,
  'proposer' : Principal,
  'detachment' : SharableDetachment,
  'timeline' : Array<Milestone>,
}
export type SharableRange = [Value, Value];
export type SharableRange_1 = [Value_1, Value_1];
export type SharableRange_2 = [Value_2, Value_2];
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
export type SharableWorker = {};
export interface Sharable__1 {
  'ballots' : Array<[Principal, bigint]>,
  'referendums' : Array<bigint>,
  'icpEarning' : SharableEarning,
  'referendumVotes' : Array<[bigint, TernaryVote]>,
  'acornEarning' : SharableEarning,
  'lastUpdateBallot' : Time,
  'proposalVotes' : Array<[bigint, Delegable__1]>,
  'proposals' : Array<bigint>,
}
export interface Sharable__2 {
  'id' : bigint,
  'title' : string,
  'icpReward' : bigint,
  'content' : string,
  'callerVote' : [] | [Delegable__1],
  'votes' : [
    Array<Principal>,
    Array<Principal>,
    Array<Principal>,
    Array<Principal>,
  ],
  'acornReward' : bigint,
  'proposer' : Principal,
  'detachment' : SharableDetachment,
  'timeline' : Array<Milestone>,
}
export type Sharable__3 = Array<SharableProposal>;
export interface Sharable__4 {
  'title' : string,
  'principal' : Principal,
  'ballots' : [bigint, bigint],
  'isCustodian' : boolean,
  'callerBallot' : [] | [bigint],
}
export type Sharable__5 = Array<SharableNominee>;
export interface Sharable__6 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S,
  'balance' : SharableE8S,
}
export type Sharable__7 = bigint;
export type Sharable__8 = Array<[Key, SharableValue]>;
export interface Sort { 'by' : Sort__1, 'order' : Order }
export interface Sort_1 { 'by' : Sort__2, 'order' : Order }
export type Sort__1 = { 'icpReward' : null } |
  { 'acornReward' : null } |
  { 'updated' : null } |
  { 'recent' : null };
export type Sort__2 = { 'token' : null } |
  { 'voter' : null };
export type Status = { 'Failed' : string } |
  { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Proposed' : null } |
  { 'Executed' : null } |
  { 'Retried' : null } |
  { 'Expired' : null };
export type StatusVariant = { 'Failed' : null } |
  { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Proposed' : null } |
  { 'Executed' : null } |
  { 'Retried' : null } |
  { 'Expired' : null };
export interface TernaryVote { 'value' : bigint, 'choice' : Choice__1 }
export type Time = bigint;
export interface UniformBinaryVote { 'choice' : Choice }
export type UpdateLevel = { 'Patch' : null } |
  { 'Major' : null } |
  { 'Minor' : null };
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
export interface _SERVICE extends DAO {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
