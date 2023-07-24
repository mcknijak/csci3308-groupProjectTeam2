const { Given, Then , When} = require('@cucumber/cucumber');    
const axios = require('axios');
const { expect } = require('chai');

let loginResponse;



When('I make a POST request to {string} with valid credentials', async (endpoint) => {
  try {
    const response = await axios.post(`http://localhost:4000/login${endpoint}`, {
      email: 'tester2@gmail.com',
      password: 'Password_2',
    });
    loginResponse = response;
  } catch (error) {
    loginResponse = error.response;
  }
});

Then('the response status code should be 200', () => {
  expect(loginResponse.status).to.equal(200);
});










const { Given, When, Then } = require('@cucumber/cucumber');

let input = null
Given('an input number of {int}', function (inputNumber) {
    return input = inputNumber;
});

const pactum = require('pactum');
let spec;
const BASE_URL = 'http://localhost:4000/primeFactors/api?input=';
When('I get the prime factors from the endpoint', function () {
    spec = pactum.spec();
    spec.get(BASE_URL + input);
});


Then('the REST call succeeds', async function () {
    await spec.expectStatus(200);
});
    
    
const chai = require('chai');
const expect = chai.expect;
Then(/^the prime factors returned are:$/, async function (factors) {
    const actualList = spec._response.json.factors;
    const expectedList = factors.raw().flat().map(y => parseInt(y));
    expect(actualList).to.eql(expectedList);
});






