# DaCDN Endpoints Verifier

## Goal

It's goal is to verify the data/headers in all endpoints present in two types of files(described below)

1. endpoints-without-tags.json - It contains all the unversioned endpoints of all the JSLIB repos which are servable from DaCDN
2. jslib-tags/tagsConfig.json - It contains all the tag URLs. Critical and Not critical. As submodule hash is commited in the repo, we need to update it manually.

TODO - Before giving it to QA:

- static/survey/images and static/images both are servable
    - Images are not gzipped/brotlied. Verify it.
- JSON generating script needs to take care of disble and only -> DONE
    - in surveys, svg files exist only in 0.5 -> DONE
- 3.0 cases failing for the following file.
    - hashes.json
    - opa.js
    - worker.js
    - player.js
- Survey lib is giving error for the accept-encoding defalte .
- Analysis/worker.js not working giving 404 . but it is there on the ams5 dev
- Also survey-lib is accessed without the version name . SO it is not brotli .
- skipping the current 3.0 as testapp contains 2.0 changes . Both versions cannot be deployed on the testapp .

Ignoring the case - survey-debugger.js and preview.css
COMMAND TO RUN LOCALLY -> node --inspect-brk endpoints-verifier.js --baseUrl='vwotestapp7dev.visualwebsiteoptimizer.com' --protocol='http'
4.0 occurs for NLS_VERSION. Two changes need to be done :
    1. firstly add a argument(nlsJslibVersionFor4) support for th e4th version like the way 3.0 and 2.0 has.for e.g  nlsJslibversionFor2.
    2. change the specific path of the nlsversion in contentchecker of nlsjslib in libraryConfigs object.

Roadmap

- While running fetch latest jslib-tags from master instead of using the hash that's commited. It would make sure any changes in master branch of jslib-tags are automatically catered.
- Skipping the endpoints in which there are multiple license in the file like the file vis_opt_survey_debug.js,va_survey_debug.js and some files of tag manager as well.
- Make a quick version of these tests - Not important
    1. Not all endpoints need to be tested in case of tags
- Configure all non tag endpoints using single JSON(endpoints-without-tags.json). Following things can be mentioned in JSON and should be automatically verified
    - Response Header Verification
        - e.g. gzip, vary
    - Content Verification
        - License string to search
        - UA Based Content Check. A hashmap of UA to Content Check(regex)
