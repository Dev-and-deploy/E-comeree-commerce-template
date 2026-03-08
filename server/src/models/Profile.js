import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    avatar_url: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
profileSchema.index({ user_id: 1 });

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
