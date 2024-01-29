import type { LoaderFunctionArgs } from "@remix-run/node";

import { authenticator } from "~/authenticator.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticator.logout(request, { redirectTo: "/" });
}