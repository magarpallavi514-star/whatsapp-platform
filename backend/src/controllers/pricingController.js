import PricingPlan from '../models/PricingPlan.js';
import { generateId } from '../utils/idGenerator.js';

// Get all active pricing plans (for public website)
export const getPublicPricingPlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find({ isActive: true })
      .sort({ monthlyPrice: 1 })
      .select('-updatedBy');

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing plans'
    });
  }
};

// Get single pricing plan details
export const getPricingPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await PricingPlan.findOne({ planId, isActive: true });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing plan'
    });
  }
};

// [SUPERADMIN] Create new pricing plan
export const createPricingPlan = async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can create pricing plans'
      });
    }

    const {
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      currency,
      monthlyDiscount,
      yearlyDiscount,
      limits,
      features,
      isPopular
    } = req.body;

    // Validate required fields
    if (!name || monthlyPrice === undefined || yearlyPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, monthlyPrice, yearlyPrice'
      });
    }

    // Check if plan name already exists
    const existingPlan = await PricingPlan.findOne({ name });
    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: 'A plan with this name already exists'
      });
    }

    const planId = `plan_${generateId()}`;

    const newPlan = new PricingPlan({
      planId,
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      currency: currency || 'USD',
      monthlyDiscount: monthlyDiscount || 0,
      yearlyDiscount: yearlyDiscount || 0,
      limits: limits || {},
      features: features || [],
      isPopular: isPopular || false,
      updatedBy: req.account._id
    });

    await newPlan.save();

    res.status(201).json({
      success: true,
      message: 'Pricing plan created successfully',
      data: newPlan
    });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pricing plan'
    });
  }
};

// [SUPERADMIN] Update pricing plan
export const updatePricingPlan = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can update pricing plans'
      });
    }

    const { planId } = req.params;
    const updates = req.body;

    // Prevent changing plan name to avoid conflicts
    if (updates.name) {
      const existingPlan = await PricingPlan.findOne({
        name: updates.name,
        planId: { $ne: planId }
      });
      if (existingPlan) {
        return res.status(409).json({
          success: false,
          message: 'A plan with this name already exists'
        });
      }
    }

    const plan = await PricingPlan.findOneAndUpdate(
      { planId },
      {
        ...updates,
        updatedBy: req.account._id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pricing plan'
    });
  }
};

// [SUPERADMIN] Delete pricing plan
export const deletePricingPlan = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can delete pricing plans'
      });
    }

    const { planId } = req.params;

    const plan = await PricingPlan.findOneAndUpdate(
      { planId },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing plan deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pricing plan'
    });
  }
};

// [SUPERADMIN] Get all pricing plans (including inactive)
export const getAllPricingPlans = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can view all pricing plans'
      });
    }

    const plans = await PricingPlan.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: plans,
      total: plans.length
    });
  } catch (error) {
    console.error('Error fetching all pricing plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing plans'
    });
  }
};

// [SUPERADMIN] Add feature to plan
export const addFeatureToPlan = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can modify plan features'
      });
    }

    const { planId } = req.params;
    const { name, description, included, limit } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Feature name is required'
      });
    }

    const plan = await PricingPlan.findOneAndUpdate(
      { planId },
      {
        $push: {
          features: {
            name,
            description: description || '',
            included: included !== false,
            limit: limit || null
          }
        },
        updatedAt: new Date(),
        updatedBy: req.account._id
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feature added successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error adding feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feature'
    });
  }
};

// [SUPERADMIN] Remove feature from plan
export const removeFeatureFromPlan = async (req, res) => {
  try {
    if (req.account.type !== 'internal') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmins can modify plan features'
      });
    }

    const { planId, featureId } = req.params;

    const plan = await PricingPlan.findOneAndUpdate(
      { planId },
      {
        $pull: { features: { _id: featureId } },
        updatedAt: new Date(),
        updatedBy: req.account._id
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feature removed successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error removing feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove feature'
    });
  }
};
