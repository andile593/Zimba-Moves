const cron = require("node-cron");
const { processWeeklyPayouts } = require("./processPayouts");

// Run every Friday at 10:00 AM
cron.schedule("0 10 * * 5", () => {
  console.log("Running weekly payout job...");
  processWeeklyPayouts();
});
