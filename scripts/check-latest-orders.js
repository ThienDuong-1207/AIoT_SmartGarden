const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

(async () => {
  const uri = process.env.MONGODB_URI || process.argv[2];
  const dbName = process.env.MONGODB_DB_NAME || process.argv[3] || "AIoT";

  if (!uri) {
    console.error("Missing Mongo URI. Set MONGODB_URI or pass URI as arg 1.");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName });

  const orders = await mongoose.connection.db
    .collection("orders")
    .find({}, { projection: { orderCode: 1, userId: 1, totalAmount: 1, paymentStatus: 1, orderStatus: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  console.log(JSON.stringify({
    dbName,
    countLatest: orders.length,
    latestOrders: orders.map((o) => ({
      id: String(o._id),
      orderCode: o.orderCode,
      userId: String(o.userId),
      totalAmount: o.totalAmount,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
    })),
  }, null, 2));

  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
