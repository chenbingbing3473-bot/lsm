/**
 * 代厨模型
 */
const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: { type: String, required: true, trim: true },
    name_zh: { type: String, trim: true },
    avatar: { type: String, required: true },
    distance: { type: String, default: '1.0 miles' },
    distance_zh: { type: String, default: '1.0 英里' },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    specialty: { type: String, default: 'HOME COOKING' },
    specialty_zh: { type: String, default: '家常菜' },
    responseTime: { type: String, default: '10m' },
    responseTime_zh: { type: String, default: '10分钟' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

chefSchema.methods.toFrontendJSON = function toFrontendJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    name_zh: this.name_zh || this.name,
    avatar: this.avatar,
    distance: this.distance,
    distance_zh: this.distance_zh || this.distance,
    rating: this.rating,
    specialty: this.specialty,
    specialty_zh: this.specialty_zh || this.specialty,
    responseTime: this.responseTime,
    responseTime_zh: this.responseTime_zh || this.responseTime,
  };
};

module.exports = mongoose.model('Chef', chefSchema);
