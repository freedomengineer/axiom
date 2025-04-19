import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ACORN {
  'icrc1_balance_of' : ActorMethod<[Account], bigint>,
  'icrc1_decimals' : ActorMethod<[], number>,
  'icrc1_fee' : ActorMethod<[], bigint>,
  'icrc1_minting_account' : ActorMethod<[], [] | [Account]>,
  'icrc1_name' : ActorMethod<[], string>,
  'icrc1_symbol' : ActorMethod<[], string>,
  'icrc1_total_supply' : ActorMethod<[], bigint>,
  'icrc1_transfer' : ActorMethod<[TransferArgs], TransferResult>,
  'icrc2_allowance' : ActorMethod<[AllowanceArgs], Allowance>,
  'icrc2_approve' : ActorMethod<[ApproveArgs], ApproveResult>,
  'icrc2_transfer_from' : ActorMethod<[TransferFromArgs], TransferFromResult>,
}
export interface ACORNToMint { 'buried' : bigint, 'liquid' : bigint }
export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type ActorVariant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Founder' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'ICPUSD' : null };
export type ActorVariant__1 = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Founder' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'ICPUSD' : null };
export type ActorsConfigs = Array<[ConfigurableActorVariant, SharableConfigs]>;
export type ActorsConfigs__1 = Array<
  [ConfigurableActorVariant, SharableConfigs]
>;
export interface Affiliate {
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'fillReferrals' : ActorMethod<
    [Principal, bigint, [] | [Principal]],
    undefined
  >,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getEarning' : ActorMethod<[Principal], Sharable__7>,
  'getUser' : ActorMethod<[Principal], Sharable__31>,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export interface Allowance {
  'allowance' : bigint,
  'expires_at' : [] | [bigint],
}
export interface AllowanceArgs { 'account' : Account, 'spender' : Account }
export interface ApproveArgs {
  'fee' : [] | [bigint],
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'expected_allowance' : [] | [bigint],
  'expires_at' : [] | [bigint],
  'spender' : Account,
}
export type ApproveResult = { 'Ok' : bigint } |
  {
    'Err' : { 'GenericError' : { 'message' : string, 'error_code' : bigint } } |
      { 'TemporarilyUnavailable' : null } |
      { 'Duplicate' : { 'duplicate_of' : bigint } } |
      { 'BadFee' : { 'expected_fee' : bigint } } |
      { 'AllowanceChanged' : { 'current_allowance' : bigint } } |
      { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
      { 'TooOld' : null } |
      { 'Expired' : { 'ledger_time' : bigint } } |
      { 'InsufficientFunds' : { 'balance' : bigint } }
  };
export interface Axioms {
  'addToAxioms' : ActorMethod<[bigint], undefined>,
  'addToBookmarks' : ActorMethod<[bigint], undefined>,
  'createField' : ActorMethod<[string, string], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getAgePayout' : ActorMethod<[bigint, bigint], Sharable__30>,
  'getAgePayouts' : ActorMethod<[bigint], Sharable__29>,
  'getAgesPayout' : ActorMethod<[bigint], Sharable__29>,
  'getAgesPayouts' : ActorMethod<[], Array<Sharable__29>>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getEarning' : ActorMethod<[Principal], Sharable__7>,
  'getEvidence' : ActorMethod<[bigint], Sharable__27>,
  'getEvidences' : ActorMethod<[Filter__6, Sort_6], Sharable__28>,
  'getEvidencesPagination' : ActorMethod<
    [Filter__6, Sort_6, bigint, bigint],
    Pagination_6
  >,
  'getField' : ActorMethod<[string], Sharable__25>,
  'getFields' : ActorMethod<[Filter__5, Sort_5], Sharable__26>,
  'getFieldsPagination' : ActorMethod<
    [Filter__5, Sort_5, bigint, bigint],
    Pagination_5
  >,
  'getFlag' : ActorMethod<[Header], Sharable__23>,
  'getFlags' : ActorMethod<[Filter__4, Sort_4], Sharable__24>,
  'getFlagsPagination' : ActorMethod<
    [Filter__4, Sort_4, bigint, bigint],
    Pagination_4
  >,
  'getHypotheses' : ActorMethod<[Filter__3, Sort_3], Sharable__22>,
  'getHypothesesPagination' : ActorMethod<
    [Filter__3, Sort_3, bigint, bigint],
    Pagination_3
  >,
  'getHypothesis' : ActorMethod<[bigint], Sharable__21>,
  'getUser' : ActorMethod<[Principal], Sharable__20>,
  'initialize' : ActorMethod<[], undefined>,
  'joinField' : ActorMethod<[string], undefined>,
  'leaveField' : ActorMethod<[string], undefined>,
  'publishEvidence' : ActorMethod<[bigint, Form, Choice__2], bigint>,
  'publishHypothesis' : ActorMethod<[string, string], bigint>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal], undefined>,
  'removeEvidenceVote' : ActorMethod<[bigint], undefined>,
  'removeFlagVote' : ActorMethod<[Header], undefined>,
  'removeFromAxioms' : ActorMethod<[bigint], undefined>,
  'removeFromBookmarks' : ActorMethod<[bigint], undefined>,
  'removeHypothesisVote' : ActorMethod<[bigint], undefined>,
  'requestFlag' : ActorMethod<[Header, string], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'voteEvidence' : ActorMethod<[bigint, Choice__2], undefined>,
  'voteFlag' : ActorMethod<[Header, Choice__2], undefined>,
  'voteHypothesis' : ActorMethod<[bigint, Choice__1], undefined>,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export type BinaryChoice = { 'Negative' : null } |
  { 'Positive' : null };
export type BinaryChoice__1 = { 'Negative' : null } |
  { 'Positive' : null };
export interface BinaryVote { 'value' : bigint, 'choice' : Choice__2 }
export interface BinaryVote__1 { 'value' : bigint, 'choice' : Choice__2 }
export interface BinaryVote__2 { 'value' : bigint, 'choice' : Choice__2 }
export type Category = { 'Hypothesis' : null } |
  { 'Evidence' : null };
export type Category__1 = { 'Hypothesis' : null } |
  { 'Evidence' : null };
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
export type Choice__2 = { 'Negative' : null } |
  { 'Positive' : null };
export type ConfigurableActorVariant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Treasury' : null };
export interface DAO {
  'cancelCodeUpload' : ActorMethod<[], undefined>,
  'castBallots' : ActorMethod<[Array<Principal>], undefined>,
  'enterElection' : ActorMethod<[string], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getDaysInPeriod' : ActorMethod<[], Sharable__19>,
  'getEarning' : ActorMethod<[Principal], [Sharable__7, Sharable__7]>,
  'getNominee' : ActorMethod<[Principal], Sharable__17>,
  'getNominees' : ActorMethod<[Filter__2, Sort_2], Sharable__18>,
  'getNomineesPagination' : ActorMethod<
    [Filter__2, Sort_2, bigint, bigint],
    Pagination_2
  >,
  'getProposal' : ActorMethod<[bigint], Sharable__15>,
  'getProposals' : ActorMethod<[Filter__1, Sort_1], Sharable__16>,
  'getProposalsPagination' : ActorMethod<
    [Filter__1, Sort_1, bigint, bigint],
    Pagination_1
  >,
  'getUser' : ActorMethod<[Principal], Sharable__14>,
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
export type Delegable__2 = { 'Delegated' : Principal } |
  { 'Default' : UniformBinaryVote__1 };
export type DeployableActorVariant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'ICPUSD' : null };
export type DeployableVariant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'ICPUSD' : null };
export interface Dip721NonFungibleToken {
  'maxLimit' : number,
  'logo' : LogoResult,
  'name' : string,
  'symbol' : string,
}
export interface Entry { 'rank' : bigint, 'score' : bigint }
export interface Escrow {
  'bury' : ActorMethod<[bigint, Option], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getBurials' : ActorMethod<[Principal], Sharable__13>,
  'getBuriedAmount' : ActorMethod<[Principal], bigint>,
  'getClaimableAmount' : ActorMethod<[Principal], bigint>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getExpiredAmount' : ActorMethod<[Principal], bigint>,
  'getInterestAmount' : ActorMethod<[Principal], bigint>,
  'getUser' : ActorMethod<[Principal], Sharable__12>,
  'getVotingPower' : ActorMethod<[Principal], bigint>,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal, bigint], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export interface Facade {
  'editAvatar' : ActorMethod<[[] | [Picture]], undefined>,
  'editLinks' : ActorMethod<[Array<Hyperlink__1>], undefined>,
  'editLocation' : ActorMethod<[[] | [string]], undefined>,
  'editUsername' : ActorMethod<[string], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getUser' : ActorMethod<[Principal], Sharable__11>,
  'getUserIdentifier' : ActorMethod<[IdentifierVariant], Identifier>,
  'getUsers' : ActorMethod<[Filter, Sort], Array<Sharable__11>>,
  'getUsersCount' : ActorMethod<[], bigint>,
  'getUsersPagination' : ActorMethod<
    [Filter, Sort, bigint, bigint],
    Pagination
  >,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[string, bigint, [] | [Principal]], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
}
export interface Filter {
  'containsPattern' : [] | [string],
  'hasCapitalRaised' : [] | [bigint],
}
export interface Filter__1 {
  'votedBy' : [] | [Principal],
  'proposedBy' : [] | [Principal],
  'proposedIn' : [] | [ProposalVariant],
  'withStatus' : [] | [StatusVariant],
}
export interface Filter__2 {
  'votedBy' : [] | [Principal],
  'isCustodian' : [] | [boolean],
}
export interface Filter__3 {
  'axiomsFrom' : [] | [Principal],
  'publishedAt' : [] | [bigint],
  'publishedBy' : [] | [Principal],
  'publishedIn' : [] | [string],
  'votedBy' : [] | [Principal],
  'bookmarksFrom' : [] | [Principal],
  'containsPattern' : [] | [string],
}
export interface Filter__4 {
  'votedBy' : [] | [Principal],
  'requestedBy' : [] | [Principal],
  'requestedIn' : [] | [Category__1],
}
export interface Filter__5 {
  'joinedBy' : [] | [Principal],
  'containsPattern' : [] | [string],
}
export interface Filter__6 {
  'publishedBy' : [] | [Principal],
  'publishedIn' : [] | [bigint],
  'votedBy' : [] | [Principal],
  'containsPattern' : [] | [string],
  'onSide' : [] | [BinaryChoice],
}
export type Form = Array<Format>;
export type Format = { 'Note' : Note } |
  { 'Picture' : Picture } |
  { 'Hyperlink' : Hyperlink__1 };
export interface Header { 'id' : bigint, 'category' : Category }
export interface Hyperlink { 'url' : string, 'anchorText' : string }
export interface Hyperlink__1 { 'url' : string, 'anchorText' : string }
export interface ICPUSD { 'exchange' : ActorMethod<[boolean, bigint], bigint> }
export interface Identifier { 'principal' : Principal, 'username' : string }
export type IdentifierVariant = { 'Principal' : Principal } |
  { 'Username' : string };
export interface Indicator {
  'ACORN' : ActorMethod<[], Principal>,
  'Affiliate' : ActorMethod<[], Principal>,
  'Axioms' : ActorMethod<[], Principal>,
  'DAO' : ActorMethod<[], Principal>,
  'Escrow' : ActorMethod<[], Principal>,
  'Facade' : ActorMethod<[], Principal>,
  'ICPUSD' : ActorMethod<[], Principal>,
  'Sales' : ActorMethod<[], Principal>,
  'Split' : ActorMethod<[], Principal>,
  'Treasury' : ActorMethod<[], Principal>,
  'checkInstallationSettled' : ActorMethod<[Principal], boolean>,
  'clearCommitment' : ActorMethod<[DeployableVariant], undefined>,
  'deleteSession' : ActorMethod<[Principal], undefined>,
  'enqueueUpgradeTask' : ActorMethod<
    [bigint, Principal, ActorsConfigs],
    undefined
  >,
  'expectAuthorized' : ActorMethod<[Principal, Array<Variant>], undefined>,
  'expectUnreleased' : ActorMethod<[], undefined>,
  'extendInstallationExpiryDate' : ActorMethod<[Principal, bigint], undefined>,
  'getActorInfo' : ActorMethod<[Variant], Info>,
  'getActorsInfo' : ActorMethod<[], Array<[Variant, Info]>>,
  'getCanisterTime' : ActorMethod<[], bigint>,
  'getCommitmentComputedModuleHash' : ActorMethod<
    [Principal, DeployableVariant],
    string
  >,
  'getCommitmentUploadedChunks' : ActorMethod<
    [Principal, DeployableVariant],
    Uint8Array | number[]
  >,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getInstallation' : ActorMethod<[Principal], Sharable__2>,
  'getInstallationWithTitle' : ActorMethod<[Principal], [Sharable__2, string]>,
  'getPrincipal' : ActorMethod<[Variant], Principal>,
  'getPrincipals' : ActorMethod<[], Array<[Variant, Principal]>>,
  'getVariant' : ActorMethod<[Principal], Variant>,
  'getVersion' : ActorMethod<[], Sharable__1>,
  'initialize' : ActorMethod<[], undefined>,
  'initializeFirstSession' : ActorMethod<
    [UpdateLevel, ReleaseNotes, Sharable],
    undefined
  >,
  'initializeSession' : ActorMethod<
    [Principal, string, UpdateLevel, ReleaseNotes, Sharable],
    undefined
  >,
  'installCanisters' : ActorMethod<[], undefined>,
  'putActorsConfigs' : ActorMethod<[ActorsConfigs], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setActorsConfigs' : ActorMethod<[ActorsConfigs], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'settleCommitment' : ActorMethod<[DeployableVariant], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'topUp' : ActorMethod<[Variant, bigint], undefined>,
  'uploadCommitmentChunk' : ActorMethod<
    [DeployableVariant, number, Uint8Array | number[], string],
    undefined
  >,
}
export interface Info {
  'status' : { 'stopped' : null } |
    { 'stopping' : null } |
    { 'running' : null },
  'moduleHash' : string,
  'args' : Uint8Array | number[],
  'cycles' : bigint,
  'commitHash' : string,
  'memorySize' : bigint,
}
export type Key = string;
export type List = [] | [[bigint, List__1]];
export type List__1 = [] | [[bigint, List__1]];
export interface LogoResult { 'data' : string, 'logo_type' : string }
export interface Milestone { 'status' : Status, 'date' : Time__4 }
export interface Note { 'content' : string, 'extended' : boolean }
export type OneSideSharable = [bigint, bigint, bigint];
export type OneSideSharable__1 = [bigint, bigint];
export type Option = { 'Perpetual' : null } |
  { 'Double' : null } |
  { 'Octuple' : null } |
  { 'Quadruple' : null } |
  { 'Single' : null };
export type Order = { 'descending' : null } |
  { 'ascending' : null };
export interface Pagination {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__11>,
}
export interface Pagination_1 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__15>,
}
export interface Pagination_2 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__17>,
}
export interface Pagination_3 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__21>,
}
export interface Pagination_4 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__23>,
}
export interface Pagination_5 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__25>,
}
export interface Pagination_6 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__27>,
}
export interface Picture { 'blob' : Uint8Array | number[] }
export type ProposalVariant = { 'Code' : null } |
  { 'Field' : null } |
  { 'Configs' : null } |
  { 'Worker' : null };
export type ReleaseNotes = Array<Changes>;
export type Role = { 'Guest' : null } |
  { 'Member' : null };
export interface Sales {
  'addPackage' : ActorMethod<[bigint, string, string, string], undefined>,
  'computeAcornToMint' : ActorMethod<[bigint], ACORNToMint>,
  'expectPackageFound' : ActorMethod<[bigint], bigint>,
  'expectPackageNotFound' : ActorMethod<[bigint], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getDeployedPackages' : ActorMethod<[], Sharable__10>,
  'getOwnedPackages' : ActorMethod<[Principal], Sharable__10>,
  'getPackagePrincipals' : ActorMethod<[], Array<[bigint, Principal]>>,
  'getPackages' : ActorMethod<[], Sharable__10>,
  'mintPackage' : ActorMethod<[Principal, bigint], bigint>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
}
export type Sharable = Array<SharableCommitment>;
export interface SharableAllocation {
  'balance' : bigint,
  'allocated' : bigint,
  'actorVariant' : ActorVariant,
}
export interface SharableBinaryVotes {
  'powered' : OneSideSharable__1,
  'regular' : OneSideSharable__1,
}
export interface SharableBinaryVotes__1 {
  'powered' : OneSideSharable__1,
  'regular' : OneSideSharable__1,
}
export interface SharableBurial {
  'issueDate' : Time__2,
  'coefficient' : bigint,
  'expiryDate' : Time__2,
  'claimableInterest' : SharableE8S__2,
  'amount' : SharableE8S__2,
}
export type SharableBurials = Array<SharableBurial>;
export interface SharableCode {
  'actorsConfigs' : ActorsConfigs__1,
  'installation' : SharableInstallation,
}
export interface SharableCommitment {
  'moduleHash' : string,
  'args' : Uint8Array | number[],
  'actorVariant' : DeployableActorVariant,
}
export type SharableCommitments = Array<SharableCommitment>;
export type SharableConfigs = Array<[Key, SharableValue]>;
export interface SharableConfigs__1 { 'actorsConfigs' : ActorsConfigs__1 }
export type SharableCount = bigint;
export type SharableCount__1 = bigint;
export type SharableDate = bigint;
export type SharableDetachment = { 'Code' : SharableCode } |
  { 'Field' : SharableField } |
  { 'Configs' : SharableConfigs__1 } |
  { 'Worker' : SharableWorker };
export interface SharableDistribution {
  'earning' : SharableEarning,
  'proportion' : SharableProportion__1,
  'actorVariant' : ActorVariant__1,
}
export type SharableE8S = bigint;
export type SharableE8S__1 = bigint;
export type SharableE8S__2 = bigint;
export type SharableE8S__3 = bigint;
export interface SharableEarning {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export interface SharableEarning__1 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export interface SharableEarning__2 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export interface SharableEarning__3 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export interface SharableEvidence {
  'id' : bigint,
  'callerVote' : [] | [BinaryVote__2],
  'votes' : SharableBinaryVotes__1,
  'publishDate' : bigint,
  'form' : Form,
  'publisher' : Principal,
  'choice' : BinaryChoice__1,
  'hypothesisId' : bigint,
}
export interface SharableField { 'name' : string, 'description' : string }
export interface SharableField__1 {
  'members' : Array<Principal>,
  'hypothesisIds' : Array<bigint>,
  'callerRole' : [] | [Role],
  'name' : string,
  'description' : string,
  'creationDate' : Time__6,
}
export interface SharableFlag {
  'id' : bigint,
  'requester' : Principal,
  'callerVote' : [] | [BinaryVote__1],
  'votes' : SharableBinaryVotes,
  'category' : Category,
  'requestDate' : Time__5,
  'reason' : string,
}
export interface SharableHypothesis {
  'id' : bigint,
  'content' : string,
  'axioms' : SharableCount,
  'callerVote' : [] | [TernaryVote__2],
  'votes' : SharableTernaryVotes,
  'publishDate' : bigint,
  'publisher' : Principal,
  'callerAxiom' : [] | [boolean],
  'callerBookmark' : [] | [boolean],
  'fieldId' : string,
  'evidenceIds' : Array<bigint>,
}
export interface SharableInstallation {
  'updateLevel' : UpdateLevel__1,
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
export interface SharablePackage {
  'principal' : [] | [Principal],
  'metadata' : Dip721NonFungibleToken,
  'capitalRaised' : bigint,
}
export interface SharablePayout {
  'ranks' : SharableRanks,
  'callerRevenue' : [] | [SharableE8S__3],
}
export type SharableProportion = [bigint, bigint];
export type SharableProportion__1 = [bigint, bigint];
export interface SharableProposal {
  'id' : bigint,
  'title' : string,
  'icpReward' : bigint,
  'content' : string,
  'callerVote' : [] | [Delegable__2],
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
export interface SharableRank {
  'poweredEntry' : Entry,
  'regularEntry' : Entry,
  'averageRank' : number,
  'hypothesisId' : bigint,
}
export type SharableRanks = Array<SharableRank>;
export interface SharableTernaryVotes {
  'powered' : OneSideSharable,
  'regular' : OneSideSharable,
}
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
export type Sharable__1 = string;
export type Sharable__10 = Array<SharablePackage>;
export interface Sharable__11 {
  'principal' : Principal,
  'username' : string,
  'links' : Array<Hyperlink>,
  'creationDate' : Time__1,
  'capitalRaised' : bigint,
  'location' : string,
  'avatar' : [] | [Picture],
}
export interface Sharable__12 { 'burials' : SharableBurials }
export type Sharable__13 = Array<SharableBurial>;
export interface Sharable__14 {
  'ballots' : Array<[Principal, bigint]>,
  'referendums' : List,
  'icpEarning' : SharableEarning__1,
  'referendumVotes' : Array<[bigint, TernaryVote]>,
  'acornEarning' : SharableEarning__1,
  'lastUpdateBallot' : Time__3,
  'proposalVotes' : Array<[bigint, Delegable__1]>,
  'proposals' : List,
}
export interface Sharable__15 {
  'id' : bigint,
  'title' : string,
  'icpReward' : bigint,
  'content' : string,
  'callerVote' : [] | [Delegable__2],
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
export type Sharable__16 = Array<SharableProposal>;
export interface Sharable__17 {
  'title' : string,
  'principal' : Principal,
  'ballots' : [bigint, bigint],
  'isCustodian' : boolean,
  'callerBallot' : [] | [bigint],
}
export type Sharable__18 = Array<SharableNominee>;
export type Sharable__19 = bigint;
export interface Sharable__2 {
  'updateLevel' : UpdateLevel__1,
  'releaseNotes' : ReleaseNotes,
  'commitments' : SharableCommitments,
  'commitHash' : string,
}
export interface Sharable__20 {
  'evidences' : Array<bigint>,
  'earning' : SharableEarning__2,
  'joinedFields' : Array<string>,
  'axioms' : Array<bigint>,
  'votedHypotheses' : Array<[bigint, TernaryVote__1]>,
  'bookmarks' : Array<bigint>,
  'hypotheses' : Array<bigint>,
  'votedEvidences' : Array<[bigint, BinaryVote]>,
}
export interface Sharable__21 {
  'id' : bigint,
  'content' : string,
  'axioms' : SharableCount,
  'callerVote' : [] | [TernaryVote__2],
  'votes' : SharableTernaryVotes,
  'publishDate' : bigint,
  'publisher' : Principal,
  'callerAxiom' : [] | [boolean],
  'callerBookmark' : [] | [boolean],
  'fieldId' : string,
  'evidenceIds' : Array<bigint>,
}
export type Sharable__22 = Array<SharableHypothesis>;
export interface Sharable__23 {
  'id' : bigint,
  'requester' : Principal,
  'callerVote' : [] | [BinaryVote__1],
  'votes' : SharableBinaryVotes,
  'category' : Category,
  'requestDate' : Time__5,
  'reason' : string,
}
export type Sharable__24 = Array<SharableFlag>;
export interface Sharable__25 {
  'members' : Array<Principal>,
  'hypothesisIds' : Array<bigint>,
  'callerRole' : [] | [Role],
  'name' : string,
  'description' : string,
  'creationDate' : Time__6,
}
export type Sharable__26 = Array<SharableField__1>;
export interface Sharable__27 {
  'id' : bigint,
  'callerVote' : [] | [BinaryVote__2],
  'votes' : SharableBinaryVotes__1,
  'publishDate' : bigint,
  'form' : Form,
  'publisher' : Principal,
  'choice' : BinaryChoice__1,
  'hypothesisId' : bigint,
}
export type Sharable__28 = Array<SharableEvidence>;
export type Sharable__29 = Array<SharablePayout>;
export type Sharable__3 = Array<[Key, SharableValue]>;
export interface Sharable__30 {
  'ranks' : SharableRanks,
  'callerRevenue' : [] | [SharableE8S__3],
}
export interface Sharable__31 {
  'referrer' : [] | [Principal],
  'earning' : SharableEarning__3,
  'referrals' : SharableCount__1,
}
export type Sharable__4 = bigint;
export type Sharable__5 = Array<SharableAllocation>;
export interface Sharable__6 {
  'balance' : bigint,
  'allocated' : bigint,
  'actorVariant' : ActorVariant,
}
export interface Sharable__7 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export type Sharable__8 = Array<SharableDistribution>;
export interface Sharable__9 {
  'earning' : SharableEarning,
  'proportion' : SharableProportion__1,
  'actorVariant' : ActorVariant__1,
}
export interface Sort { 'by' : Sort__1, 'order' : Order }
export interface Sort_1 { 'by' : Sort__2, 'order' : Order }
export interface Sort_2 { 'by' : Sort__3, 'order' : Order }
export interface Sort_3 { 'by' : Sort__4, 'order' : Order }
export interface Sort_4 { 'by' : Sort__5, 'order' : Order }
export interface Sort_5 { 'by' : Sort__6, 'order' : Order }
export interface Sort_6 { 'by' : Sort__7, 'order' : Order }
export type Sort__1 = { 'alphabetical' : null } |
  { 'capitalRaised' : null } |
  { 'recent' : null };
export type Sort__2 = { 'icpReward' : null } |
  { 'acornReward' : null } |
  { 'updated' : null } |
  { 'recent' : null };
export type Sort__3 = { 'token' : null } |
  { 'voter' : null };
export type Sort__4 = { 'positivity' : null } |
  { 'neutrality' : null } |
  { 'negativity' : null } |
  { 'controversy' : null } |
  { 'popularity' : null } |
  { 'recent' : null };
export type Sort__5 = { 'difference' : null } |
  { 'recent' : null };
export type Sort__6 = { 'alphabetical' : null } |
  { 'popularity' : null } |
  { 'recent' : null };
export type Sort__7 = { 'positivity' : null } |
  { 'negativity' : null } |
  { 'popularity' : null } |
  { 'recent' : null };
export interface Split {
  'deposit' : ActorMethod<[Principal, bigint], undefined>,
  'externalTransfer' : ActorMethod<[Principal, bigint], undefined>,
  'getBalance' : ActorMethod<[Variant], Sharable__4>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getDistribution' : ActorMethod<[Variant], Sharable__9>,
  'getDistributions' : ActorMethod<[], Sharable__8>,
  'getEarning' : ActorMethod<[Variant], Sharable__7>,
  'getTotalBalance' : ActorMethod<[], Sharable__4>,
  'getTotalRevenue' : ActorMethod<[], Sharable__4>,
  'internalTransfer' : ActorMethod<[Variant, bigint], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
}
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
export interface TernaryVote__1 { 'value' : bigint, 'choice' : Choice__1 }
export interface TernaryVote__2 { 'value' : bigint, 'choice' : Choice__1 }
export type Time = bigint;
export type Time__1 = bigint;
export type Time__2 = bigint;
export type Time__3 = bigint;
export type Time__4 = bigint;
export type Time__5 = bigint;
export type Time__6 = bigint;
export interface TransferArgs {
  'to' : Account,
  'fee' : [] | [bigint],
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export interface TransferFromArgs {
  'to' : Account,
  'fee' : [] | [bigint],
  'spender_subaccount' : [] | [Uint8Array | number[]],
  'from' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export type TransferFromResult = { 'Ok' : bigint } |
  {
    'Err' : { 'GenericError' : { 'message' : string, 'error_code' : bigint } } |
      { 'TemporarilyUnavailable' : null } |
      { 'InsufficientAllowance' : { 'allowance' : bigint } } |
      { 'BadBurn' : { 'min_burn_amount' : bigint } } |
      { 'Duplicate' : { 'duplicate_of' : bigint } } |
      { 'BadFee' : { 'expected_fee' : bigint } } |
      { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
      { 'TooOld' : null } |
      { 'InsufficientFunds' : { 'balance' : bigint } }
  };
export type TransferResult = { 'Ok' : bigint } |
  {
    'Err' : { 'GenericError' : { 'message' : string, 'error_code' : bigint } } |
      { 'TemporarilyUnavailable' : null } |
      { 'BadBurn' : { 'min_burn_amount' : bigint } } |
      { 'Duplicate' : { 'duplicate_of' : bigint } } |
      { 'BadFee' : { 'expected_fee' : bigint } } |
      { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
      { 'TooOld' : null } |
      { 'InsufficientFunds' : { 'balance' : bigint } }
  };
export interface Treasury {
  'claim' : ActorMethod<[Principal, bigint], undefined>,
  'delegatedClaim' : ActorMethod<[Variant, Principal, bigint], undefined>,
  'externalMint' : ActorMethod<[Principal, bigint], undefined>,
  'externalTransfer' : ActorMethod<[Principal, bigint], undefined>,
  'getAllocated' : ActorMethod<[Variant], Sharable__4>,
  'getAllocation' : ActorMethod<[Variant], Sharable__6>,
  'getAllocations' : ActorMethod<[], Sharable__5>,
  'getBalance' : ActorMethod<[Variant], Sharable__4>,
  'getCirculatingSupply' : ActorMethod<[], Sharable__4>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getReserveSupply' : ActorMethod<[], Sharable__4>,
  'getTotalSupply' : ActorMethod<[], Sharable__4>,
  'internalMint' : ActorMethod<[Variant, bigint], undefined>,
  'internalTransfer' : ActorMethod<[Variant, bigint], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
}
export interface UniformBinaryVote { 'choice' : Choice }
export interface UniformBinaryVote__1 { 'choice' : Choice }
export type UpdateLevel = { 'Patch' : null } |
  { 'Major' : null } |
  { 'Minor' : null };
export type UpdateLevel__1 = { 'Patch' : null } |
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
export type Variant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Founder' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'ICPUSD' : null };
export interface _SERVICE extends Indicator {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
