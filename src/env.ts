import { DaCDNNodeEnum } from "./DaCDNNodeEnum";
const isPrivateIp = require('private-ip');
export const IS_TESTAPP = process.env.IS_TESTAPP ? JSON.parse(process.env.IS_TESTAPP) : false;
export const HOSTNAME = process.env.HOSTNAME || '34.90.106.11'// Ams5 Public IP

export const BASE_URL = `http://${HOSTNAME}`
export const DEBUG_MODE = process.env.DEBUG_MODE ? JSON.parse(process.env.DEBUG_MODE) : false;
export const LOG_LEVEL = +(process.env.LOG_LEVEL || 2)
export const ONLY_EVENTS_ARCH_DACDN_VERIFIER = process.env.ONLY_EVENTS_ARCH_DACDN_VERIFIER ? JSON.parse(process.env.ONLY_EVENTS_ARCH_DACDN_VERIFIER) : false;
console.log('ONLY_EVENTS_ARCH_DACDN_VERIFIER:', ONLY_EVENTS_ARCH_DACDN_VERIFIER)
if (HOSTNAME) {
    if (!isPrivateIp(HOSTNAME)) {
        if (HOSTNAME === DaCDNNodeEnum.sjc1 || HOSTNAME === DaCDNNodeEnum.publicAms5) {
            console.log('Public IP Used but it is whitelisted.')
        } else if (HOSTNAME.includes('cdn-cn.vwo-analytics.com')) {
            // FIXME: Kind of hack will confirm this.
            console.log(' Ignoring the Private Ip check for the hostname cdn-cn.vwo-analytics.com');
        }
        else {
            console.error('Non Private IP Found:', HOSTNAME, '. Provide Private IP.')
            // IP is not private
            process.exit(1);
        }
    }
}


// eslint-disable-next-line no-unused-vars
if (!Object.entries(DaCDNNodeEnum).some(function ([_name, ip]): boolean {
    return ip === HOSTNAME;
})) {
    console.error('Unregistered IP Found:', HOSTNAME, 'Allowed IPS are ', JSON.stringify(DaCDNNodeEnum))
    process.exit(1);
}

//@ts-ignore
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;