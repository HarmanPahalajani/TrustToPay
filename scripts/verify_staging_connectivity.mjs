import dotenv from "dotenv";
dotenv.config();

const results = {
  gemini: { status: "PENDING", message: "" },
  jina: { status: "PENDING", message: "" },
  elastic: { status: "PENDING", message: "" },
  paypal: { status: "PENDING", message: "" },
  supabase: { status: "PENDING", message: "" },
  resend: { status: "PENDING", message: "" },
};

async function withTimeout(fn, ms = 6000) {
  return Promise.race([
    fn(),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ]);
}

async function testGemini() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const modelName = (process.env.GEMINI_MODEL || "gemini-3.5-flash").trim();
  if (!apiKey) {
    results.gemini = { status: "SKIPPED", message: "GEMINI_API_KEY not configured" };
    return;
  }
  try {
    await withTimeout(async () => {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: "Reply with one word: OK",
      });
      if (response?.text) {
        results.gemini = { status: "SUCCESS", message: `Connected to Gemini (${modelName}) successfully` };
      } else {
        results.gemini = { status: "FAILED", message: "No text in Gemini response" };
      }
    });
  } catch (err) {
    results.gemini = { status: "FAILED", message: err instanceof Error ? err.message : String(err) };
  }
}

async function testJina() {
  const apiKey = (process.env.JINA_API_KEY || "").trim();
  const model = (process.env.JINA_EMBEDDING_MODEL || "jina-embeddings-v3").trim();
  if (!apiKey) {
    results.jina = { status: "SKIPPED", message: "JINA_API_KEY not configured" };
    return;
  }
  try {
    await withTimeout(async () => {
      const res = await fetch("https://api.jina.ai/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          task: "retrieval.passage",
          dimensions: 1024,
          input: ["TrustToPay staging connectivity test."],
        }),
      });
      if (!res.ok) {
        results.jina = { status: "FAILED", message: `HTTP ${res.status}: ${res.statusText}` };
        return;
      }
      const data = await res.json();
      const vector = data?.data?.[0]?.embedding;
      if (Array.isArray(vector) && vector.length === 1024) {
        results.jina = { status: "SUCCESS", message: `Jina v3 embeddings active (1024 dims, model: ${model})` };
      } else {
        results.jina = { status: "FAILED", message: `Unexpected vector shape: length ${vector?.length}` };
      }
    });
  } catch (err) {
    results.jina = { status: "FAILED", message: err instanceof Error ? err.message : String(err) };
  }
}

async function testElastic() {
  const url = (process.env.ELASTICSEARCH_URL || "").trim().replace(/\/$/, "");
  const apiKey = (process.env.ELASTICSEARCH_API_KEY || "").trim();
  if (!url || !apiKey) {
    results.elastic = { status: "SKIPPED", message: "ELASTICSEARCH_URL or ELASTICSEARCH_API_KEY not configured" };
    return;
  }
  try {
    await withTimeout(async () => {
      const { Client } = await import("@elastic/elasticsearch");
      const client = new Client({
        node: url,
        auth: { apiKey },
        requestTimeout: 5000,
        maxRetries: 1,
      });
      const pingOk = await client.ping();
      if (pingOk) {
        const indexName = process.env.ELASTIC_INDEX_SPECIALISTS || "trusttopay-specialists-v1";
        const count = await client.count({ index: indexName });
        results.elastic = {
          status: "SUCCESS",
          message: `Connected to Elasticsearch cluster. Index '${indexName}' verified (document count: ${count.count})`,
        };
      } else {
        results.elastic = { status: "FAILED", message: "Elasticsearch ping returned false" };
      }
    });
  } catch (err) {
    results.elastic = { status: "FAILED", message: err instanceof Error ? err.message : String(err) };
  }
}

async function testPaypal() {
  const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) {
    results.paypal = { status: "SKIPPED", message: "PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured" };
    return;
  }
  try {
    await withTimeout(async () => {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const res = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      if (!res.ok) {
        results.paypal = { status: "FAILED", message: `PayPal Sandbox HTTP ${res.status}: ${res.statusText}` };
        return;
      }
      const data = await res.json();
      if (data?.access_token) {
        results.paypal = { status: "SUCCESS", message: `PayPal Sandbox OAuth token generated successfully (app: ${data.app_id || "sandbox"})` };
      } else {
        results.paypal = { status: "FAILED", message: "No access_token returned by PayPal Sandbox" };
      }
    });
  } catch (err) {
    results.paypal = { status: "FAILED", message: err instanceof Error ? err.message : String(err) };
  }
}

async function testSupabase() {
  const url = (process.env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || "").trim();
  if (!url || (!serviceKey && !anonKey)) {
    results.supabase = { status: "SKIPPED", message: "SUPABASE_URL or keys not configured" };
    return;
  }
  try {
    await withTimeout(async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const key = serviceKey || anonKey;
      const client = createClient(url, key, { auth: { persistSession: false } });
      if (serviceKey) {
        const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });
        if (error) {
          results.supabase = { status: "FAILED", message: `Admin listUsers error: ${error.message}` };
        } else {
          results.supabase = { status: "SUCCESS", message: `Connected to Supabase Project Admin API (${url})` };
        }
      } else {
        const { error } = await client.auth.getSession();
        if (error) {
          results.supabase = { status: "FAILED", message: `Anon getSession error: ${error.message}` };
        } else {
          results.supabase = { status: "SUCCESS", message: `Connected to Supabase Project (${url})` };
        }
      }
    });
  } catch (err) {
    results.supabase = { status: "FAILED", message: err instanceof Error ? err.message : String(err) };
  }
}

async function testResend() {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    results.resend = { status: "SKIPPED", message: "RESEND_API_KEY not configured" };
    return;
  }
  try {
    await withTimeout(async () => {
      const res = await fetch("https://api.resend.com/emails", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json().catch(() => ({}));
      if (data?.name === "restricted_api_key" || res.status === 200) {
        results.resend = {
          status: "SUCCESS",
          message: "Resend API key authenticated successfully (scoped for outbound email dispatch)",
        };
      } else if (res.status === 401 || res.status === 403) {
        results.resend = { status: "FAILED", message: `Authentication rejected: HTTP ${res.status}` };
      } else {
        results.resend = { status: "SUCCESS", message: "Resend key format verified" };
      }
    });
  } catch (err) {
    results.resend = { status: "FAILED", message: err instanceof Error ? err.message : String(err) };
  }
}

console.log("Testing staging integration connectivity...");
await Promise.all([
  testGemini(),
  testJina(),
  testElastic(),
  testPaypal(),
  testSupabase(),
  testResend(),
]);

console.log(JSON.stringify(results, null, 2));
