



var convertTo = "USD";
var convertFrom = "AUD";
var convertAmount = "100";

var currencyApiKey = "";
var houseApiKey = "";



var convertCurrency = function(convertFrom, convertTo, convertAmount) {
	var amount = convertAmount;

	const settings = {
		"async": true,
		"crossDomain": true,
		"url": `https://currency-converter5.p.rapidapi.com/currency/convert?format=json&from=${convertFrom}&to=${convertTo}&amount=${convertAmount}`,
		"method": "GET",
		"headers": {
			"X-RapidAPI-Host": "currency-converter5.p.rapidapi.com",
			"X-RapidAPI-Key": `${currencyApiKey}`
		}
	};
	$.ajax(settings).done(function (response) {
		console.log(response.rates.USD.rate_for_amount);
	});
};