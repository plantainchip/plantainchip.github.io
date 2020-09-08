const allArt = document.querySelectorAll(".art-thumbnail");

const clickHandler = event => {
  const imgUrl = event.target.src.replace("thumbnails", "art");
  const instance = basicLightbox.create(`
	  <img src="${imgUrl}" class="art-large" />
  `);
  instance.show();
}

allArt.forEach(thumb => {
  thumb.addEventListener("click", clickHandler);
});