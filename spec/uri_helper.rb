require 'yaml'

module DACDN
	module URL
		@config = YAML::load(File.open('config.yml'))
		@base_url = ENV["BASE_URL"].nil? ? @config["base_url"] :  ENV["BASE_URL"]
		
		def URL.getJ()
			uri = URI(@base_url + "/j.php")
			params = { a:@config["account_id"], u:@config["test_url"] }
			uri.query = URI.encode_www_form(params)
			uri
		end

		def URL.getGeoCheck()
			URI(@base_url + "/geocheck")
		end

		def URL.getVaGqJS(version = "6.0")
			if (version)
				URI(@base_url + version + "/vagq.js")
			else
				URI(@base_url + "/vagq.js")
			end
		end

		def URL.getVaJS(version = "5.0")
			if (version) 
				URI(@base_url + version + "/va.js")
			else
			
				URI(@base_url + "/va.js")
			end
		end
		
		def URL.getVanJS(version = '5.0')
			if (version) 
				URI(@base_url + version + "/vanj.js")
			else
			
				URI(@base_url + "/vanj.js")
			end
		end

		def URL.getVaGqDebugJS(version = '5.0')
			if (version)
				URI(@base_url + version + "/vagq_debug.js")
			else
				URI(@base_url + "/vagq_debug.js")
			end
		end

		def URL.getVaDebugJS(version = '5.0')
			if (version) 
				URI(@base_url + version + "/va_debug.js")
			else
			
				URI(@base_url + "/va_debug.js")
			end
		end

		def URL.getVanjDebugJS(version)
			if (version) 

				URI(@base_url + version + "/vanj_debug.js")
			else
			
				URI(@base_url + "/vanj_debug.js")
			end
		end
		
		def URL.getDebuggerJS(version)
			if (version) 
				URI(@base_url + version + "/debugger.js")
			else
			
				URI(@base_url + "/debugger.js")
			end
		end

		def URL.getVaHeatmapJS(version)
			if (version) 
				URI(@base_url + version + "/va_heatmap.js")
			else
			
				URI(@base_url + "/va_heatmap.js")
			end
		end

		def URL.getVaGqHeatmapJS(version)
			if (version)
				URI(@base_url + version + "/vagq_heatmap.js")
			else
				URI(@base_url + "/vagq_heatmap.js")
			end
		end

		def URL.getVanjHeatmapJS(version)
			if (version) 
				URI(@base_url + version + "/vanj_heatmap.js")
			else
			
				URI(@base_url + "/vanj_heatmap.js")
			end
		end

		def URL.getHeatmapHelperJS(version)
			if (version) 
				URI(@base_url + version + "/heatmap.helper.js")
			else
			
				URI(@base_url + "/heatmap.helper.js")
			end
		end

		def URL.getVaSurveyJS(version)
			if (version) 
				URI(@base_url + version + "/va_survey.js")
			else
			
				URI(@base_url + "/va_survey.js")
			end
		end

		def URL.getVanjSurveyJS(version)
			if (version) 
				URI(@base_url + version + "/vanj_survey.js")
			else
			
				URI(@base_url + "/vanj_survey.js")
			end
		end

		def URL.getSurveyLibJS(version)
			if (version) 
				URI(@base_url + version + "/survey-lib.js")
			else
			
				URI(@base_url + "/survey-lib.js")
			end
		end

		def URL.getVisOptSurveyJS(version)
			if (version) 
				URI(@base_url + version + "/vis_opt_survey.js")
			else
			
				URI(@base_url + "/vis_opt_survey.js")
			end
			URI(@base_url + "/vis_opt_survey.js")
		end

		def URL.getVisOptNoJqueryJS(version)
			if (version) 
				URI(@base_url + version + "/vis_opt_no_jquery.js")
			else
			
				URI(@base_url + "/vis_opt_no_jquery.js")
			end
		end	

		def URL.getVisOptGqJS(version) 
			if (version)
				URI(@base_url + version + "/vis_opt_gq.js")
			else
				URI(@base_url + "/vis_opt_gq.js")
			end
		end

		def URL.getVisOptJS(version)
			if (version) 
				URI(@base_url + version + "/vis_opt.js")
			else
			
				URI(@base_url + "/vis_opt.js")
			end
		end	

		def URL.getOpa(version)
			if (version) 
				URI(@base_url + "/analysis/" + version + "/opa.js")
			else
				URI(@base_url + "/analysis/opa.js")
			end
		end

		def URL.getWorker(version)
			if (version) 
				URI(@base_url + "/analysis/" + version + "/worker.js")
			else
				URI(@base_url + "/analysis/worker.js")
			end
		end

		def URL.getTrack(version)
			if (version) 
				URI(@base_url + '/' + version + "/track.js")
			else
				URI(@base_url + "track.js")
			end
		end
	end
end