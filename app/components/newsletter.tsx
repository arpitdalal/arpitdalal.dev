import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useFetcher, type FetcherWithComponents } from "react-router";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { z } from "zod";
import { ErrorList } from "#app/components/error-list";
import { Field } from "#app/components/field";
import { Button } from "#app/components/ui/button";
import { Icon } from "#app/components/ui/icon";
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
}: {
  autoFocusInput?: boolean;
}) {
  const newsletterFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "newsletter-form",
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
      className="mt-4"
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
          }}
          errors={fields.email.errors}
        />
        <div className="flex justify-end">
          <SubmitButton
            state={newsletterFetcher.state}
            data={newsletterFetcher.data}
          />
        </div>
      </div>
      <div className="min-h-[32px] pb-4">
        <ErrorList
          id="newsletter-errors"
          errors={[newsletterFetcher.data?.error]}
        />
      </div>
    </newsletterFetcher.Form>
  );
}

const Y_CHANGE = 30;
function SubmitButton({
  state,
  data,
}: {
  state: FetcherWithComponents<typeof action>["state"];
  data: Awaited<ReturnType<typeof action>> | undefined;
}) {
  const [showStatus, setShowStatus] = useState<"success" | "error" | null>(
    null,
  );
  const isSubmitting = state === "submitting";
  const isSuccess = state === "idle" && data && !data.error;
  const isError = state === "idle" && data && data.error;

  useEffect(() => {
    if (isSuccess || isError) {
      setShowStatus(isSuccess ? "success" : "error");
      const timeout = setTimeout(() => {
        setShowStatus(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, isError]);

  return (
    <Button
      type="submit"
      className="group/submit mt-[22px] overflow-hidden transition-colors"
      variant={
        showStatus === "success"
          ? "success"
          : showStatus === "error"
            ? "destructive"
            : "default"
      }
      size="icon"
      disabled={isSubmitting || !!showStatus}
    >
      <div className="relative flex h-7 w-full items-center justify-center">
        <motion.div
          initial={false}
          animate={{
            y: isSubmitting ? Y_CHANGE : showStatus ? Y_CHANGE : 0,
            opacity: isSubmitting || showStatus ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 flex items-center justify-center gap-2"
        >
          <Icon
            name="arrow-right-outline"
            className="size-4 motion-safe:group-hover/submit:animate-bounce-right"
          />
        </motion.div>

        <motion.div
          initial={{ y: -Y_CHANGE, opacity: 0 }}
          animate={{
            y: isSubmitting ? 0 : -Y_CHANGE,
            opacity: isSubmitting ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 flex items-center justify-center gap-2"
        >
          <Icon
            name="refresh-outline"
            className="size-4 motion-safe:animate-spin"
          />
        </motion.div>

        <motion.div
          initial={{ y: -Y_CHANGE, opacity: 0 }}
          animate={{
            y: showStatus ? 0 : -Y_CHANGE,
            opacity: showStatus ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 flex items-center justify-center gap-2"
        >
          <motion.span
            initial={false}
            animate={{
              scale: showStatus ? [0.5, 1] : 0.5,
            }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 400,
              damping: 10,
            }}
          >
            <Icon
              name={showStatus === "success" ? "check-outline" : "x-outline"}
              className="size-4"
            />
          </motion.span>
        </motion.div>
      </div>
    </Button>
  );
}
