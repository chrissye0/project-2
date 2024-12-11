const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect, createContext, useContext } = React;
const { createRoot } = require('react-dom/client');
const { Checkbox, FormControlLabel, TextField, Button, InputLabel, Select, MenuItem, Typography } = require('@mui/material');

// for referencing premium state across multiple components
const PremiumContext = createContext(null);
// for determining if the team is full is not
let pokeMax = false;

// component for displaying the current mode (basic or premium)
const ModeDisplay = (props) => {
    if (props.checked) {
        return <div id="modeDisplay"><Typography variant="h6">Mode: Premium</Typography></div>
    } else return <div id="modeDisplay"><Typography variant="h6">Mode: Basic</Typography></div>
};

// handlePokemon - called when the pokemon form is submitted - check fields and pokemon count, then send post
const handlePokemon = (e, onPokemonAdded) => {
    e.preventDefault();
    helper.hideError();
    const name = e.target.querySelector('#pokemonName').value;
    const level = e.target.querySelector('#pokemonLevel').value;
    if (pokeMax) {
        helper.handleError('Too many Pokemon!');
        return false;
    }
    if (!name || !level) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, { name, level }, onPokemonAdded);
    return false;
}

// handleDelete - called when a user chooses to delete a pokemon, send post with ID data
const handleDelete = (e, onPokemonDeleted, pokemon) => {
    e.preventDefault();
    helper.hideError();
    const id = pokemon._id;
    helper.sendPost(e.target.action, { id }, onPokemonDeleted);
    return false;
}

// component with form for submitting pokemon details (pokemon name and level)
const PokemonForm = (props) => {
    return (
        <form id="pokemonForm"
            onSubmit={(e) => handlePokemon(e, props.triggerReload)}
            name="pokemonForm"
            action="/maker"
            method="POST"
            className="pokemonForm"
        >
            <TextField id="pokemonName" type="text" name="name" label="Pokemon" />
            <TextField id="pokemonLevel" type="number" min="1" name="level" label="Level" />
            <Button variant="contained" className="makePokemonSubmit" type="submit">Make Pokemon</Button>
        </form>
    );
};

// component for ability select with dynamically created ability options
const AbilitySelect = (props) => {
    const [selectedAbility, setAbility] = useState('');
    return (
        <>
            <InputLabel id="ability">Ability</InputLabel>
            <Select labelId="ability"
                id="abilityInput"
                value={selectedAbility}
                label="Ability"
                onChange={e => setAbility(e.target.value)}>
                {props.abilities.map(ability =>
                    (<MenuItem value={ability}> {ability} </MenuItem>))};
            </Select>
        </>
    )
};

// component for displaying all pokemon
const PokemonList = (props) => {
    const imgURL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
    const [pokemon, setPokemon] = useState(props.pokemon);
    const checked = useContext(PremiumContext);
    // load all pokemon and set
    useEffect(() => {
        const loadPokemonFromServer = async () => {
            const response = await fetch('/getPokemon');
            const data = await response.json();
            setPokemon(data.pokemon);
        };
        loadPokemonFromServer();
    }, [props.reloadPokemon]);
    // if no pokemon yet
    if (pokemon.length === 0) {
        return (
            <div className="pokemonList">
                <Typography variant="h3">No Pokemon yet!</Typography>
            </div>
        );
    }
    // if above max, change pokeMax variable to true
    if (pokemon.length > 5) {
        pokeMax = true;
    }
    // turn each pokemon into a div with a form
    const pokemonNodes = pokemon.map(pkmn => {
        return (
            <form
                onSubmit={(e) => {
                    handleDelete(e, props.triggerReload, pkmn);
                    window.location.reload();
                }
                }
                name="pokemonDeleteForm"
                action="/delete"
                method="POST"
                className="pokemon">
                <img src={`${imgURL}${pkmn.dexNum}.png`} alt="pokemon sprite" className="sprite" />
                <div id="pokemonInfo">
                    <Typography variant="subtitle1" className="pokemonName">{pkmn.name.toUpperCase()}</Typography>
                    <Typography variant="subtitle2" className="pokemonLevel">Level: {pkmn.level}</Typography>
                </div>
                <div className="ability" style={{ visibility: checked ? "visible" : "hidden" }}>
                    <AbilitySelect abilities={pkmn.abilities} />
                </div>
                <Button variant="outlined" type="submit" color="error" id="deleteButton">Delete</Button>
            </form>
        );
    });
    return (
        <div className="pokemonList">
            {pokemonNodes}
        </div>
    );
};

// component for displaying form and pokemon list
const PokemonTeam = () => {
    const [reloadPokemon, setReloadPokemon] = useState(false);
    return (
        <>
            <div id="makePokemon">
                <PokemonForm triggerReload={() => setReloadPokemon(!reloadPokemon)} />
            </div>
            <div id="pokemonList">
                <PokemonList pokemon={[]} reloadPokemon={reloadPokemon} />
            </div>
        </>
    )
}

const App = () => {
    const [checked, setChecked] = useState(false);
    return (
        <PremiumContext.Provider value={checked}>
            <FormControlLabel control={<Checkbox
                checked={checked}
                onChange={(e) => {
                    setChecked(e.target.checked)
                }}
                color="success"/>} label="Premium" id="premiumCheckbox" />
            <br />
            <ModeDisplay checked={checked} />
            <br />
            <PokemonTeam />
        </PremiumContext.Provider>
    )
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;