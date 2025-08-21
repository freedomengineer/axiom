export const idlFactory = ({ IDL }) => {
  const Variant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Founder' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const Sharable = IDL.Nat;
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
  const Sharable__4 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Time = IDL.Int;
  const SharableE8S__1 = IDL.Nat;
  const SharableEarning = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const SharableProportion__1 = IDL.Tuple(IDL.Nat, IDL.Nat);
  const ActorVariant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Founder' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const Sharable__3 = IDL.Record({
    'earning' : SharableEarning,
    'proportion' : SharableProportion__1,
    'actorVariant' : ActorVariant,
  });
  const SharableDistribution = IDL.Record({
    'earning' : SharableEarning,
    'proportion' : SharableProportion__1,
    'actorVariant' : ActorVariant,
  });
  const Sharable__2 = IDL.Vec(SharableDistribution);
  const Sharable__1 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const Split = IDL.Service({
    'affiliateDeposit' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
    'deposit' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'externalTransfer' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'getBalance' : IDL.Func([Variant], [Sharable], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__4], ['query']),
    'getDistribution' : IDL.Func([Variant], [Sharable__3], ['query']),
    'getDistributions' : IDL.Func([], [Sharable__2], ['query']),
    'getEarning' : IDL.Func([Variant], [Sharable__1], ['query']),
    'getTotalBalance' : IDL.Func([], [Sharable], ['query']),
    'getTotalRevenue' : IDL.Func([], [Sharable], ['query']),
    'internalTransfer' : IDL.Func([Variant, IDL.Nat], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
  });
  return Split;
};
export const init = ({ IDL }) => { return []; };
