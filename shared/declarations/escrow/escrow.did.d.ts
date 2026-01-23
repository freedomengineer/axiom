import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Escrow {
  'bury' : ActorMethod<[bigint, Option], undefined>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'getBurials' : ActorMethod<[Principal], Sharable__2>,
  'getBuriedAmount' : ActorMethod<[Principal], bigint>,
  'getClaimableAmount' : ActorMethod<[Principal], bigint>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__1>,
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
  'getUser' : ActorMethod<[Principal], Sharable>,
  'getVotingPower' : ActorMethod<[Principal], bigint>,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'register' : ActorMethod<[Principal, bigint], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'transferFounderBurial' : ActorMethod<[Principal, Principal], undefined>,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export type Key = string;
export type Option = { 'Perpetual' : null } |
  { 'Double' : null } |
  { 'Octuple' : null } |
  { 'Quadruple' : null } |
  { 'Single' : null };
export interface Sharable { 'burials' : SharableBurials }
export interface SharableBurial {
  'issueDate' : Time,
  'coefficient' : bigint,
  'expiryDate' : Time,
  'claimableInterest' : SharableE8S,
  'amount' : SharableE8S,
}
export type SharableBurials = Array<SharableBurial>;
export type SharableDate = bigint;
export type SharableE8S = bigint;
export type SharableProportion = [bigint, bigint];
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
export type Sharable__1 = Array<[Key, SharableValue]>;
export type Sharable__2 = Array<SharableBurial>;
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
export interface _SERVICE extends Escrow {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
