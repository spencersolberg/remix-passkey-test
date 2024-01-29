import { PrismaClient } from "@prisma/client";
import type { Authenticator } from "remix-auth-webauthn";

export type User = {
    id: string;
    username: string;
}

const prisma = new PrismaClient();

export const getAuthenticatorById = async (id: string): Promise<Authenticator | null> => {
    const authenticator = await prisma.authenticator.findUnique({
        where: {
            credentialID: id
        }
    });

    if (!authenticator) return null;
    return {
        ...authenticator,
        credentialBackedUp: authenticator.credentialBackedUp ? 1 : 0
    }
}

export const getAuthenticators = async (user: User | null): Promise<Authenticator[]> => {
    if (!user) return [];

    const authenticators = await prisma.authenticator.findMany({
        where: {
            userId: user.id
        }
    });

    return authenticators.map((authenticator) => ({
        ...authenticator,
        credentialBackedUp: authenticator.credentialBackedUp ? 1 : 0
    }));
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: {
            username
        }
    });

    return user;
}

export const getUserById = async (id: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });

    return user;
}

export const createAuthenticator = async (
    authenticator: Omit<Authenticator, "userId">,
    userId: string
): Promise<void> => {
    await prisma.authenticator.create({
        data: {
            ...authenticator,
            userId,
            credentialBackedUp: Boolean(authenticator.credentialBackedUp)
        }
    }); 
}

export const createUser = async (username: string): Promise<User> => {
    const user = await prisma.user.create({
        data: {
            id: crypto.randomUUID(),
            username
        }
    });

    return user;
}