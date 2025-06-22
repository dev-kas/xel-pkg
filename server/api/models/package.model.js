import mongoose from 'mongoose';
import counterModel from './counter.model.js';

/**
 * Mongoose schema for Package documents
 *
 * @typedef {Object} PackageDocument
 * @property {Number} id - Unique identifier for the package
 * @property {Number} gid - Unique identifier for the package (globally unique)
 * @property {String} name - Name of the package
 * @property {ObjectId} latest - ObjectId of the latest version of the package
 * @property {String} description - Description of the package
 * @property {String} author - Author of the package
 * @property {String} repo_name - Name of the repository
 * @property {String} url - URL of the repository
 * @property {String} mirror - URL of the mirror
 * @property {String[]} tags - Tags for the package
 * @property {Number} downloads - Number of downloads
 * @property {String} homepage - Homepage of the package
 * @property {String} changelog - Changelog of the package
 * @property {String} bugs - Bug tracker URL
 * @property {Date} updatedAt - Timestamp when the package was last updated
 * @property {Date} publishedAt - Timestamp when the package was published
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Version',
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
    repo_name: {
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
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
    homepage: {
      type: String,
      trim: true,
    },
    changelog: {
      type: String,
      trim: true,
    },
    bugs: {
      type: String,
      trim: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
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

packageSchema.pre('save', async function (next) {
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
  next();
});

// Index for faster search
packageSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  author: 'text',
});

export default mongoose.model('Package', packageSchema);
