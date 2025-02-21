const clientId = "ClienId"; //agregue su clientid
const redirectUri = "http://localhost:3300"; //cambielo por el suyo
const scope = "user-top-read";

// Generar la URL de autenticación
document.getElementById("login-btn").addEventListener("click", () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
});

// Obtener el token desde la URL después de la autenticación
function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get("access_token");
}

// Definición de la clase Cola de Prioridad
class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    // Método para agregar una canción con prioridad
    enqueue(song, artist, imageUrl, spotifyUrl, priority) {
        const songData = { song, artist, imageUrl, spotifyUrl, priority };
        let added = false;

        // Insertar en la posición correcta según la prioridad
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].priority > priority) {
                this.queue.splice(i, 0, songData);
                added = true;
                break;
            }
        }

        // Si no se insertó antes, agregar al final
        if (!added) {
            this.queue.push(songData);
        }

        // Actualizar la tabla
        this.updateTable();
    }

    // Método para eliminar la primera canción de la cola
    dequeue() {
        return this.queue.shift();
    }

    // Método para eliminar una canción por su índice
    removeSong(index) {
        this.queue.splice(index, 1);
        this.updateTable();
    }

    // Método para actualizar la tabla con la lista de canciones
    updateTable() {
        const songList = document.getElementById('songList');
        songList.innerHTML = '';

        this.queue.forEach((songData, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td><img src="${songData.imageUrl}" alt="${songData.song}" class="song-img"></td>
                <td>${songData.song}</td>
                <td>${songData.artist}</td>
                <td>${this.getPriorityText(songData.priority)}</td>
                <td><a href="${songData.spotifyUrl}" target="_blank">🎵 Escuchar</a></td>
                <td><button class="delete" onclick="priorityQueue.removeSong(${index})">❌</button></td>
            `;

            songList.appendChild(row);
        });
    }

    // Método para obtener el texto de la prioridad
    getPriorityText(priority) {
        switch (priority) {
            case 1: return "⭐ Muy Importante";
            case 2: return "✨ Importante";
            case 3: return "😊 Normal";
            default: return "❓ Desconocido";
        }
    }
}

// Instancia de la Cola de Prioridad
const priorityQueue = new PriorityQueue();

// Obtener las canciones más escuchadas desde Spotify
async function getTopTracks() {
    const token = getAccessToken();
    if (!token) return;

    const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    // Asignar prioridades y agregar a la cola
    data.items.forEach(track => {
        const priority = Math.floor(Math.random() * 3) + 1; // Asignar prioridad aleatoria (1, 2 o 3)
        priorityQueue.enqueue(
            track.name,
            track.artists[0].name,
            track.album.images[0].url,
            track.external_urls.spotify,
            priority
        );
    });
}

// Ejecutar la función al cargar la página si el usuario ya está autenticado
window.onload = () => {
    if (getAccessToken()) {
        getTopTracks();
    }
};