/**
 Known Issues
 1. Automatic Build Trigger doesn;t work correctly as it;s not able to pass the default value for JSLIB_VERSION param
 2. Builds can't run in parallel for different branches
 */
properties = '';
pipeline {
  agent {
    node {
      label 'master'
    }
  } 
  stages {
    stage('Ensure Clean Start') {
      steps {
        	cleanWs()
			checkout scm
    	}
    }
 
    stage('Build') {
    	steps {
    	    ansiColor('xterm') {
    	    	nodejs('Node 12.0.0 + yarn@1.17.3.0 +  grunt-cli@1.2.0') {
					// Set Environment variables for this step only.
					withEnv(["HOSTNAME=" + env.HOSTNAME, "DEBUG_MODE=" + env.DEBUG_MODE,"CORE_LIB_VERSION=" + env.CORE_LIB_VERSION,"NLS_JSLIB_VERSION_2=" + env.NLS_JSLIB_VERSION_2 ,"NLS_JSLIB_VERSION_3=" + env.NLS_JSLIB_VERSION_3, "OPS_JSLIB_VERSION_05=" + env.OPS_JSLIB_VERSION_05, "OPS_JSLIB_VERSION_1=" + env.OPS_JSLIB_VERSION_1, "BATCH_SIZE=" + env.BATCH_SIZE, "DACDN_BRANCH_NAME=" + env.DACDN_BRANCH_NAME, "IS_TESTAPP=" + env.IS_TESTAPP, "ONLY_EVENTS_ARCH_DACDN_VERIFIER=" + env.ONLY_EVENTS_ARCH_DACDN_VERIFIER]) {
						script {
							currentBuild.displayName = env.HOSTNAME
						}
						// Ruby Specs
						sh """#!/bin/bash -l
							source ~/.bashrc
							rvm use 2.2.1
							set -x
							if [[ $ONLY_EVENTS_ARCH_DACDN_VERIFIER != "true" ]]; then
                            	bundle config github.https true
								bundle install --path vendor/bundle
								bundle install --binstubs
								if [[ $HOSTNAME == *"vwo-analytics.com"* ]];then
									BASE_URL=https://$HOSTNAME/ SSL_HOST=$HOSTNAME  ./bin/rspec --exclude-pattern="j_spec.rb"
								else
									BASE_URL=http://$HOSTNAME/ SSL_HOST=$HOSTNAME  ./bin/rspec --exclude-pattern="j_spec.rb"
								fi
							fi
						"""

						sh """#!/bin/bash
							set -e
							set -x
						
							yarn
							grunt ts;
							cd src
							
							if [[ $ONLY_EVENTS_ARCH_DACDN_VERIFIER != "true" ]]; then
								# TagManager Consistency Tests
								node test.js --baseUrl=$HOSTNAME --protocol="http" --dacdnBranch=$DACDN_BRANCH_NAME
							fi
							cd endpoints-verifier;

							## End Points Verifier Tests as well as DaCDN Verifier Testws being run through endpoints-verifier.js file.
							if [[ $HOSTNAME == *"vwo-analytics.com"* ]];then
								# As requests are sent using domain. Increasing the number of requests in parallel cause request issuees
								BATCH_SIZE=3 node endpoints-verifier.js --baseUrl=$HOSTNAME --protocol="http" --coreLibVersion=$CORE_LIB_VERSION --nlsJslibVersionFor2=$NLS_JSLIB_VERSION_2 --nlsJslibVersionFor3=$NLS_JSLIB_VERSION_3 --opsJslibVersionFor05=$OPS_JSLIB_VERSION_05 --opsJslibVersionFor1=$OPS_JSLIB_VERSION_1 --batchSize='40'
							else
								node endpoints-verifier.js --baseUrl=$HOSTNAME --protocol="http" --coreLibVersion=$CORE_LIB_VERSION --nlsJslibVersionFor2=$NLS_JSLIB_VERSION_2 --nlsJslibVersionFor3=$NLS_JSLIB_VERSION_3 --opsJslibVersionFor05=$OPS_JSLIB_VERSION_05 --opsJslibVersionFor1=$OPS_JSLIB_VERSION_1 --batchSize='50'
							fi
						"""
					}
				}
				sh '''tar -czf artifacts *'''
   		    }
      	}
    }
  }
	options {
		disableConcurrentBuilds()
	}
	parameters {
		// Sample Build Params
		string(defaultValue: '10.12.6.4', description: '''
		Private IP without protocol and ://. Default IP is of ams5''', name: 'HOSTNAME')
		booleanParam(defaultValue: false, description: '''
		Events Arch DaCDN Verifier Tests Only.''', name: 'ONLY_EVENTS_ARCH_DACDN_VERIFIER')
		string(defaultValue:'NA',description:'''
		dacdn branch name''', name: 'DACDN_BRANCH_NAME')
		booleanParam(defaultValue: false, description: '''
		Is it a TestApp''', name: 'IS_TESTAPP')
		booleanParam(defaultValue: false, description: '''
		Enable Debug mode.''', name: 'DEBUG_MODE')
		string(defaultValue: 'NA', description: '''
		Jslib Current Version with tag''', name: 'CORE_LIB_VERSION')
		string(defaultValue: 'NA', description: '''
		NLS current version with tag for 2.0 ''', name: 'NLS_JSLIB_VERSION_2')
		string(defaultValue: 'NA', description: '''
		NLS current version with tag for 3.0''', name: 'NLS_JSLIB_VERSION_3')
		string(defaultValue: 'NA', description: '''
		OPS current version with tag for version 0.5''', name: 'OPS_JSLIB_VERSION_05')
		string(defaultValue: 'NA', description: '''
		OPS current version with tag for version 1.0''', name: 'OPS_JSLIB_VERSION_1')
	}
}
