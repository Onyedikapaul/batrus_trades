import WalletModel from "../model/WalletModel.js";

export const getPortfolioFromDB = async (req, res) => {
  try {
    const wallet = await WalletModel.findOne({ user: req.user._id });
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found." });
    }
 
    return res.status(200).json({
      success: true,
      coins: wallet.coins,
      totalPortfolioUSD: wallet.totalPortfolioUSD || 0,
      fetchedAt: wallet.lastUpdated,
    });
  } catch (error) {
    console.error("getPortfolioFromDB error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
