const _ = require('underscore');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

// Counter //

const counterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});


// Ingrediente en Hamburguesa //

const ingredienteEnHamburguesaSchema = new mongoose.Schema({
  path: { type: String, required: true }
}, {
  toObject: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});


// Hamburguesa //

const hamburguesaSchema = new mongoose.Schema({
  _id: Number,
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion:  { type: String, required: true },
  imagen:  { type: String, required: true },
  ingredientes: [ingredienteEnHamburguesaSchema]
}, {
  toObject: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

hamburguesaSchema.pre('save', function(next) {
    let doc = this;
    doc.ingredientes = _.uniq(doc.ingredientes);
    console.log(doc);
    mongoose.model('counter', counterSchema).findByIdAndUpdate({_id: 'hamburguesaId'}, {$inc: { seq: 1} }, function(error, c)   {
        if(error)
            return next(error);
        doc._id = c.seq;
        next();
    });
});
hamburguesaSchema.pre('validate', function(next) {
    let doc = this;

    if (doc.isModified('_id')) {
        doc.invalidate('_id');
    }
    if (doc.isModified('ingredientes')) {
        doc.invalidate('ingredientes');
    }

    next();
});


// Ingrediente //

const ingredienteSchema = new mongoose.Schema({
  _id: Number,
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true }
}, {
  toObject: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});


ingredienteSchema.pre('save', function(next) {
    let doc = this;
    mongoose.model('counter', counterSchema).findByIdAndUpdate({_id: "ingredienteId"}, {$inc: { seq: 1}}, function(error, c)   {
        if(error)
            return next(error);
        doc._id = c.seq;
        next();
    });
});


module.exports.ingredienteEnHamburguesaSchema = ingredienteEnHamburguesaSchema;
module.exports.hamburguesaSchema = hamburguesaSchema;
module.exports.ingredienteSchema = ingredienteSchema;
module.exports.counterSchema = counterSchema;
