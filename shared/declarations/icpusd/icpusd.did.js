export const idlFactory = ({ IDL }) => {
  const ICPUSD = IDL.Service({
    'exchange' : IDL.Func([IDL.Bool, IDL.Nat], [IDL.Nat], []),
  });
  return ICPUSD;
};
export const init = ({ IDL }) => { return []; };
