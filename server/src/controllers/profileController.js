import { Profile, User } from '../models/index.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, address, city, country, avatar_url } = req.body;

    // Update user document
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { full_name: full_name || '' },
      { new: true, runValidators: true }
    ).select('-password');

    // Update or create profile
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      {
        full_name: full_name || '',
        phone: phone || '',
        address: address || '',
        city: city || '',
        country: country || '',
        avatar_url: avatar_url || ''
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON(),
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get all profiles (admin)
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate('user_id', 'email full_name role is_active')
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message
    });
  }
};

// Get profile by user ID (admin)
export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await Profile.findOne({ user_id: id })
      .populate('user_id', 'email full_name role is_active');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update profile by user ID (admin)
export const updateProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, city, country, avatar_url, is_active, role } = req.body;

    // Update user if needed
    if (full_name !== undefined || is_active !== undefined || role !== undefined) {
      const userUpdate = {};
      if (full_name !== undefined) userUpdate.full_name = full_name;
      if (is_active !== undefined) userUpdate.is_active = is_active;
      if (role !== undefined) userUpdate.role = role;
      
      await User.findByIdAndUpdate(
        id,
        userUpdate,
        { new: true, runValidators: true }
      );
    }

    // Update profile
    const profile = await Profile.findOneAndUpdate(
      { user_id: id },
      {
        full_name: full_name || '',
        phone: phone || '',
        address: address || '',
        city: city || '',
        country: country || '',
        avatar_url: avatar_url || ''
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('user_id', 'email full_name role is_active');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete profile (admin)
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete profile
    const profile = await Profile.findOneAndDelete({ user_id: id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
};