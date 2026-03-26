import Investmentmodel from "../model/Investmentmodel.js";
import UserModel from "../model/UserModel.js";
import resend from "../lib/resend.js";
import { investmentCompletedEmailTemplate } from "../lib/email-templates/investmentCompletedEmailTemplate.js";

export const checkExpiredInvestments = async (req, res) => {
  try {
    const now = new Date();

    const expiredInvestments = await Investmentmodel.find({
      user: req.user._id,
      status: "active",
      expires_at: { $lte: now },
    }).populate("user", "name email").populate("plan", "name");

    if (expiredInvestments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No expired investments found.",
        processed: 0,
      });
    }

    console.log(`[InvCheck] ${expiredInvestments.length} expired investment(s) found for user ${req.user._id} — processing...`);

    const results = [];

    for (const investment of expiredInvestments) {
      try {
        investment.status = "completed";
        await investment.save();

        const credited = await UserModel.findByIdAndUpdate(
          investment.user._id,
          { $inc: { account_balance: investment.return_amount } },
          { returnDocument: "after" },
        );
 
        // ── Email: investment completed & balance credited ──
        try {
          const { data, error } = await resend.emails.send({
            from: "Batrus Trades <info@batrus-trades.pro>",
            to: [investment.user.email],
            subject: "Your Investment Has Matured - Batrus Trades",
            html: investmentCompletedEmailTemplate({
              name: investment.user.name,
              amount: investment.amount,
              return_amount: investment.return_amount,
              plan: investment.plan?.name || "Investment Plan",
            }),
          });

          if (error) console.error(`[InvCheck] Email error for ${investment.user.email}:`, error);
          else console.log(`[InvCheck] Email sent to ${investment.user.email}`);
        } catch (emailErr) {
          console.error(`[InvCheck] Email exception:`, emailErr.message);
        }

        results.push({
          investment_id: investment._id,
          user_id: investment.user._id,
          return_amount: investment.return_amount,
          credited: !!credited,
          status: "completed",
        });
      } catch (err) {
        results.push({
          investment_id: investment._id,
          user_id: investment.user,
          error: err.message,
          status: "failed_to_process",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${expiredInvestments.length} expired investment(s).`,
      processed: expiredInvestments.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking expired investments.",
      error: error.message,
    });
  }
};