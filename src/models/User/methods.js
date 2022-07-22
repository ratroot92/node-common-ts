/* eslint-disable func-names */
const bcryptJs = require('bcryptjs');
const userSchema = require('./schema');

module.exports = function (mongoose) {
  function preFindHook(next) {
    this.select('-__v -createdAt -updatedAt -password');
    this.populate('role');
    next();
  }
  const userSchema = require('./schema')(mongoose);
  userSchema.statics.existById = async function existById(id) {
    const role = await User.findById(id);
    if (role === null) throw new Error(`User with id '${id}' does not exists!`);
    return id;
  };
  userSchema.pre('find', preFindHook);
  userSchema.pre('findById', preFindHook);

  userSchema.pre('save', async function (next) {
    // if (!this.isModified('password')) {
    //   return next();
    // }
    // const salt = await bcryptJs.genSalt(10);
    // this.password = await bcryptJs.hash(this.password, 10);
    // console.log('this.email    ==>', this.email);
    // console.log('this.password ==>', this.password);

    return next();
  });
  const User = mongoose.model('user', userSchema);
  return User;
};
