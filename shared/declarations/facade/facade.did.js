export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  const List_1 = IDL.Rec();
  const List_2 = IDL.Rec();
  const List_3 = IDL.Rec();
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
  const Sharable__2 = IDL.Vec(IDL.Tuple(Key, SharableValue));
  const Time = IDL.Int;
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
  const BinaryChoice = IDL.Variant({
    'Negative' : IDL.Null,
    'Positive' : IDL.Null,
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
  const Category = IDL.Variant({
    'Hypothesis' : IDL.Null,
    'Evidence' : IDL.Null,
  });
  const FlagHeader = IDL.Record({ 'id' : IDL.Nat, 'category' : Category });
  const Hyperlink = IDL.Record({ 'url' : IDL.Text, 'anchorText' : IDL.Text });
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
  const Sharable__1 = IDL.Tuple(
    IDL.Vec(SharableUserVariant),
    IDL.Vec(SharableSystemVariant),
  );
  const Hyperlink__2 = IDL.Record({
    'url' : IDL.Text,
    'anchorText' : IDL.Text,
  });
  const Time__1 = IDL.Int;
  const Sharable = IDL.Record({
    'principal' : IDL.Principal,
    'username' : IDL.Text,
    'links' : IDL.Vec(Hyperlink__2),
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
  const SystemVariantParam__1 = IDL.Variant({
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
  const UserVariantParam__1 = IDL.Variant({
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
    'NewVotesToProposal' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewVotesToProposalData,
    }),
    'NewRepliesToEvidence' : IDL.Record({
      'id' : IDL.Nat,
      'data' : NewRepliesToEvidenceData,
    }),
  });
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
    'editLinks' : IDL.Func([IDL.Vec(Hyperlink__1)], [], []),
    'editLocation' : IDL.Func([IDL.Opt(IDL.Text)], [], []),
    'editUsername' : IDL.Func([IDL.Text], [], []),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__2], ['query']),
    'getNotification' : IDL.Func([], [Sharable__1], ['query']),
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
    'getUsersPrincipal' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'initialize' : IDL.Func([], [], []),
    'postSystemGenericNotification' : IDL.Func(
        [IDL.Text, IDL.Opt(Hyperlink__1)],
        [],
        [],
      ),
    'postSystemNotification' : IDL.Func([SystemVariantParam__1], [], []),
    'postSystemNotifications' : IDL.Func([SystemNotificationsBatch], [], []),
    'postUserNotification' : IDL.Func(
        [IDL.Principal, UserVariantParam__1],
        [],
        [],
      ),
    'postUserNotifications' : IDL.Func(
        [IDL.Principal, UserNotificationsBatch],
        [],
        [],
      ),
    'postUsersNotification' : IDL.Func(
        [UsersBatch, UserVariantParam__1],
        [],
        [],
      ),
    'postUsersNotifications' : IDL.Func([UsersNotificationsBatch], [], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'register' : IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Principal)], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'shiftToMidnight' : IDL.Func([IDL.Nat], [], []),
    'updateCapitalRaised' : IDL.Func([IDL.Principal, IDL.Nat], [], []),
  });
  return Facade;
};
export const init = ({ IDL }) => { return []; };
