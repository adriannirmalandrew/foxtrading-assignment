/*
The backend for the "trader" application:
- Login to a demat account
- Place trades and record on database
*/

const express = require('express');
const mongodb = require('mongodb');
const crypto = require('crypto');

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
		body: JSON.stringify({'userId': USER_ID}),
		redirect: 'follow',
	});
	//Get encryption key
	let encKeyResponse = await fetch(encKeyRequest).then(encResp => {
		return encResp.text();
	});
	console.log(encKeyResponse);
	//Check fields
	let userId = encKeyResponse['userId'];
	let encKey = encKeyResponse['encKey'];
	if(userId !== USER_ID) {
		//Send error response
		//Return
	}
	
	//SHA-256 hash (user ID + API key + encryption key)
	let dataString = userId + SECRET_KEY + encKey;
	let sha256 = crypto.createHash('sha256');
	sha256.update(dataString, 'utf8');
	let dataStringHash = sha256.digest('base64');
	//Header to get sessionId
	let sessionIdRequestHeaders = new Headers();
	sessionIdRequestHeaders.append('Content-Type', 'application/json');
	//Request to get sessionId
	let sessionIdRequest = new Request(baseUrl + 'customer/getUserSID', {
		method: 'POST',
		headers: sessionIdRequestHeaders,
		body: JSON.stringify({
			'userId': USER_ID,
			'userData': dataStringHash,
		}),
		redirect: 'follow',
	})
	//Get session ID
	let sessionIdResponse = await fetch(sessionIdRequest).then(sessResp => {
		return sessResp.text();
	});
	console.log(sessionIdResponse);
	//Check fields
	let stat = sessionIdResponse['stat'];
	let sessionId = sessionIdResponse['sessionID'];
	//Return session ID
	res.send({'sessionId': sessionId});
});

//Logout
tradeServer.post('/logout', (req, res) => {
	//TODO
});

//Start app
tradeServer.listen(3000, () => {
	console.log('Started trading server');
});