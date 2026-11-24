import type { ListParamsDefaults } from "@/lib/table/parse-list-params";

export const courseListDefaults = {
  pageSize: 20,
  initialSort: [{ id: "updatedAt", desc: true }],
  literalFilters: ["category"],
} satisfies ListParamsDefaults;
