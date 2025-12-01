// src/workers/assignment.worker.ts
import cron from "node-cron";
import { assignmentService } from "../services/assignment.service";
import { log } from "../utils/logger";

/**
 * Periodically free stale assigned drivers who didn't accept within timeout
 */
cron.schedule("*/1 * * * *", async () => {
  try {
    const freed = await assignmentService.freeStaleAssignedDrivers();
    if (freed > 0) {
      log(`⏰ Freed ${freed} stale driver assignment(s)`);
    }
  } catch (err) {
    log("assignment.worker error", err);
  }
});
