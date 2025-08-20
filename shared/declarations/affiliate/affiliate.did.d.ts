import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Affiliate {
  'createCoupon' : ActorMethod<[bigint], PrivateSharable>,
  'expectUserNotFound' : ActorMethod<[Principal], undefined>,
  'fillReferrals' : ActorMethod<
    [Principal, bigint, [] | [Principal]],
    undefined
  >,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__4>,
  'getCoupon' : ActorMethod<[string], Sharable>,
  'getCoupons' : ActorMethod<[Filter, Sort_1], Sharable__3>,
  'getCouponsPagination' : ActorMethod<
    [Filter, Sort_1, bigint, bigint],
    Pagination_1
  >,
  'getEarning' : ActorMethod<[Principal], Sharable__2>,
  'getPrivateCoupon' : ActorMethod<[string], PrivateSharable>,
  'getPrivateCoupons' : ActorMethod<[PrivateFilter, Sort], PrivateSharable__1>,
  'getPrivateCouponsPagination' : ActorMethod<
    [PrivateFilter, Sort, bigint, bigint],
    Pagination
  >,
  'getTop' : ActorMethod<
    [{ 'Referrers' : null } | { 'CouponGenerators' : null }],
    TopNonPagination
  >,
  'getTopPagination' : ActorMethod<
    [{ 'Referrers' : null } | { 'CouponGenerators' : null }, bigint, bigint],
    TopPagination
  >,
  'getUser' : ActorMethod<[Principal], Sharable__1>,
  'initialize' : ActorMethod<[], undefined>,
  'lockCoupon' : ActorMethod<[Uint8Array | number[], Principal], Sharable>,
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
export interface Filter {
  'status' : [] | [StatusVariant],
  'creator' : [] | [Principal],
  'capitalRaised' : [] | [bigint],
}
export type Key = string;
export type Order = { 'descending' : null } |
  { 'ascending' : null };
export interface Pagination {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<PrivateSharable>,
}
export interface Pagination_1 {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable>,
}
export interface PrivateFilter {
  'status' : [] | [StatusVariant],
  'capitalRaised' : [] | [bigint],
}
export interface PrivateSharable {
  'key' : string,
  'status' : Status,
  'creator' : Principal,
  'code' : Uint8Array | number[],
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export interface PrivateSharableCoupon {
  'key' : string,
  'status' : Status,
  'creator' : Principal,
  'code' : Uint8Array | number[],
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export type PrivateSharable__1 = Array<PrivateSharableCoupon>;
export type PrivateSort = { 'icpPaid' : null } |
  { 'recent' : null };
export interface Sharable {
  'key' : string,
  'status' : Status,
  'creator' : Principal,
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export type SharableCount = bigint;
export interface SharableCoupon {
  'key' : string,
  'status' : Status,
  'creator' : Principal,
  'icpPaid' : bigint,
  'creationDate' : Time,
  'capitalRaised' : bigint,
}
export type SharableDate = bigint;
export type SharableE8S = bigint;
export type SharableE8S__1 = bigint;
export interface SharableEarning {
  'lastWithdrawAt' : Time__1,
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
  'referrer' : [] | [Principal],
  'earning' : SharableEarning,
  'coupons' : Array<string>,
  'referrals' : SharableCount,
}
export interface Sharable__2 {
  'lastWithdrawAt' : Time__1,
  'revenue' : SharableE8S__1,
  'balance' : SharableE8S__1,
}
export type Sharable__3 = Array<SharableCoupon>;
export type Sharable__4 = Array<[Key, SharableValue]>;
export interface Sort { 'by' : PrivateSort, 'order' : Order }
export interface Sort_1 { 'by' : Sort__1, 'order' : Order }
export type Sort__1 = { 'icpPaid' : null } |
  { 'recent' : null };
export type Status = { 'Available' : null } |
  { 'Failed' : { 'by' : Principal, 'timestamp' : Time, 'reason' : string } } |
  { 'Redeemed' : { 'by' : Principal, 'timestamp' : Time } } |
  { 'Locked' : { 'by' : Principal, 'timestamp' : Time } };
export type StatusVariant = { 'Available' : null } |
  { 'Failed' : null } |
  { 'Redeemed' : null } |
  { 'Locked' : null };
export type Time = bigint;
export type Time__1 = bigint;
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
