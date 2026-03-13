import Skill from '../models/Skill.js';

/**
 * @desc    Get all skills
 * @route   GET /api/skills
 * @access  Public
 */
export const getSkills = async (req, res, next) => {
  try {
    const { category, search, isActive } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skills = await Skill.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single skill
 * @route   GET /api/skills/:id
 * @access  Public
 */
export const getSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new skill
 * @route   POST /api/skills
 * @access  Private (Admin)
 */
export const createSkill = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;

    const skill = await Skill.create({
      name,
      category,
      description,
      icon
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update skill
 * @route   PUT /api/skills/:id
 * @access  Private (Admin)
 */
export const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete skill
 * @route   DELETE /api/skills/:id
 * @access  Private (Admin)
 */
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get skill categories
 * @route   GET /api/skills/categories/list
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Skill.distinct('category');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
