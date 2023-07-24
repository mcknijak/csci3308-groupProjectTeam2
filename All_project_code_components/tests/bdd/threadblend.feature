Feature: Endpoint to login 

Scenario: I can login and access the User home page
When I make a POST request with valid credentials
Then the response status code should be 200