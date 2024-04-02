import requests
shared_dict_list = ["URLS", "SETTINGS", "ACCOUNTSETTINGS", "TAGS", "APPS", "S3KEYCACHE", "APPSETTINGS", "CD_PII", "QP_PII", "STATS", "HASH", "REGEXES", "IP_FILTERS", "healthcheck", "INCLUDE_EXCLUDE_URLS", "VALIDIDS"]

free_percent_dict = {}
should_fail = False
for shared_dict in shared_dict_list:
	r = requests.get("http://5.10.88.213/get_nginx_cache_status?dict="+shared_dict)
	if r.status_code == 200:
		resp = r.text
		resp = resp.split("\n")
		free_percent = (float(resp[0])/float(resp[1])) * 100
		free_percent_dict[shared_dict] = free_percent
		if free_percent <= 10:
			should_fail = True
			print("Free space too low for " + shared_dict)
	else:
		should_fail = True
		print(r.status_code,r.text)
print("\n\n\n\n\n\n\n\n\n\n\n\n\n")
print("###############################################################################")
print("\n\n\n\n")
print(free_percent_dict)
exit(should_fail)
