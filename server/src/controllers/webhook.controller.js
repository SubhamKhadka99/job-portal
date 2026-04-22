import { Webhook } from "svix";
import User from "../models/User.model.js";

// Controller to sync Clerk webhook events with the local MongoDB user collection.
// Only relevant if you use Clerk on top of this backend; otherwise this endpoint
// is harmless dead-code (it's only reachable via a signed Svix webhook call).

const clerkWebhooks = async (req, res) => {
  try {
    // Create a Svix instance with Clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // FIX: was "svix-timestampp" (double-p typo) — Svix verification would
    // always fail because the header value was never read correctly.
    await whook.verify(JSON.stringify(req.body), {
      "svix-id":        req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        // FIX: the old code used `image` and `resume` which don't exist on the
        // User schema. Corrected to `avatarUrl` and `resumeUrl`.
        const userData = {
          name:      (data.first_name + " " + data.last_name).trim() || data.email_addresses[0].email_address.split("@")[0],
          email:     data.email_addresses[0].email_address,
          avatarUrl: data.image_url || "",
          resumeUrl: "",
          authProvider: "google", // Clerk-managed users are treated as OAuth users
        };
        // Upsert so a duplicate webhook delivery doesn't throw a unique-key error
        await User.findOneAndUpdate(
          { email: userData.email },
          { $setOnInsert: userData },
          { upsert: true, new: true }
        );
        return res.json({ success: true });
      }

      case "user.updated": {
        const userData = {
          name:      (data.first_name + " " + data.last_name).trim(),
          email:     data.email_addresses[0].email_address,
          avatarUrl: data.image_url || "",
        };
        await User.findOneAndUpdate(
          { email: userData.email },
          userData
        );
        return res.json({ success: true });
      }

      case "user.deleted": {
        // Clerk sends the primary email in data.email_addresses when deleting
        const email = data.email_addresses?.[0]?.email_address;
        if (email) await User.findOneAndDelete({ email });
        return res.json({ success: true });
      }

      default:
        return res.json({ success: true });
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({ success: false, message: "Webhook error" });
  }
};

export default clerkWebhooks;
