Feature: Endpoint to login 

Scenario: I can login and access the User home page
Given the input of tester2@gmail.com for email and Password_2 for password
When the frontend sends the REST call to database
Then the REST call suceeds
And the database will authenticate the user
And returns the Users home page
