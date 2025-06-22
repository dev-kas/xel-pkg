import mongoose from 'mongoose';

/**
 * Schema for the Counter model.
 *
 * This model is used to generate unique sequential identifiers for other models.
 *
 * @typedef {Object} Counter
 * @property {string} _id - Identifier for the counter. Defaults to "global".
 * @property {number} seq - The current sequence number.
 */
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'global',
  },
  seq: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('Counter', counterSchema);
