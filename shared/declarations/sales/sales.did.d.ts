import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ACORNToMint { 'buried' : bigint, 'liquid' : bigint }
export type Achievement = { 'OctupleBurial' : null } |
  { 'Referral' : null };
export interface Dip721NonFungibleToken {
  'maxLimit' : number,
  'logo' : LogoResult,
  'name' : string,
  'symbol' : string,
}
export type Key = string;
export interface LogoResult { 'data' : string, 'logo_type' : string }
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
  'getAchievementPackagePrincipals' : ActorMethod<
    [],
    Array<[Achievement, Principal]>
  >,
  'getAchievementPackages' : ActorMethod<[], Sharable__1>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__2>,
  'getOwnedAchievementPackages' : ActorMethod<[Principal], Sharable__1>,
  'getOwnedPackages' : ActorMethod<[Principal], Sharable>,
  'getPackagePrincipals' : ActorMethod<[], Array<[bigint, Principal]>>,
  'getPackages' : ActorMethod<[], Sharable>,
  'initialize' : ActorMethod<[], undefined>,
  'mintAchievementPackage' : ActorMethod<[Achievement], undefined>,
  'mintPackage' : ActorMethod<[Principal, bigint], bigint>,
  'putConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'setConfigs' : ActorMethod<[Array<[Key, SharableValue]>], undefined>,
  'upgradePackage' : ActorMethod<[], undefined>,
}
export type Sharable = Array<SharablePackage>;
export interface SharableAchievementPackage {
  'principal' : [] | [Principal],
  'metadata' : Dip721NonFungibleToken,
  'achievement' : Achievement,
}
export type SharableDate = bigint;
export type SharableE8S = bigint;
export interface SharablePackage {
  'principal' : [] | [Principal],
  'metadata' : Dip721NonFungibleToken,
  'capitalRaised' : bigint,
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
export type Sharable__1 = Array<SharableAchievementPackage>;
export type Sharable__2 = Array<[Key, SharableValue]>;
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
export interface _SERVICE extends Sales {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
