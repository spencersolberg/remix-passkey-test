import type { Authenticator } from "remix-auth-webauthn";

export type User = {
    id: string;
    username: string;
}

const authenticators = new Map<string, Authenticator>();
const users = new Map<string, User>();

export const getAuthenticatorById = (id: string): Authenticator | null => {
    return authenticators.get(id) ?? null;
}

export const getAuthenticators = (user: User | null): Authenticator[] => {
    if (!user) return [];

    const userAuthenticators : Authenticator[] = [];
    authenticators.forEach((authenticator) => {
        if (authenticator.userId === user.id) {
            userAuthenticators.push(authenticator);
        }
    });

    return userAuthenticators;
}

export const getUserByUsername = (username: string): User | null => {
    users.forEach((user) => {
        if (user.username === username) {
            return user;
        }
    });
    return null;
}

export const getUserById = (id: string): User | null => {
    return users.get(id) ?? null;
}

export const createAuthenticator = (
    authenticator: Omit<Authenticator, "userId">,
    userId: string
) => {
    authenticators.set(authenticator.credentialID, { ...authenticator, userId });
}

export const createUser = (username: string): User => {
    const user = {
        id: crypto.randomUUID(),
        username
    }

    users.set(user.id, user);
    return user;
}