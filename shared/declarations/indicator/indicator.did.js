export const idlFactory = ({ IDL }) => {
  const List__1 = IDL.Rec();
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
  const Time = IDL.Int;
  const SharableE8S__1 = IDL.Nat;
  const Sharable__7 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const SharableEarning__3 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const SharableCount__1 = IDL.Nat;
  const Sharable__31 = IDL.Record({
    'referrer' : IDL.Opt(IDL.Principal),
    'earning' : SharableEarning__3,
    'referrals' : SharableCount__1,
  });
  const Affiliate = IDL.Service({
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'fillReferrals' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Opt(IDL.Principal)],
        [],
        [],
      ),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getEarning' : IDL.Func([IDL.Principal], [Sharable__7], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__31], ['query']),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  const Entry = IDL.Record({ 'rank' : IDL.Nat, 'score' : IDL.Nat });
  const SharableRank = IDL.Record({
    'poweredEntry' : Entry,
    'regularEntry' : Entry,
    'averageRank' : IDL.Float64,
    'hypothesisId' : IDL.Nat,
  });
  const SharableRanks = IDL.Vec(SharableRank);
  const SharableE8S__3 = IDL.Nat;
  const Sharable__30 = IDL.Record({
    'ranks' : SharableRanks,
    'callerRevenue' : IDL.Opt(SharableE8S__3),
  });
  const SharablePayout = IDL.Record({
    'ranks' : SharableRanks,
    'callerRevenue' : IDL.Opt(SharableE8S__3),
  });
  const Sharable__29 = IDL.Vec(SharablePayout);
  const Choice__2 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const BinaryVote__2 = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__2 });
  const OneSideSharable__1 = IDL.Tuple(IDL.Nat, IDL.Nat);
  const SharableBinaryVotes__1 = IDL.Record({
    'powered' : OneSideSharable__1,
    'regular' : OneSideSharable__1,
  });
  const Note = IDL.Record({ 'content' : IDL.Text, 'extended' : IDL.Bool });
  const Picture = IDL.Record({ 'blob' : IDL.Vec(IDL.Nat8) });
  const Hyperlink__1 = IDL.Record({
    'url' : IDL.Text,
    'anchorText' : IDL.Text,
  });
  const Format = IDL.Variant({
    'Note' : Note,
    'Picture' : Picture,
    'Hyperlink' : Hyperlink__1,
  });
  const Form = IDL.Vec(Format);
  const BinaryChoice__1 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const Sharable__27 = IDL.Record({
    'id' : IDL.Nat,
    'callerVote' : IDL.Opt(BinaryVote__2),
    'votes' : SharableBinaryVotes__1,
    'publishDate' : IDL.Int,
    'form' : Form,
    'publisher' : IDL.Principal,
    'choice' : BinaryChoice__1,
    'hypothesisId' : IDL.Nat,
  });
  const BinaryChoice = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const Filter__6 = IDL.Record({
    'publishedBy' : IDL.Opt(IDL.Principal),
    'publishedIn' : IDL.Opt(IDL.Nat),
    'votedBy' : IDL.Opt(IDL.Principal),
    'containsPattern' : IDL.Opt(IDL.Text),
    'onSide' : IDL.Opt(BinaryChoice),
  });
  const Sort__7 = IDL.Variant({
    'positivity' : IDL.Null,
    'negativity' : IDL.Null,
    'popularity' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Order = IDL.Variant({
    'descending' : IDL.Null,
    'ascending' : IDL.Null,
  });
  const Sort_6 = IDL.Record({ 'by' : Sort__7, 'order' : Order });
  const SharableEvidence = IDL.Record({
    'id' : IDL.Nat,
    'callerVote' : IDL.Opt(BinaryVote__2),
    'votes' : SharableBinaryVotes__1,
    'publishDate' : IDL.Int,
    'form' : Form,
    'publisher' : IDL.Principal,
    'choice' : BinaryChoice__1,
    'hypothesisId' : IDL.Nat,
  });
  const Sharable__28 = IDL.Vec(SharableEvidence);
  const Pagination_6 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__27),
  });
  const Role = IDL.Variant({ 'Guest' : IDL.Null, 'Member' : IDL.Null });
  const Time__6 = IDL.Int;
  const Sharable__25 = IDL.Record({
    'members' : IDL.Vec(IDL.Principal),
    'hypothesisIds' : IDL.Vec(IDL.Nat),
    'callerRole' : IDL.Opt(Role),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'creationDate' : Time__6,
  });
  const Filter__5 = IDL.Record({
    'joinedBy' : IDL.Opt(IDL.Principal),
    'containsPattern' : IDL.Opt(IDL.Text),
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
    'creationDate' : Time__6,
  });
  const Sharable__26 = IDL.Vec(SharableField__1);
  const Pagination_5 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__25),
  });
  const Category = IDL.Variant({
    'Hypothesis' : IDL.Null,
    'Evidence' : IDL.Null,
  });
  const Header = IDL.Record({ 'id' : IDL.Nat, 'category' : Category });
  const BinaryVote__1 = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__2 });
  const SharableBinaryVotes = IDL.Record({
    'powered' : OneSideSharable__1,
    'regular' : OneSideSharable__1,
  });
  const Time__5 = IDL.Int;
  const Sharable__23 = IDL.Record({
    'id' : IDL.Nat,
    'requester' : IDL.Principal,
    'callerVote' : IDL.Opt(BinaryVote__1),
    'votes' : SharableBinaryVotes,
    'category' : Category,
    'requestDate' : Time__5,
    'reason' : IDL.Text,
  });
  const Category__1 = IDL.Variant({
    'Hypothesis' : IDL.Null,
    'Evidence' : IDL.Null,
  });
  const Filter__4 = IDL.Record({
    'votedBy' : IDL.Opt(IDL.Principal),
    'requestedBy' : IDL.Opt(IDL.Principal),
    'requestedIn' : IDL.Opt(Category__1),
  });
  const Sort__5 = IDL.Variant({ 'difference' : IDL.Null, 'recent' : IDL.Null });
  const Sort_4 = IDL.Record({ 'by' : Sort__5, 'order' : Order });
  const SharableFlag = IDL.Record({
    'id' : IDL.Nat,
    'requester' : IDL.Principal,
    'callerVote' : IDL.Opt(BinaryVote__1),
    'votes' : SharableBinaryVotes,
    'category' : Category,
    'requestDate' : Time__5,
    'reason' : IDL.Text,
  });
  const Sharable__24 = IDL.Vec(SharableFlag);
  const Pagination_4 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__23),
  });
  const Filter__3 = IDL.Record({
    'axiomsFrom' : IDL.Opt(IDL.Principal),
    'publishedAt' : IDL.Opt(IDL.Nat),
    'publishedBy' : IDL.Opt(IDL.Principal),
    'publishedIn' : IDL.Opt(IDL.Text),
    'votedBy' : IDL.Opt(IDL.Principal),
    'bookmarksFrom' : IDL.Opt(IDL.Principal),
    'containsPattern' : IDL.Opt(IDL.Text),
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
  const SharableCount = IDL.Nat;
  const Choice__1 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
    'Neutral' : IDL.Null,
  });
  const TernaryVote__2 = IDL.Record({
    'value' : IDL.Nat,
    'choice' : Choice__1,
  });
  const OneSideSharable = IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat);
  const SharableTernaryVotes = IDL.Record({
    'powered' : OneSideSharable,
    'regular' : OneSideSharable,
  });
  const SharableHypothesis = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'axioms' : SharableCount,
    'callerVote' : IDL.Opt(TernaryVote__2),
    'votes' : SharableTernaryVotes,
    'publishDate' : IDL.Int,
    'publisher' : IDL.Principal,
    'callerAxiom' : IDL.Opt(IDL.Bool),
    'callerBookmark' : IDL.Opt(IDL.Bool),
    'fieldId' : IDL.Text,
    'evidenceIds' : IDL.Vec(IDL.Nat),
  });
  const Sharable__22 = IDL.Vec(SharableHypothesis);
  const Sharable__21 = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'axioms' : SharableCount,
    'callerVote' : IDL.Opt(TernaryVote__2),
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
    'result' : IDL.Vec(Sharable__21),
  });
  const SharableEarning__2 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const TernaryVote__1 = IDL.Record({
    'value' : IDL.Nat,
    'choice' : Choice__1,
  });
  const BinaryVote = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__2 });
  const Sharable__20 = IDL.Record({
    'evidences' : IDL.Vec(IDL.Nat),
    'earning' : SharableEarning__2,
    'joinedFields' : IDL.Vec(IDL.Text),
    'axioms' : IDL.Vec(IDL.Nat),
    'votedHypotheses' : IDL.Vec(IDL.Tuple(IDL.Nat, TernaryVote__1)),
    'bookmarks' : IDL.Vec(IDL.Nat),
    'hypotheses' : IDL.Vec(IDL.Nat),
    'votedEvidences' : IDL.Vec(IDL.Tuple(IDL.Nat, BinaryVote)),
  });
  const Axioms = IDL.Service({
    'addToAxioms' : IDL.Func([IDL.Nat], [], []),
    'addToBookmarks' : IDL.Func([IDL.Nat], [], []),
    'createField' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'getAgePayout' : IDL.Func([IDL.Nat, IDL.Nat], [Sharable__30], ['query']),
    'getAgePayouts' : IDL.Func([IDL.Nat], [Sharable__29], ['query']),
    'getAgesPayout' : IDL.Func([IDL.Nat], [Sharable__29], ['query']),
    'getAgesPayouts' : IDL.Func([], [IDL.Vec(Sharable__29)], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getEarning' : IDL.Func([IDL.Principal], [Sharable__7], ['query']),
    'getEvidence' : IDL.Func([IDL.Nat], [Sharable__27], ['query']),
    'getEvidences' : IDL.Func([Filter__6, Sort_6], [Sharable__28], ['query']),
    'getEvidencesPagination' : IDL.Func(
        [Filter__6, Sort_6, IDL.Nat, IDL.Nat],
        [Pagination_6],
        ['query'],
      ),
    'getField' : IDL.Func([IDL.Text], [Sharable__25], ['query']),
    'getFields' : IDL.Func([Filter__5, Sort_5], [Sharable__26], ['query']),
    'getFieldsPagination' : IDL.Func(
        [Filter__5, Sort_5, IDL.Nat, IDL.Nat],
        [Pagination_5],
        ['query'],
      ),
    'getFlag' : IDL.Func([Header], [Sharable__23], ['query']),
    'getFlags' : IDL.Func([Filter__4, Sort_4], [Sharable__24], ['query']),
    'getFlagsPagination' : IDL.Func(
        [Filter__4, Sort_4, IDL.Nat, IDL.Nat],
        [Pagination_4],
        ['query'],
      ),
    'getHypotheses' : IDL.Func([Filter__3, Sort_3], [Sharable__22], ['query']),
    'getHypothesesPagination' : IDL.Func(
        [Filter__3, Sort_3, IDL.Nat, IDL.Nat],
        [Pagination_3],
        ['query'],
      ),
    'getHypothesis' : IDL.Func([IDL.Nat], [Sharable__21], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__20], ['query']),
    'initialize' : IDL.Func([], [], []),
    'joinField' : IDL.Func([IDL.Text], [], []),
    'leaveField' : IDL.Func([IDL.Text], [], []),
    'publishEvidence' : IDL.Func([IDL.Nat, Form, Choice__2], [IDL.Nat], []),
    'publishHypothesis' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal], [], []),
    'removeEvidenceVote' : IDL.Func([IDL.Nat], [], []),
    'removeFlagVote' : IDL.Func([Header], [], []),
    'removeFromAxioms' : IDL.Func([IDL.Nat], [], []),
    'removeFromBookmarks' : IDL.Func([IDL.Nat], [], []),
    'removeHypothesisVote' : IDL.Func([IDL.Nat], [], []),
    'requestFlag' : IDL.Func([Header, IDL.Text], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'voteEvidence' : IDL.Func([IDL.Nat, Choice__2], [], []),
    'voteFlag' : IDL.Func([Header, Choice__2], [], []),
    'voteHypothesis' : IDL.Func([IDL.Nat, Choice__1], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  const Sharable__19 = IDL.Nat;
  const Sharable__17 = IDL.Record({
    'title' : IDL.Text,
    'principal' : IDL.Principal,
    'ballots' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'isCustodian' : IDL.Bool,
    'callerBallot' : IDL.Opt(IDL.Nat),
  });
  const Filter__2 = IDL.Record({
    'votedBy' : IDL.Opt(IDL.Principal),
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
  const Sharable__18 = IDL.Vec(SharableNominee);
  const Pagination_2 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__17),
  });
  const Choice = IDL.Variant({
    'Delegated' : IDL.Null,
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const UniformBinaryVote__1 = IDL.Record({ 'choice' : Choice });
  const Delegable__2 = IDL.Variant({
    'Delegated' : IDL.Principal,
    'Default' : UniformBinaryVote__1,
  });
  const ConfigurableActorVariant = IDL.Variant({
    'DAO' : IDL.Null,
    'Sales' : IDL.Null,
    'Escrow' : IDL.Null,
    'Split' : IDL.Null,
    'Facade' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'Treasury' : IDL.Null,
  });
  const SharableConfigs = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const ActorsConfigs__1 = IDL.Vec(
    IDL.Tuple(ConfigurableActorVariant, SharableConfigs)
  );
  const UpdateLevel__1 = IDL.Variant({
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
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const SharableCommitment = IDL.Record({
    'moduleHash' : IDL.Text,
    'args' : IDL.Vec(IDL.Nat8),
    'actorVariant' : DeployableActorVariant,
  });
  const SharableCommitments = IDL.Vec(SharableCommitment);
  const SharableInstallation = IDL.Record({
    'updateLevel' : UpdateLevel__1,
    'releaseNotes' : ReleaseNotes,
    'commitments' : SharableCommitments,
    'commitHash' : IDL.Text,
  });
  const SharableCode = IDL.Record({
    'actorsConfigs' : ActorsConfigs__1,
    'installation' : SharableInstallation,
  });
  const SharableField = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const SharableConfigs__1 = IDL.Record({ 'actorsConfigs' : ActorsConfigs__1 });
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
  const Time__4 = IDL.Int;
  const Milestone = IDL.Record({ 'status' : Status, 'date' : Time__4 });
  const Sharable__15 = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'icpReward' : IDL.Nat,
    'content' : IDL.Text,
    'callerVote' : IDL.Opt(Delegable__2),
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
  const ProposalVariant = IDL.Variant({
    'Code' : IDL.Null,
    'Field' : IDL.Null,
    'Configs' : IDL.Null,
    'Worker' : IDL.Null,
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
  const Filter__1 = IDL.Record({
    'votedBy' : IDL.Opt(IDL.Principal),
    'proposedBy' : IDL.Opt(IDL.Principal),
    'proposedIn' : IDL.Opt(ProposalVariant),
    'withStatus' : IDL.Opt(StatusVariant),
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
    'callerVote' : IDL.Opt(Delegable__2),
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
  const Sharable__16 = IDL.Vec(SharableProposal);
  const Pagination_1 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__15),
  });
  List__1.fill(IDL.Opt(IDL.Tuple(IDL.Nat, List__1)));
  const List = IDL.Opt(IDL.Tuple(IDL.Nat, List__1));
  const SharableEarning__1 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const TernaryVote = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__1 });
  const Time__3 = IDL.Int;
  const UniformBinaryVote = IDL.Record({ 'choice' : Choice });
  const Delegable__1 = IDL.Variant({
    'Delegated' : IDL.Principal,
    'Default' : UniformBinaryVote,
  });
  const Sharable__14 = IDL.Record({
    'ballots' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'referendums' : List,
    'icpEarning' : SharableEarning__1,
    'referendumVotes' : IDL.Vec(IDL.Tuple(IDL.Nat, TernaryVote)),
    'acornEarning' : SharableEarning__1,
    'lastUpdateBallot' : Time__3,
    'proposalVotes' : IDL.Vec(IDL.Tuple(IDL.Nat, Delegable__1)),
    'proposals' : List,
  });
  const UpdateLevel = IDL.Variant({
    'Patch' : IDL.Null,
    'Major' : IDL.Null,
    'Minor' : IDL.Null,
  });
  const Sharable = IDL.Vec(SharableCommitment);
  const ActorsConfigs = IDL.Vec(
    IDL.Tuple(ConfigurableActorVariant, SharableConfigs)
  );
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
    'getDaysInPeriod' : IDL.Func([], [Sharable__19], ['query']),
    'getEarning' : IDL.Func(
        [IDL.Principal],
        [Sharable__7, Sharable__7],
        ['query'],
      ),
    'getNominee' : IDL.Func([IDL.Principal], [Sharable__17], ['query']),
    'getNominees' : IDL.Func([Filter__2, Sort_2], [Sharable__18], ['query']),
    'getNomineesPagination' : IDL.Func(
        [Filter__2, Sort_2, IDL.Nat, IDL.Nat],
        [Pagination_2],
        ['query'],
      ),
    'getProposal' : IDL.Func([IDL.Nat], [Sharable__15], ['query']),
    'getProposals' : IDL.Func([Filter__1, Sort_1], [Sharable__16], ['query']),
    'getProposalsPagination' : IDL.Func(
        [Filter__1, Sort_1, IDL.Nat, IDL.Nat],
        [Pagination_1],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__14], ['query']),
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
  const Option = IDL.Variant({
    'Perpetual' : IDL.Null,
    'Double' : IDL.Null,
    'Octuple' : IDL.Null,
    'Quadruple' : IDL.Null,
    'Single' : IDL.Null,
  });
  const Time__2 = IDL.Int;
  const SharableE8S__2 = IDL.Nat;
  const SharableBurial = IDL.Record({
    'issueDate' : Time__2,
    'coefficient' : IDL.Nat,
    'expiryDate' : Time__2,
    'claimableInterest' : SharableE8S__2,
    'amount' : SharableE8S__2,
  });
  const Sharable__13 = IDL.Vec(SharableBurial);
  const SharableBurials = IDL.Vec(SharableBurial);
  const Sharable__12 = IDL.Record({ 'burials' : SharableBurials });
  const Escrow = IDL.Service({
    'bury' : IDL.Func([IDL.Nat, Option], [], []),
    'expectUserNotFound' : IDL.Func([IDL.Principal], [], ['query']),
    'getBurials' : IDL.Func([IDL.Principal], [Sharable__13], ['query']),
    'getBuriedAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getClaimableAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getExpiredAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getInterestAmount' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__12], ['query']),
    'getVotingPower' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'initialize' : IDL.Func([], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'withdrawAll' : IDL.Func([], [], []),
  });
  const Hyperlink = IDL.Record({ 'url' : IDL.Text, 'anchorText' : IDL.Text });
  const Time__1 = IDL.Int;
  const Sharable__11 = IDL.Record({
    'principal' : IDL.Principal,
    'username' : IDL.Text,
    'links' : IDL.Vec(Hyperlink),
    'creationDate' : Time__1,
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
  const Sort = IDL.Record({ 'by' : Sort__1, 'order' : Order });
  const Pagination = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__11),
  });
  const Facade = IDL.Service({
    'editAvatar' : IDL.Func([IDL.Opt(Picture)], [], []),
    'editLinks' : IDL.Func([IDL.Vec(Hyperlink__1)], [], []),
    'editLocation' : IDL.Func([IDL.Opt(IDL.Text)], [], []),
    'editUsername' : IDL.Func([IDL.Text], [], []),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__11], ['query']),
    'getUserIdentifier' : IDL.Func(
        [IdentifierVariant],
        [Identifier],
        ['query'],
      ),
    'getUsers' : IDL.Func([Filter, Sort], [IDL.Vec(Sharable__11)], ['query']),
    'getUsersCount' : IDL.Func([], [IDL.Nat], ['query']),
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
  });
  const ICPUSD = IDL.Service({
    'exchange' : IDL.Func([IDL.Bool, IDL.Nat], [IDL.Nat], []),
  });
  const ACORNToMint = IDL.Record({ 'buried' : IDL.Nat, 'liquid' : IDL.Nat });
  const LogoResult = IDL.Record({ 'data' : IDL.Text, 'logo_type' : IDL.Text });
  const Dip721NonFungibleToken = IDL.Record({
    'maxLimit' : IDL.Nat16,
    'logo' : LogoResult,
    'name' : IDL.Text,
    'symbol' : IDL.Text,
  });
  const SharablePackage = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'metadata' : Dip721NonFungibleToken,
    'capitalRaised' : IDL.Nat,
  });
  const Sharable__10 = IDL.Vec(SharablePackage);
  const Sales = IDL.Service({
    'addPackage' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [], []),
    'computeAcornToMint' : IDL.Func([IDL.Nat], [ACORNToMint], []),
    'expectPackageFound' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    'expectPackageNotFound' : IDL.Func([IDL.Nat], [], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__3], ['query']),
    'getDeployedPackages' : IDL.Func([], [Sharable__10], ['query']),
    'getOwnedPackages' : IDL.Func([IDL.Principal], [Sharable__10], []),
    'getPackagePrincipals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Principal))],
        ['query'],
      ),
    'getPackages' : IDL.Func([], [Sharable__10], ['query']),
    'mintPackage' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
  });
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
  const Sharable__4 = IDL.Nat;
  const SharableEarning = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const SharableProportion__1 = IDL.Tuple(IDL.Nat, IDL.Nat);
  const ActorVariant__1 = IDL.Variant({
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
  const Sharable__9 = IDL.Record({
    'earning' : SharableEarning,
    'proportion' : SharableProportion__1,
    'actorVariant' : ActorVariant__1,
  });
  const SharableDistribution = IDL.Record({
    'earning' : SharableEarning,
    'proportion' : SharableProportion__1,
    'actorVariant' : ActorVariant__1,
  });
  const Sharable__8 = IDL.Vec(SharableDistribution);
  const Split = IDL.Service({
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
    'Frontend' : IDL.Null,
    'Indicator' : IDL.Null,
    'Axioms' : IDL.Null,
    'Affiliate' : IDL.Null,
    'ACORN' : IDL.Null,
    'Treasury' : IDL.Null,
    'ICPUSD' : IDL.Null,
  });
  const Info = IDL.Record({
    'status' : IDL.Variant({
      'stopped' : IDL.Null,
      'stopping' : IDL.Null,
      'running' : IDL.Null,
    }),
    'moduleHash' : IDL.Text,
    'args' : IDL.Vec(IDL.Nat8),
    'cycles' : IDL.Nat,
    'commitHash' : IDL.Text,
    'memorySize' : IDL.Nat,
  });
  const Sharable__2 = IDL.Record({
    'updateLevel' : UpdateLevel__1,
    'releaseNotes' : ReleaseNotes,
    'commitments' : SharableCommitments,
    'commitHash' : IDL.Text,
  });
  const Sharable__1 = IDL.Text;
  const Indicator = IDL.Service({
    'ACORN' : IDL.Func([], [ACORN], ['query']),
    'Affiliate' : IDL.Func([], [Affiliate], ['query']),
    'Axioms' : IDL.Func([], [Axioms], ['query']),
    'DAO' : IDL.Func([], [DAO], ['query']),
    'Escrow' : IDL.Func([], [Escrow], ['query']),
    'Facade' : IDL.Func([], [Facade], ['query']),
    'ICPUSD' : IDL.Func([], [ICPUSD], ['query']),
    'Sales' : IDL.Func([], [Sales], ['query']),
    'Split' : IDL.Func([], [Split], ['query']),
    'Treasury' : IDL.Func([], [Treasury], ['query']),
    'checkInstallationSettled' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'clearCommitment' : IDL.Func([DeployableVariant], [], []),
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
    'putActorsConfigs' : IDL.Func([ActorsConfigs], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setActorsConfigs' : IDL.Func([ActorsConfigs], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'settleCommitment' : IDL.Func([DeployableVariant], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'topUp' : IDL.Func([Variant, IDL.Nat], [], []),
    'uploadCommitmentChunk' : IDL.Func(
        [DeployableVariant, IDL.Nat8, IDL.Vec(IDL.Nat8), IDL.Text],
        [],
        [],
      ),
  });
  return Indicator;
};
export const init = ({ IDL }) => { return []; };
