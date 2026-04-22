import { redirect } from "next/navigation";
import { buildDynamicPageMetadata } from "@/lib/seo/dynamic-metadata";

export async function generateMetadata() {
  return buildDynamicPageMetadata("support", {
    title: "Feedback - Story Teller",
    description:
      "Submit product feedback and bug reports directly from Story Teller.",
    canonicalPath: "/support",
  });
}

export default function SupportPage() {
  redirect("/feedback");
}
