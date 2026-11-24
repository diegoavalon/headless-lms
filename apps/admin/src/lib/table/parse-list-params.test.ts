import { expect, it } from "vitest";
import { parseListParams } from "./parse-list-params";

it("keeps commas in literal filters and still splits comma-separated facets", () => {
  const params = new URLSearchParams({
    f_category: "Safety, 100%",
    f_status: "draft,published",
  });

  expect(parseListParams(params, { pageSize: 20, literalFilters: ["category"] }).filters).toEqual({
    category: ["Safety, 100%"],
    status: ["draft", "published"],
  });
});
