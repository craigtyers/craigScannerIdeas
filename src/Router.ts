import express, { Request, Response } from 'express'

import { JwtAuthMiddleware } from 'arch-node-core'

import ScanController from '@/Controllers/ScanController'

class Router
{
    protected app: express.Application = null
    protected jwtAuth: JwtAuthMiddleware
    protected scanController: ScanController

    /**
     * 
     * @param app Initialises this router.
     */
    public init(app:express.Application): void
    {
        this.app = app
        this.jwtAuth = new JwtAuthMiddleware()
        this.scanController = new ScanController()

        this.app.set('trust proxy', true)
        this.app.use(express.json({ limit: '1gb' }))
        this.app.use((request: Request, response: Response, next) => {
            response.setHeader('Access-Control-Allow-Origin', '*')
            response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
            response.setHeader('Access-Control-Allow-Headers', 'content-type, key, authorization')
            response.setHeader('Access-Control-Allow-Credentials', 'true')
            next()
        })

        this.createRoutes()
    }

    /**
     * Creates this router's routes.
     */
    public createRoutes(): void
    {
        const methodNotAllowed = (request: Request, response: Response) => response.status(405).json({
            error: "Method not allowed."
        })

        // Options:
        this.app.options('*', (request: Request, response: Response) => {
            response.header('Access-Control-Allow-Origin', request.headers.origin)
            response.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS, HEAD')
            response.header('Access-Control-Allow-Headers', '*')
            response.sendStatus(204)
        })

        // Auth:
        // this.app.use('/api/v1/scan', (request: Request, response: Response, next: Function) => this.jwtAuth.check(request, response, next)) // Uncomment to enable jwt auth.

        // Scan:
        this.app.post('/api/v1/scan', this.scanController.create.bind(this.scanController))
    }
}

const ROUTER = new Router()
export default ROUTER
