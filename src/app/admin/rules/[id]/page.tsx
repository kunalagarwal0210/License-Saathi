import Link from "next/link";
import { notFound } from "next/navigation";
import { RuleForm } from "@/components/admin/RuleForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getRule, listLicenseOptions } from "@/lib/admin/queries";
import { updateRule, deleteRule } from "../../actions";
import type { RuleFormInput } from "@/lib/admin/ruleForm";

export default async function EditRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rule, licenseOptions] = await Promise.all([getRule(id), listLicenseOptions()]);
  if (!rule) notFound();

  const initialValues: RuleFormInput = {
    category: rule.category,
    condition: JSON.stringify(rule.condition),
    license_id: rule.license_id,
    sequence: String(rule.sequence),
  };

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-signage text-lg font-semibold text-ink">Edit rule</h2>
        <div className="flex items-center gap-4">
          <Link href="/admin/rules" className="font-signage text-sm font-semibold text-ink-secondary hover:text-ink">
            Cancel
          </Link>
          <DeleteButton
            action={deleteRule.bind(null, rule.id)}
            confirmMessage="Delete this rule? This cannot be undone."
          />
        </div>
      </div>
      <RuleForm
        action={updateRule.bind(null, rule.id)}
        initialValues={initialValues}
        licenseOptions={licenseOptions}
        submitLabel="Save changes"
      />
    </div>
  );
}
