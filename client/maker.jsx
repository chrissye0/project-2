const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect, createContext, useContext } = React;
const { createRoot } = require('react-dom/client');

const PremiumContext = createContext(null);

const ModeDisplay = (props) => {
    if (props.checked) {
        return <div> Mode: Premium</div>
    } else return <div> Mode: Basic </div>
};
let pokeMax = false;

const handlePokemon = (e, onPokemonAdded) => {
    e.preventDefault();
    helper.hideError();
    console.log(e.target.action);
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

const handleDelete = (e, onPokemonDeleted, pokemon) => {
    e.preventDefault();
    helper.hideError();
    const id = pokemon._id;
    helper.sendPost(e.target.action, { id }, onPokemonDeleted);
    return false;
}

const PokemonForm = (props) => {
    return (
        <form id="pokemonForm"
            onSubmit={(e) => handlePokemon(e, props.triggerReload)}
            name="pokemonForm"
            action="/maker"
            method="POST"
            className="pokemonForm"
        >
            <label htmlFor="name">Pokemon: </label>
            <input id="pokemonName" type="text" name="name" placeholder="Pokemon Name" />
            <label htmlFor="level">Level: </label>
            <input id="pokemonLevel" type="number" min="1" name="level" />
            <input className="makePokemonSubmit" type="submit" value="Make Pokemon" />
        </form>
    );
};

const AbilitySelect = (props) => {
    const [selectedAbility, setAbility] = useState('');
    return (
        <select value={selectedAbility} onChange={e => setAbility(e.target.value)}>
            {props.abilities.map(ability =>
                (<option value={ability}> {ability} </option>))};
        </select>
    )
};

const PokemonList = (props) => {
    const [pokemon, setPokemon] = useState(props.pokemon);
    const checked = useContext(PremiumContext);

    useEffect(() => {
        const loadPokemonFromServer = async () => {
            const response = await fetch('/getPokemon');
            const data = await response.json();
            setPokemon(data.pokemon);
        };
        loadPokemonFromServer();
    }, [props.reloadPokemon]);

    if (pokemon.length === 0) {
        return (
            <div className="pokemonList">
                <h3 className="emptyPokemon">No Pokemon Yet!</h3>
            </div>
        );
    }

    if (pokemon.length > 5) {
        pokeMax = true;
    }

    const pokemonNodes = pokemon.map(pkmn => {
        return (
            <div key={pkmn._id} className="pkmn">
                <form
                    onSubmit={(e) => {
                        handleDelete(e, props.triggerReload, pkmn);
                        window.location.reload();
                    }
                    }
                    name="pokemonDeleteForm"
                    action="/delete"
                    method="POST"
                    className="pokemonForm">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.dexNum}.png`} alt="pokemon sprite" className="sprite" />
                    <h3 className="pokemonName">{pkmn.name.toUpperCase()}</h3>
                    <h3 className="pokemonLevel">Level: {pkmn.level}</h3>
                    <div className="ability" style={{ visibility: checked ? "visible" : "hidden" }}>
                        <h3 className="pokemonAbility">Ability:
                            <AbilitySelect abilities={pkmn.abilities} />
                        </h3>
                    </div>
                    <button type="submit">Delete</button>
                </form>
            </div>
        );
    });
    return (
        <div className="pokemonList">
            {pokemonNodes}
        </div>
    );
};

const PokemonTeam = () => {
    const [reloadPokemon, setReloadPokemon] = useState(false);
    return (
        <>
            <h1>Team</h1>
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
            <label>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                        setChecked(e.target.checked)
                    }}
                />
                Premium
            </label>
            <br />
            <ModeDisplay checked={checked} />
            <br />
            {<PokemonTeam />}
        </PremiumContext.Provider>
    )
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;