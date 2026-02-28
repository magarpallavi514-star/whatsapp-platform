/**
 * Payment Timeout Job Scheduler
 * Uses node-cron to run payment timeout check every 15 minutes
 * Runs in background when server starts
 */

import cron from 'node-cron';
import { checkPaymentTimeouts } from '../jobs/paymentTimeoutJob.js';

let scheduledJob = null;

export const startPaymentTimeoutScheduler = () => {
  try {
    // Schedule job to run every 15 minutes (at 0, 15, 30, 45 minute marks)
    scheduledJob = cron.schedule('*/15 * * * *', async () => {
      try {
        await checkPaymentTimeouts();
      } catch (error) {
        console.error('❌ Payment timeout check error:', error.message);
      }
    });
    return scheduledJob;
  } catch (error) {
    console.error('❌ Failed to start payment timeout scheduler:', error.message);
    return null;
  }
};

export const stopPaymentTimeoutScheduler = () => {
  if (scheduledJob) {
    scheduledJob.stop();
    console.log('⏹️ Payment timeout scheduler stopped');
    return true;
  }
  return false;
};

// Alternative: Manual trigger function
// Use this if you want to trigger the job via API endpoint
export const triggerPaymentTimeoutCheck = async () => {
  console.log('🔔 [MANUAL TRIGGER] Running payment timeout check...');
  try {
    const result = await checkPaymentTimeouts();
    console.log('🔔 [MANUAL TRIGGER] Payment timeout check completed:', result);
    return result;
  } catch (error) {
    console.error('🔔 [MANUAL TRIGGER] Error:', error.message);
    throw error;
  }
};

export default {
  startPaymentTimeoutScheduler,
  stopPaymentTimeoutScheduler,
  triggerPaymentTimeoutCheck
};
