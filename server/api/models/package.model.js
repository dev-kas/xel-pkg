import mongoose from 'mongoose';
import counterModel from './counter.model.js';

/**
 * Mongoose schema for Package documents
 *
 * @typedef {Object} PackageDocument
 * @property {Number} id - Unique identifier for the package
 * @property {Number} gid - Unique identifier for the package (globally unique)
 * @property {String} name - Name of the package
 * @property {Number} latest - ID of the latest version of the package
 * @property {String} description - Description of the package
 * @property {String} author - Author of the package
 * @property {String} repo_name - Name of the repository
 * @property {String} url - URL of the repository
 * @property {String} mirror - URL of the mirror
 * @property {String[]} tags - Tags for the package
 * @property {Boolean} isDeprecated - Whether the package is deprecated
 * @property {String} deprecatedReason - Reason for deprecation
 */
const packageSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      index: true,
    },
    gid: {
      type: Number,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    latest: {
      type: Number,
    },
    description: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    mirror: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isDeprecated: {
      type: Boolean,
      default: false,
    },
    deprecatedReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

packageSchema.pre('save', async function () {
  if (this.isNew && typeof this.gid !== 'number') {
    const { seq: id } = await counterModel.findByIdAndUpdate(
      'packages',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = id;

    const { seq: gid } = await counterModel.findByIdAndUpdate(
      'global',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.gid = gid;
  }
});

// Index for faster search
packageSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  author: 'text',
});

export default mongoose.model('Package', packageSchema);
