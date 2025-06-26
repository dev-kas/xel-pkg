import mongoose from 'mongoose';
import counterModel from './counter.model.js';

/**
 * Mongoose schema for Version documents.
 *
 * @typedef {Object} VersionDocument
 * @property {Number} id - Unique identifier for the version.
 * @property {Number} gid - Unique identifier for the version (globally unique).
 * @property {String} version - String representation of the version.
 * @property {Object} semver - SemVer representation of the version.
 * @property {Number} semver.major - Major version number.
 * @property {Number} semver.minor - Minor version number.
 * @property {Number} semver.patch - Patch version number.
 * @property {Number} package - ID of the package.
 * @property {Number} downloads - Number of downloads.
 * @property {String} license - License of the package.
 * @property {String} dist_mode - Distribution mode of the package.
 * @property {String} xel - Xel version range.
 * @property {String} engine - Engine version range.
 * @property {Date} updatedAt - Timestamp when the version was last updated.
 * @property {Date} publishedAt - Timestamp when the version was published.
 */
const versionSchema = new mongoose.Schema(
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
    version: {
      type: String,
      required: true,
    },
    semver: {
      major: {
        type: Number,
        required: true,
      },
      minor: {
        type: Number,
        required: true,
      },
      patch: {
        type: Number,
        required: true,
      },
    },
    package: {
      type: Number,
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },
    license: {
      type: String,
      required: true,
    },
    dist_mode: {
      type: String,
      required: true,
      enum: ['release', 'pre-release'],
    },
    xel: {
      type: String,
      required: true,
    },
    engine: {
      type: String,
      required: true,
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

versionSchema.pre('save', async function () {
  if (this.isNew && typeof this.gid !== 'number') {
    const { seq: id } = await counterModel.findByIdAndUpdate(
      'versions',
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

versionSchema.index({
  package: 1,
  'semver.major': 1,
  'semver.minor': 1,
  'semver.patch': 1,
});

export default mongoose.model('Version', versionSchema);
