import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { handleFormSubmit } from "remix-auth-webauthn";

import { authenticator, webAuthnStrategy } from "~/authenticator.server";
import { sessionStorage } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request);

    return webAuthnStrategy.generateOptions(request, sessionStorage, user);
}

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        await authenticator.authenticate("webauthn", request, {
            successRedirect: "/"
        });

        return { error: null };
    } catch (error) {
        if (error instanceof Response && error.status >= 400) {
            return { error: (await error.json()) as { message: string } };
        }
        throw error;
    }
}

export default function Login() {
    const options = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    return (
        <Form onSubmit={handleFormSubmit(options)} method="POST">
            <label>
                Username
                <input type="text" name="username" />
            </label>
            <button formMethod="GET">Check Username</button>
            <button
                name="intent"
                value="registration"
                disabled={options.usernameAvailable !== true}
            >
                Register
            </button>
            <button name="intent" value="authentication">
                Authenticate
            </button>
            {actionData?.error ? <div>{actionData.error.message}</div> : null}
        </Form>
    )
}