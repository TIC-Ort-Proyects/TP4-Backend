import { signup as signupService, signin as signinService } from '../services/user.service.js'

export async function signup(req, res, next) {
    await signupService(req, res, next)
}

export async function signin(req, res, next) {
    await signinService(req, res, next)
}