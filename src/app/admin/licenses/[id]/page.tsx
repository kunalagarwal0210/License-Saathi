import Link from "next/link";
import { notFound } from "next/navigation";
import { LicenseForm } from "@/components/admin/LicenseForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getLicense } from "@/lib/admin/queries";
import { updateLicense, deleteLicense } from "../../actions";
import type { LicenseFormInput } from "@/lib/admin/licenseForm";

export default async function EditLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const license = await getLicense(id);
  if (!license) notFound();

  const initialValues: LicenseFormInput = {
    name: license.name,
    description: license.description,
    category: license.category,
    govt_fee_inr: license.govt_fee_inr === null ? "" : String(license.govt_fee_inr),
    rough_timeline: license.rough_timeline,
    portal_deep_link: license.portal_deep_link,
    required_documents: license.required_documents.join("\n"),
    source_url: license.source_url ?? "",
    last_verified_date: license.last_verified_date ?? "",
    status: license.status,
  };

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-signage text-lg font-semibold text-ink">Edit licence</h2>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-signage text-sm font-semibold text-ink-secondary hover:text-ink">
            Cancel
          </Link>
          <DeleteButton
            action={deleteLicense.bind(null, license.id)}
            confirmMessage={`Delete "${license.name}"? This cannot be undone.`}
          />
        </div>
      </div>
      <LicenseForm
        action={updateLicense.bind(null, license.id)}
        initialValues={initialValues}
        submitLabel="Save changes"
      />
    </div>
  );
}
