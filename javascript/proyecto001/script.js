const unsplash = "https://source.unsplash.com/$1";
const pexels = "https://images.pexels.com/photos/$1/pexels-photo-$2.jpeg";

const listImages = [
	{imageId: 'mgJSkgIo_JI', text: 'Explorar el mundo', from: 'unsplash' },
	{imageId: '14541409', text: 'Bosque silvestre', from: 'pexels' },
	{imageId: '5kSVDnCVLDg', text: 'Playa soleada', from: 'unsplash' },
	{imageId: '15819943', text: 'Ciudad en invierno', from: 'pexels' },
	{imageId: 'bUhzlj3gGso', text: 'Montañas & Nubes', from: 'unsplash' }
];

const html = document.querySelector('html');
const panelCentral = document.querySelector('.panels');

listImages.map( (data, index) => {
	// Destructuramos el objeto 'data'
	const { imageId, text, from } = data;
	// Obtenemos el contenido de <template>...
	const template = document.getElementById('cloneCard').content;
	// Clonamos lo que esta dentro de <template>...
	const clone = template.cloneNode(true);
  	// Generamos la url dependiendo de donde viene
  	let image;
  	if(from == 'pexels') image = pexels.replace('$1', imageId).replace('$2', imageId);
  	if(from == 'unsplash') image = unsplash.replace('$1', imageId);
  	// Añadimos estos parámetros
	image += "?&auto=format&fit=crop&w=1200&q=90";
	// Creamos la línea de estilo para aplicar
	let style = `background: #CCC8 url('${image}') no-repeat center / cover`;
	// Obtenemos el selector '.panel'
	const panel = clone.querySelector('.panel');
	// Aplicamos los estilos
	panel.setAttribute('style', style)
	if(index == 0) {
		// Aplicamos los estilos al <html>
		html.setAttribute('style', style)
		// Añadimos la clase
		panel.className += ' active';
	}
	clone.querySelector(".title").innerHTML = text;
	clone.querySelector(".tag").innerHTML = from;

  	panelCentral.appendChild(clone);
})

const panels = document.querySelectorAll('.panel');
function removeActiveClasses() {
   panels.forEach(panel => panel.classList.remove("active"))
}
/**
 * Cambiamos el fondo, con la imagen actual
*/
changeBackground = panel => html.setAttribute('style', panel.getAttribute('style'))

panels.forEach(panel => {
   panel.addEventListener("click", () => {
      removeActiveClasses();
      panel.classList.add("active");
      changeBackground(panel);
   })
})

