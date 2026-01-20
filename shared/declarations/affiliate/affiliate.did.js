export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Status = IDL.Variant({
    'Available' : IDL.Null,
    'Failed' : IDL.Record({
      'by' : IDL.Principal,
      'timestamp' : Time,
      'reason' : IDL.Text,
    }),
    'Redeemed' : IDL.Record({ 'by' : IDL.Principal, 'timestamp' : Time }),
    'Locked' : IDL.Record({ 'by' : IDL.Principal, 'timestamp' : Time }),
  });
  const PrivateSharable = IDL.Record({
    'key' : IDL.Text,
    'status' : Status,
    'creator' : IDL.Principal,
    'code' : IDL.Vec(IDL.Nat8),
    'icpPaid' : IDL.Nat,
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
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
  const Sharable__4 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Sharable = IDL.Record({
    'key' : IDL.Text,
    'status' : Status,
    'creator' : IDL.Principal,
    'icpPaid' : IDL.Nat,
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
  });
  const StatusVariant = IDL.Variant({
    'Available' : IDL.Null,
    'Failed' : IDL.Null,
    'Redeemed' : IDL.Null,
    'Locked' : IDL.Null,
  });
  const Filter = IDL.Record({
    'status' : IDL.Opt(StatusVariant),
    'creator' : IDL.Opt(IDL.Principal),
    'capitalRaised' : IDL.Opt(IDL.Nat),
  });
  const Sort__1 = IDL.Variant({ 'icpPaid' : IDL.Null, 'recent' : IDL.Null });
  const Order = IDL.Variant({
    'descending' : IDL.Null,
    'ascending' : IDL.Null,
  });
  const Sort_1 = IDL.Record({ 'by' : Sort__1, 'order' : Order });
  const SharableCoupon = IDL.Record({
    'key' : IDL.Text,
    'status' : Status,
    'creator' : IDL.Principal,
    'icpPaid' : IDL.Nat,
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
  });
  const Sharable__3 = IDL.Vec(SharableCoupon);
  const Pagination_1 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable),
  });
  const Sharable__2 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S,
    'balance' : SharableE8S,
  });
  const PrivateFilter = IDL.Record({
    'status' : IDL.Opt(StatusVariant),
    'capitalRaised' : IDL.Opt(IDL.Nat),
  });
  const PrivateSort = IDL.Variant({
    'icpPaid' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort = IDL.Record({ 'by' : PrivateSort, 'order' : Order });
  const PrivateSharableCoupon = IDL.Record({
    'key' : IDL.Text,
    'status' : Status,
    'creator' : IDL.Principal,
    'code' : IDL.Vec(IDL.Nat8),
    'icpPaid' : IDL.Nat,
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
  });
  const PrivateSharable__1 = IDL.Vec(PrivateSharableCoupon);
  const Pagination = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(PrivateSharable),
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
    'revenue' : SharableE8S,
    'balance' : SharableE8S,
  });
  const SharableCount = IDL.Nat;
  const Sharable__1 = IDL.Record({
    'referrer' : IDL.Opt(IDL.Principal),
    'earning' : SharableEarning,
    'coupons' : IDL.Vec(IDL.Text),
    'referrals' : SharableCount,
  });
  const Affiliate = IDL.Service({
    'createCoupon' : IDL.Func([IDL.Nat], [PrivateSharable], []),
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'fillReferrals' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Opt(IDL.Principal)],
        [],
        [],
      ),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__4], ['query']),
    'getCoupon' : IDL.Func([IDL.Text], [Sharable], ['query']),
    'getCoupons' : IDL.Func([Filter, Sort_1], [Sharable__3], ['query']),
    'getCouponsPagination' : IDL.Func(
        [Filter, Sort_1, IDL.Nat, IDL.Nat],
        [Pagination_1],
        ['query'],
      ),
    'getEarning' : IDL.Func([IDL.Principal], [Sharable__2], ['query']),
    'getPrivateCoupon' : IDL.Func([IDL.Text], [PrivateSharable], ['query']),
    'getPrivateCoupons' : IDL.Func(
        [PrivateFilter, Sort],
        [PrivateSharable__1],
        ['query'],
      ),
    'getPrivateCouponsPagination' : IDL.Func(
        [PrivateFilter, Sort, IDL.Nat, IDL.Nat],
        [Pagination],
        ['query'],
      ),
    'getTop' : IDL.Func(
        [
          IDL.Variant({
            'Referrers' : IDL.Null,
            'CouponGenerators' : IDL.Null,
          }),
        ],
        [TopNonPagination],
        ['query'],
      ),
    'getTopPagination' : IDL.Func(
        [
          IDL.Variant({
            'Referrers' : IDL.Null,
            'CouponGenerators' : IDL.Null,
          }),
          IDL.Nat,
          IDL.Nat,
        ],
        [TopPagination],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__1], ['query']),
    'getUserCouponTotal' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat, IDL.Nat],
        ['query'],
      ),
    'initialize' : IDL.Func([], [], []),
    'lockCoupon' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Principal], [Sharable], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'redeemCoupon' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Principal], [], []),
    'redeemCouponFailed' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Principal, IDL.Text],
        [],
        [],
      ),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  return Affiliate;
};
export const init = ({ IDL }) => { return []; };
