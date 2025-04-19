export const idlFactory = ({ IDL }) => {
  const Achievement = IDL.Variant({
    'OctupleBurial' : IDL.Null,
    'Referral' : IDL.Null,
  });
  const ACORNToMint = IDL.Record({ 'buried' : IDL.Nat, 'liquid' : IDL.Nat });
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
  const Sharable__1 = IDL.Vec(SharableAchievementPackage);
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
  const SharablePackage = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'metadata' : Dip721NonFungibleToken,
    'capitalRaised' : IDL.Nat,
  });
  const Sharable = IDL.Vec(SharablePackage);
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
    'getAchievementPackagePrincipals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(Achievement, IDL.Principal))],
        ['query'],
      ),
    'getAchievementPackages' : IDL.Func([], [Sharable__1], ['query']),
    'getConfig' : IDL.Func([Key], [SharableValue], ['query']),
    'getConfigs' : IDL.Func([], [Sharable__2], ['query']),
    'getOwnedAchievementPackages' : IDL.Func(
        [IDL.Principal],
        [Sharable__1],
        [],
      ),
    'getOwnedPackages' : IDL.Func([IDL.Principal], [Sharable], []),
    'getPackagePrincipals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Principal))],
        ['query'],
      ),
    'getPackages' : IDL.Func([], [Sharable], ['query']),
    'initialize' : IDL.Func([], [], []),
    'mintAchievementPackage' : IDL.Func([Achievement], [], []),
    'mintPackage' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Nat], []),
    'putConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'setConfigs' : IDL.Func([IDL.Vec(IDL.Tuple(Key, SharableValue))], [], []),
    'upgradePackage' : IDL.Func([], [], []),
  });
  return Sales;
};
export const init = ({ IDL }) => { return []; };
