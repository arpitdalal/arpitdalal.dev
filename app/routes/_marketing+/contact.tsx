import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs } from "@remix-run/node";
import {
  useFetcher,
  useNavigate,
  type FetcherWithComponents,
} from "@remix-run/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { z } from "zod";
import { ErrorList } from "#app/components/error-list";
import { Field } from "#app/components/field";
import { TextareaField } from "#app/components/textarea-field";
import { Button } from "#app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "#app/components/ui/dialog";
import { Icon } from "#app/components/ui/icon";
import { sendEmail } from "#app/utils/email";

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

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: ContactSchema });
  if (submission.status !== "success") {
    return { result: submission.reply(), error: "Invalid form data" };
  }
  try {
    await sendEmail({
      subject: "Contact Form Submission - arpitdalal.dev",
      message: `${submission.value.name} (${submission.value.email}) says:\n\n${submission.value.message}`,
    });
    return {
      result: submission.reply({ resetForm: true }),
      error: null,
    };
  } catch (error) {
    console.error("Error sending email", error);
    return {
      result: submission.reply(),
      error:
        "Error sending message. Please try again later. If the issue persists, please contact me.",
    };
  }
};

export default function Contact() {
  const navigate = useNavigate();
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
    <Dialog open={true} onOpenChange={() => navigate("..")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact</DialogTitle>
        </DialogHeader>
        <div className="grid gap-8">
          <contactFetcher.Form method="POST" {...getFormProps(form)}>
            <div className="min-h-[32px] pb-4">
              <ErrorList
                id="general-errors"
                errors={[contactFetcher.data?.error]}
              />
            </div>
            <HoneypotInputs />
            <Field
              labelProps={{ children: "Name" }}
              inputProps={{
                autoFocus: true,
                ...getInputProps(fields.name, { type: "text" }),
                placeholder: "Enter your name",
              }}
              errors={fields.name.errors}
            />

            <Field
              labelProps={{ children: "Email" }}
              inputProps={{
                ...getInputProps(fields.email, { type: "email" }),
                placeholder: "Enter your email",
              }}
              errors={fields.email.errors}
            />

            <TextareaField
              labelProps={{ children: "Message" }}
              textareaProps={{
                ...getTextareaProps(fields.message),
                placeholder: "Enter your message",
                className: "min-h-[100px]",
              }}
              errors={fields.message.errors}
            />

            <SubmitButton
              state={contactFetcher.state}
              data={contactFetcher.data}
            />
          </contactFetcher.Form>
        </div>
      </DialogContent>
    </Dialog>
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
    null
  );
  const isSubmitting = state === "submitting";
  const isSuccess = state === "idle" && data && !data.error;
  const isError = state === "idle" && data && data.error;

  useEffect(() => {
    if (isSuccess || isError) {
      setShowStatus(isSuccess ? "success" : isError ? "error" : null);
      const timeout = setTimeout(() => {
        setShowStatus(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, isError]);

  return (
    <Button
      type="submit"
      className="group/submit w-full overflow-hidden transition-colors"
      variant={
        showStatus === "success"
          ? "success"
          : showStatus === "error"
            ? "destructive"
            : "default"
      }
      disabled={isSubmitting || !!showStatus}
    >
      <div className="relative h-7 w-full flex items-center justify-center">
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
