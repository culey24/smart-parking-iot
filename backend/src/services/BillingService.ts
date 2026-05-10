import { PricingPolicy } from '../models/PricingPolicy';

export class BillingService {
  static async calculateFee(startTime: Date, endTime: Date, vehicleType: string, userRole: string): Promise<number> {
    try {
      // 1. Resolve the pricing role (map sub-roles to main billing categories)
      let pricingRole = 'VISITOR';
      if (userRole === 'LEARNER') pricingRole = 'LEARNER';
      else if (['FACULTY', 'IT_TEAM', 'FINANCE_OFFICE', 'OPERATOR', 'ADMIN'].includes(userRole)) pricingRole = 'FACULTY';

      // 2. Fetch the active policy
      const policy = await PricingPolicy.findOne({ 
        userRole: pricingRole,
        vehicleType: vehicleType 
      });

      if (!policy || !policy.specialRules || policy.specialRules.length === 0) {
        console.warn(`[Billing] No policy found for ${pricingRole}/${vehicleType}. Falling back to default fee.`);
        return 5000; 
      }

      const dayOfWeek = endTime.getDay(); // Check-out day
      const hourOfDay = endTime.getHours(); // Check-out hour

      // 3. Determine the base rate from the "Default" rule (first row)
      let applicableRate = policy.specialRules[0].rate;
      
      // 4. Scan for matching special rule overrides (First match after default wins)
      for (let i = 1; i < policy.specialRules.length; i++) {
        const rule = policy.specialRules[i];
        
        const isDayMatch = rule.daysOfWeek.length === 0 || rule.daysOfWeek.includes(dayOfWeek);
        let isTimeMatch = false;

        // Handle full day vs specific range vs overnight range
        if (rule.startHour === 0 && rule.endHour === 23) {
          isTimeMatch = true; 
        } else if (rule.startHour > rule.endHour) {
          // Overnight case: e.g., 22:00 to 06:00
          isTimeMatch = hourOfDay >= rule.startHour || hourOfDay < rule.endHour;
        } else {
          // Normal case: e.g., 08:00 to 17:00
          isTimeMatch = hourOfDay >= rule.startHour && hourOfDay < rule.endHour;
        }

        if (isDayMatch && isTimeMatch) {
          applicableRate = rule.rate;
          break; // Stop at the first specialized rule that matches
        }
      }

      // 5. Calculate the gross fee based on method
      let totalFee = 0;
      if (policy.calculationType === 'PER_TURN') {
        // Flat fee applied at checkout regardless of duration
        totalFee = applicableRate;
      } else {
        // Duration-based billing (rounding up to nearest interval)
        const durationMs = endTime.getTime() - startTime.getTime();
        const intervalMs = (policy.billingIntervalMinutes || 60) * 60 * 1000;
        const intervals = Math.ceil(durationMs / intervalMs);
        
        totalFee = Math.max(1, intervals) * applicableRate;
      }

      // 6. Apply role-specific discounts (e.g., Faculty/Staff)
      // This applies to both Hourly and Per Turn rates
      if (policy.discountPercent && policy.discountPercent > 0) {
        const discountAmount = (totalFee * policy.discountPercent) / 100;
        totalFee -= discountAmount;
      }

      return Math.round(Math.max(0, totalFee));

    } catch (error) {
      console.error('[Billing] Fee calculation failed:', error);
      throw error;
    }
  }

  static calculateCycleFee(sessions: any[]): number {
    return sessions.reduce((totalAmount, session) => totalAmount + (session.fee || 0), 0);
  }
}