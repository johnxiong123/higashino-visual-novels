// 条件求值：用于 choices[].requires 与 node.requires
// cond 形如：
//   { flags:["x"], notFlags:["y"], clues:["z"],
//     vars:{ suspicion:{gte:3} }, any:[cond...], all:[cond...], not:cond }
// 省略字段视为通过；同一对象内多个字段为「与」关系。

const CMP = {
  eq: (a, b) => a === b,
  ne: (a, b) => a !== b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
};

function evalVars(vars, state) {
  return Object.entries(vars).every(([name, test]) => {
    const v = state.getVar(name);
    if (typeof test === 'number') return v === test;
    return Object.entries(test).every(([op, val]) => (CMP[op] ? CMP[op](v, val) : true));
  });
}

export function evalCondition(cond, state) {
  if (!cond) return true;
  if (Array.isArray(cond.all) && !cond.all.every((c) => evalCondition(c, state))) return false;
  if (Array.isArray(cond.any) && cond.any.length && !cond.any.some((c) => evalCondition(c, state))) return false;
  if (cond.not && evalCondition(cond.not, state)) return false;
  if (Array.isArray(cond.flags) && !cond.flags.every((f) => state.hasFlag(f))) return false;
  if (Array.isArray(cond.notFlags) && cond.notFlags.some((f) => state.hasFlag(f))) return false;
  if (Array.isArray(cond.clues) && !cond.clues.every((c) => state.hasClue(c))) return false;
  if (cond.vars && !evalVars(cond.vars, state)) return false;
  return true;
}
