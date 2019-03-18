/**
 * Starts an express-server on `localhost` that serves the client-web app on the port specified in
 * the environment variables or 3000 (default)
 */


import { loadConfiguration, complementWebpackConfig, startDevServer } from './libs';
import { ConfigTypes } from './config';


import { startSlsOffline } from './types/sls-config';
import { startSsr } from './types/ssr-config';

/**
 *
 * @param configFilePath
 */
export async function start (configFilePath: string) {

    const config = await loadConfiguration(configFilePath);

    // when we have a browser app, we start it directly
    if (config.type === ConfigTypes.LOWLEVEL_SPA && config.webpackConfig !== undefined) {
        
        console.log("start spa locally");
        startDevServer(complementWebpackConfig(config.webpackConfig));
        
    } else if (config.type === ConfigTypes.LOWLEVEL_SERVER && config.slsConfig !== undefined) {
        
        console.log("start llsrv locally/offline");
        startSlsOffline(config.slsConfig, true);
        
    } else if (config.type === ConfigTypes.SSR && config.ssrConfig !== undefined) {

        console.log("start ssr locally/offline");
        startSsr(config.ssrConfig, true);

    } else {
        console.error("Cannot start the provided configuration!")
    }


}
