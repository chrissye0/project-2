const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const PokemonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  level: {
    type: Number,
    min: 1,
    required: true,
  },
  dexNum: {
    type: Number,
    min: 1,
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PokemonSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  level: doc.level,
  dexNum: doc.dexNum,
});

const PokemonModel = mongoose.model('Pokemon', PokemonSchema);

module.exports = PokemonModel;
