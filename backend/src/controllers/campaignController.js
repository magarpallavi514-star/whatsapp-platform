import campaignService from '../services/campaignService.js';

/**
 * Get available segments for audience selection
 */
export const getAvailableSegments = async (req, res) => {
  try {
    const accountId = req.account._id; // Use ObjectId for database queries

    const segments = await campaignService.getAvailableSegments(accountId);

    res.json({
      success: true,
      segments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create new campaign
 */
export const createCampaign = async (req, res) => {
  try {
    const accountId = req.account._id; // Use ObjectId for database queries
    const phoneNumberId = req.params.phoneNumberId || req.body.phoneNumberId; // Only phoneNumberId from params
    const data = req.body;

    const campaign = await campaignService.createCampaign(accountId, phoneNumberId, data);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all campaigns
 */
export const getCampaigns = async (req, res) => {
  try {
    const accountId = req.account._id; // Use ObjectId for database queries
    const phoneNumberId = req.params.phoneNumberId;
    const filters = {
      status: req.query.status,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 50,
      skip: parseInt(req.query.skip) || 0
    };

    const campaigns = await campaignService.getCampaigns(accountId, phoneNumberId, filters);

    res.json({
      success: true,
      campaigns,
      count: campaigns.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get campaign by ID
 */
export const getCampaignById = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;

    const campaign = await campaignService.getCampaignById(accountId, campaignId);

    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update campaign
 */
export const updateCampaign = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;
    const data = req.body;

    const campaign = await campaignService.updateCampaign(accountId, campaignId, data);

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete campaign
 */
export const deleteCampaign = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;

    await campaignService.deleteCampaign(accountId, campaignId);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Validate campaign
 */
export const validateCampaign = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;

    const validation = await campaignService.validateCampaign(accountId, campaignId);

    res.json({
      success: true,
      ...validation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Estimate audience reach
 */
export const estimateAudienceReach = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { audience } = req.body;

    const reach = await campaignService.estimateAudienceReach(accountId, audience);

    res.json({
      success: true,
      estimatedReach: reach
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Start campaign
 */
export const startCampaign = async (req, res) => {
  try {
    const { accountId, phoneNumberId, campaignId } = req.params;

    const campaign = await campaignService.startCampaign(accountId, phoneNumberId, campaignId);

    res.json({
      success: true,
      message: 'Campaign started successfully',
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Pause campaign
 */
export const pauseCampaign = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;

    const campaign = await campaignService.pauseCampaign(accountId, campaignId);

    res.json({
      success: true,
      message: 'Campaign paused successfully',
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Resume campaign
 */
export const resumeCampaign = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;

    const campaign = await campaignService.resumeCampaign(accountId, campaignId);

    res.json({
      success: true,
      message: 'Campaign resumed successfully',
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Cancel campaign
 */
export const cancelCampaign = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;

    const campaign = await campaignService.cancelCampaign(accountId, campaignId);

    res.json({
      success: true,
      message: 'Campaign cancelled successfully',
      campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;

    const stats = await campaignService.getCampaignStats(accountId, campaignId);

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Save campaign as template
 */
export const saveCampaignAsTemplate = async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;
    const { templateName } = req.body;

    const template = await campaignService.saveCampaignAsTemplate(accountId, campaignId, templateName);

    res.status(201).json({
      success: true,
      message: 'Campaign saved as template successfully',
      template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Duplicate campaign
 */
export const duplicateCampaign = async (req, res) => {
  try {
    const { accountId, phoneNumberId, campaignId } = req.params;
    const { newName } = req.body;

    const duplicate = await campaignService.duplicateCampaign(accountId, phoneNumberId, campaignId, newName);

    res.status(201).json({
      success: true,
      message: 'Campaign duplicated successfully',
      campaign: duplicate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
