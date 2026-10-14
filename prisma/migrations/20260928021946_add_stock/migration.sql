-- CreateTable
CREATE TABLE "stock" (
    "id" SERIAL NOT NULL,
    "producto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_producto_key" ON "stock"("producto");
