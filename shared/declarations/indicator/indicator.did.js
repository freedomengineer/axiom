export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  const List_1 = IDL.Rec();
  const List_2 = IDL.Rec();
  const List_3 = IDL.Rec();
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const TransferArgs = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
  });
  const TransferResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : IDL.Variant({
      'GenericError' : IDL.Record({
        'message' : IDL.Text,
        'error_code' : IDL.Nat,
      }),
      'TemporarilyUnavailable' : IDL.Null,
      'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
      'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
      'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
      'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'TooOld' : IDL.Null,
      'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
    }),
  });
  const AllowanceArgs = IDL.Record({
    'account' : Account,
    'spender' : Account,
  });
  const Allowance = IDL.Record({
    'allowance' : IDL.Nat,
    'expires_at' : IDL.Opt(IDL.Nat),
  });
  const ApproveArgs = IDL.Record({
    'fee' : IDL.Opt(IDL.Nat),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
    'expected_allowance' : IDL.Opt(IDL.Nat),
    'expires_at' : IDL.Opt(IDL.Nat64),
    'spender' : Account,
  });
  const ApproveResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : IDL.Variant({
      'GenericError' : IDL.Record({
        'message' : IDL.Text,
        'error_code' : IDL.Nat,
      }),
      'TemporarilyUnavailable' : IDL.Null,
      'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
      'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
      'AllowanceChanged' : IDL.Record({ 'current_allowance' : IDL.Nat }),
      'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'TooOld' : IDL.Null,
      'Expired' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
    }),
  });
  const TransferFromArgs = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'spender_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
  });
  const TransferFromResult = IDL.Variant({
    'Ok' : IDL.Nat,
    'Err' : IDL.Variant({
      'GenericError' : IDL.Record({
        'message' : IDL.Text,
        'error_code' : IDL.Nat,
      }),
      'TemporarilyUnavailable' : IDL.Null,
      'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
      'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
      'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
      'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
      'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'TooOld' : IDL.Null,
      'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
    }),
  });
  const ACORN = IDL.Service({
    'icrc1_balance_of' : IDL.Func([Account], [IDL.Nat], ['query']),
    'icrc1_decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_minting_account' : IDL.Func([], [IDL.Opt(Account)], ['query']),
    'icrc1_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_total_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_transfer' : IDL.Func([TransferArgs], [TransferResult], []),
    'icrc2_allowance' : IDL.Func([AllowanceArgs], [Allowance], ['query']),
    'icrc2_approve' : IDL.Func([ApproveArgs], [ApproveResult], []),
    'icrc2_transfer_from' : IDL.Func(
        [TransferFromArgs],
        [TransferFromResult],
        [],
      ),
  });
  const Time = IDL.Int;
  const Status__3 = IDL.Variant({
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
    'status' : Status__3,
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
  const Sharable__3 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Sharable__35 = IDL.Record({
    'key' : IDL.Text,
    'status' : Status__3,
    'creator' : IDL.Principal,
    'icpPaid' : IDL.Nat,
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
  });
  const StatusVariant__1 = IDL.Variant({
    'Available' : IDL.Null,
    'Failed' : IDL.Null,
    'Redeemed' : IDL.Null,
    'Locked' : IDL.Null,
  });
  const Filter__7 = IDL.Record({
    'status' : IDL.Opt(StatusVariant__1),
    'creator' : IDL.Opt(IDL.Principal),
    'capitalRaised' : IDL.Opt(IDL.Nat),
  });
  const Sort__8 = IDL.Variant({ 'icpPaid' : IDL.Null, 'recent' : IDL.Null });
  const Order = IDL.Variant({
    'descending' : IDL.Null,
    'ascending' : IDL.Null,
  });
  const Sort_8 = IDL.Record({ 'by' : Sort__8, 'order' : Order });
  const SharableCoupon = IDL.Record({
    'key' : IDL.Text,
    'status' : Status__3,
    'creator' : IDL.Principal,
    'icpPaid' : IDL.Nat,
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
  });
  const Sharable__37 = IDL.Vec(SharableCoupon);
  const Pagination_8 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__35),
  });
  const Sharable__7 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S,
    'balance' : SharableE8S,
  });
  const PrivateFilter = IDL.Record({
    'status' : IDL.Opt(StatusVariant__1),
    'capitalRaised' : IDL.Opt(IDL.Nat),
  });
  const PrivateSort = IDL.Variant({
    'icpPaid' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort_7 = IDL.Record({ 'by' : PrivateSort, 'order' : Order });
  const PrivateSharableCoupon = IDL.Record({
    'key' : IDL.Text,
    'status' : Status__3,
    'creator' : IDL.Principal,
    'code' : IDL.Vec(IDL.Nat8),
    'icpPaid' : IDL.Nat,
    'creationDate' : Time,
    'capitalRaised' : IDL.Nat,
  });
  const PrivateSharable__1 = IDL.Vec(PrivateSharableCoupon);
  const Pagination_7 = IDL.Record({
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
  const Sharable__36 = IDL.Record({
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
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getCoupon' : IDL.Func([IDL.Text], [Sharable__35], ['query']),
    'getCoupons' : IDL.Func([Filter__7, Sort_8], [Sharable__37], ['query']),
    'getCouponsPagination' : IDL.Func(
        [Filter__7, Sort_8, IDL.Nat, IDL.Nat],
        [Pagination_8],
        ['query'],
      ),
    'getEarning' : IDL.Func([IDL.Principal], [Sharable__7], ['query']),
    'getPrivateCoupon' : IDL.Func([IDL.Text], [PrivateSharable], ['query']),
    'getPrivateCoupons' : IDL.Func(
        [PrivateFilter, Sort_7],
        [PrivateSharable__1],
        ['query'],
      ),
    'getPrivateCouponsPagination' : IDL.Func(
        [PrivateFilter, Sort_7, IDL.Nat, IDL.Nat],
        [Pagination_7],
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
    'getUser' : IDL.Func([IDL.Principal], [Sharable__36], ['query']),
    'getUserCouponTotal' : IDL.Func(
        [IDL.Principal],
        [IDL.Nat, IDL.Nat],
        ['query'],
      ),
    'initialize' : IDL.Func([], [], []),
    'lockCoupon' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Principal],
        [Sharable__35],
        [],
      ),
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
  const Assets = IDL.Service({
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
  });
  const Entry = IDL.Record({ 'rank' : IDL.Int, 'score' : IDL.Int });
  const SharableRank = IDL.Record({
    'poweredEntry' : Entry,
    'regularEntry' : Entry,
    'averageRank' : IDL.Float64,
    'hypothesisId' : IDL.Nat,
  });
  const SharableRanks = IDL.Vec(SharableRank);
  const Sharable__34 = IDL.Record({
    'ranks' : SharableRanks,
    'callerRevenue' : IDL.Opt(SharableE8S),
  });
  const SharablePayout = IDL.Record({
    'ranks' : SharableRanks,
    'callerRevenue' : IDL.Opt(SharableE8S),
  });
  const Sharable__33 = IDL.Vec(SharablePayout);
  const Choice__2 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const BinaryVote = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__2 });
  const OneSideSharable__1 = IDL.Tuple(IDL.Nat, IDL.Nat);
  const SharableBinaryVotes = IDL.Record({
    'powered' : OneSideSharable__1,
    'regular' : OneSideSharable__1,
  });
  const Note = IDL.Record({ 'content' : IDL.Text, 'extended' : IDL.Bool });
  const Picture = IDL.Record({ 'blob' : IDL.Vec(IDL.Nat8) });
  const Hyperlink = IDL.Record({ 'url' : IDL.Text, 'anchorText' : IDL.Text });
  const Format = IDL.Variant({
    'Note' : Note,
    'Picture' : Picture,
    'Hyperlink' : Hyperlink,
  });
  const Form = IDL.Vec(Format);
  const BinaryChoice = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const Sharable__31 = IDL.Record({
    'id' : IDL.Nat,
    'callerVote' : IDL.Opt(BinaryVote),
    'votes' : SharableBinaryVotes,
    'publishDate' : IDL.Int,
    'form' : Form,
    'publisher' : IDL.Principal,
    'repliedTo' : IDL.Opt(IDL.Nat),
    'replies' : IDL.Vec(IDL.Nat),
    'choice' : BinaryChoice,
    'hypothesisId' : IDL.Nat,
  });
  const Filter__6 = IDL.Record({
    'q' : IDL.Opt(IDL.Text),
    'voter' : IDL.Opt(IDL.Principal),
    'publisher' : IDL.Opt(IDL.Principal),
    'side' : IDL.Opt(BinaryChoice),
    'agoEnd' : IDL.Opt(IDL.Nat),
    'hypothesis' : IDL.Opt(IDL.Nat),
    'repliedTo' : IDL.Opt(IDL.Nat),
    'agoStart' : IDL.Opt(IDL.Nat),
  });
  const Sort__7 = IDL.Variant({
    'positivity' : IDL.Null,
    'negativity' : IDL.Null,
    'popularity' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort_6 = IDL.Record({ 'by' : Sort__7, 'order' : Order });
  const SharableEvidence = IDL.Record({
    'id' : IDL.Nat,
    'callerVote' : IDL.Opt(BinaryVote),
    'votes' : SharableBinaryVotes,
    'publishDate' : IDL.Int,
    'form' : Form,
    'publisher' : IDL.Principal,
    'repliedTo' : IDL.Opt(IDL.Nat),
    'replies' : IDL.Vec(IDL.Nat),
    'choice' : BinaryChoice,
    'hypothesisId' : IDL.Nat,
  });
  const Sharable__32 = IDL.Vec(SharableEvidence);
  const Pagination_6 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__31),
  });
  const Role = IDL.Variant({ 'Guest' : IDL.Null, 'Member' : IDL.Null });
  const Sharable__29 = IDL.Record({
    'members' : IDL.Vec(IDL.Principal),
    'hypothesisIds' : IDL.Vec(IDL.Nat),
    'callerRole' : IDL.Opt(Role),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'creationDate' : Time,
  });
  const Filter__5 = IDL.Record({
    'q' : IDL.Opt(IDL.Text),
    'member' : IDL.Opt(IDL.Principal),
  });
  const Sort__6 = IDL.Variant({
    'alphabetical' : IDL.Null,
    'popularity' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort_5 = IDL.Record({ 'by' : Sort__6, 'order' : Order });
  const SharableField__1 = IDL.Record({
    'members' : IDL.Vec(IDL.Principal),
    'hypothesisIds' : IDL.Vec(IDL.Nat),
    'callerRole' : IDL.Opt(Role),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'creationDate' : Time,
  });
  const Sharable__30 = IDL.Vec(SharableField__1);
  const Pagination_5 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__29),
  });
  const Category = IDL.Variant({
    'Hypothesis' : IDL.Null,
    'Evidence' : IDL.Null,
  });
  const Header = IDL.Record({ 'id' : IDL.Nat, 'category' : Category });
  const Status__1 = IDL.Variant({
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Requested' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const Sharable__27 = IDL.Record({
    'id' : IDL.Nat,
    'status' : Status__1,
    'requester' : IDL.Principal,
    'callerVote' : IDL.Opt(BinaryVote),
    'votes' : SharableBinaryVotes,
    'category' : Category,
    'requestDate' : Time,
    'reason' : IDL.Text,
  });
  const Filter__4 = IDL.Record({
    'status' : IDL.Opt(Status__1),
    'requester' : IDL.Opt(IDL.Principal),
    'voter' : IDL.Opt(IDL.Principal),
    'category' : IDL.Opt(Category),
  });
  const Sort__5 = IDL.Variant({ 'difference' : IDL.Null, 'recent' : IDL.Null });
  const Sort_4 = IDL.Record({ 'by' : Sort__5, 'order' : Order });
  const SharableFlag = IDL.Record({
    'id' : IDL.Nat,
    'status' : Status__1,
    'requester' : IDL.Principal,
    'callerVote' : IDL.Opt(BinaryVote),
    'votes' : SharableBinaryVotes,
    'category' : Category,
    'requestDate' : Time,
    'reason' : IDL.Text,
  });
  const Sharable__28 = IDL.Vec(SharableFlag);
  const Pagination_4 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__27),
  });
  const Filter__3 = IDL.Record({
    'q' : IDL.Opt(IDL.Text),
    'age' : IDL.Opt(IDL.Nat),
    'field' : IDL.Opt(IDL.Text),
    'axiomsFrom' : IDL.Opt(IDL.Principal),
    'voter' : IDL.Opt(IDL.Principal),
    'publisher' : IDL.Opt(IDL.Principal),
    'agoEnd' : IDL.Opt(IDL.Nat),
    'userFollowedPublishers' : IDL.Opt(IDL.Principal),
    'bookmarksFrom' : IDL.Opt(IDL.Principal),
    'userJoinedFields' : IDL.Opt(IDL.Principal),
    'agoStart' : IDL.Opt(IDL.Nat),
  });
  const Sort__4 = IDL.Variant({
    'positivity' : IDL.Null,
    'neutrality' : IDL.Null,
    'negativity' : IDL.Null,
    'controversy' : IDL.Null,
    'popularity' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort_3 = IDL.Record({ 'by' : Sort__4, 'order' : Order });
  const Choice__1 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
    'Neutral' : IDL.Null,
  });
  const TernaryVote = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__1 });
  const OneSideSharable = IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat);
  const SharableTernaryVotes = IDL.Record({
    'powered' : OneSideSharable,
    'regular' : OneSideSharable,
  });
  const SharableHypothesis = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'axioms' : SharableCount,
    'callerVote' : IDL.Opt(TernaryVote),
    'votes' : SharableTernaryVotes,
    'publishDate' : IDL.Int,
    'publisher' : IDL.Principal,
    'callerAxiom' : IDL.Opt(IDL.Bool),
    'callerBookmark' : IDL.Opt(IDL.Bool),
    'fieldId' : IDL.Text,
    'evidenceIds' : IDL.Vec(IDL.Nat),
  });
  const Sharable__26 = IDL.Vec(SharableHypothesis);
  const Sharable__25 = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'axioms' : SharableCount,
    'callerVote' : IDL.Opt(TernaryVote),
    'votes' : SharableTernaryVotes,
    'publishDate' : IDL.Int,
    'publisher' : IDL.Principal,
    'callerAxiom' : IDL.Opt(IDL.Bool),
    'callerBookmark' : IDL.Opt(IDL.Bool),
    'fieldId' : IDL.Text,
    'evidenceIds' : IDL.Vec(IDL.Nat),
  });
  const Pagination_3 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__25),
  });
  const Sharable__24 = IDL.Record({
    'evidences' : IDL.Vec(IDL.Nat),
    'principal' : IDL.Principal,
    'earning' : SharableEarning,
    'joinedFields' : IDL.Vec(IDL.Text),
    'axioms' : IDL.Vec(IDL.Nat),
    'votedHypotheses' : IDL.Vec(IDL.Tuple(IDL.Nat, TernaryVote)),
    'bookmarks' : IDL.Vec(IDL.Nat),
    'hypotheses' : IDL.Vec(IDL.Nat),
    'votedEvidences' : IDL.Vec(IDL.Tuple(IDL.Nat, BinaryVote)),
    'callerFollowing' : IDL.Opt(IDL.Bool),
    'followers' : IDL.Vec(IDL.Principal),
    'followings' : IDL.Vec(IDL.Principal),
    'callerFollower' : IDL.Opt(IDL.Bool),
  });
  const SharableConfig = IDL.Variant({
    'ExcludedPublishers' : IDL.Vec(IDL.Principal),
    'ExcludedFields' : IDL.Vec(IDL.Text),
  });
  const Sharable__23 = IDL.Vec(SharableConfig);
  const Variant__1 = IDL.Variant({
    'ExcludedPublishers' : IDL.Null,
    'ExcludedFields' : IDL.Null,
  });
  const Sharable__22 = IDL.Variant({
    'ExcludedPublishers' : IDL.Vec(IDL.Principal),
    'ExcludedFields' : IDL.Vec(IDL.Text),
  });
  const CustomValue = IDL.Variant({ 'Scale' : IDL.Nat, 'Value' : IDL.Nat });
  const Axioms = IDL.Service({
    'addToAxioms' : IDL.Func([IDL.Nat], [], []),
    'addToBookmarks' : IDL.Func([IDL.Nat], [], []),
    'createField' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'editHypothesis' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'follow' : IDL.Func([IDL.Principal], [], []),
    'getAgePayout' : IDL.Func([IDL.Nat, IDL.Nat], [Sharable__34], ['query']),
    'getAgePayouts' : IDL.Func([IDL.Nat], [Sharable__33], ['query']),
    'getAgesPayout' : IDL.Func([IDL.Nat], [Sharable__33], ['query']),
    'getAgesPayouts' : IDL.Func([], [IDL.Vec(Sharable__33)], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getEarning' : IDL.Func([IDL.Principal], [Sharable__7], ['query']),
    'getEvidence' : IDL.Func([IDL.Nat], [Sharable__31], ['query']),
    'getEvidences' : IDL.Func([Filter__6, Sort_6], [Sharable__32], ['query']),
    'getEvidencesPagination' : IDL.Func(
        [Filter__6, Sort_6, IDL.Nat, IDL.Nat],
        [Pagination_6],
        ['query'],
      ),
    'getField' : IDL.Func([IDL.Text], [Sharable__29], ['query']),
    'getFields' : IDL.Func([Filter__5, Sort_5], [Sharable__30], ['query']),
    'getFieldsPagination' : IDL.Func(
        [Filter__5, Sort_5, IDL.Nat, IDL.Nat],
        [Pagination_5],
        ['query'],
      ),
    'getFlag' : IDL.Func([Header], [Sharable__27], ['query']),
    'getFlags' : IDL.Func([Filter__4, Sort_4], [Sharable__28], ['query']),
    'getFlagsPagination' : IDL.Func(
        [Filter__4, Sort_4, IDL.Nat, IDL.Nat],
        [Pagination_4],
        ['query'],
      ),
    'getHypotheses' : IDL.Func([Filter__3, Sort_3], [Sharable__26], ['query']),
    'getHypothesesPagination' : IDL.Func(
        [Filter__3, Sort_3, IDL.Nat, IDL.Nat],
        [Pagination_3],
        ['query'],
      ),
    'getHypothesis' : IDL.Func([IDL.Nat], [Sharable__25], ['query']),
    'getTop' : IDL.Func(
        [
          IDL.Variant({
            'HypothesisPublishers' : IDL.Null,
            'AcornEarners' : IDL.Null,
            'HypothesisVoters' : IDL.Null,
            'Influencers' : IDL.Null,
            'EvidenceVoters' : IDL.Null,
            'EvidencePublishers' : IDL.Null,
          }),
        ],
        [TopNonPagination],
        ['query'],
      ),
    'getTopPagination' : IDL.Func(
        [
          IDL.Variant({
            'HypothesisPublishers' : IDL.Null,
            'AcornEarners' : IDL.Null,
            'HypothesisVoters' : IDL.Null,
            'Influencers' : IDL.Null,
            'EvidenceVoters' : IDL.Null,
            'EvidencePublishers' : IDL.Null,
          }),
          IDL.Nat,
          IDL.Nat,
        ],
        [TopPagination],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__24], ['query']),
    'getUserConfigs' : IDL.Func([], [Sharable__23], ['query']),
    'initialize' : IDL.Func([], [], []),
    'joinField' : IDL.Func([IDL.Text], [], []),
    'leaveField' : IDL.Func([IDL.Text], [], []),
    'publishEvidence' : IDL.Func(
        [IDL.Nat, Form, Choice__2, IDL.Opt(IDL.Nat)],
        [IDL.Nat],
        [],
      ),
    'publishHypothesis' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal], [], []),
    'removeEvidenceVote' : IDL.Func([IDL.Nat], [], []),
    'removeFlagVote' : IDL.Func([Header], [], []),
    'removeFromAxioms' : IDL.Func([IDL.Nat], [], []),
    'removeFromBookmarks' : IDL.Func([IDL.Nat], [], []),
    'removeHypothesisVote' : IDL.Func([IDL.Nat], [], []),
    'requestFlag' : IDL.Func([Header, IDL.Text], [], []),
    'restoreAllUserConfigs' : IDL.Func([], [], []),
    'restoreUserConfig' : IDL.Func([Variant__1], [], []),
    'setAllUserConfigs' : IDL.Func([IDL.Vec(Sharable__22)], [], []),
    'setBatchUserConfigs' : IDL.Func([IDL.Vec(Sharable__22)], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setUserConfig' : IDL.Func([Sharable__22], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'unfollow' : IDL.Func([IDL.Principal], [], []),
    'voteEvidence' : IDL.Func(
        [IDL.Nat, Choice__2, IDL.Opt(CustomValue)],
        [],
        [],
      ),
    'voteFlag' : IDL.Func([Header, Choice__2], [], []),
    'voteHypothesis' : IDL.Func(
        [IDL.Nat, Choice__1, IDL.Opt(CustomValue)],
        [],
        [],
      ),
    'withdrawAll' : IDL.Func([], [], []),
  });
  const Chat = IDL.Service({
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
  });
  const Sharable__4 = IDL.Nat;
  const Sharable__19 = IDL.Record({
    'title' : IDL.Text,
    'principal' : IDL.Principal,
    'ballots' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'isCustodian' : IDL.Bool,
    'callerBallot' : IDL.Opt(IDL.Nat),
  });
  const Filter__2 = IDL.Record({
    'voter' : IDL.Opt(IDL.Principal),
    'isCustodian' : IDL.Opt(IDL.Bool),
  });
  const Sort__3 = IDL.Variant({ 'token' : IDL.Null, 'voter' : IDL.Null });
  const Sort_2 = IDL.Record({ 'by' : Sort__3, 'order' : Order });
  const SharableNominee = IDL.Record({
    'title' : IDL.Text,
    'principal' : IDL.Principal,
    'ballots' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'isCustodian' : IDL.Bool,
    'callerBallot' : IDL.Opt(IDL.Nat),
  });
  const Sharable__20 = IDL.Vec(SharableNominee);
  const Pagination_2 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__19),
  });
  const Choice = IDL.Variant({
    'Delegated' : IDL.Null,
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const UniformBinaryVote = IDL.Record({ 'choice' : Choice });
  const Delegable__1 = IDL.Variant({
    'Delegated' : IDL.Principal,
    'Default' : UniformBinaryVote,
  });
  const ConfigurableActorVariant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Chat' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Assets' : IDL.Null,
    'Treasury' : IDL.Null,
    'Encyclopedia' : IDL.Null,
  });
  const SharableConfigs = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const ActorsConfigs = IDL.Vec(
    IDL.Tuple(ConfigurableActorVariant, SharableConfigs)
  );
  const UpdateLevel = IDL.Variant({
    'Patch' : IDL.Null,
    'Major' : IDL.Null,
    'Minor' : IDL.Null,
  });
  const Changes = IDL.Variant({
    'Security' : IDL.Vec(IDL.Text),
    'Fixed' : IDL.Vec(IDL.Text),
    'Changed' : IDL.Vec(IDL.Text),
    'Added' : IDL.Vec(IDL.Text),
    'Removed' : IDL.Vec(IDL.Text),
  });
  const ReleaseNotes = IDL.Vec(Changes);
  const DeployableActorVariant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Chat' : IDL.Null,
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Assets' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'Encyclopedia' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const SharableCommitment = IDL.Record({
    'moduleHash' : IDL.Text,
    'args' : IDL.Vec(IDL.Nat8),
    'actorVariant' : DeployableActorVariant,
  });
  const SharableCommitments = IDL.Vec(SharableCommitment);
  const SharableInstallation = IDL.Record({
    'updateLevel' : UpdateLevel,
    'releaseNotes' : ReleaseNotes,
    'commitments' : SharableCommitments,
    'commitHash' : IDL.Text,
  });
  const SharableCode = IDL.Record({
    'actorsConfigs' : ActorsConfigs,
    'installation' : SharableInstallation,
  });
  const SharableField = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const SharableConfigs__1 = IDL.Record({ 'actorsConfigs' : ActorsConfigs });
  const SharableWorker = IDL.Record({});
  const SharableDetachment = IDL.Variant({
    'Code' : SharableCode,
    'Field' : SharableField,
    'Configs' : SharableConfigs__1,
    'Worker' : SharableWorker,
  });
  const Status = IDL.Variant({
    'Failed' : IDL.Text,
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Proposed' : IDL.Null,
    'Executed' : IDL.Null,
    'Retried' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const Milestone = IDL.Record({ 'status' : Status, 'date' : Time });
  const Sharable__17 = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'icpReward' : IDL.Nat,
    'content' : IDL.Text,
    'callerVote' : IDL.Opt(Delegable__1),
    'votes' : IDL.Tuple(
      IDL.Vec(IDL.Principal),
      IDL.Vec(IDL.Principal),
      IDL.Vec(IDL.Principal),
      IDL.Vec(IDL.Principal),
    ),
    'acornReward' : IDL.Nat,
    'proposer' : IDL.Principal,
    'detachment' : SharableDetachment,
    'timeline' : IDL.Vec(Milestone),
  });
  const StatusVariant = IDL.Variant({
    'Failed' : IDL.Null,
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Proposed' : IDL.Null,
    'Executed' : IDL.Null,
    'Retried' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const ProposalVariant = IDL.Variant({
    'Code' : IDL.Null,
    'Field' : IDL.Null,
    'Configs' : IDL.Null,
    'Worker' : IDL.Null,
  });
  const Filter__1 = IDL.Record({
    'status' : IDL.Opt(StatusVariant),
    'voter' : IDL.Opt(IDL.Principal),
    'category' : IDL.Opt(ProposalVariant),
    'proposer' : IDL.Opt(IDL.Principal),
  });
  const Sort__2 = IDL.Variant({
    'icpReward' : IDL.Null,
    'acornReward' : IDL.Null,
    'updated' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort_1 = IDL.Record({ 'by' : Sort__2, 'order' : Order });
  const SharableProposal = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'icpReward' : IDL.Nat,
    'content' : IDL.Text,
    'callerVote' : IDL.Opt(Delegable__1),
    'votes' : IDL.Tuple(
      IDL.Vec(IDL.Principal),
      IDL.Vec(IDL.Principal),
      IDL.Vec(IDL.Principal),
      IDL.Vec(IDL.Principal),
    ),
    'acornReward' : IDL.Nat,
    'proposer' : IDL.Principal,
    'detachment' : SharableDetachment,
    'timeline' : IDL.Vec(Milestone),
  });
  const Sharable__18 = IDL.Vec(SharableProposal);
  const Pagination_1 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__17),
  });
  const Sharable__16 = IDL.Record({
    'ballots' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'referendums' : IDL.Vec(IDL.Nat),
    'icpEarning' : SharableEarning,
    'referendumVotes' : IDL.Vec(IDL.Tuple(IDL.Nat, TernaryVote)),
    'acornEarning' : SharableEarning,
    'lastUpdateBallot' : Time,
    'proposalVotes' : IDL.Vec(IDL.Tuple(IDL.Nat, Delegable__1)),
    'proposals' : IDL.Vec(IDL.Nat),
  });
  const Sharable = IDL.Vec(SharableCommitment);
  const Delegable = IDL.Variant({
    'Delegated' : IDL.Principal,
    'Default' : Choice,
  });
  const DAO = IDL.Service({
    'cancelCodeUpload' : IDL.Func([], [], []),
    'castBallots' : IDL.Func([IDL.Vec(IDL.Principal)], [], []),
    'enterElection' : IDL.Func([IDL.Text], [], []),
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getDaysInPeriod' : IDL.Func([], [Sharable__4], ['query']),
    'getEarning' : IDL.Func(
        [IDL.Principal],
        [Sharable__7, Sharable__7],
        ['query'],
      ),
    'getNominee' : IDL.Func([IDL.Principal], [Sharable__19], ['query']),
    'getNominees' : IDL.Func([Filter__2, Sort_2], [Sharable__20], ['query']),
    'getNomineesPagination' : IDL.Func(
        [Filter__2, Sort_2, IDL.Nat, IDL.Nat],
        [Pagination_2],
        ['query'],
      ),
    'getProposal' : IDL.Func([IDL.Nat], [Sharable__17], ['query']),
    'getProposals' : IDL.Func([Filter__1, Sort_1], [Sharable__18], ['query']),
    'getProposalsPagination' : IDL.Func(
        [Filter__1, Sort_1, IDL.Nat, IDL.Nat],
        [Pagination_1],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__16], ['query']),
    'initialize' : IDL.Func([], [], []),
    'initializeCodeUploadSession' : IDL.Func(
        [IDL.Text, UpdateLevel, ReleaseNotes, Sharable],
        [],
        [],
      ),
    'leaveElection' : IDL.Func([], [], []),
    'openCodeProposal' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Nat, ActorsConfigs],
        [IDL.Nat],
        [],
      ),
    'openConfigsProposal' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Nat, ActorsConfigs],
        [IDL.Nat],
        [],
      ),
    'openFieldProposal' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Nat],
        [],
      ),
    'openWorkerProposal' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
        [IDL.Nat],
        [],
      ),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal], [], []),
    'retryConfigsProposal' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, ActorsConfigs],
        [],
        [],
      ),
    'retryFieldProposal' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
        [],
        [],
      ),
    'retryWorkerProposal' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat],
        [],
        [],
      ),
    'setCodeProposalExecuted' : IDL.Func([IDL.Nat], [], []),
    'setCodeProposalFailed' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'updateNomineeTitle' : IDL.Func([IDL.Text], [], []),
    'voteProposal' : IDL.Func([IDL.Nat, Delegable], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  const Encyclopedia = IDL.Service({
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
  });
  const Option = IDL.Variant({
    'Perpetual' : IDL.Null,
    'Double' : IDL.Null,
    'Octuple' : IDL.Null,
    'Quadruple' : IDL.Null,
    'Single' : IDL.Null,
  });
  const SharableBurial = IDL.Record({
    'issueDate' : Time,
    'coefficient' : IDL.Nat,
    'expiryDate' : Time,
    'claimableInterest' : SharableE8S,
    'amount' : SharableE8S,
  });
  const Sharable__15 = IDL.Vec(SharableBurial);
  const SharableBurials = IDL.Vec(SharableBurial);
  const Sharable__14 = IDL.Record({ 'burials' : SharableBurials });
  const Escrow = IDL.Service({
    'bury' : IDL.Func([IDL.Nat, Option], [], []),
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'getBurials' : IDL.Func([IDL.Principal], [Sharable__15], ['query']),
    'getBuriedAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getClaimableAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
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
    'getUser' : IDL.Func([IDL.Principal], [Sharable__14], ['query']),
    'getVotingPower' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'transferFounderBurial' : IDL.Func([IDL.Principal, IDL.Principal], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  const NewEvidencesFromFollowingsData = IDL.Record({
    'publisher' : IDL.Principal,
    'timestamp' : Time,
    'evidenceId' : IDL.Nat,
  });
  const NewAxiomsToHypothesisData = IDL.Record({
    'user' : IDL.Principal,
    'timestamp' : Time,
  });
  const NewReferralsData = IDL.Record({
    'user' : IDL.Principal,
    'claimable' : IDL.Nat,
    'timestamp' : Time,
  });
  const ElectionResult = IDL.Variant({
    'New' : IDL.Null,
    'Unchanged' : IDL.Null,
    'Removed' : IDL.Null,
  });
  const CustodianElectionResultData = IDL.Record({
    'result' : ElectionResult,
    'claimable' : IDL.Nat,
    'timestamp' : Time,
  });
  const ExecutedResult = IDL.Variant({
    'Failed' : IDL.Null,
    'Executed' : IDL.Null,
  });
  const ProposalExecutedData = IDL.Record({
    'result' : ExecutedResult,
    'claimable' : IDL.Nat,
    'timestamp' : Time,
    'proposalId' : IDL.Nat,
  });
  const NewBallotsData = IDL.Record({
    'voter' : IDL.Principal,
    'timestamp' : Time,
  });
  const Result = IDL.Variant({
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const ProposalResultData = IDL.Record({
    'result' : Result,
    'timestamp' : Time,
    'proposalId' : IDL.Nat,
  });
  const CustodianProposalResultData = IDL.Record({
    'result' : Result,
    'timestamp' : Time,
    'proposer' : IDL.Principal,
    'proposalId' : IDL.Nat,
  });
  const NewEvidencesToHypothesisData = IDL.Record({
    'publisher' : IDL.Principal,
    'side' : BinaryChoice,
    'timestamp' : Time,
    'evidenceId' : IDL.Nat,
  });
  const CustodianProposalOpenedData = IDL.Record({
    'timestamp' : Time,
    'proposer' : IDL.Principal,
    'proposalId' : IDL.Nat,
    'retried' : IDL.Nat,
  });
  const CustodianProposalDelegatedData = IDL.Record({
    'delegator' : IDL.Principal,
    'timestamp' : Time,
    'proposalId' : IDL.Nat,
  });
  const TernaryChoice = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
    'Neutral' : IDL.Null,
  });
  const NewVotesToHypothesisData = IDL.Record({
    'voter' : IDL.Principal,
    'timestamp' : Time,
    'choice' : TernaryChoice,
  });
  const NewFollowersData = IDL.Record({
    'user' : IDL.Principal,
    'timestamp' : Time,
  });
  const NewVotesToEvidenceData = IDL.Record({
    'voter' : IDL.Principal,
    'timestamp' : Time,
    'choice' : BinaryChoice,
  });
  const NewHypothesesFromFollowingsData = IDL.Record({
    'publisher' : IDL.Principal,
    'timestamp' : Time,
    'hypothesisId' : IDL.Nat,
  });
  const CouponRedeemedData = IDL.Record({
    'key' : IDL.Text,
    'user' : IDL.Principal,
    'timestamp' : Time,
  });
  const NewVotesToProposalData = IDL.Record({
    'voter' : IDL.Principal,
    'timestamp' : Time,
    'choice' : BinaryChoice,
  });
  const NewRepliesToEvidenceData = IDL.Record({
    'publisher' : IDL.Principal,
    'timestamp' : Time,
    'evidenceId' : IDL.Nat,
  });
  const SharableUserVariant = IDL.Variant({
    'NewEvidencesFromFollowings' : IDL.Record({
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewEvidencesFromFollowingsData),
    }),
    'NewAxiomsToHypothesis' : IDL.Record({
      'id' : IDL.Nat,
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewAxiomsToHypothesisData),
    }),
    'NewReferrals' : IDL.Record({
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewReferralsData),
    }),
    'CustodianElectionResult' : CustodianElectionResultData,
    'ProposalExecuted' : ProposalExecutedData,
    'NewBallots' : IDL.Record({
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewBallotsData),
    }),
    'ProposalResult' : ProposalResultData,
    'CustodianProposalResult' : CustodianProposalResultData,
    'NewEvidencesToHypothesis' : IDL.Record({
      'id' : IDL.Nat,
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewEvidencesToHypothesisData),
    }),
    'CustodianProposalOpened' : CustodianProposalOpenedData,
    'CustodianProposalDelegated' : CustodianProposalDelegatedData,
    'NewVotesToHypothesis' : IDL.Record({
      'id' : IDL.Nat,
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewVotesToHypothesisData),
    }),
    'NewFollowers' : IDL.Record({
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewFollowersData),
    }),
    'NewVotesToEvidence' : IDL.Record({
      'id' : IDL.Nat,
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewVotesToEvidenceData),
    }),
    'NewHypothesesFromFollowings' : IDL.Record({
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewHypothesesFromFollowingsData),
    }),
    'CouponRedeemed' : CouponRedeemedData,
    'NewVotesToProposal' : IDL.Record({
      'id' : IDL.Nat,
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewVotesToProposalData),
    }),
    'NewRepliesToEvidence' : IDL.Record({
      'id' : IDL.Nat,
      'total' : IDL.Nat,
      'capacity' : IDL.Vec(NewRepliesToEvidenceData),
    }),
  });
  const FlagHeader = IDL.Record({ 'id' : IDL.Nat, 'category' : Category });
  const SharableSystemVariant = IDL.Variant({
    'TallyResult' : IDL.Record({
      'new' : IDL.Vec(IDL.Principal),
      'timestamp' : Time,
      'unchanged' : IDL.Vec(IDL.Principal),
      'removed' : IDL.Vec(IDL.Principal),
    }),
    'FlagResult' : IDL.Record({
      'result' : Result,
      'timestamp' : Time,
      'header' : FlagHeader,
    }),
    'ProposalExecuted' : IDL.Record({
      'result' : ExecutedResult,
      'timestamp' : Time,
      'proposer' : IDL.Principal,
      'proposalId' : IDL.Nat,
    }),
    'FlagRequested' : IDL.Record({ 'timestamp' : Time, 'header' : FlagHeader }),
    'SystemGeneric' : IDL.Record({
      'link' : IDL.Opt(Hyperlink),
      'message' : IDL.Text,
      'timestamp' : Time,
    }),
  });
  const Sharable__13 = IDL.Tuple(
    IDL.Vec(SharableUserVariant),
    IDL.Vec(SharableSystemVariant),
  );
  const Sharable__12 = IDL.Record({
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
    'capitalRaised' : IDL.Nat,
  });
  const Filter = IDL.Record({
    'q' : IDL.Opt(IDL.Text),
    'capitalRaised' : IDL.Opt(IDL.Nat),
  });
  const Sort__1 = IDL.Variant({
    'alphabetical' : IDL.Null,
    'capitalRaised' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort = IDL.Record({ 'by' : Sort__1, 'order' : Order });
  const Pagination = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__12),
  });
  const SystemVariantParam = IDL.Variant({
    'TallyResult' : IDL.Record({
      'new' : IDL.Vec(IDL.Principal),
      'timestamp' : Time,
      'unchanged' : IDL.Vec(IDL.Principal),
      'removed' : IDL.Vec(IDL.Principal),
    }),
    'FlagResult' : IDL.Record({
      'result' : Result,
      'timestamp' : Time,
      'header' : FlagHeader,
    }),
    'ProposalExecuted' : IDL.Record({
      'result' : ExecutedResult,
      'timestamp' : Time,
      'proposer' : IDL.Principal,
      'proposalId' : IDL.Nat,
    }),
    'FlagRequested' : IDL.Record({ 'timestamp' : Time, 'header' : FlagHeader }),
    'SystemGeneric' : IDL.Record({
      'link' : IDL.Opt(Hyperlink),
      'message' : IDL.Text,
      'timestamp' : Time,
    }),
  });
  List_3.fill(IDL.Opt(IDL.Tuple(SystemVariantParam, List_3)));
  const SystemNotificationsBatch = IDL.Opt(
    IDL.Tuple(SystemVariantParam, List_3)
  );
  const UserVariantParam = IDL.Variant({
    'NewEvidencesFromFollowings' : NewEvidencesFromFollowingsData,
    'NewAxiomsToHypothesis' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewAxiomsToHypothesisData,
    }),
    'NewReferrals' : NewReferralsData,
    'CustodianElectionResult' : CustodianElectionResultData,
    'ProposalExecuted' : ProposalExecutedData,
    'NewBallots' : NewBallotsData,
    'ProposalResult' : ProposalResultData,
    'CustodianProposalResult' : CustodianProposalResultData,
    'NewEvidencesToHypothesis' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewEvidencesToHypothesisData,
    }),
    'CustodianProposalOpened' : CustodianProposalOpenedData,
    'CustodianProposalDelegated' : CustodianProposalDelegatedData,
    'NewVotesToHypothesis' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewVotesToHypothesisData,
    }),
    'NewFollowers' : NewFollowersData,
    'NewVotesToEvidence' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewVotesToEvidenceData,
    }),
    'NewHypothesesFromFollowings' : NewHypothesesFromFollowingsData,
    'CouponRedeemed' : CouponRedeemedData,
    'NewVotesToProposal' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewVotesToProposalData,
    }),
    'NewRepliesToEvidence' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewRepliesToEvidenceData,
    }),
  });
  List_2.fill(IDL.Opt(IDL.Tuple(UserVariantParam, List_2)));
  const UserNotificationsBatch = IDL.Opt(IDL.Tuple(UserVariantParam, List_2));
  List_1.fill(IDL.Opt(IDL.Tuple(IDL.Principal, List_1)));
  const UsersBatch = IDL.Opt(IDL.Tuple(IDL.Principal, List_1));
  List.fill(
    IDL.Opt(IDL.Tuple(IDL.Tuple(IDL.Principal, UserVariantParam), List))
  );
  const UsersNotificationsBatch = IDL.Opt(
    IDL.Tuple(IDL.Tuple(IDL.Principal, UserVariantParam), List)
  );
  const Facade = IDL.Service({
    'editAvatar' : IDL.Func([IDL.Opt(Picture)], [], []),
    'editLinks' : IDL.Func([IDL.Vec(Hyperlink)], [], []),
    'editLocation' : IDL.Func([IDL.Opt(IDL.Text)], [], []),
    'editUsername' : IDL.Func([IDL.Text], [], []),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getNotification' : IDL.Func([], [Sharable__13], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__12], ['query']),
    'getUserCapitalRaised' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUserIdentifier' : IDL.Func(
        [IdentifierVariant],
        [Identifier],
        ['query'],
      ),
    'getUsers' : IDL.Func([Filter, Sort], [IDL.Vec(Sharable__12)], ['query']),
    'getUsersCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getUsersIdentifier' : IDL.Func([], [IDL.Vec(Identifier)], ['query']),
    'getUsersPagination' : IDL.Func(
        [Filter, Sort, IDL.Nat, IDL.Nat],
        [Pagination],
        ['query'],
      ),
    'getUsersPrincipal' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'initialize' : IDL.Func([], [], []),
    'postSystemGenericNotification' : IDL.Func(
        [IDL.Text, IDL.Opt(Hyperlink)],
        [],
        [],
      ),
    'postSystemNotification' : IDL.Func([SystemVariantParam], [], []),
    'postSystemNotifications' : IDL.Func([SystemNotificationsBatch], [], []),
    'postUserNotification' : IDL.Func(
        [IDL.Principal, UserVariantParam],
        [],
        [],
      ),
    'postUserNotifications' : IDL.Func(
        [IDL.Principal, UserNotificationsBatch],
        [],
        [],
      ),
    'postUsersNotification' : IDL.Func([UsersBatch, UserVariantParam], [], []),
    'postUsersNotifications' : IDL.Func([UsersNotificationsBatch], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Principal)], [], []),
    'registerWithCoupon' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'updateCapitalRaised' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
  });
  const ICPUSD = IDL.Service({
    'exchange' : IDL.Func([IDL.Bool, IDL.Nat], [IDL.Nat], []),
  });
  const Achievement = IDL.Variant({
    'OctupleBurial' : IDL.Null,
    'Referral' : IDL.Null,
  });
  const ACORNToMint = IDL.Record({ 'buried' : IDL.Nat, 'liquid' : IDL.Nat });
  const ForceUpdateCapitalRaisedResult = IDL.Record({
    'success' : IDL.Vec(IDL.Principal),
    'failed' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text)),
  });
  const LogoResult = IDL.Record({ 'data' : IDL.Text, 'logo_type' : IDL.Text });
  const Dip721NonFungibleToken = IDL.Record({
    'maxLimit' : IDL.Nat16,
    'logo' : LogoResult,
    'name' : IDL.Text,
    'symbol' : IDL.Text,
  });
  const SharableAchievementPackage = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'metadata' : Dip721NonFungibleToken,
    'achievement' : Achievement,
  });
  const Sharable__11 = IDL.Vec(SharableAchievementPackage);
  const SharablePackage = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'metadata' : Dip721NonFungibleToken,
    'capitalRaised' : IDL.Nat,
  });
  const Sharable__10 = IDL.Vec(SharablePackage);
  const Sales = IDL.Service({
    'addAchievementPackage' : IDL.Func(
        [Achievement, IDL.Text, IDL.Text, IDL.Text],
        [],
        [],
      ),
    'addPackage' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [], []),
    'computeAcornToMint' : IDL.Func([IDL.Nat], [ACORNToMint], []),
    'deployAchievementPackage' : IDL.Func([Achievement], [], []),
    'deployPackage' : IDL.Func([IDL.Nat], [], []),
    'expectPackageFound' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    'expectPackageNotFound' : IDL.Func([IDL.Nat], [], ['query']),
    'forceUpdateCapitalRaised' : IDL.Func(
        [IDL.Vec(IDL.Principal)],
        [ForceUpdateCapitalRaisedResult],
        [],
      ),
    'getAchievementPackagePrincipals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(Achievement, IDL.Principal))],
        ['query'],
      ),
    'getAchievementPackages' : IDL.Func([], [Sharable__11], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getOwnedAchievementPackages' : IDL.Func(
        [IDL.Principal],
        [Sharable__11],
        [],
      ),
    'getOwnedPackages' : IDL.Func([IDL.Principal], [Sharable__10], []),
    'getPackagePrincipals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Principal))],
        ['query'],
      ),
    'getPackages' : IDL.Func([], [Sharable__10], ['query']),
    'initialize' : IDL.Func([], [], []),
    'mintAchievementPackage' : IDL.Func([Achievement], [], []),
    'mintPackage' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'upgradePackage' : IDL.Func([], [], []),
  });
  const Variant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Chat' : IDL.Null,
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Founder' : IDL.Null,
    'Assets' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'Encyclopedia' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const ActorVariant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Chat' : IDL.Null,
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Founder' : IDL.Null,
    'Assets' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'Encyclopedia' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const Sharable__9 = IDL.Record({
    'earning' : SharableEarning,
    'proportion' : SharableProportion,
    'actorVariant' : ActorVariant,
  });
  const SharableDistribution = IDL.Record({
    'earning' : SharableEarning,
    'proportion' : SharableProportion,
    'actorVariant' : ActorVariant,
  });
  const Sharable__8 = IDL.Vec(SharableDistribution);
  const Split = IDL.Service({
    'affiliateDeposit' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
    'deposit' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'externalTransfer' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'getBalance' : IDL.Func([Variant], [Sharable__4], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getDistribution' : IDL.Func([Variant], [Sharable__9], ['query']),
    'getDistributions' : IDL.Func([], [Sharable__8], ['query']),
    'getEarning' : IDL.Func([Variant], [Sharable__7], ['query']),
    'getTotalBalance' : IDL.Func([], [Sharable__4], ['query']),
    'getTotalRevenue' : IDL.Func([], [Sharable__4], ['query']),
    'internalTransfer' : IDL.Func([Variant, IDL.Nat], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
  });
  const Sharable__6 = IDL.Record({
    'balance' : IDL.Nat,
    'allocated' : IDL.Nat,
    'actorVariant' : ActorVariant,
  });
  const SharableAllocation = IDL.Record({
    'balance' : IDL.Nat,
    'allocated' : IDL.Nat,
    'actorVariant' : ActorVariant,
  });
  const Sharable__5 = IDL.Vec(SharableAllocation);
  const Treasury = IDL.Service({
    'claim' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'delegatedClaim' : IDL.Func([Variant, IDL.Principal, IDL.Nat], [], []),
    'delegatedExternalTransfer' : IDL.Func(
        [Variant, IDL.Principal, IDL.Nat],
        [],
        [],
      ),
    'externalMint' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'externalTransfer' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'getAllocated' : IDL.Func([Variant], [Sharable__4], ['query']),
    'getAllocation' : IDL.Func([Variant], [Sharable__6], ['query']),
    'getAllocations' : IDL.Func([], [Sharable__5], ['query']),
    'getBalance' : IDL.Func([Variant], [Sharable__4], ['query']),
    'getCirculatingSupply' : IDL.Func([], [Sharable__4], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getReserveSupply' : IDL.Func([], [Sharable__4], ['query']),
    'getTotalSupply' : IDL.Func([], [Sharable__4], ['query']),
    'internalMint' : IDL.Func([Variant, IDL.Nat], [], []),
    'internalTransfer' : IDL.Func([Variant, IDL.Nat], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
  });
  const DeployableVariant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Chat' : IDL.Null,
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Assets' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'Encyclopedia' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const SnapshotFrom = IDL.Variant({
    'Arbitrary' : IDL.Null,
    'BeforeProposal' : IDL.Nat,
    'AfterProposal' : IDL.Nat,
  });
  const SnapshotDetail = IDL.Record({
    'id' : IDL.Text,
    'moduleHash' : IDL.Text,
    'from' : SnapshotFrom,
    'total_size' : IDL.Nat64,
    'taken_at_timestamp' : IDL.Nat64,
  });
  const Info = IDL.Record({
    'status' : IDL.Variant({
      'stopped' : IDL.Null,
      'stopping' : IDL.Null,
      'running' : IDL.Null,
    }),
    'moduleHash' : IDL.Text,
    'args' : IDL.Vec(IDL.Nat8),
    'snapshots' : IDL.Vec(SnapshotDetail),
    'cycles' : IDL.Nat,
    'commitHash' : IDL.Text,
    'memorySize' : IDL.Nat,
  });
  const Sharable__2 = IDL.Record({
    'updateLevel' : UpdateLevel,
    'releaseNotes' : ReleaseNotes,
    'commitments' : SharableCommitments,
    'commitHash' : IDL.Text,
  });
  const Sharable__1 = IDL.Text;
  const Settings = IDL.Record({
    'freezing_threshold' : IDL.Opt(IDL.Nat),
    'wasm_memory_threshold' : IDL.Opt(IDL.Nat),
    'environment_variables' : IDL.Opt(
      IDL.Vec(IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text }))
    ),
    'controllers' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'reserved_cycles_limit' : IDL.Opt(IDL.Nat),
    'log_visibility' : IDL.Opt(
      IDL.Variant({
        'controllers' : IDL.Null,
        'allowed_viewers' : IDL.Vec(IDL.Principal),
      })
    ),
    'wasm_memory_limit' : IDL.Opt(IDL.Nat),
    'memory_allocation' : IDL.Opt(IDL.Nat),
    'compute_allocation' : IDL.Opt(IDL.Nat),
  });
  const Indicator = IDL.Service({
    'ACORN' : IDL.Func([], [ACORN], ['query']),
    'Affiliate' : IDL.Func([], [Affiliate], ['query']),
    'Assets' : IDL.Func([], [Assets], ['query']),
    'Axioms' : IDL.Func([], [Axioms], ['query']),
    'Chat' : IDL.Func([], [Chat], ['query']),
    'DAO' : IDL.Func([], [DAO], ['query']),
    'Encyclopedia' : IDL.Func([], [Encyclopedia], ['query']),
    'Escrow' : IDL.Func([], [Escrow], ['query']),
    'Facade' : IDL.Func([], [Facade], ['query']),
    'ICPUSD' : IDL.Func([], [ICPUSD], ['query']),
    'Sales' : IDL.Func([], [Sales], ['query']),
    'Split' : IDL.Func([], [Split], ['query']),
    'Treasury' : IDL.Func([], [Treasury], ['query']),
    'addController' : IDL.Func([], [], []),
    'checkInstallationSettled' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'clearCommitment' : IDL.Func([DeployableVariant], [], []),
    'createNewCanisters' : IDL.Func([], [], []),
    'deleteSession' : IDL.Func([IDL.Principal], [], []),
    'enqueueUpgradeTask' : IDL.Func(
        [IDL.Nat, IDL.Principal, ActorsConfigs],
        [],
        [],
      ),
    'expectAuthorized' : IDL.Func(
        [IDL.Principal, IDL.Vec(Variant)],
        [],
        ['query'],
      ),
    'expectUnreleased' : IDL.Func([], [], ['query']),
    'extendInstallationExpiryDate' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'getActorInfo' : IDL.Func([Variant], [Info], []),
    'getActorsInfo' : IDL.Func([], [IDL.Vec(IDL.Tuple(Variant, Info))], []),
    'getCanisterTime' : IDL.Func([], [IDL.Int], ['query']),
    'getCommitmentComputedModuleHash' : IDL.Func(
        [IDL.Principal, DeployableVariant],
        [IDL.Text],
        ['query'],
      ),
    'getCommitmentUploadedChunks' : IDL.Func(
        [IDL.Principal, DeployableVariant],
        [IDL.Vec(IDL.Nat8)],
        ['query'],
      ),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getInstallation' : IDL.Func([IDL.Principal], [Sharable__2], ['query']),
    'getInstallationWithTitle' : IDL.Func(
        [IDL.Principal],
        [Sharable__2, IDL.Text],
        ['query'],
      ),
    'getPrincipal' : IDL.Func([Variant], [IDL.Principal], ['query']),
    'getPrincipals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(Variant, IDL.Principal))],
        ['query'],
      ),
    'getVariant' : IDL.Func([IDL.Principal], [Variant], ['query']),
    'getVersion' : IDL.Func([], [Sharable__1], ['query']),
    'initialize' : IDL.Func([], [], []),
    'initializeFirstSession' : IDL.Func(
        [UpdateLevel, ReleaseNotes, Sharable],
        [],
        [],
      ),
    'initializeSession' : IDL.Func(
        [IDL.Principal, IDL.Text, UpdateLevel, ReleaseNotes, Sharable],
        [],
        [],
      ),
    'installCanisters' : IDL.Func([], [], []),
    'loadSnapshots' : IDL.Func(
        [IDL.Vec(IDL.Tuple(DeployableVariant, IDL.Text))],
        [],
        [],
      ),
    'putActorsConfigs' : IDL.Func([ActorsConfigs], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setActorsConfigs' : IDL.Func([ActorsConfigs], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'settleCommitment' : IDL.Func([DeployableVariant], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'takeArbitrarySnapshots' : IDL.Func([IDL.Vec(DeployableVariant)], [], []),
    'updateSettings' : IDL.Func([IDL.Vec(Variant), Settings], [], []),
    'uploadCommitmentChunk' : IDL.Func(
        [DeployableVariant, IDL.Nat8, IDL.Vec(IDL.Nat8), IDL.Text],
        [],
        [],
      ),
  });
  return Indicator;
};
export const init = ({ IDL }) => { return []; };
