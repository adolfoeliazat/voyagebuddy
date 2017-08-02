'use strict';

const http = require('http');
const zlib = require("zlib");
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var processors = xml2js.processors;


function airfareHandler(db) {
	this.getFare = function(req, res) {
		console.log('calling session');

		getSession(function(sessionId) {
			console.log('session id is ', sessionId);

			fareSearch(sessionId, req.body, function(fares) {
				console.log(req.body.origin, 'for ', req.body.dest);
				res.end(fares);
			});
	    });
	};
}

function getSession(callback) {
	var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint"> <soapenv:Header/> <soapenv:Body>  <mys:CreateSession><!--Optional:--> <mys:rq> <!--Optional:--> <mys1:AccountNumber>MCN000278</mys1:AccountNumber><!--Optional:--> <mys1:Password>VOYB2017_xml</mys1:Password> <!--Optional:--><mys1:Target>Test</mys1:Target><!--Optional:--> <mys1:UserName>VOYBXML</mys1:UserName> </mys:rq> </mys:CreateSession> </soapenv:Body></soapenv:Envelope>';

	var postRequest = {
		host: 'onepointdemo.myfarebox.com',
		path: '/V2/OnePoint.svc?wsdl',
		port: 80,
		method: 'POST',
		headers: {
			'Cookie': 'cookie',
			'Content-Type': 'text/xml',
			'SOAPAction': 'Mystifly.OnePoint/OnePoint/CreateSession',
			'Content-Length': Buffer.byteLength(body)
		}
	};

	var req = http.request(postRequest, function(res) {
		console.log(res.statusCode);
		var buffer = '';
		res.on('data', function(data) {
			buffer = buffer + data;
		});

		res.on('end', function(data) {
			parseString(buffer, {
				tagNameProcessors: [processors.stripPrefix]
			}, function(err, result) {
				console.log('returning *******');
				var sessionId = result.Envelope.Body[0].CreateSessionResponse[0].CreateSessionResult[0].SessionId[0];

				return callback(sessionId);
			});
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.write(body);
	req.end();
}

function fareSearch(sessionId, data, callback) {
	console.log('getting fare search ', sessionId);

	var OriginDestinationInformations = '';
	if (data.trip_type === 'OneWay') {
		OriginDestinationInformations = '<mys:OriginDestinationInformations><mys1:OriginDestinationInformation><mys1:ArrivalWindow xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /><mys1:DepartureDateTime>'+data.from_date+'</mys1:DepartureDateTime><mys1:DepartureWindow xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /><mys1:DestinationLocationCode>'+data.dest+'</mys1:DestinationLocationCode><mys1:OriginLocationCode>'+data.origin+'</mys1:OriginLocationCode></mys1:OriginDestinationInformation></mys:OriginDestinationInformations>';
	} else {
		OriginDestinationInformations = '<mys:OriginDestinationInformations><mys1:OriginDestinationInformation><mys1:ArrivalWindow xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /><mys1:DepartureDateTime>'+data.from_date+'</mys1:DepartureDateTime><mys1:DepartureWindow xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /><mys1:DestinationLocationCode>'+data.dest+'</mys1:DestinationLocationCode><mys1:OriginLocationCode>'+data.origin+'</mys1:OriginLocationCode></mys1:OriginDestinationInformation><mys1:OriginDestinationInformation><mys1:ArrivalWindow xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /><mys1:DepartureDateTime>'+data.return_date+'</mys1:DepartureDateTime><mys1:DepartureWindow xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true" /><mys1:DestinationLocationCode>'+data.origin+'</mys1:DestinationLocationCode><mys1:OriginLocationCode>'+data.dest+'</mys1:OriginLocationCode></mys1:OriginDestinationInformation></mys:OriginDestinationInformations>';
	}

	//var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint"> <soapenv:Header/> <soapenv:Body>  <mys:CreateSession><!--Optional:--> <mys:rq> <!--Optional:--> <mys1:AccountNumber>MCN000278</mys1:AccountNumber><!--Optional:--> <mys1:Password>VOYB2017_xml</mys1:Password> <!--Optional:--><mys1:Target>Test</mys1:Target><!--Optional:--> <mys1:UserName>VOYBXML</mys1:UserName> </mys:rq> </mys:CreateSession> </soapenv:Body></soapenv:Envelope>';
	var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns:mys="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint.OnePointEntities" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint" xmlns:tem="http://tempuri.org/"><soapenv:Header /><soapenv:Body><tem:AirLowFareSearch><tem:rq><mys:IsRefundable>false</mys:IsRefundable><mys:IsResidentFare>false</mys:IsResidentFare><mys:NearByAirports>true</mys:NearByAirports>'+OriginDestinationInformations+'<mys:PassengerTypeQuantities><mys1:PassengerTypeQuantity><mys1:Code>ADT</mys1:Code><mys1:Quantity>1</mys1:Quantity></mys1:PassengerTypeQuantity></mys:PassengerTypeQuantities><mys:PricingSourceType>All</mys:PricingSourceType><mys:RequestOptions>Fifty</mys:RequestOptions><mys:ResponseFormat>JSON</mys:ResponseFormat><mys:SessionId>'+sessionId+'</mys:SessionId><mys:Target>Test</mys:Target><mys:TravelPreferences><mys1:AirTripType>OneWay</mys1:AirTripType><mys1:CabinPreference>Y</mys1:CabinPreference><mys1:MaxStopsQuantity>OneStop</mys1:MaxStopsQuantity><mys1:Preferences><mys1:CabinClassPreference><mys1:CabinType>Y</mys1:CabinType><mys1:PreferenceLevel>Restricted</mys1:PreferenceLevel></mys1:CabinClassPreference></mys1:Preferences></mys:TravelPreferences></tem:rq></tem:AirLowFareSearch></soapenv:Body></soapenv:Envelope>';

	var postRequest = {
		host: 'onepointdemo.myfarebox.com',
		path: '/V2/OnePointGZip.svc?wsdl',
		port: 80,
		method: 'POST',
		headers: {
			'Cookie': 'cookie',
			'Content-Type': 'text/xml',
			'Content-Length': Buffer.byteLength(body),
			'SOAPAction': 'http://tempuri.org/IOnePointGZip/AirLowFareSearch',
		}
	};

	var req = http.request(postRequest, function(res) {
		console.log(res.statusCode);
		var buffer = '';

		res.on('data', function(data) {
			buffer = buffer + data;
		});

		res.on('end', function(data) {
			parseString(buffer, {
				tagNameProcessors: [processors.stripPrefix]
			}, function(err, result) {
				var zippedRes = result.Envelope.Body[0].AirLowFareSearchResponse[0].AirLowFareSearchResult[0];
				const buffer = Buffer.from(zippedRes, 'base64');
				zlib.unzip(buffer, (err, buffer) => {
					if (!err) {
						return callback(buffer.toString());
					} else {
						// handle error
						console.log('err');
					}
				});
			});
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ', e.message);
	});

	req.write(body);
	req.end();
}

module.exports = airfareHandler;
