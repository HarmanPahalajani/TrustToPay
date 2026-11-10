import { createClient, type SupabaseClient, type User as SupabaseUser } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { prisma } from "../db.js";
import type { User } from "@prisma/client";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!config.supabaseConfigured) return null;
  if (!supabaseClient) {
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    supabaseClient = createClient(config.supabaseUrl, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

export type VerifiedSupabaseIdentity = {
  id: string;
  email: string;
  name?: string;
};

/**
 * Verifies a Supabase access token server-side:
 * 1. Validates signature, audience, issuer and expiration via Supabase Admin API or JWT Secret.
 * 2. Never trusts unverified client-supplied claims or roles.
 */
export async function verifySupabaseToken(token: string): Promise<VerifiedSupabaseIdentity | null> {
  const trimmed = token.trim();
  if (!trimmed || trimmed.split(".").length !== 3) {
    return null;
  }

  // Path A: Use Supabase JWT Secret if configured locally
  if (config.supabaseJwtSecret) {
    try {
      const decoded = jwt.verify(trimmed, config.supabaseJwtSecret, {
        audience: "authenticated",
        issuer: config.supabaseUrl ? `${config.supabaseUrl}/auth/v1` : undefined,
      }) as jwt.JwtPayload;

      if (!decoded.sub || !decoded.email) return null;

      return {
        id: String(decoded.sub),
        email: String(decoded.email).toLowerCase(),
        name: decoded.user_metadata?.name ? String(decoded.user_metadata.name) : undefined,
      };
    } catch {
      // Fall through to Admin API check
    }
  }

  // Path B: Verify via Supabase Auth client if configured
  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { data, error } = await admin.auth.getUser(trimmed);
      if (error || !data.user || !data.user.email) return null;

      const user = data.user;
      const userEmail = user.email;
      if (!userEmail) return null;

      return {
        id: user.id,
        email: userEmail.toLowerCase(),
        name: user.user_metadata?.name ? String(user.user_metadata.name) : undefined,
      };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Resolves or provisions a local Prisma User corresponding to a verified Supabase identity.
 * Roles and permissions are server-controlled in Prisma and cannot be modified by frontend requests.
 */
export async function resolveSupabaseUser(identity: VerifiedSupabaseIdentity): Promise<User | null> {
  const email = identity.email.toLowerCase();

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseId: identity.id }, { email }],
    },
    include: { profile: true, skills: true },
  });

  if (!user) {
    // Security Rule: New self-registered accounts strictly default to REQUESTER.
    // Client-writable user_metadata is NEVER trusted for role assignment or automatic reviewer approval.
    // Reviewer approval can ONLY be granted via the server-side assessment engine or authoritative DB.
    const name = identity.name?.trim() || email.split("@")[0] || "User";

    user = await prisma.user.create({
      data: {
        supabaseId: identity.id,
        email,
        name,
        role: "REQUESTER",
        isReviewerApproved: false,
        profile: {
          create: {},
        },
      },
      include: { profile: true, skills: true },
    });
  } else if (!user.supabaseId) {
    // Link Supabase UUID to existing authoritative user record without modifying established role or approval
    user = await prisma.user.update({
      where: { id: user.id },
      data: { supabaseId: identity.id },
      include: { profile: true, skills: true },
    });
  }

  return user;
}
