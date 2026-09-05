import Link from "next/link";
import { RuleForm } from "@/components/admin/RuleForm";
import { listLicenseOptions } from "@/lib/admin/queries";
import { createRule } from "../../actions";
import type { RuleFormInput } from "@/lib/admin/ruleForm";

const BLANK: RuleFormInput = {
  category: "eatery",
  condition: "",
  license_id: "",
  sequence: "0",
};

export default async function NewRulePage() {
  const licenseOptions = await listLicenseOptions();

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-signage text-lg font-semibold text-ink">New rule</h2>
        <Link href="/admin/rules" className="font-signage text-sm font-semibold text-ink-secondary hover:text-ink">
          Cancel
        </Link>
      </div>
      <RuleForm
        action={createRule}
        initialValues={BLANK}
        licenseOptions={licenseOptions}
        submitLabel="Create rule"
      />
    </div>
  );
}
