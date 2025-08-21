import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export type Key = string;
export type Sharable = bigint;
export type SharableDate = bigint;
export interface SharableDistribution {
  'earning' : SharableEarning,
  'proportion' : SharableProportion__1,
  'actorVariant' : ActorVariant,
}
export type SharableE8S = bigint;
export type SharableE8S__1 = bigint;
export interface SharableEarning {
  'lastWithdrawAt' : Time,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export type SharableProportion = [bigint, bigint];
export type SharableProportion__1 = [bigint, bigint];
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
export type Sharable__2 = Array<SharableDistribution>;
export interface Sharable__3 {
  'earning' : SharableEarning,
  'proportion' : SharableProportion__1,
  'actorVariant' : ActorVariant,
}
export type Sharable__4 = Array<[Key, SharableValue]>;
export interface Split {
  'affiliateDeposit' : ActorMethod<[Principal, bigint], bigint>,
  'deposit' : ActorMethod<[Principal, bigint], undefined>,
  'externalTransfer' : ActorMethod<[Principal, bigint], undefined>,
  'getBalance' : ActorMethod<[Variant], Sharable>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__4>,
  'getDistribution' : ActorMethod<[Variant], Sharable__3>,
  'getDistributions' : ActorMethod<[], Sharable__2>,
  'getEarning' : ActorMethod<[Variant], Sharable__1>,
  'getTotalBalance' : ActorMethod<[], Sharable>,
  'getTotalRevenue' : ActorMethod<[], Sharable>,
  'internalTransfer' : ActorMethod<[Variant, bigint], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'shiftToMidnight' : ActorMethod<[bigint], undefined>,
}
export type Time = bigint;
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
export interface _SERVICE extends Split {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
