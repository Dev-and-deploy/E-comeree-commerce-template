import mongoose from 'mongoose';
import User from './src/models/User.js';
import Profile from './src/models/Profile.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin user
    const superAdminData = {
      email: 'superadmin@example.com',
      password: 'SuperAdminPassword123!',
      full_name: 'Super Admin',
      role: 'super_admin',
      is_active: true,
    };

    const superAdmin = new User(superAdminData);
    await superAdmin.save();
    console.log('Super admin user created:', superAdmin.email);

    // Create profile for super admin
    const profile = new Profile({
      user_id: superAdmin._id,
      full_name: superAdmin.full_name,
    });
    await profile.save();
    console.log('Profile created for super admin');

    console.log('Super admin setup completed successfully!');
    console.log('Email:', superAdminData.email);
    console.log('Password: SuperAdminPassword123!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
