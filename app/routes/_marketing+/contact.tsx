import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useFetcher, type FetcherWithComponents } from "react-router";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { z } from "zod";
import { ErrorList } from "#app/components/error-list";
import { Field } from "#app/components/field";
import {
  HeroHighlight,
  HeroHighlightDescription,
  HeroHighlightH1,
} from "#app/components/highlight";
import { LineGlow } from "#app/components/line-glow";
import { TextareaField } from "#app/components/textarea-field";
import { Button } from "#app/components/ui/button";
import { Icon } from "#app/components/ui/icon";
import { sendEmail } from "#app/utils/email";
import { checkHoneypot } from "#app/utils/honeypot.server";
import { type Route } from "./+types/contact";

export const meta: Route.MetaFunction = () => [
  {
    title: "Contact Arpit | Arpit Dalal",
  },
];

export const ContactSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .min(1, "Email is required"),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = parseWithZod(formData, { schema: ContactSchema });
  if (submission.status !== "success") {
    return { result: submission.reply(), success: false };
  }
  try {
    await sendEmail({
      subject: "Contact Form Submission - arpitdalal.dev",
      message: `${submission.value.name} (${submission.value.email}) says:\n\n${submission.value.message}`,
    });
    return {
      result: submission.reply({ resetForm: true }),
      success: true,
    };
  } catch (error) {
    console.error("Error sending email", error);
    return {
      result: submission.reply({
        formErrors: [
          "Error sending message. Please try again later. If the issue persists, please contact me.",
        ],
      }),
      success: false,
    };
  }
};

export default function Contact() {
  const contactFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "contact-form",
    constraint: getZodConstraint(ContactSchema),
    lastResult: contactFetcher.data?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ContactSchema });
    },
  });

  return (
    <>
      <HeroHighlight className="pt-24">
        <div className="flex flex-col items-center justify-between gap-6">
          <HeroHighlightH1>
            <span>Contact</span>
            <span className="first-letter:text-primary">Arpit</span>
          </HeroHighlightH1>
          <HeroHighlightDescription>
            Have a question or want to work together? Send me a message and I
            will get back to you as soon as possible.
          </HeroHighlightDescription>
        </div>
      </HeroHighlight>
      <section id="contact">
        <LineGlow />
        <div className="container">
          <contactFetcher.Form method="POST" {...getFormProps(form)}>
            <div className="min-h-[32px] pb-4">
              <ErrorList id="general-errors" errors={form.errors} />
            </div>
            <HoneypotInputs />
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <Field
                labelProps={{ children: "Name" }}
                inputProps={{
                  autoFocus: true,
                  ...getInputProps(fields.name, { type: "text" }),
                  placeholder: "Enter your name",
                }}
                className="flex-1"
                errors={fields.name.errors}
              />
              <Field
                labelProps={{ children: "Email" }}
                inputProps={{
                  ...getInputProps(fields.email, { type: "email" }),
                  placeholder: "Enter your email",
                }}
                className="flex-1"
                errors={fields.email.errors}
              />
            </div>

            <TextareaField
              labelProps={{ children: "Message" }}
              textareaProps={{
                ...getTextareaProps(fields.message),
                placeholder: "Enter your message",
                className: "min-h-[100px]",
              }}
              errors={fields.message.errors}
            />

            <div className="flex justify-end">
              <SubmitButton
                state={contactFetcher.state}
                data={contactFetcher.data}
              />
            </div>
          </contactFetcher.Form>
        </div>
      </section>
    </>
  );
}

const Y_CHANGE = 30;
type Status = "success" | "error";
function SubmitButton({
  state,
  data,
}: {
  state: FetcherWithComponents<typeof action>["state"];
  data: Awaited<ReturnType<typeof action>> | undefined;
}) {
  const [showStatus, setShowStatus] = useState<Status | null>(null);
  const isSubmitting = state !== "idle";
  const isSuccess = !isSubmitting && data && data.success;

  useEffect(() => {
    if (isSuccess === undefined || isSubmitting) return;
    setShowStatus(isSuccess ? "success" : !isSuccess ? "error" : null);
    const timeout = setTimeout(() => {
      setShowStatus(null);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [isSuccess, isSubmitting]);

  return (
    <Button
      type="submit"
      className="group/submit w-full overflow-hidden transition-colors sm:w-[300px]"
      variant={
        showStatus === "success"
          ? "success"
          : showStatus === "error"
            ? "destructive"
            : "default"
      }
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
          <span>Send Message</span>
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
          <span>Sending</span>
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
          <span>
            {showStatus === "success"
              ? "Sent"
              : showStatus === "error"
                ? "Something went wrong"
                : "Sending"}
          </span>
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
