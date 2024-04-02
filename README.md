# DACDN SMOKE TESTS

These tests are scheduled to execute daily in the evening for all DaCDN Nodes. Following are the type of tests that run here.

# Development
1. `yarn`
2. `git submodule init`
3. `git submodule update`
4. `cd dacdn && git submodule init && cd -`
5. `git submodule update --recursive`

## Ruby Specs for DaCDN Endpoints(Legacy)
**This are in maintenance mode.**

This project contains the smoke test which you should run once you deploy the dacdn project to any environment.

See Jenkinsfile to see how these tests are run.

---

## TagManager Consistency(tagmanager-consistency) Tests

-   Script "test.ts" compares the content of tags to corresponding no tag files from which the tag is made of. It helps in ensuring that the depoyment on DaCDN isn't faulty
-   It also does a basic geocheck to ensure that DaCDN is correctly determining location. *It should be moved to EndpointsVerifier Tests*. **This is skipped for testapp as maxmind isn't updated there**.

It takes the following parameters (all are optional):

1.  JSLIB_TAGS_BRANCH_NAME - Name of the branch from which tagsConfig.json will be read
2.  HOSTNAME - Name of the server from which to get the files
3.  DEBUG_MODE - When enabled prints the contents of all the files which are fetched

### Known Issues

- For "*.vwo-analytics.com" the tests are skipped intentionally because for the domain va.js always serves CookieJar supported file but tags don't have that smartness in them.

---

## Endpoints Verifier(endpoints-verifier) Tests

- These tests are run to verify following things in all possible endpoints in all types of libraries including tags and non-tags. It is mostly declarative and controlled by two files, *tagsConfig.json* and *endpoints-without-tags*

    - License
    - UA Based content
    - Version Check
    - Uglification Check
    - DaCDN Verifier
        - Checks for existing accounts in prod for all types of smart code requests to DaCDN
            - Checks that the JS is syntactically correct by evaluating it
            - Checks that the file being served by endpoints are also syntactically correct

-   To Run only non Tags tests
    `yarn e2e --baseUrl=34.90.106.11 --protocol="http" --batchSize='1' --nonTags`
-   To Run only Tags tests
    `yarn e2e --baseUrl=34.90.106.11 --protocol="http" --batchSize='1' --tags`
-   To Run only dacdn-verifier tests
    `yarn e2e --baseUrl=34.90.106.11 --protocol="http" --batchSize='1' --dacdnVerifier`
-   To run all the tests, use either of the following commands
    `yarn e2e --baseUrl=34.90.106.11 --protocol="http" --batchSize='1' --tags --nonTags --dacdnVerifier`
    `yarn e2e --baseUrl=34.90.106.11 --protocol="http" --batchSize='1`
-   To run the test Cases locally and if using only and disable support mentioned in the config add a special param: `--localRun`
    `yarn e2e --baseUrl=34.90.106.11 --protocol="http" --localRun`


While doing Debugging use the following command
`cd src/e2e/dacdn-serving && node --inspect-brk -r ts-node/register  dacdn-verifier.ts --baseUrl=34.90.106.11 --protocol=http --batchSize=1 --dacdnVerifier`

### endpoints-without-tags.json

1. Endpoint config: consists of all the endpoints served by dacdn .
2. If adding the value in concatFiles mentionsed in config for specific file object. Add them in string comma seperated. for e.g.
   `vanj_heatmap: concatFiles: {"heatmap":"checkstring1,checkstring2","vanj": "checkstring1"}`

### **Dacdn Verifier(DaCDN Verifier) Tests**

-   Skipped for TestApps as the accounts are not present on testapp.
- These Tests execute the JS code fetch from requests in JSDOM which might cause security risk if not done carefully. See https://github.com/jsdom/jsdom/issues/2729. This is the reason all IPS for which these tests can run are whitelisted. All other IPS are not allowed. Public IPs are straightaway rejected.

#### Known Issues

-   Gquery is always in case of heatmap and preview for both codeType: async, osc
-   Safari is also false in case of heatmap and preview for both codeType: async, osc
-   Skipping the track check in case of OSC. Unable to extract out the tag call. Can be fixed further when using jsdom.

-   Skipping the get_debugger_ui call in case of preview, heatmap for both codeType: osc and async.Unable to extract out the get_debugger_ui. It do not contains a complete path of get_Debugger_ui. Can be fixed further when using jsdom.

#### Adding a new config in input config of dacdn-verifier.

-   Access the features for the particular account using : https://dev.visualwebsiteoptimizer.com/get_account_cache?a={accountId}
-   Copy the shared Value Object and extract out the ac object from the shared Value Object .Paste in the features object of the accountId config.

##### Format:

```javascript
"accountId": {
    "features": {
        //object which contains the features present in the get_Account_cache.
    },
    "attributes": {
        // will contains the library name like coreLib, analyze, track, survey.
        coreLib: {
            version: '6.0', // version of the coreLib
            fileConf: {
                gquery: false, // mark it false or true if gquery is present
                jquery: true, // mark it true if jquery is present
                safari: false,
            },
            includedIn: [UrlsEnum.jPhp, UrlsEnum.oscLib], // Array of calls in which this library can be present.
        },
    },
    campaingId: string      // the campaign Id for which you want to check the heatmap and preview
    previewObject : string, // Read below for how to generate the previewObject
    heatmapObject: string // Read below for how to generate the heatmap Object
}
```

##### Generation of heatmap and Preview Object:

-   visit the preview mode of the campaign.
-   Open console. hit name .
-   if it is preview mode: hit: copy(JSON.parse(name)[`_vis_preview_accountId`]) in console
-   if it is heatmap mode: hit: copy(JSON.parse(name)[`_vis_preview_accountId`])
-   paste in the heatmapObject or previewObject in the config for this particular accountId.

##### Url used in preview and heatmap for osc and async are:

-   For async : `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId={accountId}`

-   For Sync: `http://vwo-jslib-test-website.glitch.me/iframe.html?accountId={accountId}&osc`

-   For SettingsType2 Url is : `http://vwo-jslib-test-website.glitch.me/iframe.html?accountId={accountId}&urlchangetesting`; Mention Osc as well if it is the case of osc.

-   <b>Known Limitation</b>: Above url mentioned are default.

### Note:

-   A special character <code>!</code> is used for not checking a key. For ex.: if you want that a key should not be present in the file , then add <code>!</code> at the starting of the key

-   Also, if you want to check multiple keys in file concatenation . For e.g. if you want to check two keys for debug in va_debug.js . then add a special character <code>#</code> in between the two keys.
    Sample:<code>{key1}#{key2}</code>: <code>VWO_d._.keys#VWO_d.v=" </code> for checking the two keys for debugger in va_debug.js or any other file. 

### Roadmap:

-  Add support of concatenation key check for non critical files as well
-  Add support for old sync code.
-  Currently when tags are checked we are not testing tags with gquery and pushcrew as their individual files are not accessible. Need to figure a way to fix that.
-  Verify Shared Preview Link
-  In version check, make sure that for production nodes the vversions don't have '-' in them. - means that they are not properly tagged.
-  Add Support for Shared Preview Link (Hash Based)

### Exceptions

-   Useragent based tests are run only for CoreLib and OSC
-   DaCDN Verifier Tests don't verify vanj.js
-   Cloudflare(cdn-cn.vwo-analytics.com) serves
    -   SVGs are brotli compressed but not from DaCDN. It is done by cloudflare
    -   Cloudflare rightly handles accept-encoding ;q= which isn't handled by DaCDN(which is a bug)
    -   Survey below 0.5 version doesn't support brotli as per DaCDN but cloudflare does it brotli compression
    -   Cloudflare always serves over HTTPS. So, http requests get a 301 redirect which ruby specs can't handle currenty
    -   Cloudflare standard plan doesn't support Vary header with User-Agent. See https://community.cloudflare.com/t/cloudflare-cdn-cache-to-support-http-vary-header/160802/. So, we are skipping those tests for cloudflare for now
    -   For empty accept-encoding, cloudflare does no encoding
    -   OSC is brolti compressed in case of cloudflare

## E2E Caveats

-   Currently tags with multiple files cannot be checked for different assertions, need to fix that
-   We are also not testing for surveys, need to create campaigns for all accounts

## Possible reasons for build failure: 
- You have mentioned the wrong branch for which we are testing .In this scenario, the test.js test cases will be failed. So please check the content mentioned in tag manager calls and without tag-manager calls should be same. 

- another scenario may be, while running the submodule init and submodule update for that specific branch. So it would give this error
``` This commit do not exist on this branch in this repo ```
So, in this case, the reason can be that the prod branch for that repo is updated and that commit is been overridden. Trigger a build for that branch and redeploy it.

## Some conventions to be followed in smoke -tests
 
- [SPECIAL_BUG_EXCEPTION] : This special check is considered as a bug in out current scenario and will fix it up in the upcoming sprints. So, this check will be considered as temporary check.

- [SPECIAL_KNOWN_BEHAVIOR] : This special check is considered a known behavior and will never be changed. For e.g. : in case of old Sync we will never support gQuery . So, use this check in those behavior. 

