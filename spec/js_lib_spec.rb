require 'net/http'
require 'pry'
require 'uri_helper'

core_lib_default_version_include_text = 'VWO.v="6.'
RSpec.describe "JS Lib","Smoke" do
	context "va.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVaJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVaJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVaJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVaJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVaJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			#expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"

			uri = DACDN::URL.getVaJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			expect(res.body).not_to include ('gQVersion')
			#expect(res.body).to include "VWO._.jar=null"


			# uri = DACDN::URL.getVaJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			# #expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVaJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"
		end
	end

	context "track.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getTrack('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getTrack('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getTrack('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getTrack('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('isFunnelIncluded')
			#expect(res.body).not_to include "VWO._.jar"

			uri = DACDN::URL.getTrack('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('isFunnelIncluded')
			#expect(res.body).not_to include "VWO._.jar"


			# uri = DACDN::URL.getTrack('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('isFunnelIncluded')
			# #expect(res.body).not_to include "VWO._.jar"
		end
	end

	context "vanj.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVanJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVanJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVanJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
			
			uri = DACDN::URL.getVanJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVanJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVanJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			expect(res.body).not_to include ('gQVersion')
			#expect(res.body).not_to include "VWO._.jar"


			# uri = DACDN::URL.getVanJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			# #expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVanJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"

		end
	end

	context "va_debug.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVaDebugJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVaDebugJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVaDebugJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVaDebugJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVaDebugJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"

			uri = DACDN::URL.getVaDebugJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).not_to include ('gQVersion')
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"

			# uri = DACDN::URL.getVaDebugJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			#expect(res.body).not_to include "VWO._.jar"
			
			uri = DACDN::URL.getVaDebugJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"
		end
	end

	context "vanj_debug.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVanjDebugJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVanjDebugJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVanjDebugJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
			
			uri = DACDN::URL.getVanjDebugJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVanjDebugJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVanjDebugJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			expect(res.body).not_to include('gQVersion')
			#expect(res.body).not_to include "VWO._.jar"


			# uri = DACDN::URL.getVanjDebugJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVanjDebugJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"
		end
	end

	context "debugger.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getDebuggerJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getDebuggerJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getDebuggerJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
			
			uri = DACDN::URL.getDebuggerJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getDebuggerJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO_d.restoreLogs')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getDebuggerJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO_d.restoreLogs')
			#expect(res.body).not_to include "VWO._.jar"


			# uri = DACDN::URL.getDebuggerJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO_d.restoreLogs')
			# #expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getDebuggerJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO_d.restoreLogs')
			#expect(res.body).not_to include "VWO._.jar"

		end
	end

	context "va_heatmap.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVaHeatmapJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVaHeatmapJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVaHeatmapJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVaHeatmapJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVaHeatmapJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVaHeatmapJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			expect(res.body).not_to include ('gQVersion')
			#expect(res.body).not_to include "VWO._.jar"


			# uri = DACDN::URL.getVaHeatmapJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVaHeatmapJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"

		end
	end

	context "vanj_heatmap.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVanjHeatmapJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVanjHeatmapJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVanjHeatmapJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVanjHeatmapJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVanjHeatmapJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVanjHeatmapJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			expect(res.body).not_to include ('gQVersion')
			#expect(res.body).not_to include "VWO._.jar"


			# uri = DACDN::URL.getVanjHeatmapJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVanjHeatmapJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"

		end
	end

	context "va_survey.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVaSurveyJS(false)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVaSurveyJS(false)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
		end
	end
	# TODO:  remove this later (this is assumed to be non working end point)
	# context "survey-lib.js" do
	# 	it "should return 200 Ok" do
	# 		uri = DACDN::URL.getSurveyLibJS(false)
	# 		res = Net::HTTP.get_response(uri)
	# 		expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
	# 	end

	# 	it "should contain the va.js specific data in response" do
	# 		uri = DACDN::URL.getSurveyLibJS(false)
	# 		res = Net::HTTP.get_response(uri)
	# 		expect(res.body.size).to be > 1000
	# 	end
	# end

	context "vis_opt_survey.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVisOptSurveyJS(false)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVisOptSurveyJS(false)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
		end
	end

	context "vis_opt_no_jquery.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVisOptNoJqueryJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVisOptNoJqueryJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVisOptNoJqueryJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVisOptNoJqueryJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"
		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVisOptNoJqueryJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVisOptNoJqueryJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			expect(res.body).not_to include ('gQVersion')
			#expect(res.body).not_to include "VWO._.jar"


			# uri = DACDN::URL.getVisOptNoJqueryJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVisOptNoJqueryJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include (core_lib_default_version_include_text)
			#expect(res.body).not_to include "VWO._.jar"
		end
	end

	context "vis_opt.js" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getVisOptJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVisOptJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			# uri = DACDN::URL.getVisOptJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getVisOptJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

		end

		it "should contain the va.js specific data in response" do
			uri = DACDN::URL.getVisOptJS('5.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			#expect(res.body).not_to include "VWO._.jar"

			uri = DACDN::URL.getVisOptJS('6.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('VWO.v="6.')
			expect(res.body).not_to include ('gQVersion')
			#expect(res.body).not_to include "VWO._.jar"

			# uri = DACDN::URL.getVisOptJS('7.0')
			# res = Net::HTTP.get_response(uri)
			# expect(res.body.size).to be > 1000
			# expect(res.body).to include ('VWO.v="7.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getVisOptJS(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include (core_lib_default_version_include_text)
			#expect(res.body).not_to include "VWO._.jar"

		end
	end
	
	context "OPA or nls-jslib" do
		it "should return 200 Ok" do
			uri = DACDN::URL.getOpa('3.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getOpa('2.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getOpa(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getWorker('3.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getWorker('2.0')
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy

			uri = DACDN::URL.getWorker(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the opa.js specific data in response" do
			uri = DACDN::URL.getOpa('3.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('version:"3.')
			#expect(res.body).not_to include "VWO._.jar"

			uri = DACDN::URL.getOpa('2.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('version:"2.')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getOpa(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('version:"2.')
			#expect(res.body).not_to include "VWO._.jar"

			uri = DACDN::URL.getWorker('3.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('compress')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getWorker('2.0')
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('compress')
			#expect(res.body).not_to include "VWO._.jar"


			uri = DACDN::URL.getWorker(nil)
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 1000
			expect(res.body).to include ('compress')
			#expect(res.body).not_to include "VWO._.jar"
		end

	end
end
