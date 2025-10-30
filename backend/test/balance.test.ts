import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { makeDb } from "../src/db";
import { makeRouter } from "../src/routes";

describe("Bookkeeping balance cascade", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(cors());
    app.use(bodyParser.json());

    const db = makeDb(true);
    app.use("/api", makeRouter(db));
  });

  it("cascades balance updates to parent accounts", async () => {
    // Create parent
    const parentRes = await request(app)
      .post("/api/accounts")
      .send({ name: "Parent", parent_id: null });
    const parent = parentRes.body;

    // Create child
    const childRes = await request(app)
      .post("/api/accounts")
      .send({ name: "Child", parent_id: parent.id });
    const child = childRes.body;

    // Adjust child balance
    await request(app)
      .patch(`/api/accounts/${child.id}/balance`)
      .send({ delta: 200 })
      .expect(200);

    // Verify parent balance updated
    const treeRes = await request(app).get("/api/accounts");
    const tree = treeRes.body;

    const updatedParent = tree.find((n: any) => n.id === parent.id);
    expect(updatedParent.balance).toBe(200);

    const updatedChild = updatedParent.children.find(
      (n: any) => n.id === child.id,
    );
    expect(updatedChild.balance).toBe(200);
  });

  it("rejects balance adjustment on non-leaf accounts", async () => {
    // Create parent + child
    const parentRes = await request(app)
      .post("/api/accounts")
      .send({ name: "Parent" });
    const parent = parentRes.body;

    await request(app)
      .post("/api/accounts")
      .send({ name: "Child", parent_id: parent.id });

    // Try to adjust parent (should fail)
    const patchRes = await request(app)
      .patch(`/api/accounts/${parent.id}/balance`)
      .send({ delta: 100 });

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.error).toContain("non-leaf");
  });
});
