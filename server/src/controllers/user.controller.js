import User from "../models/User.model.js";

export const getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "location", "skills", "experience", "bio"];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
