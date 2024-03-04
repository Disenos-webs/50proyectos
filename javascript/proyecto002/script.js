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

// PARA CREAR Y/O OBTENER PARAMETRO DE LA URL
const GetParams = {
	URLSearchParams: () => new URLSearchParams(window.location.search),
	URLEditParams: editparam => {
		const nuevaURL = `${window.location.origin}${window.location.pathname}${editparam}`
    	history.pushState(null, null, nuevaURL);
	},
	URLSearch: param => {
		const searchParams = GetParams.URLSearchParams();
   	const pageActual = searchParams.get('page');
   	const newObject = {
   		pagina: (pageActual ? parseInt(pageActual) : 1),
   		cat: searchParams.get('cat') || 'movie'
   	}
   	return newObject[param];
	}
}

// CREAMOS EL PAGINADOR
const Paginador = {
	limite: 5,
	contenedor: document.getElementById('paginacion'),
	limpiar: function() {
		this.contenedor.innerHTML = '';
	},
	agregar: function(html) {
		this.contenedor.appendChild(html);
	},
	crearHTML: function(tipo) {
		return document.createElement(tipo);
	},
	boton_pagina: function(page, numberPage) {
		const cat = GetParams.URLSearch('cat');
		const boton = this.crearHTML(page === '...' ? 'span' : 'button');
		boton.textContent = page === '...' ? page : numberPage;
		if(page !== '...') {
			boton.addEventListener('click', () => APPMovie.resultados(numberPage, cat));
			if (page === numberPage) boton.classList.add('active');
		}
		this.agregar(boton);
	},
	crear: function(data, page) {
		const totalPaginas = data.total_pages;
		this.limpiar();
		this.boton_pagina(page, 1);
		if (page > this.limite + 1) this.boton_pagina('...');
		const inicio = Math.max(2, page - Math.floor(this.limite / 2));
		const fin = Math.min(totalPaginas - 1, inicio + this.limite - 1);
		for (let i = inicio; i <= fin; i++) this.boton_pagina(page, i);
		if (fin < totalPaginas - 1) this.boton_pagina('...');
		this.boton_pagina(page, totalPaginas);
	}
}


// INICIAMOS 
const APPMovie = {
	datos: {},
	limpiar: function() {
		moviesContent.innerHTML = '';
	},
	informacion: async function() {
		let action = `${this.datos.type}/${this.datos.cat}`;
		let pagina = '&page=' + this.datos.page;
		const apiurl = await fetch(`${APIURLTMDB}/${action}?${APIPARAMSTMDB}${pagina}`);
		return await apiurl.json();
	},
	inicio: async function(objeto) {
		this.datos = objeto
		this.agregar(await this.informacion());
	},
	resultados: function(page, cat) {
		GetParams.URLEditParams(`?cat=${cat}&page=${page}`);
		this.inicio({ 
			type: 'discover', 
			cat: cat,
			page: page 
		});
	},
	agregar: function(data) {
   	// Recorremos las peliculas
   	this.limpiar();
		moviesContent.classList.add('grid')
		data.results.map( movie => {
			// Obtenemos valores que usaremos
			const { poster_path, id, overview, title, vote_average } = movie
			const small = `https://image.tmdb.org/t/p/${poster_sizes[0]}${poster_path}`;
			const big = `https://image.tmdb.org/t/p/${poster_sizes[5]}${poster_path}`;
			const template = document.getElementById('templateMovie').content;
			// Clonamos lo que esta dentro de <template>...
			const clone = template.cloneNode(true).querySelector('.movie');
			clone.setAttribute('id', 'movie-' + id);
			this.image(clone, {
				clase: '.poster',
				attr: ['data-src', 'src', 'alt'],
				val: [big, small, title]
			})
			clone.querySelector('h3').textContent = title;
			// Votos
			this.votos(clone, vote_average)
			const overviewdiv = clone.querySelector('.overview')
			overviewdiv.querySelector('p').textContent = overview;
			moviesContent.appendChild(clone);
		})
		let page = GetParams.URLSearch('pagina');
		Paginador.crear(data, page);
		this.LazyLoad();
	},
	image: function(element, object) {
		object.attr.forEach( (attr, index) => {
			element.querySelector(object.clase).setAttribute(object.attr[index], object.val[index]);
		})
	},
	votos: function(element, vote_average) {
   	const patron = /\d+\.\d{1}/g;
   	const texto = vote_average.toString().match(patron);
		let number = Math.ceil(texto);
   	let clase = (number >= 8) ? "green" : (number >= 5 ? "orange" : "red");
		element.querySelector('.vote_average').textContent = texto;
		element.querySelector('.vote_average').classList.add(clase);
	},
   LazyLoad: function() {
   	let NewOptions = {
	      elements_selector: '.poster',
	      use_native: true,
	      class_loading: 'lazy-loading',
         callback_error: callback => {
			   callback.setAttribute("src", "https://aramar.com/wp-content/uploads/2017/05/aramar-suministros-para-el-vidrio-cristal-sin-imagen-disponible.jpg");
			}
	   }
	  	new LazyLoad(NewOptions)
   }
}

let page = GetParams.URLSearch('pagina');
let cat = GetParams.URLSearch('cat') || 'movie';
APPMovie.inicio({
	type: 'discover',
	cat: cat,
	page: page 
});

function quitarClase(filtros) {
	filtros.forEach(f => f.classList.remove('active'));
}

const filtros = document.querySelectorAll('.filtro');
quitarClase(filtros);

filtros.forEach( function(filtro) {
	// Quitamos todos las clases '.active'
	let movietv = filtro.getAttribute('data-filter');
	if(GetParams.URLSearch('cat') === movietv) {
		filtro.classList.add('active');
	}
	filtro.addEventListener('click', function() {
		quitarClase(filtros)
		// Le añadimos la clase '.active' al que corresonde
		filtro.classList.add('active');
		// Obtener la página actual
		let page = GetParams.URLSearch('pagina');
		GetParams.URLEditParams(`?cat=${movietv}&page=${page}`);
		APPMovie.inicio({ 
			type: 'discover',
			cat: movietv, 
			page: page 
		});
	})
})