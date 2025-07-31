export const idlFactory = ({ IDL }) => {
  const Entry = IDL.Record({ 'rank' : IDL.Int, 'score' : IDL.Int });
  const SharableRank = IDL.Record({
    'poweredEntry' : Entry,
    'regularEntry' : Entry,
    'averageRank' : IDL.Float64,
    'hypothesisId' : IDL.Nat,
  });
  const SharableRanks = IDL.Vec(SharableRank);
  const SharableE8S__2 = IDL.Nat;
  const Sharable__14 = IDL.Record({
    'ranks' : SharableRanks,
    'callerRevenue' : IDL.Opt(SharableE8S__2),
  });
  const SharablePayout = IDL.Record({
    'ranks' : SharableRanks,
    'callerRevenue' : IDL.Opt(SharableE8S__2),
  });
  const Sharable__13 = IDL.Vec(SharablePayout);
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
  const Sharable__12 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Time = IDL.Int;
  const SharableE8S__1 = IDL.Nat;
  const Sharable__11 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const Choice__1 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const BinaryVote__2 = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__1 });
  const OneSideSharable__1 = IDL.Tuple(IDL.Nat, IDL.Nat);
  const SharableBinaryVotes__1 = IDL.Record({
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
  const BinaryChoice__1 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const Sharable__9 = IDL.Record({
    'id' : IDL.Nat,
    'callerVote' : IDL.Opt(BinaryVote__2),
    'votes' : SharableBinaryVotes__1,
    'publishDate' : IDL.Int,
    'form' : Form,
    'publisher' : IDL.Principal,
    'repliedTo' : IDL.Opt(IDL.Nat),
    'replies' : IDL.Vec(IDL.Nat),
    'choice' : BinaryChoice__1,
    'hypothesisId' : IDL.Nat,
  });
  const BinaryChoice = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
  });
  const Filter__3 = IDL.Record({
    'q' : IDL.Opt(IDL.Text),
    'voter' : IDL.Opt(IDL.Principal),
    'publisher' : IDL.Opt(IDL.Principal),
    'side' : IDL.Opt(BinaryChoice),
    'agoEnd' : IDL.Opt(IDL.Nat),
    'hypothesis' : IDL.Opt(IDL.Nat),
    'repliedTo' : IDL.Opt(IDL.Nat),
    'agoStart' : IDL.Opt(IDL.Nat),
  });
  const Sort__4 = IDL.Variant({
    'positivity' : IDL.Null,
    'negativity' : IDL.Null,
    'popularity' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Order = IDL.Variant({
    'descending' : IDL.Null,
    'ascending' : IDL.Null,
  });
  const Sort_3 = IDL.Record({ 'by' : Sort__4, 'order' : Order });
  const SharableEvidence = IDL.Record({
    'id' : IDL.Nat,
    'callerVote' : IDL.Opt(BinaryVote__2),
    'votes' : SharableBinaryVotes__1,
    'publishDate' : IDL.Int,
    'form' : Form,
    'publisher' : IDL.Principal,
    'repliedTo' : IDL.Opt(IDL.Nat),
    'replies' : IDL.Vec(IDL.Nat),
    'choice' : BinaryChoice__1,
    'hypothesisId' : IDL.Nat,
  });
  const Sharable__10 = IDL.Vec(SharableEvidence);
  const Pagination_3 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__9),
  });
  const Role = IDL.Variant({ 'Guest' : IDL.Null, 'Member' : IDL.Null });
  const Time__2 = IDL.Int;
  const Sharable__7 = IDL.Record({
    'members' : IDL.Vec(IDL.Principal),
    'hypothesisIds' : IDL.Vec(IDL.Nat),
    'callerRole' : IDL.Opt(Role),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'creationDate' : Time__2,
  });
  const Filter__2 = IDL.Record({
    'q' : IDL.Opt(IDL.Text),
    'member' : IDL.Opt(IDL.Principal),
  });
  const Sort__3 = IDL.Variant({
    'alphabetical' : IDL.Null,
    'popularity' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort_2 = IDL.Record({ 'by' : Sort__3, 'order' : Order });
  const SharableField = IDL.Record({
    'members' : IDL.Vec(IDL.Principal),
    'hypothesisIds' : IDL.Vec(IDL.Nat),
    'callerRole' : IDL.Opt(Role),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'creationDate' : Time__2,
  });
  const Sharable__8 = IDL.Vec(SharableField);
  const Pagination_2 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__7),
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
  const BinaryVote__1 = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__1 });
  const SharableBinaryVotes = IDL.Record({
    'powered' : OneSideSharable__1,
    'regular' : OneSideSharable__1,
  });
  const Time__1 = IDL.Int;
  const Sharable__5 = IDL.Record({
    'id' : IDL.Nat,
    'status' : Status__1,
    'requester' : IDL.Principal,
    'callerVote' : IDL.Opt(BinaryVote__1),
    'votes' : SharableBinaryVotes,
    'category' : Category,
    'requestDate' : Time__1,
    'reason' : IDL.Text,
  });
  const Status = IDL.Variant({
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Requested' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const Category__1 = IDL.Variant({
    'Hypothesis' : IDL.Null,
    'Evidence' : IDL.Null,
  });
  const Filter__1 = IDL.Record({
    'status' : IDL.Opt(Status),
    'requester' : IDL.Opt(IDL.Principal),
    'voter' : IDL.Opt(IDL.Principal),
    'category' : IDL.Opt(Category__1),
  });
  const Sort__2 = IDL.Variant({ 'difference' : IDL.Null, 'recent' : IDL.Null });
  const Sort_1 = IDL.Record({ 'by' : Sort__2, 'order' : Order });
  const SharableFlag = IDL.Record({
    'id' : IDL.Nat,
    'status' : Status__1,
    'requester' : IDL.Principal,
    'callerVote' : IDL.Opt(BinaryVote__1),
    'votes' : SharableBinaryVotes,
    'category' : Category,
    'requestDate' : Time__1,
    'reason' : IDL.Text,
  });
  const Sharable__6 = IDL.Vec(SharableFlag);
  const Pagination_1 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__5),
  });
  const Filter = IDL.Record({
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
  const Sort__1 = IDL.Variant({
    'positivity' : IDL.Null,
    'neutrality' : IDL.Null,
    'negativity' : IDL.Null,
    'controversy' : IDL.Null,
    'popularity' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort = IDL.Record({ 'by' : Sort__1, 'order' : Order });
  const SharableCount = IDL.Nat;
  const Choice = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
    'Neutral' : IDL.Null,
  });
  const TernaryVote__1 = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice });
  const OneSideSharable = IDL.Tuple(IDL.Nat, IDL.Nat, IDL.Nat);
  const SharableTernaryVotes = IDL.Record({
    'powered' : OneSideSharable,
    'regular' : OneSideSharable,
  });
  const SharableHypothesis = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'axioms' : SharableCount,
    'callerVote' : IDL.Opt(TernaryVote__1),
    'votes' : SharableTernaryVotes,
    'publishDate' : IDL.Int,
    'publisher' : IDL.Principal,
    'callerAxiom' : IDL.Opt(IDL.Bool),
    'callerBookmark' : IDL.Opt(IDL.Bool),
    'fieldId' : IDL.Text,
    'evidenceIds' : IDL.Vec(IDL.Nat),
  });
  const Sharable__4 = IDL.Vec(SharableHypothesis);
  const Sharable__3 = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'axioms' : SharableCount,
    'callerVote' : IDL.Opt(TernaryVote__1),
    'votes' : SharableTernaryVotes,
    'publishDate' : IDL.Int,
    'publisher' : IDL.Principal,
    'callerAxiom' : IDL.Opt(IDL.Bool),
    'callerBookmark' : IDL.Opt(IDL.Bool),
    'fieldId' : IDL.Text,
    'evidenceIds' : IDL.Vec(IDL.Nat),
  });
  const Pagination = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__3),
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
  const TernaryVote = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice });
  const BinaryVote = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__1 });
  const Sharable__2 = IDL.Record({
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
  const Sharable__1 = IDL.Vec(SharableConfig);
  const Variant = IDL.Variant({
    'ExcludedPublishers' : IDL.Null,
    'ExcludedFields' : IDL.Null,
  });
  const Sharable = IDL.Variant({
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
    'getAgePayout' : IDL.Func([IDL.Nat, IDL.Nat], [Sharable__14], ['query']),
    'getAgePayouts' : IDL.Func([IDL.Nat], [Sharable__13], ['query']),
    'getAgesPayout' : IDL.Func([IDL.Nat], [Sharable__13], ['query']),
    'getAgesPayouts' : IDL.Func([], [IDL.Vec(Sharable__13)], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__12], ['query']),
    'getEarning' : IDL.Func([IDL.Principal], [Sharable__11], ['query']),
    'getEvidence' : IDL.Func([IDL.Nat], [Sharable__9], ['query']),
    'getEvidences' : IDL.Func([Filter__3, Sort_3], [Sharable__10], ['query']),
    'getEvidencesPagination' : IDL.Func(
        [Filter__3, Sort_3, IDL.Nat, IDL.Nat],
        [Pagination_3],
        ['query'],
      ),
    'getField' : IDL.Func([IDL.Text], [Sharable__7], ['query']),
    'getFields' : IDL.Func([Filter__2, Sort_2], [Sharable__8], ['query']),
    'getFieldsPagination' : IDL.Func(
        [Filter__2, Sort_2, IDL.Nat, IDL.Nat],
        [Pagination_2],
        ['query'],
      ),
    'getFlag' : IDL.Func([Header], [Sharable__5], ['query']),
    'getFlags' : IDL.Func([Filter__1, Sort_1], [Sharable__6], ['query']),
    'getFlagsPagination' : IDL.Func(
        [Filter__1, Sort_1, IDL.Nat, IDL.Nat],
        [Pagination_1],
        ['query'],
      ),
    'getHypotheses' : IDL.Func([Filter, Sort], [Sharable__4], ['query']),
    'getHypothesesPagination' : IDL.Func(
        [Filter, Sort, IDL.Nat, IDL.Nat],
        [Pagination],
        ['query'],
      ),
    'getHypothesis' : IDL.Func([IDL.Nat], [Sharable__3], ['query']),
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
    'getUser' : IDL.Func([IDL.Principal], [Sharable__2], ['query']),
    'getUserConfigs' : IDL.Func([], [Sharable__1], ['query']),
    'initialize' : IDL.Func([], [], []),
    'joinField' : IDL.Func([IDL.Text], [], []),
    'leaveField' : IDL.Func([IDL.Text], [], []),
    'publishEvidence' : IDL.Func(
        [IDL.Nat, Form, Choice__1, IDL.Opt(IDL.Nat)],
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
    'restoreUserConfig' : IDL.Func([Variant], [], []),
    'setAllUserConfigs' : IDL.Func([IDL.Vec(Sharable)], [], []),
    'setBatchUserConfigs' : IDL.Func([IDL.Vec(Sharable)], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setUserConfig' : IDL.Func([Sharable], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'unfollow' : IDL.Func([IDL.Principal], [], []),
    'voteEvidence' : IDL.Func(
        [IDL.Nat, Choice__1, IDL.Opt(CustomValue)],
        [],
        [],
      ),
    'voteFlag' : IDL.Func([Header, Choice__1], [], []),
    'voteHypothesis' : IDL.Func(
        [IDL.Nat, Choice, IDL.Opt(CustomValue)],
        [],
        [],
      ),
    'withdrawAll' : IDL.Func([], [], []),
  });
  return Axioms;
};
export const init = ({ IDL }) => { return []; };
