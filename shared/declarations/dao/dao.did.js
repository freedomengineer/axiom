export const idlFactory = ({ IDL }) => {
  const List__1 = IDL.Rec();
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
  const Sharable__8 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Sharable__7 = IDL.Nat;
  const Time = IDL.Int;
  const SharableE8S__1 = IDL.Nat;
  const Sharable__6 = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const Sharable__4 = IDL.Record({
    'title' : IDL.Text,
    'principal' : IDL.Principal,
    'ballots' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'isCustodian' : IDL.Bool,
    'callerBallot' : IDL.Opt(IDL.Nat),
  });
  const Filter__1 = IDL.Record({
    'voter' : IDL.Opt(IDL.Principal),
    'isCustodian' : IDL.Opt(IDL.Bool),
  });
  const Sort__2 = IDL.Variant({ 'token' : IDL.Null, 'voter' : IDL.Null });
  const Order = IDL.Variant({
    'descending' : IDL.Null,
    'ascending' : IDL.Null,
  });
  const Sort_1 = IDL.Record({ 'by' : Sort__2, 'order' : Order });
  const SharableNominee = IDL.Record({
    'title' : IDL.Text,
    'principal' : IDL.Principal,
    'ballots' : IDL.Tuple(IDL.Nat, IDL.Nat),
    'isCustodian' : IDL.Bool,
    'callerBallot' : IDL.Opt(IDL.Nat),
  });
  const Sharable__5 = IDL.Vec(SharableNominee);
  const Pagination_1 = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__4),
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
  const Time__2 = IDL.Int;
  const Milestone = IDL.Record({ 'status' : Status, 'date' : Time__2 });
  const Sharable__2 = IDL.Record({
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
  const Filter = IDL.Record({
    'status' : IDL.Opt(StatusVariant),
    'voter' : IDL.Opt(IDL.Principal),
    'category' : IDL.Opt(ProposalVariant),
    'proposer' : IDL.Opt(IDL.Principal),
  });
  const Sort__1 = IDL.Variant({
    'icpReward' : IDL.Null,
    'acornReward' : IDL.Null,
    'updated' : IDL.Null,
    'recent' : IDL.Null,
  });
  const Sort = IDL.Record({ 'by' : Sort__1, 'order' : Order });
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
  const Sharable__3 = IDL.Vec(SharableProposal);
  const Pagination = IDL.Record({
    'is' : IDL.Nat,
    'of' : IDL.Nat,
    'result' : IDL.Vec(Sharable__2),
  });
  List__1.fill(IDL.Opt(IDL.Tuple(IDL.Nat, List__1)));
  const List = IDL.Opt(IDL.Tuple(IDL.Nat, List__1));
  const SharableEarning = IDL.Record({
    'lastWithdrawAt' : Time,
    'revenue' : SharableE8S__1,
    'balance' : SharableE8S__1,
  });
  const Choice__1 = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
    'Neutral' : IDL.Null,
  });
  const TernaryVote = IDL.Record({ 'value' : IDL.Nat, 'choice' : Choice__1 });
  const Time__1 = IDL.Int;
  const UniformBinaryVote = IDL.Record({ 'choice' : Choice });
  const Delegable__1 = IDL.Variant({
    'Delegated' : IDL.Principal,
    'Default' : UniformBinaryVote,
  });
  const Sharable__1 = IDL.Record({
    'ballots' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'referendums' : List,
    'icpEarning' : SharableEarning,
    'referendumVotes' : IDL.Vec(IDL.Tuple(IDL.Nat, TernaryVote)),
    'acornEarning' : SharableEarning,
    'lastUpdateBallot' : Time__1,
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
    'getConfigs' : IDL.Func([], [Sharable__8], ['query']),
    'getDaysInPeriod' : IDL.Func([], [Sharable__7], ['query']),
    'getEarning' : IDL.Func(
        [IDL.Principal],
        [Sharable__6, Sharable__6],
        ['query'],
      ),
    'getNominee' : IDL.Func([IDL.Principal], [Sharable__4], ['query']),
    'getNominees' : IDL.Func([Filter__1, Sort_1], [Sharable__5], ['query']),
    'getNomineesPagination' : IDL.Func(
        [Filter__1, Sort_1, IDL.Nat, IDL.Nat],
        [Pagination_1],
        ['query'],
      ),
    'getProposal' : IDL.Func([IDL.Nat], [Sharable__2], ['query']),
    'getProposals' : IDL.Func([Filter, Sort], [Sharable__3], ['query']),
    'getProposalsPagination' : IDL.Func(
        [Filter, Sort, IDL.Nat, IDL.Nat],
        [Pagination],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Principal], [Sharable__1], ['query']),
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
  return DAO;
};
export const init = ({ IDL }) => { return []; };
