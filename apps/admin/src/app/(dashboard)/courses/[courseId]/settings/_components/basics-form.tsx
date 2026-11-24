"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Field } from "@/components/forms/field";
import { SettingsSection } from "@/components/forms/settings-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Course } from "@/lib/api/types";

import { updateCourseDetailsAction } from "../../actions";
import { CATEGORY_MAX_LENGTH, CourseCategoryField } from "../../../_components/course-category-field";

const schema = z.object({
  title: z.string().trim().min(1, "A title is required").max(120, "Keep it under 120 characters"),
  category: z.string().trim().min(1, "Pick a category").max(CATEGORY_MAX_LENGTH),
  description: z.string().trim().max(600, "Keep the description under 600 characters"),
});

type FormValues = z.infer<typeof schema>;

/** Settings → Basics: the course's title, category, and description. */
export function BasicsForm({ course, categories }: { course: Course; categories: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: course.title,
      category: course.category,
      description: course.description,
    },
  });

  // Re-sync when the server sends a fresh course (after a save revalidates).
  useEffect(() => {
    reset({ title: course.title, category: course.category, description: course.description });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id, course.title, course.category, course.description]);

  const category = useWatch({ control, name: "category" });

  function onValid(values: FormValues) {
    startTransition(async () => {
      try {
        await updateCourseDetailsAction(course.id, values);
        toast.success("Changes saved");
        router.refresh();
      } catch (err) {
        toast.error("Couldn't Save", { description: (err as Error).message });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <SettingsSection
        title="Details"
        description="How this course is titled and categorised across the product."
        footer={
          <Button type="submit" variant="primary" disabled={isPending || !isDirty}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        }
      >
        <Field id="title" label="Title" required error={errors.title?.message}>
          <Input id="title" {...register("title")} />
        </Field>
        <CourseCategoryField
          categories={categories}
          value={category}
          error={errors.category?.message}
          onValueChange={(name) =>
            setValue("category", name, { shouldValidate: true, shouldDirty: true })
          }
        />
        <Field
          id="description"
          label="Description"
          hint="A short summary shown on the course card."
          error={errors.description?.message}
        >
          <Textarea id="description" rows={5} {...register("description")} />
        </Field>
      </SettingsSection>
    </form>
  );
}
