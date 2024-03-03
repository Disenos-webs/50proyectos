const github = {
	savename: '',
	api: 'https://api.github.com/users/',
	getuser: async username => {
		github.savename = username;
	   try {
	   	const data = github.api + username;
	      const response = await peticion.getResponse(data)
	     	github.createUserCard(response)

	   } catch (error) {
	   	console.log(error)
	      if(error.response.status == 404) {
	      	document.getElementById('githubuser').innerHTML = "No profile with this username"
	      }
	   }
	},
	formatDate: date => {
		const fecha = new Date(date);
		const año = fecha.getFullYear();
		const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
		const día = ('0' + fecha.getDate()).slice(-2);

		return `${día}.${mes}.${año}`;
	},
	createUserCard: response => {
		const { avatar_url, bio, created_at, followers, following,  hireable, location, login, name, public_gists, public_repos } = response;

		console.log(response)

		let Username = name || login;
		let createAt = github.formatDate(created_at);
		let hire = "<span class=\"hireable\">Contratable</span>" || ''

		const template = `<div id="github-perfil">
			<div class="avatar">
				<img src="${avatar_url}" alt="${Username}">
			</div>
			<div class="data-info">
				<h2>${Username}</h2>
				<p>${bio} <small>Registrado el ${createAt} - En ${location}</small> </p>
				<div class="data">
					<div id="followers"><strong>${followers}</strong> <span>Seguidores</span></div>
					<div id="following"><strong>${following}</strong> <span>Siguiendo</span></div>
					<div id="repos"><strong>${public_repos}</strong> <span>Repos</span></div>
					<div id="gists"><strong>${public_gists}</strong> <span>Gits</span></div>
				</div>
			</div>
			<div class="data-response"></div>
		</div>`
		document.getElementById('githubuser').innerHTML = template;
		const events = ['followers', 'following', 'repos', 'gists'];
		events.map( event => {
			const element = document.getElementById(event);
			element.addEventListener('click', () => github.event(event))
		})
		
	},
	event: async event => {
		const data = github.api + github.savename + '/' + event;
	   const response = await peticion.getResponse(data)
	   console.log(response)
	   document.querySelector('.data-response').innerHTML = '';
	   if(event == 'followers' || event == 'following') {
	   	response.map( user => {
	   		const template = `<a href="#" target="_blank"><img src="${user.avatar_url}" alt="${user.login}"> <span>${user.login}</span></a>`;
	   		document.querySelector('.data-response').innerHTML += template;
	   	})
	   } else if(event == 'repos') {
	   	response.map( data => {
	   		const template = `<a href="${data.html_url}" target="_blank"><span>${data.name}</span></a>`;
	   		document.querySelector('.data-response').innerHTML += template;
	   	})
	   }
	}
}

document.getElementById('search').addEventListener('keyup', function(e) {
	const user = this.value;
	github.getuser(user)
})