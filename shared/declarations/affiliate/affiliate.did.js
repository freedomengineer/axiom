export const idlFactory = ({ IDL }) => {
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
  const Sharable__2 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Time = IDL.Int;
  const SharableE8S__1 = IDL.Nat;
  const Sharable__1 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const TopResult = IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat));
  const TopNonPagination = IDL.Record({
    'result' : TopResult,
    'callerRank' : IDL.Opt(IDL.Nat),
  });
  const TopPagination = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : TopResult,
    'callerRank' : IDL.Opt(IDL.Nat),
  });
  const SharableEarning = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const SharableCount = IDL.Nat;
  const Sharable = IDL.Record({
    'referrer' : IDL.Opt(IDL.Principal),
    'earning' : SharableEarning,
    'referrals' : SharableCount,
  });
  const Affiliate = IDL.Service({
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'fillReferrals' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Opt(IDL.Principal)],
        [],
        [],
      ),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__2], ['query']),
    'getEarning' : IDL.Func([IDL.Principal], [Sharable__1], ['query']),
    'getTop' : IDL.Func(
        [IDL.Variant({ 'Referrals' : IDL.Null })],
        [TopNonPagination],
        ['query'],
      ),
    'getTopPagination' : IDL.Func(
        [IDL.Variant({ 'Referrals' : IDL.Null }), IDL.Nat, IDL.Nat],
        [TopPagination],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Principal], [Sharable], ['query']),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  return Affiliate;
};
export const init = ({ IDL }) => { return []; };
