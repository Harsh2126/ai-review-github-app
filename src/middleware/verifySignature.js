import crypto from "crypto";

const verifySignature = (req, res, next) => {
  const signature = req.headers["x-hub-signature-256"] || "";
  const secret = process.env.GITHUB_WEBHOOK_SECRET || "";

  if (!secret) return next();
  if (!signature) return res.status(401).json({ error: "Missing signature" });

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
  const mac = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;

  if (mac.length !== signature.length) return res.status(401).json({ error: "Invalid signature" });

  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(signature))) {
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
};

export default verifySignature;
