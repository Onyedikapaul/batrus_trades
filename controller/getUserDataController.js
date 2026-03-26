import UserModel from "../model/UserModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId).select(
      "-password -securityPin -emailVerifyCodeHash -emailVerifyCodeExpiresAt",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("user", user)

    return res.status(200).json({ user });
  } catch (error) {
    console.error("getUserData error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });

    await UserModel.findByIdAndUpdate(req.user._id, { name });
    return res.status(200).json({ success: true, message: "Profile updated." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
