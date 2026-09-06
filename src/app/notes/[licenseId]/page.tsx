import { notFound } from "next/navigation";
import { isEnabled } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FieldNoteForm } from "@/components/FieldNoteForm";

type NotesCapturePageProps = {
  params: Promise<{ licenseId: string }>;
};

// Ticket 15 — field-note capture page, gated behind FEATURE_REMINDERS (same
// flag as ticket 14). Reads the licence name via the anon, RLS-governed
// server client (licenses are public-select) purely for display + an
// existence check — a bad/unknown licenseId 404s here rather than letting
// the form silently attempt an insert that will only fail on submit via the
// FK constraint.
export const dynamic = "force-dynamic";

export default async function NotesCapturePage({ params }: NotesCapturePageProps) {
  if (!isEnabled("FEATURE_REMINDERS")) {
    notFound();
  }

  const { licenseId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: license, error } = await supabase
    .from("licenses")
    .select("name")
    .eq("id", licenseId)
    .maybeSingle();

  if (error || !license) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <div className="flex w-full max-w-[600px] flex-col gap-6">
        <p className="text-sm leading-relaxed text-ink-secondary">
          Tell us what actually happened when you dealt with this licence — an
          unlisted document, a surprise fee, anything that didn&rsquo;t match
          the checklist. It helps the next person, and it&rsquo;s reviewed
          before it&rsquo;s shown to anyone else.
        </p>
        <FieldNoteForm licenseId={licenseId} licenseName={license.name} />
      </div>
    </main>
  );
}
