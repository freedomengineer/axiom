import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Affiliate {
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'fillReferrals' : ActorMethod<
    [Principal, bigint, [] | [Principal]],
    undefined
  >,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__2>,
  'getEarning' : ActorMethod<[Principal], Sharable__1>,
  'getTop' : ActorMethod<[{ 'Referrals' : null }], TopNonPagination>,
  'getTopPagination' : ActorMethod<
    [{ 'Referrals' : null }, bigint, bigint],
    TopPagination
  >,
  'getUser' : ActorMethod<[Principal], Sharable>,
  'initialize' : ActorMethod<[], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
  'withdrawAll' : ActorMethod<[], undefined>,
}
export type Key = string;
export interface Sharable {
  'referrer' : [] | [Principal],
  'earning' : SharableEarning,
  'referrals' : SharableCount,
}
export type SharableCount = bigint;
export type SharableDate = bigint;
export type SharableE8S = bigint;
export type SharableE8S__1 = bigint;
export interface SharableEarning {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
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
export interface Sharable__1 {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export type Sharable__2 = Array<[Key, SharableValue]>;
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
export interface _SERVICE extends Affiliate {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
