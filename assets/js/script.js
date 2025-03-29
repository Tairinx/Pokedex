document.addEventListener('DOMContentLoaded', function() {

    const pokemonContainer = document.getElementById('pokemon-container');
    const typeFilters = document.getElementById('type-filters');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resetButton = document.getElementById('reset-filters');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Estados
    let allPokemon = [];
    let filteredPokemon = [];
    let currentPage = 1;
    const pokemonPerPage = 12;
    let selectedTypes = [];
    
    // Cores para os tipos
    const typeColors = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC'
    };
    
    // Inicializa aqui
    init();
    
    async function init() {
        await fetchAllPokemon();
        createTypeFilters();
        displayPokemon();
        setupEventListeners();
    }
    
    async function fetchAllPokemon() {
        try {
            // Primeiro busco a lista de pokemon na api
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
            const data = await response.json();
            
            // Agora pego os detalhes de cada pokemon
            const pokemonDetails = await Promise.all(
                data.results.map(async (pokemon) => {
                    const pokemonResponse = await fetch(pokemon.url);
                    return pokemonResponse.json();
                })
            );
            
            allPokemon = pokemonDetails.map(pokemon => ({
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.other['official-artwork'].front_default || 
                      pokemon.sprites.front_default,
                types: pokemon.types.map(type => type.type.name)
            }));
            
            filteredPokemon = [...allPokemon];
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        }
    }
    
    function createTypeFilters() {
        // Agoa pego todos os tipos únicos de Pokémons
        const allTypes = new Set();
        allPokemon.forEach(pokemon => {
            pokemon.types.forEach(type => allTypes.add(type));
        });
        
        // filtros
        typeFilters.innerHTML = '';
        Array.from(allTypes).sort().forEach(type => {
            const filterElement = document.createElement('div');
            filterElement.className = 'option-filter-atribute';
            filterElement.textContent = type;
            filterElement.style.backgroundColor = typeColors[type] || '#777';
            filterElement.addEventListener('click', () => toggleTypeFilter(type));
            typeFilters.appendChild(filterElement);
        });
    }
    
    function toggleTypeFilter(type) {
        const index = selectedTypes.indexOf(type);
        if (index === -1) {
            selectedTypes.push(type);
        } else {
            selectedTypes.splice(index, 1);
        }
        
        updateFilterDisplay(); // Atualiza a exibição (filtros)
        filterPokemon(); // Filtra os Pokémon
    }
    
    function updateFilterDisplay() {
        const filterElements = document.querySelectorAll('.option-filter-atribute');
        filterElements.forEach(element => {
            const type = element.textContent;
            if (selectedTypes.includes(type)) {
                element.style.transform = 'scale(1.1)';
                element.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
            } else {
                element.style.transform = 'scale(1)';
                element.style.boxShadow = 'none';
            }
        });
    }
    
    function filterPokemon(searchTerm = '') {
        filteredPokemon = allPokemon.filter(pokemon => {
            // Filtro por nome
            const nameMatch = pokemon.name.includes(searchTerm.toLowerCase());
            
            // Filtro por tipo
            let typeMatch = true;
            if (selectedTypes.length > 0) {
                typeMatch = selectedTypes.some(type => pokemon.types.includes(type));
            }
            
            return nameMatch && typeMatch;
        });
        
        currentPage = 1; // Reseta para a primeira pag
        displayPokemon();
    }
    
    function displayPokemon() {
        // Atualiza a informação da página
        updatePaginationInfo();
        
        // Calcula quais Pokémons mostrar
        const startIndex = (currentPage - 1) * pokemonPerPage;
        const endIndex = startIndex + pokemonPerPage;
        const pokemonToShow = filteredPokemon.slice(startIndex, endIndex);
        
        // Limpa o container
        pokemonContainer.innerHTML = '';
        
        // Adiciona os Pokémons
        pokemonToShow.forEach(pokemon => {
            const pokemonCard = createPokemonCard(pokemon);
            pokemonContainer.appendChild(pokemonCard);
        });
    }
    
    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'card-pokemon';
        
        // ID do Pokémon
        const idSpan = document.createElement('span');
        idSpan.className = 'pokemon-id';
        idSpan.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
        
        // Imagem do Pokémon
        const imgContainer = document.createElement('div');
        imgContainer.className = 'pokemon';
        
        const img = document.createElement('img');
        img.className = 'pokemon-img';
        img.src = pokemon.image;
        img.alt = pokemon.name;
        
        imgContainer.appendChild(idSpan);
        imgContainer.appendChild(img);
        
        // Descrição do Pokémon
        const descContainer = document.createElement('div');
        descContainer.className = 'descricao';
        
        const name = document.createElement('h2');
        name.className = 'name-pokemon';
        name.textContent = pokemon.name;
        
        const typesContainer = document.createElement('div');
        typesContainer.className = 'atributos';
        
        // Adiciona os tipos
        pokemon.types.forEach(type => {
            const typeElement = document.createElement('div');
            typeElement.className = 'atribute';
            typeElement.textContent = type;
            typeElement.style.backgroundColor = typeColors[type] || '#777';
            typesContainer.appendChild(typeElement);
        });
        
        descContainer.appendChild(name);
        descContainer.appendChild(typesContainer);
        
        // Montando o card
        card.appendChild(imgContainer);
        card.appendChild(descContainer);
        
        // Adiciona o evento de clique para mostrar mais detalhes
        card.addEventListener('click', () => {
            // vou implementar um modal para exibir mais detalhes aqui depois kkk
        });
        
        return card;
    }
    
    function updatePaginationInfo() {
        const totalPages = Math.ceil(filteredPokemon.length / pokemonPerPage);
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        
        // Atualiza o estado dos botões
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    function setupEventListeners() {
        // Pesquisa
        searchButton.addEventListener('click', () => {
            filterPokemon(searchInput.value);
        });
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterPokemon(searchInput.value);
            }
        });
        
        // Resetar filtros
        resetButton.addEventListener('click', () => {
            selectedTypes = [];
            searchInput.value = '';
            updateFilterDisplay();
            filterPokemon();
        });
        
        // Paginação
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayPokemon();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        nextPageButton.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredPokemon.length / pokemonPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayPokemon();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
});