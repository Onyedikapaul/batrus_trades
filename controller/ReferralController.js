import ReferralModel from "../model/ReferralModel.js";
import UserModel from "../model/UserModel.js";

const REFERRAL_PERCENTAGE = 10; // 10% of each deposit

// ─── Called during signup if referralCode is in the query ─────────────────────
export const handleReferralOnSignup = async (newUserId, referralCode) => {
  try {
    if (!referralCode) return;

    // Find referrer by their referral code
    const referrer = await UserModel.findOne({ referralCode });
    if (!referrer) return;

    // Avoid self-referral
    if (referrer._id.toString() === newUserId.toString()) return;

    // Only create one referral record per referred user
    const existing = await ReferralModel.findOne({ referred: newUserId });
    if (existing) return;

    // Create referral record — earnings array starts empty
    await ReferralModel.create({
      referrer: referrer._id,
      referred: newUserId,
      percentage: REFERRAL_PERCENTAGE,
      earnings: [],
      totalEarned: 0,
    });

    // Increment referrer's referral count on User model
    await UserModel.findByIdAndUpdate(referrer._id, {
      $inc: { referralCount: 1 },
    });

    console.log(`Referral created: ${referrer._id} referred ${newUserId}`);
  } catch (error) {
    console.error("handleReferralOnSignup error:", error);
  }
};

// ─── Called on every deposit — adds a new earning entry to the array ──────────
// ─── Called on every deposit — adds a new earning entry to the array ──────────
export const creditReferralEarning = async (referredUserId, depositAmount) => {
  try {
    const referral = await ReferralModel.findOne({ referred: referredUserId });
    if (!referral) return; // this user was not referred by anyone

    const earned = (referral.percentage / 100) * depositAmount;
    if (!earned || earned <= 0) return;

    // Push new earning into the array
    referral.earnings.push({
      depositAmount,
      percentage: referral.percentage,
      earned,
    });

    // Update running total
    referral.totalEarned += earned;
    await referral.save();

    // Credit referrer's account_balance
    await UserModel.findByIdAndUpdate(referral.referrer, {
      $inc: { account_balance: earned },
    });
  } catch (error) {
    console.error("creditReferralEarning error:", error);
  }
};

// ─── GET /api/referral/my-referrals — logged-in user's referral list ──────────
export const getMyReferrals = async (req, res) => {
  try {
    const referrals = await ReferralModel.find({ referrer: req.user._id })
      .populate("referred", "name username email createdAt")
      .sort({ createdAt: -1 });

    // Grand total across all referred users
    const grandTotal = referrals.reduce((sum, r) => sum + r.totalEarned, 0);

    return res.status(200).json({
      referrals,
      grandTotal,
      count: referrals.length,
    });
  } catch (error) {
    console.error("getMyReferrals error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/referral/stats
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const referrals = await ReferralModel.find({ referrer: userId });

    const total_referral_earned = referrals.reduce(
      (sum, ref) => sum + (ref.totalEarned ?? 0),
      0,
    );

    const total_referrals = referrals.length;

    return res.status(200).json({
      success: true,
      stats: {
        total_referrals, // how many people they referred
        total_referral_earned, // total $ earned from referrals
      },
    });
  } catch (err) {
    console.error("getReferralStats error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
