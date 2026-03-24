const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

(async () => {
  const uri = process.argv[2];
  const db = process.argv[3];
  await mongoose.connect(uri, { dbName: db });

  const inputEmail = "admin@ecotech.com".trim().toLowerCase();
  const inputPassword = "admin123".trim();
  const escaped = inputEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const user = await mongoose.connection.db.collection("users").findOne({
    email: { $regex: `^${escaped}$`, $options: "i" },
  });

  if (!user) {
    console.log("NO_USER");
    await mongoose.disconnect();
    return;
  }

  const hash = String(user.password || "");
  const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(hash);
  const passwordOk = isBcryptHash ? await bcrypt.compare(inputPassword, hash) : inputPassword === hash;

  console.log(JSON.stringify({
    email: user.email,
    role: user.role,
    status: user.status,
    hasPassword: !!user.password,
    isBcryptHash,
    passwordOk,
  }, null, 2));

  await mongoose.disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
