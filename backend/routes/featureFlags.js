/**
 * Feature Flags API Routes
 * Manage and retrieve feature flags
 */

const express = require('express');
const router = express.Router();
const {
  getAllFlags,
  getEnabledFeatures,
  updateFlag,
  createFlag,
  deleteFlag,
} = require('../lib/featureFlags');
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/feature-flags
 * @desc Get all feature flags (admin only)
 * @access Private (Admin)
 */
router.get('/', authenticate, (req, res) => {
  try {
    // In production, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ status: 'error', message: 'Admin only' });
    // }

    const flags = getAllFlags();
    res.json({
      status: 'success',
      data: flags,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/feature-flags/enabled
 * @desc Get enabled features for current user
 * @access Public
 */
router.get('/enabled', (req, res) => {
  try {
    const context = {
      userId: req.user?.id,
      userRole: req.user?.subscription_tier || 'free',
    };

    const enabledFeatures = getEnabledFeatures(context);

    res.json({
      status: 'success',
      data: {
        features: enabledFeatures,
        userId: context.userId,
        userRole: context.userRole,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * @route PUT /api/feature-flags/:name
 * @desc Update a feature flag
 * @access Private (Admin)
 */
router.put('/:name', authenticate, (req, res) => {
  try {
    // In production, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ status: 'error', message: 'Admin only' });
    // }

    const { name } = req.params;
    const updates = req.body;

    updateFlag(name, updates);

    res.json({
      status: 'success',
      message: `Feature flag '${name}' updated`,
      data: updates,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/feature-flags
 * @desc Create a new feature flag
 * @access Private (Admin)
 */
router.post('/', authenticate, (req, res) => {
  try {
    // In production, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ status: 'error', message: 'Admin only' });
    // }

    const { name, ...config } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Feature flag name is required',
      });
    }

    createFlag(name, config);

    res.status(201).json({
      status: 'success',
      message: `Feature flag '${name}' created`,
      data: { name, ...config },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * @route DELETE /api/feature-flags/:name
 * @desc Delete a feature flag
 * @access Private (Admin)
 */
router.delete('/:name', authenticate, (req, res) => {
  try {
    // In production, check if user is admin
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ status: 'error', message: 'Admin only' });
    // }

    const { name } = req.params;
    deleteFlag(name);

    res.json({
      status: 'success',
      message: `Feature flag '${name}' deleted`,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
