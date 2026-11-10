import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { agent, app, createUser, loginAs, resetDatabase } from "./helpers.js";

beforeEach(async () => {
  await resetDatabase();
});

describe("request origin protection", () => {
  it("rejects a state-changing request from a foreign origin", async () => {
    await createUser("REQUESTER", { email: "origin@test.dev" });

    const response = await agent()
      .post("/api/v1/auth/login")
      .set("Origin", "https://evil.example")
      .send({ email: "origin@test.dev", password: "Demo1234!" });

    expect(response.status).toBe(403);
    // The CORS layer rejects a foreign origin before the route-level origin check.
    expect(["CORS_DENIED", "ORIGIN_MISMATCH"]).toContain(response.body.error.code);
  });

  it("allows a state-changing request from the configured frontend origin", async () => {
    await createUser("REQUESTER", { email: "origin-ok@test.dev" });

    const response = await agent()
      .post("/api/v1/auth/login")
      .set("Origin", "http://localhost:5173")
      .send({ email: "origin-ok@test.dev", password: "Demo1234!" });

    expect(response.status).toBe(200);
  });
});

describe("security headers", () => {
  it("sets hardening headers on API responses", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
  });
});

describe("role enforcement", () => {
  it("returns 404 for removed admin routes", async () => {
    const response = await agent().get("/api/v1/admin/users");
    expect(response.status).toBe(404);
  });

  it("blocks a requester from the reviewer dashboard", async () => {
    await createUser("REQUESTER", { email: "requester-only@test.dev" });
    const client = agent();
    await loginAs(client, "requester-only@test.dev");

    const reviewerDashboard = await client.get("/api/v1/dashboard/reviewer");
    const removedAdminDashboard = await client.get("/api/v1/dashboard/admin");

    expect(reviewerDashboard.status).toBe(403);
    expect(reviewerDashboard.body.error.code).toBe("FORBIDDEN");
    expect(removedAdminDashboard.status).toBe(404);
  });

  it("blocks a reviewer from listing every task or creating agent API keys", async () => {
    await createUser("REVIEWER", { email: "reviewer-scope@test.dev" });
    const client = agent();
    await loginAs(client, "reviewer-scope@test.dev");

    const response = await client.get("/api/v1/tasks?scope=all");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("SCOPE_FORBIDDEN");

    const keyResponse = await client.post("/api/v1/auth/api-keys").send({ name: "Disallowed Key" });
    expect(keyResponse.status).toBe(403);
    expect(keyResponse.body.error.code).toBe("FORBIDDEN");
  });
});

