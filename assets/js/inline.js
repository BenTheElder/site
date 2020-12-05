function playYT(s) {
    var id = s.getAttribute("data-id");
    var wrapper = s.parentElement;
    wrapper.innerHTML = '<iframe allowfullscreen="" title="YouTube Video" src="https://www.youtube.com/embed/' + id + '?autoplay=1"></iframe>';
}