const APIKEYTMDB = '70b7df64b9645bb5fb4733cbacc5ac1e';
const APIURLTMDB = 'https://api.themoviedb.org/3';
const APIIMAGETMDB = 'https://image.tmdb.org/t/p';
const backdrop_sizes = ["w300", "w780", "w1280", "original"];
const poster_sizes = ["w92", "w154", "w185", "w342", "w500", "w780", "original"];
const moviesContent = document.getElementById('movies');

let APIPARAMSTMDB = [
	'language=es-ES',
	'sort_by=popularity.desc',
	'append_to_response=videos,images',
	'include_image_language=en,null',
	'api_key=' + APIKEYTMDB
].join('&');

/*
movie/{ID_MOVIE}/images
search/movie
movie/{ID_MOVIE}
discover/movie
*/
const APPMovie = {
	getMovies: async (action = 'discover/movie', page = 1) => {
		const apiurl = await fetch(`${APIURLTMDB}/${action}?${APIPARAMSTMDB}&page=${page}`);
		return await apiurl.json();
	},
	start: async function(action = 'discover/movie', page = 1) {
		getStarter(await APPMovie.getMovies(action, page))
	},
	mostrarResultados: async (page = 1) => {
		const data = await APPMovie.getMovies('discover/movie', page)
		APPMovie.crearFront(page, data);
	},
	crearPaginacion: (data, paginaActual) => {

		let totalPaginas = data.total_pages;
      const paginacionContainer = document.getElementById('paginacion');
      const limiteBotones = 5; 
      
      paginacionContainer.innerHTML = ''; 
    
      const botonInicio = document.createElement('button');
      botonInicio.textContent = '1';
      botonInicio.addEventListener('click', () => APPMovie.mostrarResultados(1));
      if (paginaActual === 1) botonInicio.classList.add('active');
      paginacionContainer.appendChild(botonInicio);
      // Agregar ... si la página actual es mayor que el límite de botones
      if (paginaActual > limiteBotones + 1) {
         const puntosInicio = document.createElement('span');
         puntosInicio.textContent = '...';
         paginacionContainer.appendChild(puntosInicio);
      }
      // Calcular el rango de botones a mostrar
      const inicio = Math.max(2, paginaActual - Math.floor(limiteBotones / 2));
      const fin = Math.min(totalPaginas - 1, inicio + limiteBotones - 1);
      // Crear botones para las páginas
      for (let i = inicio; i <= fin; i++) {
         const boton = document.createElement('button');
         boton.textContent = i;
         boton.addEventListener('click', () => APPMovie.mostrarResultados(i));
         if (i === paginaActual) boton.classList.add('active');
         paginacionContainer.appendChild(boton);
      }
      // Agregar ... si hay más páginas después del rango de botones
      if (fin < totalPaginas - 1) {
         const puntosFinal = document.createElement('span');
         puntosFinal.textContent = '...';
         paginacionContainer.appendChild(puntosFinal);
      }
      // Botón para la última página
      const botonFinal = document.createElement('button');
      botonFinal.textContent = totalPaginas;
      botonFinal.addEventListener('click', () => APPMovie.mostrarResultados(totalPaginas));
      if (paginaActual === totalPaginas) botonFinal.classList.add('active');
      paginacionContainer.appendChild(botonFinal);
   },
   crearFront: (page, data) => {
   	// Recorremos las peliculas
   	moviesContent.innerHTML = '';
		data.results.map( movie => {
			// Obtenemos valores que usaremos
			const { backdrop_path, poster_path, id, overview, title, vote_average } = movie
			const small = `https://image.tmdb.org/t/p/${poster_sizes[0]}${poster_path}`;
			const big = `https://image.tmdb.org/t/p/${poster_sizes[5]}${poster_path}`;

			const template = document.getElementById('templateMovie').content;
			// Clonamos lo que esta dentro de <template>...
			const clone = template.cloneNode(true).querySelector('.movie');

			clone.setAttribute('id', 'movie-' + id);

			clone.querySelector('.poster').setAttribute('data-src', big);
			clone.querySelector('.poster').setAttribute('src', small);
			clone.querySelector('.poster').setAttribute('alt', title);

			clone.querySelector('h3').textContent = title;
			clone.querySelector('.vote_average').textContent = APPMovie.newVal(vote_average);
			clone.querySelector('.vote_average').className += ' ' + APPMovie.vote(vote_average);

			const overviewdiv = clone.querySelector('.overview')
			overviewdiv.querySelector('p').textContent = overview;
			
			moviesContent.appendChild(clone);
		})
		APPMovie.paramPage(page);
		APPMovie.crearPaginacion(data, page);
		APPMovie.LazyLoad();
   },
   LazyLoad: () => {
   	let NewOptions = {
	      elements_selector: '.poster',
	      use_native: true,
	      class_loading: 'lazy-loading'
	   }
	  	new LazyLoad(NewOptions)
   },
   paramPageSearch: () => {
   	const searchParam = new URLSearchParams(window.location.search);
   	const paginaActual = searchParam.get('page');
   	const numeroPagina = paginaActual ? parseInt(paginaActual) : 1;
   	return numeroPagina
   },
   paramPage: (nuevaPagina) => {
   	const nuevaURL = window.location.origin + window.location.pathname + '?page=' + nuevaPagina;
   	history.pushState(null, null, nuevaURL);
   },
	newVal: vote_average => {
   	const patron = /\d+\.\d{1}/g;
   	const texto = vote_average.toString();
   	return texto.match(patron);
	},
	vote: vote => {
		let number = Math.ceil(APPMovie.newVal(vote));
   	return (number >= 8) ? "green" : (number >= 5 ? "orange" : "red");
   }
}

function getStarter( movies ) {
	APPMovie.crearFront(movies.page, movies);
}

APPMovie.start('discover/movie', APPMovie.paramPageSearch());