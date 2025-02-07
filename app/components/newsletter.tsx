import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useFetcher } from "react-router";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { z } from "zod";
import { ErrorList } from "#app/components/error-list";
import { Field } from "#app/components/field";
import { SubmitButton } from "#app/components/submit-button";
import { type action } from "../routes/resources+/newsletter";

const NewsletterSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .min(1, "Email is required"),
});

export function Newsletter({
  autoFocusInput = false,
  isStandalone = false,
}: {
  autoFocusInput?: boolean;
  isStandalone?: boolean;
}) {
  const newsletterFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: isStandalone ? "newsletter-form-standalone" : "newsletter-form",
    constraint: getZodConstraint(NewsletterSchema),
    lastResult: newsletterFetcher.data?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NewsletterSchema });
    },
  });

  return (
    <newsletterFetcher.Form
      method="POST"
      action="/resources/newsletter"
      className={
        isStandalone ? "flex flex-col items-center justify-center" : "mt-4"
      }
      {...getFormProps(form)}
    >
      <HoneypotInputs />
      <div className="flex flex-row">
        <Field
          labelProps={{ children: "Email" }}
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: "Enter your email",
            autoFocus: autoFocusInput,
            className: "rounded-r-none",
          }}
          errors={fields.email.errors}
        />
        <SubmitButton
          state={newsletterFetcher.state}
          data={newsletterFetcher.data}
          size="icon"
          dataProps={{
            "data-umami-event": "newsletter-form-submit",
            "data-umami-event-email": fields.email.value ?? "",
          }}
        />
      </div>
      <div className="min-h-[32px] pb-4">
        <ErrorList id="newsletter-errors" errors={form.errors} />
      </div>
    </newsletterFetcher.Form>
  );
}
