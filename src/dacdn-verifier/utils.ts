import { extend } from "../test-utils";

// Make unhandled rejections fail the script.
process.on('unhandledRejection', (up): void => {
    throw up;
});
/**
 * @description: Filtering the config on basis of only and disable present in the input config.
 */
export const filterConfigOnBasisOfOnlyandDisable = function filterInputConfig(
    config: Record<string, any>
): Record<string, any> {
    /*const args = minimist(process.argv);

    if (!args.localRun) {
        //@ts-ignore
        return config;
    }*/

    let tempConfig: Record<string, any> = {};
    for (const prop in config) {
        if (config[prop].only) {
            tempConfig = {};
            extend(true, tempConfig, { [prop]: config[prop] });
            break;
        } else if (!config[prop].disable) {
            extend(true, tempConfig, { [prop]: config[prop] });
        }
    }
    return tempConfig;
};