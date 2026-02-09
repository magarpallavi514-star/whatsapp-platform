import DiscountConfig from '../models/DiscountConfig.js';
import PricingPlan from '../models/PricingPlan.js';

// Get all discount configurations
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await DiscountConfig.find()
      .populate('pricingPlanId', 'name price billingCycle')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: discounts,
      count: discounts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discounts',
      error: error.message
    });
  }
};

// Get discount by pricing plan
export const getDiscountByPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const discount = await DiscountConfig.findOne({ pricingPlanId: planId });
    
    if (!discount) {
      // Return default discounts if not configured
      return res.json({
        success: true,
        data: {
          monthlyDiscount: 0,
          quarterlyDiscount: 10,
          annualDiscount: 20,
          source: 'default'
        }
      });
    }
    
    res.json({
      success: true,
      data: discount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discount',
      error: error.message
    });
  }
};

// Update discount configuration
export const updateDiscount = async (req, res) => {
  try {
    const { planId } = req.params;
    const { monthlyDiscount, quarterlyDiscount, annualDiscount, reason } = req.body;
    const adminEmail = req.user?.email || 'system';

    // Validate percentages
    const discounts = { monthlyDiscount, quarterlyDiscount, annualDiscount };
    for (const [key, value] of Object.entries(discounts)) {
      if (value !== undefined && (value < 0 || value > 100)) {
        return res.status(400).json({
          success: false,
          message: `${key} must be between 0 and 100`
        });
      }
    }

    // Check if plan exists
    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    // Update or create discount config
    const updatedDiscount = await DiscountConfig.findOneAndUpdate(
      { pricingPlanId: planId },
      {
        pricingPlanId: planId,
        planName: plan.name,
        monthlyDiscount: monthlyDiscount ?? 0,
        quarterlyDiscount: quarterlyDiscount ?? 10,
        annualDiscount: annualDiscount ?? 20,
        updatedBy: adminEmail,
        reason: reason || `Updated by ${adminEmail}`,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Discount configuration updated successfully',
      data: updatedDiscount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update discount',
      error: error.message
    });
  }
};

// Reset discounts to defaults for a plan
export const resetDiscount = async (req, res) => {
  try {
    const { planId } = req.params;
    const adminEmail = req.user?.email || 'system';

    const result = await DiscountConfig.deleteOne({ pricingPlanId: planId });

    res.json({
      success: true,
      message: 'Discount reset to defaults',
      data: {
        monthlyDiscount: 0,
        quarterlyDiscount: 10,
        annualDiscount: 20,
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset discount',
      error: error.message
    });
  }
};

// Get discount history for auditing
export const getDiscountHistory = async (req, res) => {
  try {
    const { planId } = req.params;
    const history = await DiscountConfig.find({ pricingPlanId: planId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
};

// Export discounts as CSV for backup
export const exportDiscounts = async (req, res) => {
  try {
    const discounts = await DiscountConfig.find()
      .populate('pricingPlanId', 'name price billingCycle');

    const csv = ['Plan Name,Monthly %,Quarterly %,Annual %,Updated By,Updated At'];
    discounts.forEach(d => {
      csv.push(
        `"${d.planName}",${d.monthlyDiscount},${d.quarterlyDiscount},${d.annualDiscount},"${d.updatedBy}","${d.updatedAt.toISOString()}"`
      );
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=discount-config.csv');
    res.send(csv.join('\n'));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export discounts',
      error: error.message
    });
  }
};
