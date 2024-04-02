require 'net/http'
require 'pry'
require 'uri_helper'


RSpec.describe "GeoCheck","Smoke" do
	context "The Endpoint" do
		it "should return 200 Ok" do 
			uri = DACDN::URL.getGeoCheck()
			res = Net::HTTP.get_response(uri)
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
		end

		it "should contain the geo specific data in response" do 
			uri = DACDN::URL.getGeoCheck()
			res = Net::HTTP.get_response(uri)
			expect(res.body.size).to be > 0
		end
	end
end