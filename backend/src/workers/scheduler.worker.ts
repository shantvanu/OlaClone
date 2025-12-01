// src/workers/scheduler.worker.ts
import cron from "node-cron";
import Booking from "../models/Booking";
import { assignmentService } from "../services/assignment.service";
import { log } from "../utils/logger";

cron.schedule("* * * * *", async () => {
  // Only log when there are scheduled bookings to process
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 1 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 6 * 60 * 1000);

    const bookings = await Booking.find({
      status: "scheduled",
      scheduledFor: { $gte: windowStart, $lte: windowEnd }
    });

    if (bookings.length > 0) {
      log(`📅 Processing ${bookings.length} scheduled booking(s)`);
    }

    for (const bk of bookings) {
      // 🔥 FIX 1: Check if pickup & coords exist
      if (
        !bk.pickup ||
        !bk.pickup.coords ||
        typeof bk.pickup.coords.lat !== "number" ||
        typeof bk.pickup.coords.lng !== "number"
      ) {
        log("❌ Skipping booking due to missing pickup.coords:", bk._id.toString());
        continue;
      }

      // Move booking to pending assignment
      await Booking.findByIdAndUpdate(bk._id, {
        $set: { status: "pending_assignment" },
        $push: {
          logs: {
            ts: new Date(),
            text: "Moved to pending_assignment by scheduler"
          }
        }
      });

      // Assign driver
      await assignmentService.tryAssignDriver(
        bk._id,
        bk.pickup.coords, // ⭐ Now guaranteed safe
        bk.rideType
      );
    }
  } catch (err) {
    log("Scheduler worker error", err);
  }
});
