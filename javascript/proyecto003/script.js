const github = {
	savename: '',
	api: 'https://api.github.com/users/',
	getuser: async function(username) {
		this.savename = username;
	   try {
	   	const data = this.api + username;
	      const response = await peticion.getResponse(data)
	     	this.createUserCard(response)

	   } catch (error) {
	      if(error.response.status == 404) {
	      	document.getElementById('githubuser').innerHTML = "No hay perfil con este nombre de usuario"
	      }
	   }
	},
	formatDate: function(date) {
		const fecha = new Date(date);
		const año = fecha.getFullYear();
		const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
		const día = ('0' + fecha.getDate()).slice(-2);
		return `${día}.${mes}.${año}`;
	},
	createUserCard: function(response) {
		const { avatar_url, bio, created_at, followers, following,  hireable, location, login, name, public_gists, public_repos } = response;

		if(response.message) {
			document.getElementById('githubuser').innerHTML = `<span>${response.message}</span>`;
			return;
		}

		let Username = name || login;
		let createAt = this.formatDate(created_at);
		let hire = "<span class=\"hireable\">Contratable</span>" || ''

		const template = `<div id="github-perfil">
			<div class="avatar">
				<img src="${avatar_url}" alt="${Username}">
			</div>
			<div class="data-info">
				<h2>${Username}</h2>
				<p>${bio} <small>Registrado el ${createAt} - En ${location}</small> </p>
				<div class="data">
					<div class="data--badge" id="followers"><strong>${followers}</strong> <span>Seguidores</span></div>
					<div class="data--badge" id="following"><strong>${following}</strong> <span>Siguiendo</span></div>
					<div class="data--badge" id="repos"><strong>${public_repos}</strong> <span>Repos</span></div>
					<div class="data--badge" id="gists"><strong>${public_gists}</strong> <span>Gits</span></div>
				</div>
			</div>
			<div class="data__response"></div>
		</div>`
		document.getElementById('githubuser').innerHTML = template;
		const events = ['followers', 'following', 'repos', 'gists'];
		events.map( event => {
			const element = document.getElementById(event);
			element.addEventListener('click', () => this.loaderInfo(event))
		})	
	},
	loaderInfo: async function(event) {
		const data = this.api + this.savename + '/' + event;
	   const response = await peticion.getResponse(data)
	   document.querySelector('.data__response').innerHTML = '';	
		response.map( data => {
			const { html_url } = data;
			const createA = document.createElement('a')
			createA.href = html_url;
         createA.target = '_blank';

			if(event == 'followers' || event == 'following') {
				const { avatar_url, login } = data;
				const createImg = document.createElement('img')
				createImg.src = avatar_url;
				createImg.alt = login;
            createA.innerText = login;
				createA.appendChild(createImg)
				document.querySelector('.data__response').classList.remove('gist')
			} else if(event == 'repos') {
	   		const { name } = data;
            createA.innerText = name;
				document.querySelector('.data__response').classList.remove('gist')
	   	} else {
	   		const { files, description } = data;
            createA.innerText = Object.keys(files)[0];
				const createSpan = document.createElement('span')
            createSpan.innerText = description;
				createA.appendChild(createSpan)
				document.querySelector('.data__response').classList.add('gist')
	   	}
		   document.querySelector('.data__response').appendChild(createA);
		})
	}
}

let tiempo;
document.getElementById('search').addEventListener('keyup', function() {
	clearTimeout(tiempo);
	const user = this.value;
	// Para evitar saturar de consulta la API de github
	tiempo = setTimeout(function() {
      github.getuser(user)
    }, 500);

})