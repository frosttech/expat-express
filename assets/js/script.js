
var currencyApiKey = "256df3e813msh8586755e5591e80p1e72dajsn668f10750869";
var zipApi = "GVdfjcqE40zkSALO6iqFBUpH71AayyuMmmDkWvmesgRW3Uslm7bArbSpRO32cOnk";
var currencyData = {
	convertedTotal: "",
	rentalBudget: ""
}
var zipData = {}

var zipCache = [];
var propertyCache = [];

var removeAllChildren = function(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
};


var convertCurrency = function(convertFrom, convertTo, convertAmount) {
	var from = convertFrom;
	var to = convertTo;
	var amount = convertAmount;
	
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": `https://currency-converter5.p.rapidapi.com/currency/convert?format=json&from=${from}&to=${to}&amount=${amount}`,
		"method": "GET",
		"headers": {
			"X-RapidAPI-Host": "currency-converter5.p.rapidapi.com",
			"X-RapidAPI-Key": `${currencyApiKey}`
		}
	};
	$.ajax(settings).done(function (response) {
		//console.log(response.rates.USD.rate_for_amount);
		var convertedTotal = Number(response.rates.USD.rate_for_amount).toFixed(2);
		var rentalBudget = (Number(convertedTotal) * 0.28).toFixed(2);
		currencyData = {
			convertedTotal: convertedTotal,
			rentalBudget: rentalBudget
		}
		console.log(currencyData);

	});
	
};

var saveCache = function() {
	localStorage.setItem("zipCache", JSON.stringify(zipCache));
};

var responseHandler = function(response) {
	if (response.error_msg) {
		console.log(response.error_msg);
	}
	else if ("city" in response) {
		console.log(zipCache);
	}
};

var resolveZip = function(zipCode) {
	var zip = zipCode;
	cachedZip = false;
	if (zip.length == 5 && /^[0-9]+$/.test(zip)) {
		for (var i = 0; i < zipCache.length; i++) {
			if (zipCache[i].zipCode == zip) {
				//console.log("Zip code found in cache! Skipping API call...");
				zipData = {
					zipCode: zipCache[i].zipCode,
					city: zipCache[i].city,
					state: zipCache[i].state
				}
				cachedZip = true;
				console.log(zipData);
			}
		};
		if (cachedZip) {
			console.log("Zip found in cache! Skipping API call...");
			// responseHandler(zipCache[zip]);
		}
		else {
			const settings = {
				"async": true,
				"crossDomain": true,
				"url": `https://redline-redline-zipcode.p.rapidapi.com/rest/info.json/${zip}/degrees`,
				"method": "GET",
				"headers": {
					"X-RapidAPI-Host": "redline-redline-zipcode.p.rapidapi.com",
					"X-RapidAPI-Key": "256df3e813msh8586755e5591e80p1e72dajsn668f10750869"
				}
			};
			
			$.ajax(settings).done(function (response) {
				console.log("Calling ZIP API...")
				zipData = {
					zipCode: response.zip_code,
					city: response.city,
					state: response.state
				}
				zipCache.push(zipData);
				console.log(zipCache);
				saveCache();
				loadProperties(zipData.state, zipData.city);
			});
		}
	}
	else {
		console.log("Please enter a valid zip code!");
	}
};

var eventHandler = function(convertFrom, convertTo, convertAmount, zipCode) {
	if (!convertFrom || !convertTo || !convertAmount || !zipCode) {
		console.log("Missing parameter, please enter values for convertFrom, convertTo, and convertAmount.")
		return false;
	}
	else {
		return true;
	}
};

var loadCache = function() {
	savedZips = localStorage.getItem("zipCache");
	if(!savedZips) {
		zipCache = [];
		return false;
	}
	zipCache = JSON.parse(savedZips);
};

var loadProperties = function(state, city) {
	var zipState = state;
	var zipCity = city;
	console.log(zipState, zipCity);
	console.log(zipData.city);
	const settings = {
		"async": true,
		"crossDomain": true,
		"url": `https://realty-mole-property-api.p.rapidapi.com/rentalListings?state=${zipState}&city=${zipCity}&limit=5`,
		"method": "GET",
		"headers": {
			"X-RapidAPI-Host": "realty-mole-property-api.p.rapidapi.com",
			"X-RapidAPI-Key": "256df3e813msh8586755e5591e80p1e72dajsn668f10750869"
		}
	};
	$.ajax(settings).done(function (response) {
		console.log(response);
		parsedResponse = response;
		for (i = 0; i < parsedResponse.length; i++) {
			var propertyData = {
				address: parsedResponse[i].rawAddress,
				marketData: parsedResponse[i].daysOnMarket,
				type: parsedResponse[i].propertyType,
				price: parsedResponse[i].price
			}
			if (Number(currencyData.rentalBudget) >= propertyData.price) {
				propertyCache.push(propertyData)
			}
		}
		console.log(propertyCache.length);
		createPropertyEl();
	});

};

var createPropertyEl = function() {
	var formEl = document.querySelector("#propertyForm");
	removeAllChildren(formEl);
	var propertyListEl = document.createElement("ul");
	propertyListEl.className = "content";
	propertyListEl.id = "property-list";
	for (i = 0; i < propertyCache.length; i++) {
		console.log(i);
		var propertyEl = document.createElement("li");
		propertyEl.className = "content property";

		var addressEl = document.createElement("div");
		addressEl.textContent = propertyCache[i].address;
		addressEl.className = "address";
		propertyEl.appendChild(addressEl);

		var marketDataEl = document.createElement("div");
		marketDataEl.textContent = propertyCache[i].marketData + " days on the market";
		marketDataEl.className = "marketData";
		propertyEl.appendChild(marketDataEl);

		var typeEl = document.createElement("div");
		typeEl.textContent = propertyCache[i].type;
		typeEl.className = "propertyType";
		propertyEl.appendChild(typeEl);

		var priceEl = document.createElement("div");
		priceEl.textContent = "$" + propertyCache[i].price + " per month";
		priceEl.className = "price";
		propertyEl.appendChild(priceEl);

		propertyListEl.appendChild(propertyEl);
	}

	formEl.appendChild(propertyListEl);

};

loadCache();

$("#submit").click(function() {
	var convertFrom = $("select[name='currency'] :selected").val();
	var convertTo = "USD";
	var convertAmount = $("#currencyInput").val();
	var zipCode = $("#zipcode").val();
	if (eventHandler(convertFrom, convertTo, convertAmount, zipCode)) {
		convertCurrency(convertFrom, convertTo, convertAmount);
		resolveZip(zipCode);
		loadProperties(zipData.state, zipData.city);
	}
});