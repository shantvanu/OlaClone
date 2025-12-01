import Booking from "../models/Booking";
import { assignmentService } from "./assignment.service";
import { log } from "../utils/logger";

/**
 * Service wrapper used by cron worker to process scheduled bookings.
 * The actual cron is in `workers/scheduler.worker.ts`, but this keeps
 * the business logic isolated and testable.
 */
export const schedulerService = {
  async runScheduler() {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - 1 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 6 * 60 * 1000);

      const bookings = await Booking.find({
        status: "scheduled",
        scheduledFor: { $gte: windowStart, $lte: windowEnd }
      });

      if (bookings.length > 0) {
        log(`📅 SchedulerService processing ${bookings.length} scheduled booking(s)`);
      }

      for (const bk of bookings) {
        if (
          !bk.pickup ||
          !bk.pickup.coords ||
          typeof bk.pickup.coords.lat !== "number" ||
          typeof bk.pickup.coords.lng !== "number"
        ) {
          log("❌ Skipping booking due to missing pickup.coords:", bk._id.toString());
          continue;
        }

        await Booking.findByIdAndUpdate(bk._id, {
          $set: { status: "pending_assignment" },
          $push: {
            logs: {
              ts: new Date(),
              text: "Moved to pending_assignment by schedulerService"
            }
          }
        });

        await assignmentService.tryAssignDriver(
          bk._id,
          bk.pickup.coords,
          bk.rideType as any
        );
      }
    } catch (err) {
      log("schedulerService.runScheduler error", err);
    }
  }
};
