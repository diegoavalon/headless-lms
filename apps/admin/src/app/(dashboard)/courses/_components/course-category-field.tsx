"use client";

import { Field } from "@/components/forms/field";
import { Combobox } from "@/components/ui/combobox";

export const CATEGORY_MAX_LENGTH = 100;

const defaultCategories = [
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "Data",
  "Leadership",
  "Finance",
  "Operations",
];

export function CourseCategoryField({
  categories,
  value,
  onValueChange,
  error,
}: {
  categories: string[];
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}) {
  const choices = new Map<string, string>();
  for (const name of [...categories, ...defaultCategories, value.trim()]) {
    const key = name.toLowerCase();
    if (key && !choices.has(key)) choices.set(key, name);
  }
  const options = [...choices.values()]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ label: name, value: name }));

  return (
    <Field id="category" label="Category" required error={error}>
      <Combobox
        id="category"
        value={choices.get(value.trim().toLowerCase()) ?? ""}
        onValueChange={onValueChange}
        options={options}
        placeholder="Select a category"
        searchPlaceholder="Search or add a category…"
        emptyText="Enter a category name up to 100 characters."
        aria-invalid={Boolean(error)}
        createOption={(query) =>
          query && query.length <= CATEGORY_MAX_LENGTH && !choices.has(query.toLowerCase())
            ? { value: query, label: `Use “${query}” as a new category` }
            : undefined
        }
      />
    </Field>
  );
}
