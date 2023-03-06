import express from 'express'
import sourceMapSupport from 'source-map-support'
import http from 'http'

import { LOGGER, CONFIG, AUTH_SERVICE } from 'arch-node-core'

import GENERAL_CONFIG from '@/Config'
import ROUTER from '@/Router'

sourceMapSupport.install() // Used for cleaner ts error stacks, logs, etc.

LOGGER.info("----- WCAG Scanner Service Starting Up -----")
CONFIG.init()
GENERAL_CONFIG.init()
LOGGER.info("Service Name: " + CONFIG.serviceName)


// Express Setup:
const app: express.Application = express()
ROUTER.init(app)
const server: http.Server = http.createServer(app)
LOGGER.info("Http access is popping off yo!")

// Init Core Services:
AUTH_SERVICE.init()

server.listen(GENERAL_CONFIG.port, GENERAL_CONFIG.host, () => {
    console.log(`WCAG Scanner is on it like a car bonnit! At: http://${GENERAL_CONFIG.host}:${GENERAL_CONFIG.port}/`)
})