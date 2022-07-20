module.exports = function (mongoose) {
  return mongoose.Schema(
    {
      id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      name: { type: String, required: true, trim: true, unique: true },
    },
    {
      timestamps: true,
    }
  );
};
