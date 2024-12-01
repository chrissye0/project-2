const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handlePokemon = (e, onPokemonAdded) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#pokemonName').value;
    const level = e.target.querySelector('#pokemonLevel').value;

    if (!name || !level) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, { name, level }, onPokemonAdded);
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
            <label htmlFor="name">Name: </label>
            <input id="pokemonName" type="text" name="name" placeholder="Pokemon Name" />
            <label htmlFor="level">Level: </label>
            <input id="pokemonLevel" type="number" min="1" name="level" />
            <input className="makePokemonSubmit" type="submit" value="Make Pokemon" />
        </form>
    );
};

const PokemonList = (props) => {
    const [pokemon, setPokemon] = useState(props.pokemon);
    console.log(pokemon);

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

    if (pokemon.length > 6) {
        helper.handleError('Full team!');
    }

    const pokemonNodes = pokemon.slice(0, 6).map(pkmn => {
        return (
            <div key={pkmn.id} className="pkmn">
                {/* <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.dexNum}.png`} alt="pokemon sprite" className="sprite" /> */}
                <h3 className="pokemonName">Name: {pkmn.name}</h3>
                <h3 className="pokemonLevel">Level: {pkmn.level}</h3>
            </div>
        );
    });

    return (
        <>
            <button onClick={() => {
                setPokemon([]);
                console.log(pokemon.length)
                }}>Clear</button>
            <div className="pokemonList">
                {pokemonNodes}
            </div>
        </>

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
    const [teamList, setTeamList] = useState([]);
    console.log(teamList);
    const handleTeams = e => {
        setTeamList(teamList.concat(<PokemonTeam key={teamList.length} />));
        console.log(teamList);
    };

    return (
        <>
            <button onClick={handleTeams}>Add Team</button>
            <PokemonTeam />
            {teamList}
        </>
    )
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;