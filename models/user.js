'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['client', 'seller'],
      default: 'client'
    },
    photo: {
      type: String
    },
    location: {
      type: {
        type: String
        //default: 'Point'
      },
      coordinates: [
        {
          type: Number,
          min: -180,
          max: 180
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

schema.virtual('latitude').get(function() {
  const user = this;
  if (
    user &&
    user.location &&
    user.location.coordinates &&
    user.location.coordinates.length
  ) {
    return user.location.coordinates[1];
  }
});

schema.virtual('longitude').get(function() {
  const user = this;
  if (
    user &&
    user.location &&
    user.location.coordinates &&
    user.location.coordinates.length
  ) {
    return user.location.coordinates[0];
  }
});

schema.set('toJSON', { getters: true, virtuals: false });
schema.set('toObject', { getters: true, virtuals: false });

schema.index({
  location: '2dsphere'
});

module.exports = mongoose.model('User', schema);
