const models = require('../models');

const { Pokemon } = models;

const pokemonList = [];
const staticURL = 'https://pokeapi.co/api/v2/pokemon/';

const makerPage = async (req, res) => {
  res.render('app');
};

const loadData = () => {
  for (let i = 1; i < 1026; i++) {
    fetch(`${staticURL + i}/`)
      .then((response) => response.json())
      .then((out) => {
        pokemonList.push(out);
      })
      .catch((err) => console.error(err));
  }
};

loadData();

const makePokemon = async (req, res) => {
  console.log(req)
  let selectedPkmn;

  if (!req.body.name || !req.body.level) {
    return res.status(400).json({ error: 'Both name and level are required!' });
  }

  // if there is no pokemon existing with the name input
  if (!pokemonList.map((pkmn) => pkmn.name).includes(req.body.name.toLowerCase())) {
    return res.status(400).json({ error: 'Not a valid Pokemon!' });
  }

  // if level is over 100
  if (req.body.level > 100) {
    return res.status(400).json({ error: 'Level too high!' });
  }

  pokemonList.forEach((pkmn) => {
    if (req.body.name.toLowerCase() === pkmn.name) {
      selectedPkmn = pkmn;
    }
  });

  const pokemonData = {
    name: req.body.name.toLowerCase(),
    level: req.body.level,
    dexNum: selectedPkmn.id,
    abilities: selectedPkmn.abilities.map((ability) => ability.ability.name),
    owner: req.session.account._id,
  };

  try {
    const newPokemon = new Pokemon(pokemonData);
    await newPokemon.save();
    return res.status(201).json({
      name: newPokemon.name,
      level: newPokemon.level,
      dexNum: newPokemon.dexNum,
      abilities: newPokemon.abilities,
      _id: newPokemon.id,
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Pokemon already exists!' });
    }
    return res.status(500).json({ error: 'An error occurred making pokemon!' });
  }
};

const deletePokemon = async (req, res) => {
  console.log(req)
  Pokemon.deleteOne({ _id: req.body.id }).then(() => {
    console.log('deleted');
  }).catch(() => {
    console.log('error deleting Pokemon');
  });
  return res.status(200).json({message: "success"});
};

const getPokemon = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Pokemon.find(query).select('name level dexNum abilities').lean().exec();

    return res.json({ pokemon: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving pokemon!' });
  }
};

module.exports = {
  makerPage,
  loadData,
  makePokemon,
  getPokemon,
  deletePokemon,
};
