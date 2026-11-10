import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = (process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.log("Supabase URL or Service Role Key missing. Skipping Supabase judge account provisioning.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const JUDGE_PASSWORD = process.env.JUDGE_DEMO_PASSWORD || "TrustToPay2026!Judge";

const JUDGE_ACCOUNTS = [
  {
    email: "agent@demo.trusttopay.dev",
    name: "Elena Rostova — Judge Requester Demo",
    role: "REQUESTER",
  },
  {
    email: "reviewer@demo.trusttopay.dev",
    name: "Marcus Vance — Judge Reviewer Demo",
    role: "REVIEWER",
  },
];

async function provision() {
  console.log("Checking Supabase Auth for judge demonstration accounts...");
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 50,
  });

  if (listError) {
    console.error("Failed to query Supabase admin API:", listError.message);
    process.exit(1);
  }

  const existingByEmail = new Map(users.map((u) => [u.email?.toLowerCase(), u]));

  for (const account of JUDGE_ACCOUNTS) {
    const existing = existingByEmail.get(account.email.toLowerCase());
    if (!existing) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: JUDGE_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: account.name,
          role: account.role,
        },
      });

      if (error) {
        console.error(`Failed to create ${account.email} in Supabase:`, error.message);
      } else {
        console.log(`[PROVISIONED] Created Supabase Auth user: ${account.email} (ID: ${data.user.id})`);
      }
    } else {
      // Ensure email is confirmed and metadata is updated
      const { error } = await supabase.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
        user_metadata: {
          name: account.name,
          role: account.role,
        },
      });
      if (error) {
        console.error(`Failed to update ${account.email}:`, error.message);
      } else {
        console.log(`[VERIFIED] Supabase Auth user confirmed: ${account.email} (ID: ${existing.id})`);
      }
    }
  }

  console.log("Supabase judge account provisioning complete.");
}

provision().catch((err) => {
  console.error("Error during provisioning:", err);
  process.exit(1);
});
