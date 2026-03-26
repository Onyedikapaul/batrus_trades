import walletmodel from "../../model/walletmodel.js";

// ─── Public: Get all active wallets (for deposit page) ───────────────────────
export const getActiveWallets = async (req, res) => {
  try {
    const wallets = await walletmodel.find({ isActive: true })
      .select("coin symbol network address")
      .lean();

    return res.status(200).json({ success: true, wallets });
  } catch (err) {
    console.error("getActiveWallets error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Get all wallets ───────────────────────────────────────────────────
export const getAllWallets = async (req, res) => {
  try {
    const wallets = await walletmodel.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, wallets });
  } catch (err) {
    console.error("getAllWallets error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Add wallet ────────────────────────────────────────────────────────
export const addWallet = async (req, res) => {
  try {
    const { coin, symbol, network, address } = req.body;

    if (!coin || !symbol || !address) {
      return res.status(400).json({
        success: false,
        message: "Coin, symbol, and address are required.",
      });
    }

    const existing = await walletmodel.findOne({
      coin: coin.trim().toLowerCase(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A wallet for this coin already exists. Edit it instead.",
      });
    }

    const wallet = await walletmodel.create({
      coin: coin.trim().toLowerCase(),
      symbol: symbol.trim().toUpperCase(),
      network: network?.trim() || null,
      address: address.trim(),
    });

    return res.status(201).json({ success: true, wallet });
  } catch (err) {
    console.error("addWallet error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Edit wallet ───────────────────────────────────────────────────────
export const updateWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { symbol, network, address, isActive } = req.body;

    const wallet = await walletmodel.findById(id);
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found." });
    }

    if (symbol !== undefined) wallet.symbol = symbol.trim().toUpperCase();
    if (network !== undefined) wallet.network = network?.trim() || null;
    if (address !== undefined) wallet.address = address.trim();
    if (isActive !== undefined) wallet.isActive = Boolean(isActive);

    await wallet.save();

    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error("updateWallet error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Admin: Delete wallet ─────────────────────────────────────────────────────
export const deleteWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await walletmodel.findByIdAndDelete(id);
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Wallet deleted." });
  } catch (err) {
    console.error("deleteWallet error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};