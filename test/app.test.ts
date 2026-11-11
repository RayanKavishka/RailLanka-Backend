import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../src/index";


test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.message, "ok");
});