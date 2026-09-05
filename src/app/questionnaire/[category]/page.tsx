import { notFound } from "next/navigation";
import { isCategory } from "@/lib/categories";
import { QuestionnaireFlow } from "@/components/QuestionnaireFlow";

type QuestionnairePageProps = {
  params: Promise<{ category: string }>;
};

// Real questionnaire (ticket 06), replacing the ticket-05 stub. Server shell
// validates the route param; all interaction lives in the client
// <QuestionnaireFlow> (one question at a time, per
// docs/UI_IMPLEMENTATION_SPEC.md §10).
export default async function QuestionnairePage({
  params,
}: QuestionnairePageProps) {
  const { category } = await params;

  if (!isCategory(category)) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <QuestionnaireFlow category={category} />
    </main>
  );
}
