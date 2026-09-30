-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderPizza_orderId_idx" ON "OrderPizza"("orderId");

-- CreateIndex
CREATE INDEX "OrderPizzaIngredient_orderPizzaId_idx" ON "OrderPizzaIngredient"("orderPizzaId");
