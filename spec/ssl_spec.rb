require 'net/http'
require 'pry'
require 'uri_helper'
require 'ssllabs'
require 'yaml'



RSpec.describe "SSL","Smoke" do
	context "The Endpoint" do
		before(:all) do
			@config = YAML::load(File.open('config.yml'))
			@ssl_host = ENV["SSL_HOST"].nil? ? @config["ssl_host"] :  ENV["SSL_HOST"]
		end
		@config = YAML::load(File.open('config.yml'))
		xit "should be of grade C" do
			api = Ssllabs::Api.new
			result = api.analyse(host:@ssl_host ,publish: 'off', startNew: 'on', all: 'done')

			while result.endpoints == nil
				p "Endpoints not Found Sleeping for 30 seconds"
				sleep(30)
				result = api.analyse(host:@ssl_host ,publish: 'off', startNew: 'on', all: 'done')
			end

			ip = result.endpoints.first.ip_address
			endpoint_data = api.get_endpoint_data(host: @ssl_host,s: ip, fromCache: 'on')

			while endpoint_data == nil or endpoint_data.grade == nil or endpoint_data.details == nil
				p "Not Ready Will try after 30 sec"
				sleep(30)
				endpoint_data = api.get_endpoint_data(host: @ssl_host,s: ip, fromCache: 'on')
			end

			puts "You have Got the following grade: " + endpoint_data.grade

			expect(endpoint_data.details.cert.issues).to eq(0)


			puts "Your Certificate Atl Names are " + endpoint_data.details.cert.alt_names.join(",")

			puts "Your Certificate is expriring on : " + Time.at(endpoint_data.details.cert.not_after/1000).to_s

			expect(endpoint_data.details.vuln_beast?).to be_falsy
			puts "Vulnerable to Beast: " + endpoint_data.details.vuln_beast?.to_s

			expect(endpoint_data.details.heartbleed?).to be_falsy
			puts "Vulnerable to HeartBleed: " + endpoint_data.details.heartbleed?.to_s

			expect(endpoint_data.details.poodle?).to be_falsy
			puts "Vulnerable to Poodle: " + endpoint_data.details.poodle?.to_s

			expect(endpoint_data.details.freak?).to be_falsy
			puts "Vulnerable to Freak: " + endpoint_data.details.freak?.to_s


		end
	end
end
