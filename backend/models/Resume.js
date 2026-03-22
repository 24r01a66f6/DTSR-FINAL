const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // 'text', 'header', etc.
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  content: { type: String },
  fontSize: { type: Number },
  fontWeight: { type: mongoose.Schema.Types.Mixed }, // String or Number
  fontFamily: { type: String },
  align: { type: String },
  fill: { type: String }
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Resume'
  },
  layout: [blockSchema],
  templateData: { type: mongoose.Schema.Types.Mixed },
  score: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
