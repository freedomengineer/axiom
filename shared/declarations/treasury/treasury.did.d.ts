import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export type Key = string;
export type Sharable = bigint;
export interface SharableAllocation {
  'balance' : bigint,
  'allocated' : bigint,
  'actorVariant' : ActorVariant,
}
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
export type Sharable__2 = Array<SharableAllocation>;
export interface Sharable__3 {
  'balance' : bigint,
  'allocated' : bigint,
  'actorVariant' : ActorVariant,
}
export interface Treasury {
  'claim' : ActorMethod<[Principal, bigint], undefined>,
  'delegatedClaim' : ActorMethod<[Variant, Principal, bigint], undefined>,
  'delegatedExternalTransfer' : ActorMethod<
    [Variant, Principal, bigint],
    undefined
  >,
  'externalMint' : ActorMethod<[Principal, bigint], undefined>,
  'externalTransfer' : ActorMethod<[Principal, bigint], undefined>,
  'getAllocated' : ActorMethod<[Variant], Sharable>,
  'getAllocation' : ActorMethod<[Variant], Sharable__3>,
  'getAllocations' : ActorMethod<[], Sharable__2>,
  'getBalance' : ActorMethod<[Variant], Sharable>,
  'getCirculatingSupply' : ActorMethod<[], Sharable>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__1>,
  'getReserveSupply' : ActorMethod<[], Sharable>,
  'getTotalSupply' : ActorMethod<[], Sharable>,
  'internalMint' : ActorMethod<[Variant, bigint], undefined>,
  'internalTransfer' : ActorMethod<[Variant, bigint], undefined>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
}
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
export interface _SERVICE extends Treasury {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
