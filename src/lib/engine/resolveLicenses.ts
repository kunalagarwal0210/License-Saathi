/**
 * The deterministic licensing rules engine (ticket 03) — LicenseSaathi's
 * moat. Pure function: `(category, answers, rulesSource) -> OrderedLicense[]`.
 * No LLM, no DB, no UI import. Rules and licences are always supplied by the
 * caller via `rulesSource` (in-memory fixtures today, Supabase-backed rows
 * later) — this file never hardcodes an answer-to-licence mapping.
 */
import type {
  AnswerKey,
  Answers,
  BusinessCategory,
  License,
  OrderedLicense,
  RuleCondition,
  RulesSource,
} from "./types";

export function resolveLicenses(
  category: BusinessCategory,
  answers: Answers,
  rulesSource: RulesSource
): OrderedLicense[] {
  const matchedIds = new Set<string>();
  for (const rule of rulesSource.rules) {
    if (rule.category !== category) continue;
    if (matchesConditions(rule.conditions, answers)) {
      matchedIds.add(rule.grantsLicenseId);
    }
  }

  const licenseById = new Map(rulesSource.licenses.map((license) => [license.id, license]));
  const selected = [...matchedIds]
    .map((id) => licenseById.get(id))
    .filter((license): license is License => license !== undefined);

  return topologicalSort(selected, licenseById);
}

function matchesConditions(conditions: RuleCondition, answers: Answers): boolean {
  return (Object.keys(conditions) as AnswerKey[]).every((key) => {
    const expected = conditions[key];
    const actual = answers[key];
    if (Array.isArray(expected)) {
      return (expected as unknown[]).includes(actual);
    }
    return actual === expected;
  });
}

/**
 * Kahn's algorithm: prerequisites first, deterministic for equal rank via
 * `License.order` (then `id`) as a stable tie-break. Throws if the subgraph
 * induced by `selected` (edges restricted to licences also in `selected`)
 * contains a cycle.
 */
function topologicalSort(selected: License[], licenseById: Map<string, License>): License[] {
  const selectedIds = new Set(selected.map((license) => license.id));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const license of selected) {
    inDegree.set(license.id, 0);
    dependents.set(license.id, []);
  }
  for (const license of selected) {
    for (const prereqId of license.dependsOn) {
      if (!selectedIds.has(prereqId)) continue; // dependency not in this result set
      inDegree.set(license.id, (inDegree.get(license.id) ?? 0) + 1);
      dependents.get(prereqId)?.push(license.id);
    }
  }

  const compareIds = (a: string, b: string): number => {
    const orderA = licenseById.get(a)?.order ?? Number.POSITIVE_INFINITY;
    const orderB = licenseById.get(b)?.order ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    return a < b ? -1 : a > b ? 1 : 0;
  };

  const ready = selected
    .filter((license) => inDegree.get(license.id) === 0)
    .map((license) => license.id)
    .sort(compareIds);

  const result: License[] = [];
  while (ready.length > 0) {
    const id = ready.shift() as string;
    result.push(licenseById.get(id) as License);
    for (const dependentId of dependents.get(id) ?? []) {
      const remaining = (inDegree.get(dependentId) ?? 0) - 1;
      inDegree.set(dependentId, remaining);
      if (remaining === 0) {
        ready.push(dependentId);
        ready.sort(compareIds);
      }
    }
  }

  if (result.length !== selected.length) {
    const unresolved = selected
      .map((license) => license.id)
      .filter((id) => !result.some((license) => license.id === id));
    throw new Error(
      `Dependency cycle detected among licences: ${unresolved.join(", ")}`
    );
  }

  return result;
}
