# Discourse Connector for SaaS Connectivity
This is for SailPoint's SaaS Connectivity runtime that connects to [Discourse](https://www.discourse.org/), a forum/community software tool.

# How to use
Start by downloading the discourse-connector-1.0.0.zip file from the [releases page](https://github.com/sailpoint-oss/saas-conn-discourse/releases) 

Once downloaded, you can upload the connector to your org by using the [SailPoint CLI](https://developer.sailpoint.com/idn/tools/cli/) and issuing the following commands:

1. sail conn create "your connector name"
2. sail conn upload -c "your connector name" -f "/path/to/discourse-connector-1.0.0.zip"

# Configuring
When you create a new source using the connector, you will need to provide the following configuration parameters:

1. API Key - You can follow the steps [here](https://meta.discourse.org/t/create-and-configure-an-api-key/230124) on how to create an API Key for your discourse instance. The User Level should be set to "All Users" and the scope should be set to "global" or as appropriate scopes set for the connector to manage all users in the instance.

2. API Username - This will be set to "system" if hte user level is set to "All Users"

3. Base URL - This is generally the URL that appears on the discourse homepage. So in the case of the developer.sailpoint.com site, the Base URL is "https://developer.sailpoint.com/discuss/"

4. Primary Group - This is the group that the discourse connector will manage accounts from. This way you can set your connector to only list accounts that appear in this group. This is helpful if you only want to manage users who are actually a part of your organization and not outside "non employees" who use the platform to facilitate conversations. If you are only using discourse for internal discussions, then you can set this to "all users"

# Running Locally
To run and test locally, follow the steps for running connectors [here](https://developer.sailpoint.com/idn/docs/saas-connectivity/test-build-deploy)