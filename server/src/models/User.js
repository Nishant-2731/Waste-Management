import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true, trim: true },
    points: { type: Number, required: true, default: 0 },
    isEmailVerified: { type: Boolean, default: false },
    // Optional basic audit
    logs: [
      {
        type: {
          type: String,
          enum: ['award', 'redeem'],
          required: true,
        },
        amount: { type: Number, required: true },
        name: { type: String }, // reward name
        reason: { type: String }, // e.g., 'device-serial'
        serial: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = mongoose.model('User', UserSchema);