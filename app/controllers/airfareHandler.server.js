'use strict';

const http = require('http');
const zlib = require("zlib");
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var processors = xml2js.processors;



function airfareHandler (db) {

   this.getFare = function (req, res) {

      var travelDate = req.body.travelDate;
      var origin = req.body.origin;
      var destination = req.body.dest;

      console.log("calling session");
      getSession(function(response){
            // Here you have access to your variable
            //res.json({"travel": response});
            console.log("session is "+response);


            fareSearch(response, travelDate, origin, destination, function(fares)
            {
                console.log("for "+origin+destination);
                res.end(fares);
            });
        });

      
   };

}

function getSession(callback)
{
    var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint"> <soapenv:Header/> <soapenv:Body>  <mys:CreateSession><!--Optional:--> <mys:rq> <!--Optional:--> <mys1:AccountNumber>MCN000278</mys1:AccountNumber><!--Optional:--> <mys1:Password>VOYB2017_xml</mys1:Password> <!--Optional:--><mys1:Target>Test</mys1:Target><!--Optional:--> <mys1:UserName>VOYBXML</mys1:UserName> </mys:rq> </mys:CreateSession> </soapenv:Body></soapenv:Envelope>';

        var postRequest = {
            host: "onepointdemo.myfarebox.com",
            path: "/V2/OnePoint.svc?wsdl",
            port: 80,
            method: "POST",
            headers: {
                'Cookie': "cookie",
                'Content-Type': 'text/xml',
                'SOAPAction':"Mystifly.OnePoint/OnePoint/CreateSession",
                'Content-Length': Buffer.byteLength(body)
            }
        };

        var buffer = "";

        var req = http.request( postRequest, function( res )    {

        console.log( res.statusCode );
        var buffer = "";
        res.on( "data", function( data ) { buffer = buffer + data; } );
        res.on( "end", function( data ) 
            { 
                parseString(buffer,{tagNameProcessors: [processors.stripPrefix]}, function (err, result) 
                    {
                       console.log("returning *******");
                       var sessionId = result.Envelope.Body[0].CreateSessionResponse[0].CreateSessionResult[0].SessionId[0];

                       return callback(sessionId);
                       
                    });
                
            } );

        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.write( body );
        req.end();
    

}


function fareSearch(sessionId, travelDate, dest, origin, callback)
{

var SessionId =  sessionId

console.log("getting fare search "+sessionId);

var depDateTime = travelDate; //'2017-08-20T00:00:00.000Z';
var destLoc = dest; //'LHR';
var origLoc = origin; //'NYC';

//var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:mys="Mystifly.OnePoint" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint"> <soapenv:Header/> <soapenv:Body>  <mys:CreateSession><!--Optional:--> <mys:rq> <!--Optional:--> <mys1:AccountNumber>MCN000278</mys1:AccountNumber><!--Optional:--> <mys1:Password>VOYB2017_xml</mys1:Password> <!--Optional:--><mys1:Target>Test</mys1:Target><!--Optional:--> <mys1:UserName>VOYBXML</mys1:UserName> </mys:rq> </mys:CreateSession> </soapenv:Body></soapenv:Envelope>';
var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:mys="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint.OnePointEntities" xmlns:mys1="http://schemas.datacontract.org/2004/07/Mystifly.OnePoint" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays"> <soapenv:Header/> <soapenv:Body> <tem:AirLowFareSearch> <!--Optional:--> <tem:rq><!--Optional:--><mys:IsRefundable>false</mys:IsRefundable><!--Optional:--><mys:IsResidentFare>false</mys:IsResidentFare><!--Optional:--><mys:NearByAirports>true</mys:NearByAirports><!--Optional:--><mys:OriginDestinationInformations><!--Zero or more repetitions:--><mys1:OriginDestinationInformation><!--Optional:--><mys1:ArrivalWindow xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/><!--Optional:--><mys1:DepartureDateTime>'+depDateTime+'</mys1:DepartureDateTime><!--Optional:--><mys1:DepartureWindow xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/><!--Optional:--><mys1:DestinationLocationCode>'+destLoc+'</mys1:DestinationLocationCode><!--Optional:--><mys1:OriginLocationCode>'+origLoc+'</mys1:OriginLocationCode></mys1:OriginDestinationInformation></mys:OriginDestinationInformations><!--Optional:--><mys:PassengerTypeQuantities><!--Zero or more repetitions:--><mys1:PassengerTypeQuantity><!--Optional:--><mys1:Code>ADT</mys1:Code><!--Optional:--><mys1:Quantity>1</mys1:Quantity></mys1:PassengerTypeQuantity></mys:PassengerTypeQuantities><!--Optional:--><mys:PricingSourceType>All</mys:PricingSourceType><!--Optional:--><mys:RequestOptions>Hundred</mys:RequestOptions><!--Optional:--><mys:ResponseFormat>JSON</mys:ResponseFormat><!--Optional:--><mys:SessionId>'+SessionId+'</mys:SessionId><!--Optional:--><mys:Target>Test</mys:Target><!--Optional:--><mys:TravelPreferences><!--Optional:--><mys1:AirTripType>OneWay</mys1:AirTripType><!--Optional:--><mys1:CabinPreference>Y</mys1:CabinPreference><!--Optional:--><mys1:MaxStopsQuantity>All</mys1:MaxStopsQuantity><!--Optional:--><mys1:Preferences><!--Optional:--><mys1:CabinClassPreference><!--Optional:--><mys1:CabinType>Y</mys1:CabinType><!--Optional:--><mys1:PreferenceLevel>Restricted</mys1:PreferenceLevel></mys1:CabinClassPreference></mys1:Preferences><!--Optional:--></mys:TravelPreferences> </tem:rq> </tem:AirLowFareSearch> </soapenv:Body> </soapenv:Envelope>'

//console.log(body);

var postRequest = {
    host: "onepointdemo.myfarebox.com",
    path: "/V2/OnePointGZip.svc?wsdl",
    port: 80,
    method: "POST",
    headers: {
        'Cookie': "cookie",
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(body),
        'SOAPAction': "http://tempuri.org/IOnePointGZip/AirLowFareSearch",
    }
};

var buffer = "";

var req = http.request( postRequest, function( res )    {

   console.log( res.statusCode );

   var buffer = "";
   res.on( "data", function( data ) { 
       
       buffer = buffer + data; 
    } );
   res.on( "end", function( data ) { 
       
            //console.log(buffer);

            parseString(buffer,{tagNameProcessors: [processors.stripPrefix]}, function (err, result) {

                
                  
                  var zippedRes = result.Envelope.Body[0].AirLowFareSearchResponse[0].AirLowFareSearchResult[0];
                 // console.log(zippedRes);
                 const buffer = Buffer.from(zippedRes, 'base64');
                    zlib.unzip(buffer, (err, buffer) => {
                    if (!err) {
                        //console.log(buffer.toString);
                        return callback(buffer.toString());
                    } else {
                        // handle error
                         console.log("err");
                    }

                });
             });
   });

});


req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

req.write( body );
req.end();


}
module.exports = airfareHandler;
