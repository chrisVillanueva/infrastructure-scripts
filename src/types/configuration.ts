
import {IPlugin} from "../infra-comp-utils/plugin";
import Types from './index'

/**
 * A configuration is the top-level node of an infrastructure-components project
 */
export interface IConfiguration {


    /**
     * An Infrastructure may provide plugins, the Plugins may need some data that we provide here!
     */
    createPlugins: (configPath: string) => Array<IPlugin>

}

/**
 * A function to check whether a component serves as an Infrastructure
 *
 * used in the parser during compilation, we get a real object here!
 *
 * @param parsedComponent is the real object to be tested!
 */
export const isConfiguration = (parsedComponent): boolean => {
    if (parsedComponent !== undefined) {
        return parsedComponent.createPlugins !== undefined &&
            parsedComponent.infrastructureType === Types.INFRASTRUCTURE_TYPE_CONFIGURATION
    }

    return false;
};


/**
 * Extracts the plugins from an infrastructure
 *
 * @param infrastructure is the infrastructure-object
 * @param configPath specifies the path to the original configuration of the project, as passes as argument in the command
 *
 */
export function extractPlugins(infrastructure: IConfiguration, configPath: string) {
    
    return infrastructure.createPlugins(configPath);
}

