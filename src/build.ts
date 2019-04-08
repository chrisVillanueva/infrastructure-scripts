
import { prepareConfiguration, loadStaticConfiguration } from './infra-comp-utils/configuration-lib';
import {runWebpack} from "./infra-comp-utils/webpack-libs";

import { createSlsYaml, toSlsConfig } from './infra-comp-utils/sls-libs';

import {
    INFRASTRUCTURE_MODES,
    loadConfiguration,
    IConfigParseResult,
    parseForPlugins,
    extractConfigs
} from 'infrastructure-components';

/**
 *
 * @param configFilePath
 */
export async function build (configFilePath: string) {

    // create a usable configuration
    const configPath = await prepareConfiguration(configFilePath);

    // load the configuration
    const config = loadConfiguration(configPath, INFRASTRUCTURE_MODES.COMPILATION);

    // parse the configuration for plugins
    const plugins = parseForPlugins(config, configFilePath);
    console.log("plugins: ", plugins);

    // load the configuration statically (without objects)
    //const staticConfig = loadStaticConfiguration(configPath).default;
    //console.log("staticConfig: ", staticConfig);


    // parse the loaded configuration in compile mode (statically)
    const parsedConfig: IConfigParseResult = await extractConfigs(config, plugins, INFRASTRUCTURE_MODES.COMPILATION);


    console.log("\n--------------------------------------------------");
    console.log("parsed config: ", parsedConfig);
    console.log("--------------------------------------------------\n");

    createSlsYaml(parsedConfig.slsConfigs, true);

    writeScriptsToPackageJson(configFilePath);

    // now run the webpacks
    await Promise.all(parsedConfig.webpackConfigs.map(async wpConfig => {
        //console.log("wpConfig: ", wpConfig);
        
        await runWebpack(wpConfig)
    }));

    // now run the post-build functions
    await Promise.all(parsedConfig.postBuilds.map(async postBuild => await postBuild()));

};

export const writeScriptsToPackageJson = (configFilePath: string) => {
    const fs = require('fs');

    try {
        fs.copyFileSync( 'package.json', 'package_last.json' );
        let rawdata = fs.readFileSync('package.json');

        let packageJson = JSON.parse(rawdata);

        
        packageJson["scripts"] = Object.assign({}, packageJson.scripts, {
            start: `scripts start ${configFilePath}`
        })

        fs.writeFileSync('package.json', JSON.stringify(packageJson, null , 2));
        
    } catch (error) {
        console.error("Could not write scripts to package.json\n", error);
        return undefined;
    };

}