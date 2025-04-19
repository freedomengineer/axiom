import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Facade {
  'editAvatar' : ActorMethod<[[] | [Picture]], undefined>,
  'editLinks' : ActorMethod<[Array<Hyperlink__1>], undefined>,
  'editLocation' : ActorMethod<[[] | [string]], undefined>,
  'editUsername' : ActorMethod<[string], undefined>,
  'getConfig' : ActorMethod<[Key], SharableValue>,
  'getConfigs' : ActorMethod<[], Sharable__1>,
  'getUser' : ActorMethod<[Principal], Sharable>,
  'getUserIdentifier' : ActorMethod<[IdentifierVariant], Identifier>,
  'getUsers' : ActorMethod<[Filter, Sort], Array<Sharable>>,
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
export interface Hyperlink { 'url' : string, 'anchorText' : string }
export interface Hyperlink__1 { 'url' : string, 'anchorText' : string }
export interface Identifier { 'principal' : Principal, 'username' : string }
export type IdentifierVariant = { 'Principal' : Principal } |
  { 'Username' : string };
export type Key = string;
export type Order = { 'descending' : null } |
  { 'ascending' : null };
export interface Pagination {
  'is' : bigint,
  'of' : bigint,
  'result' : Array<Sharable>,
}
export interface Picture { 'blob' : Uint8Array | number[] }
export interface Sharable {
  'principal' : Principal,
  'username' : string,
  'links' : Array<Hyperlink>,
  'creationDate' : Time,
  'capitalRaised' : bigint,
  'location' : string,
  'avatar' : [] | [Picture],
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
export interface Sort { 'by' : Sort__1, 'order' : Order }
export type Sort__1 = { 'alphabetical' : null } |
  { 'capitalRaised' : null } |
  { 'recent' : null };
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
export interface _SERVICE extends Facade {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
