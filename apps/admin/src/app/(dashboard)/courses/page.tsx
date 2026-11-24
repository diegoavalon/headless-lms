import { serverApi } from "@/lib/api/server";
import { requirePermission } from "@/lib/auth/server-permissions";
import { parseListParams } from "@/lib/table/parse-list-params";

import { CoursesTable } from "./courses-table";
import { courseListDefaults } from "./list-params";

// Courses list page: reads URL params, fetches server-side, renders the table.
export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("courses:read");
  const sp = await searchParams;
  const params = parseListParams(sp, courseListDefaults);

  const [{ rows, total }, categories] = await Promise.all([
    serverApi.listCourses(params),
    serverApi.listCourseCategories(),
  ]);

  return <CoursesTable rows={rows} total={total} params={params} categories={categories} />;
}
