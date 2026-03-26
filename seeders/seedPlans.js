import "dotenv/config";
import mongoose from "mongoose";
import InvestmentPlan from "../model/InvestmentPlan.js";

const plans = [
  {
    name: "Standard", // was "Standard Plan"
    min_amount: 50,
    max_amount: 499,
    duration_hours: 24,
    return_percentage: 5,
  },
  {
    name: "Magnate", // was "Magnate Plan"
    min_amount: 500,
    max_amount: 999,
    duration_hours: 24,
    return_percentage: 8,
  },
  {
    name: "Platinum", // was "Platinum Plan"
    min_amount: 1000,
    max_amount: 4999,
    duration_hours: 36, // also fix this — was 48
    return_percentage: 12,
  },
  {
    name: "Executive", // was "Executive Plan"
    min_amount: 5000,
    max_amount: 9999,
    duration_hours: 48,
    return_percentage: 15,
  },
  {
    name: "Premium", // was "Premium Plan"
    min_amount: 10000,
    max_amount: 1000000,
    duration_hours: 72,
    return_percentage: 22,
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await InvestmentPlan.deleteMany(); // clears old data first
  await InvestmentPlan.insertMany(plans);
  console.log("✅ Plans seeded successfully");
  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

// $ node seeders/seedPlans.js
