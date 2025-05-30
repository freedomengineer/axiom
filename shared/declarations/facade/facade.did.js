export const idlFactory = ({ IDL }) => {
  const Picture = IDL.Record({ 'blob' : IDL.Vec(IDL.Nat8) });
  const Hyperlink__1 = IDL.Record({
    'url' : IDL.Text,
    'anchorText' : IDL.Text,
  });
  const Key = IDL.Text;
  const SharableE8S = IDL.Nat;
  const SharableDate = IDL.Nat;
  const SharableProportion = IDL.Tuple(IDL.Nat, IDL.Nat);
  const ValueProp_1 = IDL.Variant({
    'inclusive' : IDL.Int,
    'exclusive' : IDL.Int,
  });
  const Value_1 = IDL.Variant({ 'value' : ValueProp_1, 'infinity' : IDL.Null });
  const SharableRange_1 = IDL.Tuple(Value_1, Value_1);
  const ValueProp_2 = IDL.Variant({
    'inclusive' : IDL.Nat,
    'exclusive' : IDL.Nat,
  });
  const Value_2 = IDL.Variant({ 'value' : ValueProp_2, 'infinity' : IDL.Null });
  const SharableRange_2 = IDL.Tuple(Value_2, Value_2);
  const ValueProp = IDL.Variant({
    'inclusive' : IDL.Float64,
    'exclusive' : IDL.Float64,
  });
  const Value = IDL.Variant({ 'value' : ValueProp, 'infinity' : IDL.Null });
  const SharableRange = IDL.Tuple(Value, Value);
  const SharableValue = IDL.Variant({
    'E8S' : SharableE8S,
    'Nat' : IDL.Nat,
    'Bool' : IDL.Bool,
    'Date' : SharableDate,
    'Text' : IDL.Text,
    'Proportion' : SharableProportion,
    'Float' : IDL.Float64,
    'RangeInt' : SharableRange_1,
    'RangeNat' : SharableRange_2,
    'RangeFloat' : SharableRange,
    'Duration' : IDL.Nat,
  });
  const Sharable__1 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Hyperlink = IDL.Record({ 'url' : IDL.Text, 'anchorText' : IDL.Text });
  const Time = IDL.Int;
  const Sharable = IDL.Record({
    'principal' : IDL.Principal,
    'username' : IDL.Text,
    'links' : IDL.Vec(Hyperlink),
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
    'location' : IDL.Text,
    'avatar' : IDL.Opt(Picture),
  });
  const IdentifierVariant = IDL.Variant({
    'Principal' : IDL.Principal,
    'Username' : IDL.Text,
  });
  const Identifier = IDL.Record({
    'principal' : IDL.Principal,
    'username' : IDL.Text,
  });
  const Filter = IDL.Record({
    'containsPattern' : IDL.Opt(IDL.Text),
    'hasCapitalRaised' : IDL.Opt(IDL.Nat),
  });
  const Sort__1 = IDL.Variant({
    'alphabetical' : IDL.Null,
    'capitalRaised' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Order = IDL.Variant({
    'descending' : IDL.Null,
    'ascending' : IDL.Null,
  });
  const Sort = IDL.Record({ 'by' : Sort__1, 'order' : Order });
  const Pagination = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable),
  });
  const Facade = IDL.Service({
    'editAvatar' : IDL.Func([IDL.Opt(Picture)], [], []),
    'editLinks' : IDL.Func([IDL.Vec(Hyperlink__1)], [], []),
    'editLocation' : IDL.Func([IDL.Opt(IDL.Text)], [], []),
    'editUsername' : IDL.Func([IDL.Text], [], []),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__1], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Sharable], ['query']),
    'getUserIdentifier' : IDL.Func(
        [IdentifierVariant],
        [Identifier],
        ['query'],
      ),
    'getUsers' : IDL.Func([Filter, Sort], [IDL.Vec(Sharable)], ['query']),
    'getUsersCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getUsersIdentifier' : IDL.Func([], [IDL.Vec(Identifier)], ['query']),
    'getUsersPagination' : IDL.Func(
        [Filter, Sort, IDL.Nat, IDL.Nat],
        [Pagination],
        ['query'],
      ),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Principal)], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'updateCapitalRaised' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
  });
  return Facade;
};
export const init = ({ IDL }) => { return []; };
