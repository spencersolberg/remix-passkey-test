import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { authenticator } from "~/authenticator.server";

export const meta: MetaFunction = () => {
    return [
        { title: "New Remix App" },
        { name: "description", content: "Welcome to Remix!" },
    ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request);

    return { user };
};

export default function Index() {
    const { user } = useLoaderData<typeof loader>();
    return (
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
            <h1>Welcome {user ? user.username : "Guest"}</h1>
            {user ? <Link to="/logout">Logout</Link> : <Link to="/login" prefetch="intent">Login</Link>}
        </div>
    );
}
