import fs from 'fs'

import { LOGGER, CONFIG } from 'arch-node-core'

class Config
{
    public port: number
    public host: string

    public viewports: Record<string, Record<string, number>>
    public externalTests: Record<string, Record<string, string>>
    public testDefaults: Record<string, any>
    public outputDir: string

    /**
     * Initialises this config, should be called once during startup.
     */
     public init(): void
     {
        this.readGeneralConfig()
    }

    /**
     * Reads from the general config and updates any config values.
     */
     public readGeneralConfig(): void
     {
        const configPath = CONFIG.path('general.json')
        LOGGER.info("Loading general config from: " + configPath + "...")
        const dataBuffer: Buffer = fs.readFileSync(configPath)
        const configData: any = JSON.parse(dataBuffer.toString())

        this.port = configData.port
        this.host = configData.host

        this.viewports = configData.viewports
        this.externalTests = configData.external_tests
        this.testDefaults = configData.test_defaults

        this.outputDir = configData.output_dir
    }
}

const SINGLETON = new Config()
export default SINGLETON
