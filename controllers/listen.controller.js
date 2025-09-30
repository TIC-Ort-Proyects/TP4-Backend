import { getListens as getListensService, addListen as addListenService } from '../services/listen.service.js'

export async function getListens(req, res) {
    await getListensService(req, res)
}

export async function addListen(req, res) {
    await addListenService(req, res)
}