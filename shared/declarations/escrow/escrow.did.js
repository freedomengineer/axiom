export const idlFactory = ({ IDL }) => {
  const Option = IDL.Variant({
    'Perpetual' : IDL.Null,
    'Double' : IDL.Null,
    'Octuple' : IDL.Null,
    'Quadruple' : IDL.Null,
    'Single' : IDL.Null,
  });
  const Time = IDL.Int;
  const SharableE8S = IDL.Nat;
  const SharableBurial = IDL.Record({
    'issueDate' : Time,
    'coefficient' : IDL.Nat,
    'expiryDate' : Time,
    'claimableInterest' : SharableE8S,
    'amount' : SharableE8S,
  });
  const Sharable__2 = IDL.Vec(SharableBurial);
  const Key = IDL.Text;
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
  const SharableBurials = IDL.Vec(SharableBurial);
  const Sharable = IDL.Record({ 'burials' : SharableBurials });
  const Escrow = IDL.Service({
    'bury' : IDL.Func([IDL.Nat, Option], [], []),
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'getBurials' : IDL.Func([IDL.Principal], [Sharable__2], ['query']),
    'getBuriedAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getClaimableAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__1], ['query']),
    'getExpiredAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getInterestAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getTop' : IDL.Func(
        [
          IDL.Variant({
            'PoweredVoters' : IDL.Null,
            'AcornBuriers' : IDL.Null,
          }),
        ],
        [TopNonPagination],
        ['query'],
      ),
    'getTopPagination' : IDL.Func(
        [
          IDL.Variant({
            'PoweredVoters' : IDL.Null,
            'AcornBuriers' : IDL.Null,
          }),
          IDL.Nat,
          IDL.Nat,
        ],
        [TopPagination],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Principal], [Sharable], ['query']),
    'getVotingPower' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'transferFounderBurial' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  return Escrow;
};
export const init = ({ IDL }) => { return []; };
