/**
 * 代厨订单模型
 */
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    /** 下单用户 */
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: { type: String, default: '' },
    /** 接单厨师（可选，发布公开需求时为空） */
    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chef',
      index: true,
    },
    chefName: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    type: {
      type: String,
      enum: ['chef_request', 'weekly_plan', 'market_request'],
      default: 'weekly_plan',
    },
    dietaryPreferences: { type: String, default: '' },
    allergies: { type: String, default: '' },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
    planFileUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.methods.toFrontendJSON = function toFrontendJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    price: this.price,
    status: this.status,
    type: this.type,
    chefName: this.chefName,
    customerName: this.customerName,
    dietaryPreferences: this.dietaryPreferences,
    allergies: this.allergies,
    notes: this.notes,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Order', orderSchema);
