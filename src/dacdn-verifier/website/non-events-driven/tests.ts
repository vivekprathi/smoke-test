import { HOSTNAME } from "../../../env";
import { UrlsEnum } from "../UrlsEnum";

// USE HTTP as IP is provided
const minimist = require('minimist');
export const args = minimist(process.argv);
export const protocol = HOSTNAME ? 'https://' : 'http://';
//@ts-ignore HOSTNAME possibly undefined error. Enforced in env.ts that, HOSTNAME must be defined
export const IS_CLOUDFLARE_CACHING = HOSTNAME.includes('vwo-analytics.com');


/**
 * It is a map of `accountId` to `Expected Visitor Settings`.
 * Expected Visitor Settings are verified for all modes
 * a.) Live 
 * b.) Preview as well as Preview Link.
 * c.) Heatmap
 * 
 * 
 * Properties
 * `only`: If true, causes only that account's visitor settings to be verified
 * `disable`: If true, causes that account to be disabled for testing
 * `tagManagerEnabled`: Tells if TagManager is enabled for that account or not.
 * `features`: Lists down all DaCDN Configurations for the account. Tests ensure that DaCDN Config is according to that only.
 * `attributes.coreLib`: Core Library Loader Snippet Verification in Visitor Settings
 *      `attributes.coreLib.version`: Ensure this version is present. Is it verified just by the path or by loading the library itself ?
 *      `attributes.coreLib.fileConf`
 *          `attributes.coreLib.fileConf.gquery|safari|jquery`: Ensures gquery|safari|jquery availability/non availability
 *      `attributes.coreLib.includedIn`: An array which lists all `visitor settings files` by the name given in `smartCodeConfig.fileUrls` which should have coreLib
 * Special Cases:
 * 1. In case of cloudflare smartcode as CookieJar content is served for the same filename(e.g. va.js), so make safari:true in that case.
 * But if tag-manager is enabled, the path of the file itself changes.
 */
export const inputConfig: Record<string, any> = {
    '499022': {
        tagManagerEnabled: true,
        features: {
            cj: false,
            dgqi: true,
            dios: false,
            dt: 'mobile',
            dtd: '1000',
            gab: false,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    // Cloudflare Smart Code would always get Safari Version of CoreLib for all types of SmartCodes. This is intentional. https://docs.google.com/document/d/1lt0g55OO0aIN5lHMZfSvuX8Myl3pv4G1pgz_LCNez6U/edit
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                // OldSync Code doesn't serve CoreLib.
                // TODO: There should be an inverse of includedIn, where we can specify the requests where it won't be included
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: true,
                },
                // The list of URLs where analyze would be verified being served.
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            // PC isn't supported by Old Sync Code
            pushcrew: {
                version: '1.0',
                includedIn: [UrlsEnum.settingsType1, UrlsEnum.settingsType2UrlChange, UrlsEnum.settingsType2],
            },
        },
        //only: true,
        disable: false,
        'a/bCampaignId': '3',
        sharedPreviewLinkSuffix:
            '_vis_test_id=3&_vis_opt_random=0.8132723390813796&_vis_hash=db06ddcbc3710704c7bb3c4082e82360&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"a6fc633530523d2115298e1dcc194b8c","e":{"3":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D499022","app":"app","ts":1590732793512}}}',
        heatmapObject:
            '{"a":"710f59fd7a3692f048927f26a86532dd","e":{"3":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"c65420439a1f3067d963e37b693c7471865530d7","ty":"osa","app":"app","ts":1590732918349}}}',
    },
    '499025': {
        tagManagerEnabled: true,
        features: {
            cj: false,
            dgqi: false,
            dios: false,
            dt: 'mobile',
            dtd: '1000',
            gab: true,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: true,
                    jquery: false,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        'a/bCampaignId': '3',
        sharedPreviewLinkSuffix:
            '_vis_test_id=3&_vis_opt_random=0.9536486774295014&_vis_hash=870b77e6a67f6bf8e825a18c0d2791e8&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"d642a63c19842631b8a75a7ec7de32e4","e":{"3":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D499025","app":"app","ts":1590575030913}}}',
        heatmapObject:
            '{"a":"7e7f677bf34375efb4eb328a309b9617","e":{"3":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"fb49f67b809382b9d2c8762f4500aa9e3a7c206e","ty":"osa","app":"app","ts":1590575232768}}}',
    },
    '499028': {
        tagManagerEnabled: true,
        features: {
            cj: false,
            dgqi: false,
            dios: false,
            dt: 'mobile',
            dtd: '1000',
            gab: false,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: true,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        //        only: true,
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.863011597903103&_vis_hash=63408b83e0f62add49487335500b5457&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"585dd6bfe26ecba2d10af400ab86c2b3","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D499028","app":"app","ts":1590598285326}}}',
        heatmapObject:
            '{"a":"5b1de9c46f2a01c7e7ca9dced23956ba","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"e77492491542b21128bc1864d467ba0cb11c28e3","ty":"osa","app":"app","ts":1590598435441}}}',
    },
    '499775': {
        tagManagerEnabled: true,
        features: {
            cj: false,
            dgqi: true,
            dios: false,
            dt: 'mobile',
            dtd: '1000',
            gab: true,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: true,
                    jquery: false,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: true,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.24686808631158308&_vis_hash=1d15f0e35f3be150f6b4d4e1bcd9c4ad&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"7b274d82e7f4f4f13a09f50eb9f3271f","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D499775","app":"app","ts":1590255559960}}}',
        heatmapObject:
            '{"a":"329460adc00d02ee255b7267ff5094bd","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"6a4364b1d0b3557386b8dca6e4d1f9d7d75fcdd3","ty":"osa","app":"app","ts":1590255173037}}}',
    },
    '500002': {
        tagManagerEnabled: true,
        features: {
            cj: true,
            dgqi: false,
            dios: false,
            dt: 'mobile',
            dtd: '1000',
            gab: true,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: true,
                    jquery: false,
                    safari: true,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        //only: true,
        cj_val: { bc: false, s: "cookie" },
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.6661915843900332&_vis_hash=08ee67d71697c8164bca4b34381796e7&_vis_opt_preview_combination=2',
        heatmapObject:
            '{"a":"0a6a04f36dc713877de70ff0b98f8e68","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"97846bbd28fa9f215814c9049263354b2d4b98b3","ty":"osa","app":"app","ts":1590599055458}}}',
        previewObject:
            '{"a":"e1108b5201cd9f085ab1e3f9581c67e2","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D500002","app":"app","ts":1590598986702}}}',
    },
    '500000': {
        tagManagerEnabled: true,
        features: {
            cj: false,
            dgqi: true,
            dios: false,
            dt: 'mobile',
            dtd: '1000',
            gab: false,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: true,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.846349354966337&_vis_hash=d8e8646f7107e892db597a974096988e&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"74e972e576cb7455bcf8e6d80af055d7","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D500000","app":"app","ts":1590599991999}}}',
        heatmapObject:
            '{"a":"50f3e63444534a6480fe3cf5216396d4","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"ad8752caa0450aac042aee54b0a186afeb1b4a72","ty":"osa","app":"app","ts":1590600035900}}}',
    },
    '500004': {
        tagManagerEnabled: true,
        features: {
            cj: true,
            dgqi: false,
            dios: false,
            dt: 'mobile',
            dtd: '1000',
            gab: false,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: true,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: true,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        cj_val: { bc: false, s: "cookie" },
        disable: false,
        only: false,
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.8577243947890254&_vis_hash=64e2a0eef4836da425578f43d189fd48&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"d35c5458077b2d3fbfcf9d09b5935951","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D500004","app":"app","ts":1590661896781}}}',
        heatmapObject:
            '{"a":"977783431b181cbd1b066bd6c2d9920e","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"70dac58c24dd59e29736f2d66a1dd892c77dde89","ty":"osa","app":"app","ts":1590661948459}}}',
    },
    '500718': {
        tagManagerEnabled: false,
        features: {
            cj: false,
            dgqi: false,
            dios: false,
            dt: 'OFF',
            dtd: '1000',
            gab: false,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: true,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.7838888739642218&_vis_hash=e72cd8318c4777de98821cca5fe420c1&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"1ebd4440aa963f3009d2f44ca67a1cd0","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D500718","app":"app","ts":1590663051092}}}',
        heatmapObject:
            '{"a":"0c86cdfe772f75f6ca6d71750080e2f8","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"94a55760682f742587e573ef8c9f080910c1f5b3","ty":"osa","app":"app","ts":1590663097749}}}',
    },
    '500766': {
        tagManagerEnabled: false,
        features: {
            cj: true,
            dgqi: false,
            dios: false,
            dt: 'OFF',
            dtd: '1000',
            gab: false,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: true,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: true,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        cj_val: { bc: false, s: "cookie" },
        disable: false,
        only: false,
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.21790717572511809&_vis_hash=ff8b920b12488e71ca0af0f2a6bb8918&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"e316ca866c68d2f59387917c77f60abe","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D500766","app":"app","ts":1590664221982}}}',
        heatmapObject:
            '{"a":"9e6af9e31276242b3de36e5355593f60","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"ca94cefa4a3c5f6087d5c83291f644ae3b555837","ty":"osa","app":"app","ts":1590664262701}}}',
    },
    '500769': {
        tagManagerEnabled: false,
        features: {
            cj: false,
            dgqi: true,
            dios: false,
            dt: 'OFF',
            dtd: '1000',
            gab: false,
            it: '',
            opav: '3.0',
            rum: '0',
            spa: '0',
            sstd: '.*',
            uct: '',
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: true,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        'a/bCampaignId': '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=2&_vis_opt_random=0.8702986648114501&_vis_hash=8bdee84446d269d862e5294a7468009f&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"4b0e2bbe40882a8ac30020b32416db59","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%3A%2F%2Fvwo-jslib-test-website.glitch.me%2Fiframe.html%3FaccountId%3D500769","app":"app","ts":1590665106330}}}',
        heatmapObject:
            '{"a":"ef537106100ca8d6cf5108bf36caab1b","e":{"2":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"b8784b0b7951ff607561b74b76f0e7ed4724b96e","ty":"osa","app":"app","ts":1590665280089}}}',
    },
    '509534': {
        tagManagerEnabled: true,
        features: {
            gab: false,
            dt: 'mobile',
            dtd: '1000',
            cj: false,
            fB: false,
            rum: '0',
            it: '',
            dgqi: false,
            dios: false,
            uct: '',
            spa: '0',
            opav: '3.0',
            sstd: '.*',
            aReP: false,
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                    UrlsEnum.surveyPreview,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: true,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            survey: {
                version: '1.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.surveyPreview, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        surveyCampaignId: '1',
        surveyPreviewObject:
            '{"a":"9fb4611d862768ceb17eb3d06db5c02d","e":{"1":{"v":"1","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%253A%252F%252Fvwo-jslib-test-website.glitch.me%252Fiframe.html%253FaccountId%253D509534","app":"app","ts":1593251596750,"su":{"ids":[159056],"t":1,"wC":[1]}}}}',
    },
    '509651': {
        tagManagerEnabled: true,
        features: {
            gab: true,
            fB: false,
            dtd: '1000',
            cj: false,
            dt: 'mobile',
            rum: '0',
            it: '',
            dgqi: false,
            dios: false,
            uct: '',
            spa: '0',
            opav: '3.0',
            sstd: '.*',
            aReP: false,
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: true,
                    jquery: false,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                    UrlsEnum.surveyPreview,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            survey: {
                version: '1.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.surveyPreview, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        surveyCampaignId: '1',
        surveyPreviewObject:
            '{"a":"95199a35365469e9ee17b19e4eef4337","e":{"1":{"v":"1","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%253A%252F%252Fvwo-jslib-test-website.glitch.me%252Fiframe.html%253FaccountId%253D509651","app":"app","ts":1593360987649,"su":{"ids":[159119],"t":1,"wC":[1]}}}}',
    },
    '509771': {
        tagManagerEnabled: false,
        features: {
            gab: false,
            dt: 'OFF',
            dtd: '1000',
            cj: false,
            fB: false,
            rum: '0',
            it: '',
            dgqi: false,
            dios: false,
            uct: '',
            spa: '0',
            opav: '3.0',
            sstd: '.*',
            aReP: false,
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: false,
                    jquery: true,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: true,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            survey: {
                version: '1.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.surveyPreview, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        surveyCampaignId: '1',
        surveyPreviewObject:
            '{"a":"84d7400a651df787671e7ec52f37898e","e":{"1":{"v":"1","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%253A%252F%252Fvwo-jslib-test-website.glitch.me%252Fiframe.html%253FaccountId%253D509771","app":"app","ts":1593426129954,"su":{"ids":[159179],"t":1,"wC":[1]}}}}',
    },
    '516992': {
        tagManagerEnabled: true,
        checkForCspCompCode: true,
        features: {
            "dnofD": "1000",
            "mrp": 20,
            "gcsL": false,
            "dgqi": false,
            "uct": "",
            "opav": "4.0",
            "fB": false,
            "aReP": false,
            "csp": true,
            "rum": "0",
            "dios": false,
            "cj": false,
            "gab": true,
            "it": "",
            "spa": "0",
            "rdbg": false,
            "dtdfd": "",
            "dtd": "1000",
            "dt": "mobile",
            "dnofM": "30",
            "noSam": false,
            "mcpt": 0
        },
        attributes: {
            coreLib: {
                version: '7.0',
                fileConf: {
                    gquery: true,
                    jquery: false,
                    safari: !!IS_CLOUDFLARE_CACHING,
                },
                includedIn: [
                    UrlsEnum.jPhp,
                    UrlsEnum.oscLib,
                    UrlsEnum.asyncPreview,
                    UrlsEnum.asyncSharedPreviewLink,
                    UrlsEnum.asyncSharedPreviewLinkWithHashParam,
                    UrlsEnum.syncPreview,
                    UrlsEnum.heatmapAsync,
                    UrlsEnum.heatmapSync,
                ],
            },
            track: {
                version: '7.0',
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
            analyze: {
                version: '4.0',
                fileConf: {
                    gquery: false,
                    jqueryOpa: false,
                },
                includedIn: [UrlsEnum.jPhp, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange, UrlsEnum.oldSync],
            },
        },
        disable: false,
        only: false,
        'a/bCampaignId': '1',
        splitCampaignId: '2',
        sharedPreviewLinkSuffix:
            '_vis_test_id=1&_vis_opt_random=0.14006896160947635&_vis_hash=dc6c17697a90a3a5fdd71bbf2ee981ea&_vis_opt_preview_combination=2',
        previewObject:
            '{"a":"93c0e5fee05363f33b1db66672515eb6","e":{"1":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":0,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":"https%253A%252F%252Fvwo-jslib-test-website.glitch.me%252Fiframe.html%253FaccountId%253D516992","app":"app","ts":1596813160516}}}',
        heatmapObject:
            '{"a":"8d15fd3f1820b9efc9aee3941994e3df","e":{"1":{"v":"2","d":0,"s":0,"tg":0,"t":0,"td":0,"l":1,"alh":0,"iple":0,"iho":0,"pahi":null,"cn":"undefined","url":null,"hs":"de32529043b0633b7a9e6e5fff991813bf68e2ca","ty":"osa","app":"app","ts":1596813311054}}}',
    },
};
