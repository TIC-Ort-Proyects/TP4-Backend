import { seed as seedService } from '../services/seed.service.js'

export async function seed(req, res) {
    await seedService(req, res)
}