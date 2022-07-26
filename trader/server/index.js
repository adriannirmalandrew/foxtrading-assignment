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
		res.sendStatus(403);
		return;
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
	res.cookie('sessionId', sessionId);
	res.sendStatus(200);
});

//Logout
tradeServer.post('/logout', async (req, res) => {
	//Get session ID from client
	let sessionId = req.cookies.sessionId;
	//Header for logout
	let logoutHeaders = new Headers();
	logoutHeaders.append('Authorization', 'Bearer ' + USER_ID + ' ' + sessionId);
	//Request to logout
	let logoutRequest = new Request(baseUrl + 'customer/logout', {
		method: 'POST',
		headers: logoutHeaders,
		redirect: 'follow',
	});
	//Logout from session
	let logoutResponse = await fetch(logoutRequest).then(logoutResp => {
		return logoutResp.text();
	});
	console.log(logoutResp);
	//Check fields
	let stat = logoutResponse['stat'];
	if(stat !== 'Ok') {
		res.sendStatus(403);
		return;
	}
	//Clear session ID from client
	res.clearCookie('sessionId');
	res.sendStatus(200);
});

//TODO: Implement portfolio, trading functions

//Get portfolio position book
tradeServer.post('/getPositionBook', async(req, res) => {
	//Get session ID from client
	let sessionId = req.cookies.sessionId;
	//Header for position book
	let positionBookHeaders = new Headers();
	positionBookHeaders.append('Authorization', 'Bearer ' + USER_ID + ' ' + sessionId);
	positionBookHeaders.append('Content-Type', 'application/json');
	//Request for position book
	let positionBookRequest = new Request(baseUrl + 'positionAndHoldings/positionBook', {
		method: 'POST',
		headers: positionBookHeaders,
		body: JSON.stringify({
			'ret': 'DAY',
		}),
		redirect: 'follow',
	});
	//Get position book
	let positionBookResponse = await fetch(positionBookRequest).then(positionResp => {
		return positionResp.text();
	});
	console.log(positionBookResponse);
	//Check fields
	let respStat = positionBookResponse['stat'];
	if(respStat !== 'Ok') {
		res.sendStatus(500);
		return;
	}
	//Send response
	res.json(positionBookResponse);
	res.sendStatus(200);
});

//Get portfolio holdings
tradeServer.post('/getHoldings', async(req, res) => {
	//Get session ID from client
	let sessionId = req.cookies.sessionId;
	//Header for holdings request
	let portfolioHoldingsHeaders = new Headers();
	portfolioHoldingsHeaders.append('Authorization', 'Bearer ' + USER_ID + ' ' + sessionId);
	//Request for portfolio holdings
	let portfolioHoldingsRequest = new Request(baseUrl + 'positionAndHoldings/holdings', {
		method: 'GET',
		headers: portfolioHoldingsHeaders,
		redirect: 'follow',
	});
	//Get portfolio holdings
	let portfolioHoldingsResponse = await fetch(portfolioHoldingsRequest).then(holdResp => {
		return holdResp.text();
	});
	//Check fields
	let respStat = portfolioHoldingsResponse['stat'];
	if(respStat !== 'Ok') {
		res.sendStatus(500);
		return;
	}
	//Send response
	res.json(portfolioHoldingsResponse);
	res.sendStatus(200);
});

//Get account details
tradeServer.post('/getAccountDetails', async(req, res) => {
	//Get session ID from client
	let sessionId = req.cookies.sessionId;
	//TODO
});

//Start app
tradeServer.listen(3000, () => {
	console.log('Started trading server');
});