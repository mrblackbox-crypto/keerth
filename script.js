const STORAGE_KEY = "music-storage-tracks";

const form = document.querySelector("#track-form");
const trackListEl = document.querySelector("#track-list");
const emptyStateEl = document.querySelector("#empty-state");
const clearAllBtn = document.querySelector("#clear-all");
const template = document.querySelector("#track-template");

const loadTracks = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const saveTracks = (tracks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
};

let tracks = loadTracks();

const renderList = () => {
  trackListEl.innerHTML = "";
  if (!tracks.length) {
    emptyStateEl.hidden = false;
    clearAllBtn.disabled = true;
    return;
  }

  emptyStateEl.hidden = true;
  clearAllBtn.disabled = false;

  tracks.forEach((track) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = track.id;
    node.querySelector(".track-item__title").textContent = track.title;

    const metaParts = [track.artist];
    if (track.album) metaParts.push(`• ${track.album}`);
    node.querySelector(".track-item__meta").textContent = metaParts.join(" ");

    const linkEl = node.querySelector(".track-item__link");
    if (track.url) {
      linkEl.href = track.url;
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }

    node.querySelector(".delete-btn").addEventListener("click", () => {
      tracks = tracks.filter((t) => t.id !== track.id);
      saveTracks(tracks);
      renderList();
    });

    trackListEl.appendChild(node);
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const newTrack = {
    id: crypto.randomUUID(),
    title: formData.get("title").trim(),
    artist: formData.get("artist").trim(),
    album: formData.get("album").trim(),
    url: formData.get("url").trim(),
  };

  if (!newTrack.title || !newTrack.artist) {
    return;
  }

  tracks.unshift(newTrack);
  saveTracks(tracks);
  renderList();
  form.reset();
  form.title.focus();
});

clearAllBtn.addEventListener("click", () => {
  if (!tracks.length) {
    return;
  }

  const confirmed = confirm("Erase all stored tracks?");
  if (!confirmed) {
    return;
  }

  tracks = [];
  saveTracks(tracks);
  renderList();
});

renderList();

