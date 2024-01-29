import { WebAuthnStrategy } from "remix-auth-webauthn";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";

import {
    getAuthenticators,
    getUserByUsername,
    getAuthenticatorById,
    type User,
    createUser,
    createAuthenticator,
    getUserById
} from "~/prisma.server"; // authentication works on Arc (Chromium), but not Safari

// import {
//     getAuthenticators,
//     getUserByUsername,
//     getAuthenticatorById,
//     type User,
//     createUser,
//     createAuthenticator,
//     getUserById
// } from "~/memory.server"; // authentication works on both

export const authenticator = new Authenticator<User>(sessionStorage);

export const webAuthnStrategy = new WebAuthnStrategy<User>(
    {
        rpName: "passkey",
        rpID: (request) => new URL(request.url).hostname,
        origin: (request) => new URL(request.url).origin,
        getUserAuthenticators: async (user) => {
            const authenticators = await getAuthenticators(user);

            return authenticators.map((authenticator) => ({
                ...authenticator,
                transports: authenticator.transports.split(",")
            }));
        },
        getUserDetails: (user) =>
            user ? { id: user.id, username: user.username } : null,
        getUserByUsername: (username) => getUserByUsername(username),
        getAuthenticatorById: (id) => getAuthenticatorById(id)
    },
    async ({ authenticator, type, username }) => {
        let user: User | null = null;
        const savedAuthenticator = await getAuthenticatorById(authenticator.credentialID);

        if (type === "registration") {
            if (savedAuthenticator) {
                throw new Error("Authenticator has already been registered.");
            } else {
                if (!username) {
                    throw new Error("Username is required.");
                }

                user = await getUserByUsername(username);

                if (user) {
                    throw new Error("User already exists.");
                }

                user = await createUser(username);
                await createAuthenticator(authenticator, user.id);
            }
        } else if (type === "authentication") {
            if (!savedAuthenticator) {
                throw new Error("Authenticator not found.");
            }
            user = await getUserById(savedAuthenticator.userId);
        }

        if (!user) {
            throw new Error("User not found.");
        }
        return user;
    }
)

authenticator.use(webAuthnStrategy);