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
export type Achievement = { 'OctupleBurial' : null } |
  { 'Referral' : null };
export type ActorVariant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Chat' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Founder' : null } |
  { 'Assets' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'Encyclopedia' : null } |
  { 'ICPUSD' : null };
export type ActorsConfigs = Array<[ConfigurableActorVariant, SharableConfigs]>;
export interface Affiliate {
  'createCoupon' : ActorMethod<[bigint], PrivateSharable>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'fillReferrals' : ActorMethod<
    [Principal, bigint, [] | [Principal]],
    undefined
  >,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getCoupon' : ActorMethod<[string], Sharable__35>,
  'getCoupons' : ActorMethod<[Filter__7, Sort_8], Sharable__37>,
  'getCouponsPagination' : ActorMethod<
    [Filter__7, Sort_8, bigint, bigint],
    Pagination_8
  >,
  'getEarning' : ActorMethod<[Principal], Sharable__7>,
  'getPrivateCoupon' : ActorMethod<[string], PrivateSharable>,
  'getPrivateCoupons' : ActorMethod<
    [PrivateFilter, Sort_7],
    PrivateSharable__1
  >,
  'getPrivateCouponsPagination' : ActorMethod<
    [PrivateFilter, Sort_7, bigint, bigint],
    Pagination_7
  >,
  'getTop' : ActorMethod<
    [{ 'Referrers' : null } | { 'CouponGenerators' : null }],
    TopNonPagination
  >,
  'getTopPagination' : ActorMethod<
    [{ 'Referrers' : null } | { 'CouponGenerators' : null }, bigint, bigint],
    TopPagination
  >,
  'getUser' : ActorMethod<[Principal], Sharable__36>,
  'getUserCouponTotal' : ActorMethod<[Principal], [bigint, bigint]>,
  'initialize' : ActorMethod<[], undefined>,
  'lockCoupon' : ActorMethod<[Uint8Array | number[], Principal], Sharable__35>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'redeemCoupon' : ActorMethod<[Uint8Array | number[], Principal], undefined>,
  'redeemCouponFailed' : ActorMethod<
    [Uint8Array | number[], Principal, string],
    undefined
  >,
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
export interface Assets {
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
}
export interface Axioms {
  'addToAxioms' : ActorMethod<[bigint], undefined>,
  'addToBookmarks' : ActorMethod<[bigint], undefined>,
  'createField' : ActorMethod<[string, string], undefined>,
  'editHypothesis' : ActorMethod<[bigint, string], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'follow' : ActorMethod<[Principal], undefined>,
  'getAgePayout' : ActorMethod<[bigint, bigint], Sharable__34>,
  'getAgePayouts' : ActorMethod<[bigint], Sharable__33>,
  'getAgesPayout' : ActorMethod<[bigint], Sharable__33>,
  'getAgesPayouts' : ActorMethod<[], Array<Sharable__33>>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getEarning' : ActorMethod<[Principal], Sharable__7>,
  'getEvidence' : ActorMethod<[bigint], Sharable__31>,
  'getEvidences' : ActorMethod<[Filter__6, Sort_6], Sharable__32>,
  'getEvidencesPagination' : ActorMethod<
    [Filter__6, Sort_6, bigint, bigint],
    Pagination_6
  >,
  'getField' : ActorMethod<[string], Sharable__29>,
  'getFields' : ActorMethod<[Filter__5, Sort_5], Sharable__30>,
  'getFieldsPagination' : ActorMethod<
    [Filter__5, Sort_5, bigint, bigint],
    Pagination_5
  >,
  'getFlag' : ActorMethod<[Header], Sharable__27>,
  'getFlags' : ActorMethod<[Filter__4, Sort_4], Sharable__28>,
  'getFlagsPagination' : ActorMethod<
    [Filter__4, Sort_4, bigint, bigint],
    Pagination_4
  >,
  'getHypotheses' : ActorMethod<[Filter__3, Sort_3], Sharable__26>,
  'getHypothesesPagination' : ActorMethod<
    [Filter__3, Sort_3, bigint, bigint],
    Pagination_3
  >,
  'getHypothesis' : ActorMethod<[bigint], Sharable__25>,
  'getTop' : ActorMethod<
    [
      { 'HypothesisPublishers' : null } |
        { 'AcornEarners' : null } |
        { 'HypothesisVoters' : null } |
        { 'Influencers' : null } |
        { 'EvidenceVoters' : null } |
        { 'EvidencePublishers' : null },
    ],
    TopNonPagination
  >,
  'getTopPagination' : ActorMethod<
    [
      { 'HypothesisPublishers' : null } |
        { 'AcornEarners' : null } |
        { 'HypothesisVoters' : null } |
        { 'Influencers' : null } |
        { 'EvidenceVoters' : null } |
        { 'EvidencePublishers' : null },
      bigint,
      bigint,
    ],
    TopPagination
  >,
  'getUser' : ActorMethod<[Principal], Sharable__24>,
  'getUserConfigs' : ActorMethod<[], Sharable__23>,
  'initialize' : ActorMethod<[], undefined>,
  'joinField' : ActorMethod<[string], undefined>,
  'leaveField' : ActorMethod<[string], undefined>,
  'publishEvidence' : ActorMethod<
    [bigint, Form, Choice__2, [] | [bigint]],
    bigint
  >,
  'publishHypothesis' : ActorMethod<[string, string], bigint>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal], undefined>,
  'removeEvidenceVote' : ActorMethod<[bigint], undefined>,
  'removeFlagVote' : ActorMethod<[Header], undefined>,
  'removeFromAxioms' : ActorMethod<[bigint], undefined>,
  'removeFromBookmarks' : ActorMethod<[bigint], undefined>,
  'removeHypothesisVote' : ActorMethod<[bigint], undefined>,
  'requestFlag' : ActorMethod<[Header, string], undefined>,
  'restoreAllUserConfigs' : ActorMethod<[], undefined>,
  'restoreUserConfig' : ActorMethod<[Variant__1], undefined>,
  'setAllUserConfigs' : ActorMethod<[Array<Sharable__22>], undefined>,
  'setBatchUserConfigs' : ActorMethod<[Array<Sharable__22>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setUserConfig' : ActorMethod<[Sharable__22], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'unfollow' : ActorMethod<[Principal], undefined>,
  'voteEvidence' : ActorMethod<
    [bigint, Choice__2, [] | [CustomValue]],
    undefined
  >,
  'voteFlag' : ActorMethod<[Header, Choice__2], undefined>,
  'voteHypothesis' : ActorMethod<
    [bigint, Choice__1, [] | [CustomValue]],
    undefined
  >,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export type BinaryChoice = { 'Negative' : null } |
  { 'Positive' : null };
export interface BinaryVote { 'value' : bigint, 'choice' : Choice__2 }
export type Category = { 'Hypothesis' : null } |
  { 'Evidence' : null };
export type Changes = { 'Security' : Array<string> } |
  { 'Fixed' : Array<string> } |
  { 'Changed' : Array<string> } |
  { 'Added' : Array<string> } |
  { 'Removed' : Array<string> };
export interface Chat {
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal, bigint], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
}
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
  { 'Chat' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Assets' : null } |
  { 'Treasury' : null } |
  { 'Encyclopedia' : null };
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
export type CustomValue = { 'Scale' : bigint } |
  { 'Value' : bigint };
export interface DAO {
  'cancelCodeUpload' : ActorMethod<[], undefined>,
  'castBallots' : ActorMethod<[Array<Principal>], undefined>,
  'enterElection' : ActorMethod<[string], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getDaysInPeriod' : ActorMethod<[], Sharable__4>,
  'getEarning' : ActorMethod<[Principal], [Sharable__7, Sharable__7]>,
  'getNominee' : ActorMethod<[Principal], Sharable__19>,
  'getNominees' : ActorMethod<[Filter__2, Sort_2], Sharable__20>,
  'getNomineesPagination' : ActorMethod<
    [Filter__2, Sort_2, bigint, bigint],
    Pagination_2
  >,
  'getProposal' : ActorMethod<[bigint], Sharable__17>,
  'getProposals' : ActorMethod<[Filter__1, Sort_1], Sharable__18>,
  'getProposalsPagination' : ActorMethod<
    [Filter__1, Sort_1, bigint, bigint],
    Pagination_1
  >,
  'getUser' : ActorMethod<[Principal], Sharable__16>,
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
export type DeployableVariant = { 'DAO' : null } |
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
export interface Dip721NonFungibleToken {
  'maxLimit' : number,
  'logo' : LogoResult,
  'name' : string,
  'symbol' : string,
}
export type ElectionResult = { 'New' : null } |
  { 'Unchanged' : null } |
  { 'Removed' : null };
export interface Encyclopedia {
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal, bigint], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
}
export interface Entry { 'rank' : bigint, 'score' : bigint }
export interface Escrow {
  'bury' : ActorMethod<[bigint, Option], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getBurials' : ActorMethod<[Principal], Sharable__15>,
  'getBuriedAmount' : ActorMethod<[Principal], bigint>,
  'getClaimableAmount' : ActorMethod<[Principal], bigint>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getExpiredAmount' : ActorMethod<[Principal], bigint>,
  'getInterestAmount' : ActorMethod<[Principal], bigint>,
  'getTop' : ActorMethod<
    [{ 'PoweredVoters' : null } | { 'AcornBuriers' : null }],
    TopNonPagination
  >,
  'getTopPagination' : ActorMethod<
    [{ 'PoweredVoters' : null } | { 'AcornBuriers' : null }, bigint, bigint],
    TopPagination
  >,
  'getUser' : ActorMethod<[Principal], Sharable__14>,
  'getVotingPower' : ActorMethod<[Principal], bigint>,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal, bigint], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'transferFounderBurial' : ActorMethod<[Principal, Principal], undefined>,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export type ExecutedResult = { 'Failed' : null } |
  { 'Executed' : null };
export interface Facade {
  'editAvatar' : ActorMethod<[[] | [Picture]], undefined>,
  'editLinks' : ActorMethod<[Array<Hyperlink>], undefined>,
  'editLocation' : ActorMethod<[[] | [string]], undefined>,
  'editUsername' : ActorMethod<[string], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getNotification' : ActorMethod<[], Sharable__13>,
  'getUser' : ActorMethod<[Principal], Sharable__12>,
  'getUserCapitalRaised' : ActorMethod<[Principal], bigint>,
  'getUserIdentifier' : ActorMethod<[IdentifierVariant], Identifier>,
  'getUsers' : ActorMethod<[Filter, Sort], Array<Sharable__12>>,
  'getUsersCount' : ActorMethod<[], bigint>,
  'getUsersIdentifier' : ActorMethod<[], Array<Identifier>>,
  'getUsersPagination' : ActorMethod<
    [Filter, Sort, bigint, bigint],
    Pagination
  >,
  'getUsersPrincipal' : ActorMethod<[], Array<Principal>>,
  'initialize' : ActorMethod<[], undefined>,
  'postSystemGenericNotification' : ActorMethod<
    [string, [] | [Hyperlink]],
    undefined
  >,
  'postSystemNotification' : ActorMethod<[SystemVariantParam], undefined>,
  'postSystemNotifications' : ActorMethod<
    [SystemNotificationsBatch],
    undefined
  >,
  'postUserNotification' : ActorMethod<
    [Principal, UserVariantParam],
    undefined
  >,
  'postUserNotifications' : ActorMethod<
    [Principal, UserNotificationsBatch],
    undefined
  >,
  'postUsersNotification' : ActorMethod<
    [UsersBatch, UserVariantParam],
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
export interface Filter__1 {
  'status' : [] | [StatusVariant],
  'voter' : [] | [Principal],
  'category' : [] | [ProposalVariant],
  'proposer' : [] | [Principal],
}
export interface Filter__2 {
  'voter' : [] | [Principal],
  'isCustodian' : [] | [boolean],
}
export interface Filter__3 {
  'q' : [] | [string],
  'age' : [] | [bigint],
  'field' : [] | [string],
  'axiomsFrom' : [] | [Principal],
  'voter' : [] | [Principal],
  'publisher' : [] | [Principal],
  'agoEnd' : [] | [bigint],
  'userFollowedPublishers' : [] | [Principal],
  'bookmarksFrom' : [] | [Principal],
  'userJoinedFields' : [] | [Principal],
  'agoStart' : [] | [bigint],
}
export interface Filter__4 {
  'status' : [] | [Status__1],
  'requester' : [] | [Principal],
  'voter' : [] | [Principal],
  'category' : [] | [Category],
}
export interface Filter__5 { 'q' : [] | [string], 'member' : [] | [Principal] }
export interface Filter__6 {
  'q' : [] | [string],
  'voter' : [] | [Principal],
  'publisher' : [] | [Principal],
  'side' : [] | [BinaryChoice],
  'agoEnd' : [] | [bigint],
  'hypothesis' : [] | [bigint],
  'repliedTo' : [] | [bigint],
  'agoStart' : [] | [bigint],
}
export interface Filter__7 {
  'status' : [] | [StatusVariant__1],
  'creator' : [] | [Principal],
  'capitalRaised' : [] | [bigint],
}
export interface FlagHeader { 'id' : bigint, 'category' : Category }
export interface ForceUpdateCapitalRaisedResult {
  'success' : Array<Principal>,
  'failed' : Array<[Principal, string]>,
}
export type Form = Array<Format>;
export type Format = { 'Note' : Note } |
  { 'Picture' : Picture } |
  { 'Hyperlink' : Hyperlink };
export interface Header { 'id' : bigint, 'category' : Category }
export interface Hyperlink { 'url' : string, 'anchorText' : string }
export interface ICPUSD { 'exchange' : ActorMethod<[boolean, bigint], bigint> }
export interface Identifier {
  'principal' : Principal,
  'username' : string,
  'capitalRaised' : bigint,
}
export type IdentifierVariant = { 'Principal' : Principal } |
  { 'Username' : string };
export interface Indicator {
  'ACORN' : ActorMethod<[], Principal>,
  'Affiliate' : ActorMethod<[], Principal>,
  'Assets' : ActorMethod<[], Principal>,
  'Axioms' : ActorMethod<[], Principal>,
  'Chat' : ActorMethod<[], Principal>,
  'DAO' : ActorMethod<[], Principal>,
  'Encyclopedia' : ActorMethod<[], Principal>,
  'Escrow' : ActorMethod<[], Principal>,
  'Facade' : ActorMethod<[], Principal>,
  'ICPUSD' : ActorMethod<[], Principal>,
  'Sales' : ActorMethod<[], Principal>,
  'Split' : ActorMethod<[], Principal>,
  'Treasury' : ActorMethod<[], Principal>,
  'addController' : ActorMethod<[], undefined>,
  'checkInstallationSettled' : ActorMethod<[Principal], boolean>,
  'clearCommitment' : ActorMethod<[DeployableVariant], undefined>,
  'createNewCanisters' : ActorMethod<[], undefined>,
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
  'loadSnapshots' : ActorMethod<
    [Array<[DeployableVariant, string]>],
    undefined
  >,
  'putActorsConfigs' : ActorMethod<[ActorsConfigs], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setActorsConfigs' : ActorMethod<[ActorsConfigs], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'settleCommitment' : ActorMethod<[DeployableVariant], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'takeArbitrarySnapshots' : ActorMethod<[Array<DeployableVariant>], undefined>,
  'updateSettings' : ActorMethod<[Array<Variant>, Settings], undefined>,
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
  'snapshots' : Array<SnapshotDetail>,
  'cycles' : bigint,
  'commitHash' : string,
  'memorySize' : bigint,
}
export type Key = string;
export type List = [] | [[[Principal, UserVariantParam], List]];
export type List_1 = [] | [[Principal, List_1]];
export type List_2 = [] | [[UserVariantParam, List_2]];
export type List_3 = [] | [[SystemVariantParam, List_3]];
export interface LogoResult { 'data' : string, 'logo_type' : string }
export interface Milestone { 'status' : Status, 'date' : Time }
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
  'result' : Array<Sharable__12>,
}
export interface Pagination_1 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__17>,
}
export interface Pagination_2 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__19>,
}
export interface Pagination_3 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__25>,
}
export interface Pagination_4 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__27>,
}
export interface Pagination_5 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__29>,
}
export interface Pagination_6 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__31>,
}
export interface Pagination_7 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<PrivateSharable>,
}
export interface Pagination_8 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__35>,
}
export interface Picture { 'blob' : Uint8Array | number[] }
export interface PrivateFilter {
  'status' : [] | [StatusVariant__1],
  'capitalRaised' : [] | [bigint],
}
export interface PrivateSharable {
  'key' : string,
  'status' : Status__3,
  'creator' : Principal,
  'code' : Uint8Array | number[],
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export interface PrivateSharableCoupon {
  'key' : string,
  'status' : Status__3,
  'creator' : Principal,
  'code' : Uint8Array | number[],
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export type PrivateSharable__1 = Array<PrivateSharableCoupon>;
export type PrivateSort = { 'icpPaid' : null } |
  { 'recent' : null };
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
export type ProposalVariant = { 'Code' : null } |
  { 'Field' : null } |
  { 'Configs' : null } |
  { 'Worker' : null };
export type ReleaseNotes = Array<Changes>;
export type Result = { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Expired' : null };
export type Role = { 'Guest' : null } |
  { 'Member' : null };
export interface Sales {
  'addAchievementPackage' : ActorMethod<
    [Achievement, string, string, string],
    undefined
  >,
  'addPackage' : ActorMethod<[bigint, string, string, string], undefined>,
  'computeAcornToMint' : ActorMethod<[bigint], ACORNToMint>,
  'deployAchievementPackage' : ActorMethod<[Achievement], undefined>,
  'deployPackage' : ActorMethod<[bigint], undefined>,
  'expectPackageFound' : ActorMethod<[bigint], bigint>,
  'expectPackageNotFound' : ActorMethod<[bigint], undefined>,
  'forceUpdateCapitalRaised' : ActorMethod<
    [Array<Principal>],
    ForceUpdateCapitalRaisedResult
  >,
  'getAchievementPackagePrincipals' : ActorMethod<
    [],
    Array<[Achievement, Principal]>
  >,
  'getAchievementPackages' : ActorMethod<[], Sharable__11>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__3>,
  'getOwnedAchievementPackages' : ActorMethod<[Principal], Sharable__11>,
  'getOwnedPackages' : ActorMethod<[Principal], Sharable__10>,
  'getPackagePrincipals' : ActorMethod<[], Array<[bigint, Principal]>>,
  'getPackages' : ActorMethod<[], Sharable__10>,
  'initialize' : ActorMethod<[], undefined>,
  'mintAchievementPackage' : ActorMethod<[Achievement], undefined>,
  'mintPackage' : ActorMethod<[Principal, bigint], bigint>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'upgradePackage' : ActorMethod<[], undefined>,
}
export interface Settings {
  'freezing_threshold' : [] | [bigint],
  'wasm_memory_threshold' : [] | [bigint],
  'environment_variables' : [] | [Array<{ 'value' : string, 'name' : string }>],
  'controllers' : [] | [Array<Principal>],
  'reserved_cycles_limit' : [] | [bigint],
  'log_visibility' : [] | [
    { 'controllers' : null } |
      { 'allowed_viewers' : Array<Principal> }
  ],
  'wasm_memory_limit' : [] | [bigint],
  'memory_allocation' : [] | [bigint],
  'compute_allocation' : [] | [bigint],
}
export type Sharable = Array<SharableCommitment>;
export interface SharableAchievementPackage {
  'principal' : [] | [Principal],
  'metadata' : Dip721NonFungibleToken,
  'achievement' : Achievement,
}
export interface SharableAllocation {
  'balance' : bigint,
  'allocated' : bigint,
  'actorVariant' : ActorVariant,
}
export interface SharableBinaryVotes {
  'powered' : OneSideSharable__1,
  'regular' : OneSideSharable__1,
}
export interface SharableBurial {
  'issueDate' : Time,
  'coefficient' : bigint,
  'expiryDate' : Time,
  'claimableInterest' : SharableE8S,
  'amount' : SharableE8S,
}
export type SharableBurials = Array<SharableBurial>;
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
export type SharableConfig = { 'ExcludedPublishers' : Array<Principal> } |
  { 'ExcludedFields' : Array<string> };
export type SharableConfigs = Array<[Key, SharableValue]>;
export interface SharableConfigs__1 { 'actorsConfigs' : ActorsConfigs }
export type SharableCount = bigint;
export interface SharableCoupon {
  'key' : string,
  'status' : Status__3,
  'creator' : Principal,
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export type SharableDate = bigint;
export type SharableDetachment = { 'Code' : SharableCode } |
  { 'Field' : SharableField } |
  { 'Configs' : SharableConfigs__1 } |
  { 'Worker' : SharableWorker };
export interface SharableDistribution {
  'earning' : SharableEarning,
  'proportion' : SharableProportion,
  'actorVariant' : ActorVariant,
}
export type SharableE8S = bigint;
export interface SharableEarning {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S,
  'balance' : SharableE8S,
}
export interface SharableEvidence {
  'id' : bigint,
  'callerVote' : [] | [BinaryVote],
  'votes' : SharableBinaryVotes,
  'publishDate' : bigint,
  'form' : Form,
  'publisher' : Principal,
  'repliedTo' : [] | [bigint],
  'replies' : Array<bigint>,
  'choice' : BinaryChoice,
  'hypothesisId' : bigint,
}
export interface SharableField { 'name' : string, 'description' : string }
export interface SharableField__1 {
  'members' : Array<Principal>,
  'hypothesisIds' : Array<bigint>,
  'callerRole' : [] | [Role],
  'name' : string,
  'description' : string,
  'creationDate' : Time,
}
export interface SharableFlag {
  'id' : bigint,
  'status' : Status__1,
  'requester' : Principal,
  'callerVote' : [] | [BinaryVote],
  'votes' : SharableBinaryVotes,
  'category' : Category,
  'requestDate' : Time,
  'reason' : string,
}
export interface SharableHypothesis {
  'id' : bigint,
  'content' : string,
  'axioms' : SharableCount,
  'callerVote' : [] | [TernaryVote],
  'votes' : SharableTernaryVotes,
  'publishDate' : bigint,
  'publisher' : Principal,
  'callerAxiom' : [] | [boolean],
  'callerBookmark' : [] | [boolean],
  'fieldId' : string,
  'evidenceIds' : Array<bigint>,
}
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
export interface SharablePackage {
  'principal' : [] | [Principal],
  'metadata' : Dip721NonFungibleToken,
  'capitalRaised' : bigint,
}
export interface SharablePayout {
  'ranks' : SharableRanks,
  'callerRevenue' : [] | [SharableE8S],
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
export interface SharableRank {
  'poweredEntry' : Entry,
  'regularEntry' : Entry,
  'averageRank' : number,
  'hypothesisId' : bigint,
}
export type SharableRanks = Array<SharableRank>;
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
export interface SharableTernaryVotes {
  'powered' : OneSideSharable,
  'regular' : OneSideSharable,
}
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
export type SharableWorker = {};
export type Sharable__1 = string;
export type Sharable__10 = Array<SharablePackage>;
export type Sharable__11 = Array<SharableAchievementPackage>;
export interface Sharable__12 {
  'principal' : Principal,
  'username' : string,
  'links' : Array<Hyperlink>,
  'creationDate' : Time,
  'capitalRaised' : bigint,
  'location' : string,
  'avatar' : [] | [Picture],
}
export type Sharable__13 = [
  Array<SharableUserVariant>,
  Array<SharableSystemVariant>,
];
export interface Sharable__14 { 'burials' : SharableBurials }
export type Sharable__15 = Array<SharableBurial>;
export interface Sharable__16 {
  'ballots' : Array<[Principal, bigint]>,
  'referendums' : Array<bigint>,
  'icpEarning' : SharableEarning,
  'referendumVotes' : Array<[bigint, TernaryVote]>,
  'acornEarning' : SharableEarning,
  'lastUpdateBallot' : Time,
  'proposalVotes' : Array<[bigint, Delegable__1]>,
  'proposals' : Array<bigint>,
}
export interface Sharable__17 {
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
export type Sharable__18 = Array<SharableProposal>;
export interface Sharable__19 {
  'title' : string,
  'principal' : Principal,
  'ballots' : [bigint, bigint],
  'isCustodian' : boolean,
  'callerBallot' : [] | [bigint],
}
export interface Sharable__2 {
  'updateLevel' : UpdateLevel,
  'releaseNotes' : ReleaseNotes,
  'commitments' : SharableCommitments,
  'commitHash' : string,
}
export type Sharable__20 = Array<SharableNominee>;
export type Sharable__22 = { 'ExcludedPublishers' : Array<Principal> } |
  { 'ExcludedFields' : Array<string> };
export type Sharable__23 = Array<SharableConfig>;
export interface Sharable__24 {
  'evidences' : Array<bigint>,
  'principal' : Principal,
  'earning' : SharableEarning,
  'joinedFields' : Array<string>,
  'axioms' : Array<bigint>,
  'votedHypotheses' : Array<[bigint, TernaryVote]>,
  'bookmarks' : Array<bigint>,
  'hypotheses' : Array<bigint>,
  'votedEvidences' : Array<[bigint, BinaryVote]>,
  'callerFollowing' : [] | [boolean],
  'followers' : Array<Principal>,
  'followings' : Array<Principal>,
  'callerFollower' : [] | [boolean],
}
export interface Sharable__25 {
  'id' : bigint,
  'content' : string,
  'axioms' : SharableCount,
  'callerVote' : [] | [TernaryVote],
  'votes' : SharableTernaryVotes,
  'publishDate' : bigint,
  'publisher' : Principal,
  'callerAxiom' : [] | [boolean],
  'callerBookmark' : [] | [boolean],
  'fieldId' : string,
  'evidenceIds' : Array<bigint>,
}
export type Sharable__26 = Array<SharableHypothesis>;
export interface Sharable__27 {
  'id' : bigint,
  'status' : Status__1,
  'requester' : Principal,
  'callerVote' : [] | [BinaryVote],
  'votes' : SharableBinaryVotes,
  'category' : Category,
  'requestDate' : Time,
  'reason' : string,
}
export type Sharable__28 = Array<SharableFlag>;
export interface Sharable__29 {
  'members' : Array<Principal>,
  'hypothesisIds' : Array<bigint>,
  'callerRole' : [] | [Role],
  'name' : string,
  'description' : string,
  'creationDate' : Time,
}
export type Sharable__3 = Array<[Key, SharableValue]>;
export type Sharable__30 = Array<SharableField__1>;
export interface Sharable__31 {
  'id' : bigint,
  'callerVote' : [] | [BinaryVote],
  'votes' : SharableBinaryVotes,
  'publishDate' : bigint,
  'form' : Form,
  'publisher' : Principal,
  'repliedTo' : [] | [bigint],
  'replies' : Array<bigint>,
  'choice' : BinaryChoice,
  'hypothesisId' : bigint,
}
export type Sharable__32 = Array<SharableEvidence>;
export type Sharable__33 = Array<SharablePayout>;
export interface Sharable__34 {
  'ranks' : SharableRanks,
  'callerRevenue' : [] | [SharableE8S],
}
export interface Sharable__35 {
  'key' : string,
  'status' : Status__3,
  'creator' : Principal,
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export interface Sharable__36 {
  'referrer' : [] | [Principal],
  'earning' : SharableEarning,
  'coupons' : Array<string>,
  'referrals' : SharableCount,
}
export type Sharable__37 = Array<SharableCoupon>;
export type Sharable__4 = bigint;
export type Sharable__5 = Array<SharableAllocation>;
export interface Sharable__6 {
  'balance' : bigint,
  'allocated' : bigint,
  'actorVariant' : ActorVariant,
}
export interface Sharable__7 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S,
  'balance' : SharableE8S,
}
export type Sharable__8 = Array<SharableDistribution>;
export interface Sharable__9 {
  'earning' : SharableEarning,
  'proportion' : SharableProportion,
  'actorVariant' : ActorVariant,
}
export interface SnapshotDetail {
  'id' : string,
  'moduleHash' : string,
  'from' : SnapshotFrom,
  'total_size' : bigint,
  'taken_at_timestamp' : bigint,
}
export type SnapshotFrom = { 'Arbitrary' : null } |
  { 'BeforeProposal' : bigint } |
  { 'AfterProposal' : bigint };
export interface Sort { 'by' : Sort__1, 'order' : Order }
export interface Sort_1 { 'by' : Sort__2, 'order' : Order }
export interface Sort_2 { 'by' : Sort__3, 'order' : Order }
export interface Sort_3 { 'by' : Sort__4, 'order' : Order }
export interface Sort_4 { 'by' : Sort__5, 'order' : Order }
export interface Sort_5 { 'by' : Sort__6, 'order' : Order }
export interface Sort_6 { 'by' : Sort__7, 'order' : Order }
export interface Sort_7 { 'by' : PrivateSort, 'order' : Order }
export interface Sort_8 { 'by' : Sort__8, 'order' : Order }
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
export type Sort__8 = { 'icpPaid' : null } |
  { 'recent' : null };
export interface Split {
  'affiliateDeposit' : ActorMethod<[Principal, bigint], bigint>,
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
export type StatusVariant__1 = { 'Available' : null } |
  { 'Failed' : null } |
  { 'Redeemed' : null } |
  { 'Locked' : null };
export type Status__1 = { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Requested' : null } |
  { 'Expired' : null };
export type Status__3 = { 'Available' : null } |
  { 'Failed' : { 'by' : Principal, 'timestamp' : Time, 'reason' : string } } |
  { 'Redeemed' : { 'by' : Principal, 'timestamp' : Time } } |
  { 'Locked' : { 'by' : Principal, 'timestamp' : Time } };
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
export type TernaryChoice = { 'Negative' : null } |
  { 'Positive' : null } |
  { 'Neutral' : null };
export interface TernaryVote { 'value' : bigint, 'choice' : Choice__1 }
export type Time = bigint;
export interface TopNonPagination {
  'result' : TopResult,
  'callerRank' : [] | [bigint],
}
export interface TopPagination {
  'is' : bigint,
  'of' : bigint,
  'result' : TopResult,
  'callerRank' : [] | [bigint],
}
export type TopResult = Array<[Principal, bigint]>;
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
  'delegatedExternalTransfer' : ActorMethod<
    [Variant, Principal, bigint],
    undefined
  >,
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
export type UpdateLevel = { 'Patch' : null } |
  { 'Major' : null } |
  { 'Minor' : null };
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
export type Variant = { 'DAO' : null } |
  { 'Sales' : null } |
  { 'Escrow' : null } |
  { 'Split' : null } |
  { 'Facade' : null } |
  { 'Chat' : null } |
  { 'Frontend' : null } |
  { 'Indicator' : null } |
  { 'Axioms' : null } |
  { 'Affiliate' : null } |
  { 'Founder' : null } |
  { 'Assets' : null } |
  { 'ACORN' : null } |
  { 'Treasury' : null } |
  { 'Encyclopedia' : null } |
  { 'ICPUSD' : null };
export type Variant__1 = { 'ExcludedPublishers' : null } |
  { 'ExcludedFields' : null };
export interface _SERVICE extends Indicator {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
