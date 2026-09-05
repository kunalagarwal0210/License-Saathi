import Link from "next/link";
import { LicenseForm } from "@/components/admin/LicenseForm";
import { createLicense } from "../../actions";
import type { LicenseFormInput } from "@/lib/admin/licenseForm";

const BLANK: LicenseFormInput = {
  name: "",
  description: "",
  category: "eatery",
  govt_fee_inr: "",
  rough_timeline: "",
  portal_deep_link: "",
  required_documents: "",
  source_url: "",
  last_verified_date: "",
  status: "flagged",
};

export default function NewLicensePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-signage text-lg font-semibold text-ink">New licence</h2>
        <Link href="/admin" className="font-signage text-sm font-semibold text-ink-secondary hover:text-ink">
          Cancel
        </Link>
      </div>
      <LicenseForm action={createLicense} initialValues={BLANK} submitLabel="Create licence" />
    </div>
  );
}
