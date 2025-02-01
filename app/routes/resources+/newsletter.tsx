import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, type LinksFunction } from "@remix-run/node";
import { z } from "zod";
import { NotFound, dinoCssLinks } from "#app/components/error-boundary";
import { ADD_SUBSCRIBER } from "#app/graphql/queries";
import { checkHoneypot } from "#app/utils/honeypot.server";

export const links: LinksFunction = () => {
  return [...dinoCssLinks()];
};

const NewsletterSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address")
    .trim()
    .min(1, "Email is required"),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);
  const submission = parseWithZod(formData, { schema: NewsletterSchema });

  if (submission.status !== "success") {
    return { result: submission.reply(), error: "Invalid form data" };
  }

  try {
    await subscribeToNewsletter(
      submission.value.email,
      process.env.HASHNODE_PUBLICATION_ID,
    );
    return {
      result: submission.reply({ resetForm: true }),
      error: null,
    };
  } catch (error) {
    console.error("Error subscribing to newsletter", error);
    return {
      result: submission.reply(),
      error: "Error subscribing to newsletter. Please try again later.",
    };
  }
}

export default function Newsletter() {
  return <NotFound />;
}

const SubscribeResponseSchema = z.object({
  data: z
    .object({
      subscribeToNewsletter: z.object({
        status: z.string(),
      }),
    })
    .optional(),
  errors: z
    .array(
      z.object({
        message: z.string(),
      }),
    )
    .optional(),
});

async function subscribeToNewsletter(email: string, publicationId: string) {
  const response = await fetch("https://gql.hashnode.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ADD_SUBSCRIBER,
      variables: {
        input: {
          publicationId,
          email,
        },
      },
    }),
  });

  const rawResult = await response.json();
  const result = SubscribeResponseSchema.safeParse(rawResult);

  if (!result.success) {
    console.error("Invalid response from Hashnode:", result.error);
    throw new Error("Invalid response from newsletter service");
  }

  if (result.data.errors?.length) {
    throw new Error(result.data.errors[0].message);
  }

  if (!result.data.data?.subscribeToNewsletter.status) {
    throw new Error("Failed to subscribe to newsletter");
  }

  return result.data;
}
