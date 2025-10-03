import { getSongs as getSongsService, createSong as createSongService, updateSong as updateSongService, deleteSong as deleteSongService } from '../services/song.service.js'

export async function getSongs(req, res) {
    try {
        const songs = await getSongsService();
        res.send(songs);
    } catch {
        res.status(500).json({ success: false, message: 'Error obteniendo canciones' });
    }
}

export async function createSong(req, res) {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'nombre requerido' });
    try {
        const song = await createSongService(nombre);
        res.status(201).json({ success: true, song });
    } catch {
        res.status(500).json({ success: false, message: 'Error creando canción' });
    }
}

export async function updateSong(req, res) {
    const { id, nombre } = req.body;
    if (!id || !nombre) return res.status(400).json({ success: false, message: 'id y nombre requeridos' });
    try {
        const song = await updateSongService(id, nombre);
        if (!song) {
            res.status(404).json({ success: false, message: 'Canción no encontrada' });
        } else {
            res.json({ success: true, song });
        }
    } catch {
        res.status(500).json({ success: false, message: 'Error actualizando canción' });
    }
}

export async function deleteSong(req, res) {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'id requerido' });
    try {
        const song = await deleteSongService(id);
        if (!song) {
            res.status(404).json({ success: false, message: 'Canción no encontrada' });
        } else {
            res.json({ success: true, song });
        }
    } catch {
        res.status(500).json({ success: false, message: 'Error eliminando canción' });
    }
}