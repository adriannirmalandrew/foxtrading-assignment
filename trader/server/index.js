/*
The backend for the "trader" application:
- Login to a demat account
- Place trades and record on database
*/

const express = require('express');
const mongodb = require('mongodb');

//Load environment variables
require('dotenv').config();
const USER_ID = process.env.USER_ID;
const APP_CODE = process.env.APP_CODE;
const SECRET_KEY = process.env.SECRET_KEY;

//Initialize app
let tradeServer = express();
//Base URL:
const baseUrl = 'https://a3.aliceblueonline.com/rest/AliceBlueAPIService/api/';

//Login
tradeServer.post('/login', async (req, res) => {
	//Header to get encKey
	let encKeyRequestHeaders = new Headers();
	encKeyRequestHeaders.append('Content-Type', 'application/json');
	//Request to get encKey
	let encKeyRequest = new Request(baseUrl + 'customer/getAPIEncpkey', {
		method: 'POST',
		headers: encKeyRequestHeaders,
		body: JSON.stringify({"userId": USER_ID}),
		redirect: 'follow',
	});
	//Get encryption key
	let encKeyResponse = await fetch(encKeyRequest).then(encResp => {
		return encResp.text();
	});
	console.log(encKeyResponse);
	//SHA-256 (user ID + API key + encryption key)
	//Get session ID
	//Return session ID
	res.json(encKeyResponse);
});

//Logout
tradeServer.post('/logout', (req, res) => {
	//TODO
});

//Buy
tradeServer.post('/buy', (req, res) => {
	//TODO
});

//Start app
tradeServer.listen(3000, () => {
	console.log('Started trading server');
});