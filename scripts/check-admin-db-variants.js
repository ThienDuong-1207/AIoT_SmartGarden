const mongoose = require("mongoose");

(async () => {
  const uri = process.argv[2];
  const dbNames = ["AIoT", "smart_garden"];

  for (const dbName of dbNames) {
    await mongoose.connect(uri, { dbName });
    const docs = await mongoose.connection.db.collection("users").find(
      { email: { $regex: "^admin@ecotech\\.com$", $options: "i" } },
      { projection: { email: 1, password: 1, role: 1, status: 1, provider: 1 } }
    ).toArray();

    console.log(JSON.stringify({
      dbName,
      count: docs.length,
      users: docs.map((d) => ({
        email: d.email,
        role: d.role,
        status: d.status,
        provider: d.provider,
        hasPassword: !!d.password,
        passwordLength: d.password ? String(d.password).length : 0,
      })),
    }, null, 2));

    await mongoose.disconnect();
  }
})().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
