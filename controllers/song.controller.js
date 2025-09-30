import { getSongs as getSongsService, createSong as createSongService, updateSong as updateSongService, deleteSong as deleteSongService } from '../services/song.service.js'

export async function getSongs(req, res) {
    await getSongsService(req, res)
}

export async function createSong(req, res) {
    await createSongService(req, res)
}

export async function updateSong(req, res) {
    await updateSongService(req, res)
}

export async function deleteSong(req, res) {
    await deleteSongService(req, res)
}