import mongoose from 'mongoose';
import counterModel from './counter.model.js';

/**
 * Mongoose schema for Tarball documents
 *
 * @typedef {Object} TarballDocument
 * @property {Number} id - Unique identifier for the tarball
 * @property {Number} gid - Unique identifier for the tarball (globally unique)
 * @property {Number} package - ID of the package
 * @property {Number} version - ID of the version
 * @property {String} url - URL of the tarball
 * @property {Number} size_bytes - Size of the tarball in bytes
 * @property {Object} integrity - Integrity information for the tarball
 * @property {String} integrity.algorithm - Algorithm used for integrity check
 * @property {String} integrity.hash - Hash of the tarball using the algorithm
 * @property {Number} downloads - Number of downloads
 */
const tarballSchema = new mongoose.Schema(
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
    package: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    size_bytes: {
      type: Number,
      required: true,
    },
    integrity: {
      algorithm: {
        type: String,
        required: true,
      },
      hash: {
        type: String,
        required: true,
      },
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0,
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

tarballSchema.pre('save', async function () {
  if (this.isNew && typeof this.gid !== 'number') {
    const { seq: id } = await counterModel.findByIdAndUpdate(
      'tarballs',
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

export default mongoose.model('Tarball', tarballSchema);
