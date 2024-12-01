const models = require('../models');

const { Pokemon } = models;

const pokemonList = [];
const staticURL = 'https://pokeapi.co/api/v2/pokemon/';

const makerPage = async (req, res) => {
  res.render('app');
  for (let i = 1; i < 1026; i++) {
    fetch(`${staticURL + i}/`)
      .then((response) => response.json())
      .then((out) => {
        pokemonList.push(out);
      })
      .catch((err) => console.error(err));
  }
};

const makePokemon = async (req, res) => {
  let selectedPkmn;

  if (!req.body.name || !req.body.level) {
    return res.status(400).json({ error: 'Both name and level are required!' });
  }

  // if there is no pokemon existing with the name input
  if (!pokemonList.map((pkmn) => pkmn.name).includes(req.body.name.toLowerCase())) {
    console.log('none!');
    return res.status(400).json({ error: 'Not a valid Pokemon!' });
  }

  pokemonList.forEach((pkmn) => {
    if (req.body.name.toLowerCase() === pkmn.name) {
      selectedPkmn = pkmn;
    }
  });

  const pokemonData = {
    name: req.body.name,
    level: req.body.level,
    dexNum: selectedPkmn.id,
    owner: req.session.account._id,
  };

  try {
    const newPokemon = new Pokemon(pokemonData);
    await newPokemon.save();
    return res.status(201).json({
      name: newPokemon.name,
      level: newPokemon.level,
      dexNum: newPokemon.dexNum,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Pokemon already exists!' });
    }
    return res.status(500).json({ error: 'An error occurred making pokemon!' });
  }
};

const getPokemon = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Pokemon.find(query).select('name level dexNum').lean().exec();

    return res.json({ pokemon: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving pokemon!' });
  }
};

module.exports = {
  makerPage,
  makePokemon,
  getPokemon,
};
