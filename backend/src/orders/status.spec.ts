import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { OrderStatus } from "@prisma/client";
import { assertStatusTransition, StatusTransitionError } from "./status";

describe("assertStatusTransition", () => {
  it("allows the kitchen line and cancellation before completion", () => {
    assert.doesNotThrow(() => assertStatusTransition(OrderStatus.RECEIVED, OrderStatus.PREPARING));
    assert.doesNotThrow(() => assertStatusTransition(OrderStatus.PREPARING, OrderStatus.READY));
    assert.doesNotThrow(() => assertStatusTransition(OrderStatus.READY, OrderStatus.COMPLETED));
    assert.doesNotThrow(() => assertStatusTransition(OrderStatus.RECEIVED, OrderStatus.CANCELLED));
  });

  it("refuses skips and moves out of a terminal status", () => {
    assert.throws(
      () => assertStatusTransition(OrderStatus.RECEIVED, OrderStatus.READY),
      StatusTransitionError,
    );
    assert.throws(
      () => assertStatusTransition(OrderStatus.COMPLETED, OrderStatus.CANCELLED),
      StatusTransitionError,
    );
    assert.throws(
      () => assertStatusTransition(OrderStatus.CANCELLED, OrderStatus.PREPARING),
      StatusTransitionError,
    );
  });
});
