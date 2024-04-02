require 'net/http'
require 'pry'
require 'uri_helper'


RSpec.describe "J.php","Smoke" do
	context "When there is a valid account id and and experiment is running on the URL" do
		it "should return 200 Ok" do 
			uri = DACDN::URL.getJ()
			res = Net::HTTP.get_response(uri)
			if res.header['Location']
				res1 = Net::HTTP.get_response(URI(res.header['Location']))		
				res = res1;
			end
			expect(res.is_a?(Net::HTTPSuccess)).to be_truthy
			expect(res.body).to include("var _vwo_geo = {")
			expect(res.body).to include("window._vwo_ip =")
		end
	end
end