import { getListens as getListensService, addListen as addListenService } from '../services/listen.service.js'

export async function getListens(req, res) {
    try {
        const userId = req.user.userId;
        const songs = await getListensService(userId);
        res.status(200).json({ success: true, songs });
    } catch {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export async function addListen(req, res) {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, message: 'id requerido' });
    }
    const userId = req.user.userId;
    try {
        const listen = await addListenService({ songId: id, userId });
        res.status(201).json({ success: true, message: "Listen recorded", listen });
    } catch {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}