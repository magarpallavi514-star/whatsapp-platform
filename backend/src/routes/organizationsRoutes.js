/**
 * Organizations Routes
 * Admin endpoints for managing registered organizations/users
 */

import express from 'express';
import {
  getAllOrganizations,
  createOrganization,
  getOrganizationById,
  updateOrganization,
  deleteOrganization
} from '../controllers/organizationsController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/organizations
 * @desc    Get all registered users/organizations
 * @access  Admin only (requires JWT auth)
 */
router.get('/', getAllOrganizations);

/**
 * @route   POST /api/admin/organizations
 * @desc    Create new organization/user
 * @access  Admin only (requires JWT auth)
 */
router.post('/', createOrganization);

/**
 * @route   GET /api/admin/organizations/:id
 * @desc    Get single organization by ID
 * @access  Admin only (requires JWT auth)
 */
router.get('/:id', getOrganizationById);

/**
 * @route   PUT /api/admin/organizations/:id
 * @desc    Update organization details
 * @access  Admin only (requires JWT auth)
 */
router.put('/:id', updateOrganization);

/**
 * @route   DELETE /api/admin/organizations/:id
 * @desc    Delete organization
 * @access  Admin only (requires JWT auth)
 */
router.delete('/:id', deleteOrganization);

export default router;
