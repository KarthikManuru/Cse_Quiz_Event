/**
 * Utility Script: Clear All Quiz Attempts from MongoDB
 * 
 * This script deletes all documents from the 'attempts' collection.
 * Use this when updating questions.js to ensure old attempts don't interfere.
 * 
 * Usage:
 *   cd backend
 *   node scripts/clearAttempts.js
 * 
 * Requirements:
 *   - MONGO_URI must be set in .env file
 *   - MongoDB connection must be accessible
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Attempt = require("../models/Attempt");

async function clearAttempts() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB connected");

    // Count existing attempts
    const countBefore = await Attempt.countDocuments();
    console.log(`\nFound ${countBefore} attempt(s) in database`);

    if (countBefore === 0) {
      console.log("No attempts to delete. Database is already clean.");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Delete all attempts
    console.log("\nDeleting all attempts...");
    const result = await Attempt.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} attempt(s)`);

    // Verify deletion
    const countAfter = await Attempt.countDocuments();
    console.log(`\nRemaining attempts: ${countAfter}`);

    if (countAfter === 0) {
      console.log("\n✓ Success! All attempts cleared.");
    } else {
      console.log("\n⚠ Warning: Some attempts may still exist.");
    }

    // Close connection
    await mongoose.connection.close();
    console.log("\n✓ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error("\nMake sure:");
    console.error("  1. MONGO_URI is set in .env file");
    console.error("  2. MongoDB is accessible");
    console.error("  3. You're running from the backend directory");
    process.exit(1);
  }
}

// Run the script
clearAttempts();

