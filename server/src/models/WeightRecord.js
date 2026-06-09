/**
 * 体重历史记录
 * 每次用户更新体重时可写入一条记录
 */
const mongoose = require('mongoose');

const weightRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeightRecord', weightRecordSchema);
