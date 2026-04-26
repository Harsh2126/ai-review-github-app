import crypto from "crypto";

const verifySignature = (req, res, next) => {
  const signature = req.headers["x-hub-signature-256"] || "";
  const secret = process.env.GITHUB_WEBHOOK_SECRET || "";

  if (!signature || !secret) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const mac = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
  const expected = `sha256=${mac}`;

  try {
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
};

export default verifySignature;
