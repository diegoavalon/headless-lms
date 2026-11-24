import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { genId } from "@headless-lms/core/shared/id";
import { DrizzleContentRepository } from "./content.js";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("course categories on Postgres", () => {
  let pool: pg.Pool;
  let repo: DrizzleContentRepository;
  const org = genId("organization");
  const otherOrg = genId("organization");
  let restrictedCourseId: string;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: url });
    repo = new DrizzleContentRepository(drizzle(pool));
    const owner = genId("user");
    await pool.query("insert into users (id, external_id, email) values ($1, $1, $2)", [
      owner,
      `${owner}@test`,
    ]);
    for (const id of [org, otherOrg]) {
      await pool.query(
        "insert into organizations (id, external_id, name, slug, owner_id) values ($1, $1, 'Org', $1, $2)",
        [id, owner],
      );
    }
    await repo.createCourse(org, { title: "Safety", category: "Safety, 100%" }, "safety");
    await repo.createCourse(org, { title: "Legacy", category: " safety, 100% " }, "legacy");
    await repo.createCourse(org, { title: "Different", category: "Safety, 100 percent" }, "different");
    await repo.createCourse(org, { title: "Blank" }, "blank");
    const restricted = await repo.createCourse(
      org,
      { title: "Field work", category: "Field work" },
      "field-work",
    );
    restrictedCourseId = restricted.id;
    await repo.createCourse(otherOrg, { title: "Other", category: "Other org" }, "other");
  });

  afterAll(async () => {
    await pool?.end();
  });

  it("groups equivalent names, skips blanks, and respects course and organization scope", async () => {
    const categories = await repo.listCourseCategories(org);
    expect(categories.map((value) => value.toLowerCase()).sort()).toEqual([
      "field work",
      "safety, 100 percent",
      "safety, 100%",
    ]);
    await expect(repo.listCourseCategories(org, [restrictedCourseId])).resolves.toEqual([
      "Field work",
    ]);
    await expect(repo.listCourseCategories(otherOrg)).resolves.toEqual(["Other org"]);
    await expect(repo.listCourseCategories(otherOrg, [restrictedCourseId])).resolves.toEqual([]);
  });

  it("filters across case variants and treats punctuation literally", async () => {
    const result = await repo.listCourses(org, {
      category: "SAFETY, 100%",
      page: 1,
      pageSize: 1,
      sort: "title",
    });
    expect(result.total).toBe(2);
    expect(result.rows.map(({ title }) => title)).toEqual(["Legacy"]);
  });
});
