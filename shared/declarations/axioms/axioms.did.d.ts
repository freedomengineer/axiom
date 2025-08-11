import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BinaryChoice = { 'Negative' : null } |
  { 'Positive' : null };
export type BinaryChoice__1 = { 'Negative' : null } |
  { 'Positive' : null };
export interface BinaryVote { 'value' : bigint, 'choice' : Choice__1 }
export interface BinaryVote__1 { 'value' : bigint, 'choice' : Choice__1 }
export interface BinaryVote__2 { 'value' : bigint, 'choice' : Choice__1 }
export type Category = { 'Hypothesis' : null } |
  { 'Evidence' : null };
export type Category__1 = { 'Hypothesis' : null } |
  { 'Evidence' : null };
export type Choice = { 'Negative' : null } |
  { 'Positive' : null } |
  { 'Neutral' : null };
export type Choice__1 = { 'Negative' : null } |
  { 'Positive' : null };
export type CustomValue = { 'Scale' : bigint } |
  { 'Value' : bigint };
export interface Entry { 'rank' : bigint, 'score' : bigint }
export interface Filter {
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
export interface Filter__1 {
  'status' : [] | [Status],
  'requester' : [] | [Principal],
  'voter' : [] | [Principal],
  'category' : [] | [Category__1],
}
export interface Filter__2 { 'q' : [] | [string], 'member' : [] | [Principal] }
export interface Filter__3 {
  'q' : [] | [string],
  'voter' : [] | [Principal],
  'publisher' : [] | [Principal],
  'side' : [] | [BinaryChoice],
  'agoEnd' : [] | [bigint],
  'hypothesis' : [] | [bigint],
  'repliedTo' : [] | [bigint],
  'agoStart' : [] | [bigint],
}
export type Form = Array<Format>;
export type Format = { 'Note' : Note } |
  { 'Picture' : Picture } |
  { 'Hyperlink' : Hyperlink };
export interface Header { 'id' : bigint, 'category' : Category }
export interface Hyperlink { 'url' : string, 'anchorText' : string }
export type Key = string;
export interface Note { 'content' : string, 'extended' : boolean }
export type OneSideSharable = [bigint, bigint, bigint];
export type OneSideSharable__1 = [bigint, bigint];
export type Order = { 'descending' : null } |
  { 'ascending' : null };
export interface Pagination {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__3>,
}
export interface Pagination_1 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__5>,
}
export interface Pagination_2 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__7>,
}
export interface Pagination_3 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable__9>,
}
export interface Picture { 'blob' : Uint8Array | number[] }
export type Role = { 'Guest' : null } |
  { 'Member' : null };
export type Sharable = { 'ExcludedPublishers' : Array<Principal> } |
  { 'ExcludedFields' : Array<string> };
export interface SharableBinaryVotes {
  'powered' : OneSideSharable__1,
  'regular' : OneSideSharable__1,
}
export interface SharableBinaryVotes__1 {
  'powered' : OneSideSharable__1,
  'regular' : OneSideSharable__1,
}
export type SharableConfig = { 'ExcludedPublishers' : Array<Principal> } |
  { 'ExcludedFields' : Array<string> };
export type SharableCount = bigint;
export type SharableDate = bigint;
export type SharableE8S = bigint;
export type SharableE8S__1 = bigint;
export type SharableE8S__2 = bigint;
export interface SharableEarning {
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
  'repliedTo' : [] | [bigint],
  'replies' : Array<bigint>,
  'choice' : BinaryChoice__1,
  'hypothesisId' : bigint,
}
export interface SharableField {
  'members' : Array<Principal>,
  'hypothesisIds' : Array<bigint>,
  'callerRole' : [] | [Role],
  'name' : string,
  'description' : string,
  'creationDate' : Time__2,
}
export interface SharableFlag {
  'id' : bigint,
  'status' : Status__1,
  'requester' : Principal,
  'callerVote' : [] | [BinaryVote__1],
  'votes' : SharableBinaryVotes,
  'category' : Category,
  'requestDate' : Time__1,
  'reason' : string,
}
export interface SharableHypothesis {
  'id' : bigint,
  'content' : string,
  'axioms' : SharableCount,
  'callerVote' : [] | [TernaryVote__1],
  'votes' : SharableTernaryVotes,
  'publishDate' : bigint,
  'publisher' : Principal,
  'callerAxiom' : [] | [boolean],
  'callerBookmark' : [] | [boolean],
  'fieldId' : string,
  'evidenceIds' : Array<bigint>,
}
export interface SharablePayout {
  'ranks' : SharableRanks,
  'callerRevenue' : [] | [SharableE8S__2],
}
export type SharableProportion = [bigint, bigint];
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
export type Sharable__1 = Array<SharableConfig>;
export type Sharable__10 = Array<SharableEvidence>;
export interface Sharable__11 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export type Sharable__12 = Array<[Key, SharableValue]>;
export type Sharable__13 = Array<SharablePayout>;
export interface Sharable__14 {
  'ranks' : SharableRanks,
  'callerRevenue' : [] | [SharableE8S__2],
}
export interface Sharable__2 {
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
export interface Sharable__3 {
  'id' : bigint,
  'content' : string,
  'axioms' : SharableCount,
  'callerVote' : [] | [TernaryVote__1],
  'votes' : SharableTernaryVotes,
  'publishDate' : bigint,
  'publisher' : Principal,
  'callerAxiom' : [] | [boolean],
  'callerBookmark' : [] | [boolean],
  'fieldId' : string,
  'evidenceIds' : Array<bigint>,
}
export type Sharable__4 = Array<SharableHypothesis>;
export interface Sharable__5 {
  'id' : bigint,
  'status' : Status__1,
  'requester' : Principal,
  'callerVote' : [] | [BinaryVote__1],
  'votes' : SharableBinaryVotes,
  'category' : Category,
  'requestDate' : Time__1,
  'reason' : string,
}
export type Sharable__6 = Array<SharableFlag>;
export interface Sharable__7 {
  'members' : Array<Principal>,
  'hypothesisIds' : Array<bigint>,
  'callerRole' : [] | [Role],
  'name' : string,
  'description' : string,
  'creationDate' : Time__2,
}
export type Sharable__8 = Array<SharableField>;
export interface Sharable__9 {
  'id' : bigint,
  'callerVote' : [] | [BinaryVote__2],
  'votes' : SharableBinaryVotes__1,
  'publishDate' : bigint,
  'form' : Form,
  'publisher' : Principal,
  'repliedTo' : [] | [bigint],
  'replies' : Array<bigint>,
  'choice' : BinaryChoice__1,
  'hypothesisId' : bigint,
}
export interface Sort { 'by' : Sort__1, 'order' : Order }
export interface Sort_1 { 'by' : Sort__2, 'order' : Order }
export interface Sort_2 { 'by' : Sort__3, 'order' : Order }
export interface Sort_3 { 'by' : Sort__4, 'order' : Order }
export type Sort__1 = { 'positivity' : null } |
  { 'neutrality' : null } |
  { 'negativity' : null } |
  { 'controversy' : null } |
  { 'popularity' : null } |
  { 'recent' : null };
export type Sort__2 = { 'difference' : null } |
  { 'recent' : null };
export type Sort__3 = { 'alphabetical' : null } |
  { 'popularity' : null } |
  { 'recent' : null };
export type Sort__4 = { 'positivity' : null } |
  { 'negativity' : null } |
  { 'popularity' : null } |
  { 'recent' : null };
export type Status = { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Requested' : null } |
  { 'Expired' : null };
export type Status__1 = { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Requested' : null } |
  { 'Expired' : null };
export interface TernaryVote { 'value' : bigint, 'choice' : Choice }
export interface TernaryVote__1 { 'value' : bigint, 'choice' : Choice }
export type Time = bigint;
export type Time__1 = bigint;
export type Time__2 = bigint;
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
export type Variant = { 'ExcludedPublishers' : null } |
  { 'ExcludedFields' : null };
export interface _SERVICE {
  'addToAxioms' : ActorMethod<[bigint], undefined>,
  'addToBookmarks' : ActorMethod<[bigint], undefined>,
  'createField' : ActorMethod<[string, string], undefined>,
  'editHypothesis' : ActorMethod<[bigint, string], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'follow' : ActorMethod<[Principal], undefined>,
  'getAgePayout' : ActorMethod<[bigint, bigint], Sharable__14>,
  'getAgePayouts' : ActorMethod<[bigint], Sharable__13>,
  'getAgesPayout' : ActorMethod<[bigint], Sharable__13>,
  'getAgesPayouts' : ActorMethod<[], Array<Sharable__13>>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__12>,
  'getEarning' : ActorMethod<[Principal], Sharable__11>,
  'getEvidence' : ActorMethod<[bigint], Sharable__9>,
  'getEvidences' : ActorMethod<[Filter__3, Sort_3], Sharable__10>,
  'getEvidencesPagination' : ActorMethod<
    [Filter__3, Sort_3, bigint, bigint],
    Pagination_3
  >,
  'getField' : ActorMethod<[string], Sharable__7>,
  'getFields' : ActorMethod<[Filter__2, Sort_2], Sharable__8>,
  'getFieldsPagination' : ActorMethod<
    [Filter__2, Sort_2, bigint, bigint],
    Pagination_2
  >,
  'getFlag' : ActorMethod<[Header], Sharable__5>,
  'getFlags' : ActorMethod<[Filter__1, Sort_1], Sharable__6>,
  'getFlagsPagination' : ActorMethod<
    [Filter__1, Sort_1, bigint, bigint],
    Pagination_1
  >,
  'getHypotheses' : ActorMethod<[Filter, Sort], Sharable__4>,
  'getHypothesesPagination' : ActorMethod<
    [Filter, Sort, bigint, bigint],
    Pagination
  >,
  'getHypothesis' : ActorMethod<[bigint], Sharable__3>,
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
  'getUser' : ActorMethod<[Principal], Sharable__2>,
  'getUserConfigs' : ActorMethod<[], Sharable__1>,
  'initialize' : ActorMethod<[], undefined>,
  'joinField' : ActorMethod<[string], undefined>,
  'leaveField' : ActorMethod<[string], undefined>,
  'publishEvidence' : ActorMethod<
    [bigint, Form, Choice__1, [] | [bigint]],
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
  'restoreUserConfig' : ActorMethod<[Variant], undefined>,
  'setAllUserConfigs' : ActorMethod<[Array<Sharable>], undefined>,
  'setBatchUserConfigs' : ActorMethod<[Array<Sharable>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setUserConfig' : ActorMethod<[Sharable], undefined>,
  'unfollow' : ActorMethod<[Principal], undefined>,
  'voteEvidence' : ActorMethod<
    [bigint, Choice__1, [] | [CustomValue]],
    undefined
  >,
  'voteFlag' : ActorMethod<[Header, Choice__1], undefined>,
  'voteHypothesis' : ActorMethod<
    [bigint, Choice, [] | [CustomValue]],
    undefined
  >,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];