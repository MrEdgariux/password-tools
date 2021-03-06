var HSIMP = {};
HSIMP.model = {
	password:'',calculationsPerSecond:250000000
};

HSIMP.match = function(match,length) {
	return {
		match:match,length:length
	};
};

HSIMP.matches = {
	'ASCII Lowercase':HSIMP.match(/[a-z]/,26),'ASCII Uppercase':HSIMP.match(/[A-Z]/,26),'ASCII Numbers':HSIMP.match(/\d/,10),'ASCII Top Row Symbols':HSIMP.match(/[!@£#\$%\^&\*\(\)\-_=\+]/,15),'ASCII Other Symbols':HSIMP.match(/[\?\/\.>\,<`~\\|"';:\]\}\[\{\s]/,19),'Unicode Latin 1 Supplement':HSIMP.match(/[\u00A1-\u00FF]/,94),'Unicode Latin Extended A':HSIMP.match(/[\u0100-\u017F]/,128),'Unicode Latin Extended B':HSIMP.match(/[\u0180-\u024F]/,208),'Unicode Latin Extended C':HSIMP.match(/[\u2C60-\u2C7F]/,32),'Unicode Latin Extended D':HSIMP.match(/[\uA720-\uA7FF]/,29),'Unicode Cyrillic Uppercase':HSIMP.match(/[\u0410-\u042F]/,32),'Unicode Cyrillic Lowercase':HSIMP.match(/[\u0430-\u044F]/,32)
};

HSIMP.largeNumbers = {
	'thousand':1e3,'million':1e6,'billion':1e9,'trillion':1e12,'quadrillion':1e15,'quintillion':1e18,'sextillion':1e21,'septillion':1e24,'octillion':1e27,'nonillion':1e30,'decillion':1e33,'undecillion':1e36,'duodecillion':1e39,'tredecillion':1e42,'quattuordecillion':1e45,'quindecillion':1e48,'sexdecillion':1e51,'septendecillion':1e54,'octodecillion':1e57,'novemdecillion':1e60,'vigintillion':1e63,'unvigintillion':1e66,'duovigintillion':1e69,'tresvigintillion':1e72,'quattuorvigintillion':1e75,'quinquavigintillion':1e78,'sesvigintillion':1e81,'septemvigintillion':1e84,'octovigintillion':1e87,'novemvigintillion':1e90,'trigintillion':1e93,'untrigintillion':1e96,'duotrigintillion':1e99,'googol':1e100,'trestrigintillion':1e102,'quattuortrigintillion':1e105,'quinquatrigintillion':1e108,'sestrigintillion':1e111,'septentrigintillion':1e114,'octotrigintillion':1e117,'noventrigintillion':1e120,'quadragintillion':1e123,'quinquagintillion':1e153,'sexagintillion':1e183,'septuagintillion':1e213,'octogintillion':1e243,'nonagintillion':1e273
};

HSIMP.period = function(period,inSecs,plural) {
	plural = plural || false;
	return {
		period:period,inSecs:inSecs,plural:plural
	};
};

HSIMP.periods = (function() {
	var i,current,inSecs,periods=[HSIMP.period('second',1,true),HSIMP.period('minute',60,true),HSIMP.period('hour',3600,true),HSIMP.period('day',86400,true),HSIMP.period('year',31556926,true)],sort=function(a,b) {
		return(a.inSecs < b.inSecs)? - 1:1;
	};

	for (i in HSIMP.largeNumbers) {
		if (HSIMP.largeNumbers.hasOwnProperty(i)) {
			inSecs = HSIMP.largeNumbers[i] * 31556926;
			if (inSecs !== Infinity) {
				current = HSIMP.period(i + ' years',inSecs);
				periods.push(current);
			}
		}
	}
	periods.sort(sort);
	return periods;
}());

HSIMP.check = function(password) {
	var checks = {
		results: {},insecure:false
	},result,i;for (i in HSIMP.checks) {
		if (HSIMP.checks.hasOwnProperty(i)) {
			result = HSIMP.checks[i](password);
			if (result !== undefined) {
				checks.results[i] = result;
				if (result.level === 'insecure') {
					checks.insecure = true;
				}
			}
		}
	}
	return checks;
};

HSIMP.checks = {
	'Repeated Pattern':function(password) {
		var results = password.match(/(.+)\1{2,}/gi);
		if (results) {
			return {
				level:'warning',short:'Repeated characters or patterns can make your password more predictable',long:''
			};
		}
	},'Common Password':function(password) {
		var i = (HSIMP.commonPasswords && HSIMP.commonPasswords.length) || 0,rank;
		while(i--) {
			if (password.toLowerCase()===HSIMP.commonPasswords[i]) {
				rank = HSIMP.formatNumber(Math.ceil((i + 1)/10) * 10);
				return {
					level:'insecure',subtitle:'In the top ' + rank + ' most used passwords',short:'Your password is very commonly used. It would be cracked almost instantly.',long:''
				};
			}
		}
	},'Possibly a Word':function(password) {
		if (password.match(/^[a-zA-Z]+$/)) {
			return {
				level:'warning',short:'Repeated characters or patterns can make your password more predictable',long:''
			};
		}
	},'Contains a Common Word':function(password) {
		var i=(HSIMP.commonPasswords&&HSIMP.commonPasswords.length) || 0,rank;
		while(i--) {
			var re = new RegExp(HSIMP.commonPasswords[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),"i");
			/*var re = new RegExp("password","i");*/
			var results = password.match(re);
			if (results) {
				rank=HSIMP.formatNumber(Math.ceil((i+1)/10)*10);
				return {
					level:'advice',subtitle:'This contains a word in the top '+rank+' most used passwords',short:'Your password could be similar to a commonly used one.',long:''
				};
			}
		}
	},'Possibly a Word':function(password) {
		if (password.match(/^[a-zA-Z]+$/)) {
			return {
				level:'warning',short:'Your password looks like it could be a dictionary word or a name. If it\'s a name with personal significance it might be easy to guess. If it\'s a dictionary word it could be cracked very quickly.',long:''
			};
		}
	},'Possibly a Telephone Number / Date':function(password) {
		if (password.match(/^[\-\(\)\.\/\s0-9]+$/)) {
			return {
				level:'warning',short:'Your password looks like it might be a telephone number or a date. If it is and it has personal significance then it might be very easy for someone to guess.',long:''
			};
		}
	},'Possibly a Word Followed by a Number':function(password) {
		if (password.match(/^[a-zA-Z]+[0-9]{1,4}$/)) {
			return {
				level:'warning',short:'Your password looks like it might be a word followed by a few digits. This is a very common pattern and would probably be cracked quite quickly.',long:''
			};
		}
	},'Length':function(password) {
		if (password.length<8) {
			return {
				level:'warning',subtitle:'Very short',short:'Your password is very short. The longer a password is the more secure it will be. Additionally, SensePost requires a minimum of 8 characters.',long:''
			};
		} else if (password.length<10) {
			return {
				level:'advice',subtitle:'Short',short:'Your password is quite short. The longer a password is the more secure it will be.',long:''
			};
		} else if (password.length>15) {
			return {
				level:'achievement',subtitle:'Long',short:'Your password is over 16 characters long. It should be pretty safe.',long:''
			};
		}
	},'Character Variety':function(password) {
		if (password.match(/^[A-Za-z]+$/)) {
			return{
				level:'warning',subtitle:'Just Letters',short:'Your password only contains letters. Adding numbers and symbols can make your password more secure. Additionally, SensePost requires at least one character from three of the following four categories; UPPERCASE, lowercase, numbers of special characters.',long:''
			};
		} else if (password.match(/^[A-Z0-9]+$/)) {
			return {
				level:'warning',subtitle:'Missing Character Set',short:'Your password only contains numbers and UPPERCASE letters. Adding a symbol or lowercase letters can make your password more secure. Don\'t forget you can often use spaces in passwords. Additionally, SensePost requires at least one character from three of the following four categories; UPPERCASE, lowercase, numbers of special characters.',long:''
			};
		} else if (password.match(/^[a-z0-9]+$/)) {
			return {
				level:'warning',subtitle:'Missing Character Set',short:'Your password only contains numbers and lowercase letters. Adding a symbol or UPPERCASE letters can make your password more secure. Don\'t forget you can often use spaces in passwords. Additionally, SensePost requires at least one character from three of the following four categories; UPPERCASE, lowercase, numbers of special characters.',long:''
			};
		} else if (password.match(/^[A-Z!@#$%^&*()_+-=\[\]\{\};'\\:"|,.\/<>?±§~`]+$/)) {
			return {
				level:'warning',subtitle:'Missing Character Set',short:'Your password only contains UPPERCASE letters and special characters. Adding a number or lowercase letters can make your password more secure. SensePost requires at least one character from three of the following four categories; UPPERCASE, lowercase, numbers of special characters.',long:''
			};
		} else if (password.match(/^[a-z!@#$%^&*()_+-=\[\]\{\};'\\:"|,.\/<>?±§~`]+$/)) {
			return {
				level:'warning',subtitle:'Missing Character Set',short:'Your password only contains lowercase letters and special characters. Adding a number or UPPERCASE letters can make your password more secure. SensePost requires at least one character from three of the following four categories; UPPERCASE, lowercase, numbers of special characters.',long:''
			};
		} else if (password.match(/^[0-9!@#$%^&*()_+-=\[\]\{\};'\\:"|,.\/<>?±§~`]+$/)) {
			return {
				level:'warning',subtitle:'Missing Character Set',short:'Your password only contains numbers and special characters. Adding a lowercase or UPPERCASE letter can make your password more secure. SensePost requires at least one character from three of the following four categories; UPPERCASE, lowercase, numbers of special characters.',long:''
			};
		} else if (password.match(/^[A-Za-z0-9]+$/)) {
			return {
				level:'advice',subtitle:'No Symbols',short:'Your password only contains numbers and letters. Adding a symbol can make your password more secure. Don\'t forget you can often use spaces in passwords.',long:''
			};
		} else if (password.match(/[^A-Za-z0-9\u0000-\u007E]/)) {
			return {
				level:'achievement',subtitle:'Non-Standard Character',short:'Your password contains a non-keyboard character. This should make it more secure.',long:''
			};
		}
	}
};

HSIMP.formatChecks = function(checks,parent) {
	var i,j,len,checkNames=['insecure','warning','advice','achievement'],listItems=(function() {
		var result = {};
		len = checkNames.length;
		for (i=0;i<checkNames.length;i+=1) {
			result[checkNames[i]] = [];
		}
		return result;
	}()),title,short,long,createListItem=function(level,title,short,long) {
		var li = document.createElement('li'),header=document.createElement('h3'),p=document.createElement('p');
		header.innerHTML = title;
		p.innerHTML = short;
		li.setAttribute('class',level);
		li.appendChild(header);
		li.appendChild(p);
		return li;
	};

	for (i in checks) {
		if ( ! checks.hasOwnProperty(i)) {
			continue;
		}
		title = i;
		if (checks[i].subtitle) {
			title += ': ' + checks[i].subtitle;
		}
		short = checks[i].short;
		long = checks[i].long;
		listItems[checks[i].level].push(createListItem(checks[i].level,title,short,long));
	}
	len = checkNames.length;
	for (i=0;i<len;i+=1) {
		for (j in listItems[checkNames[i]]) {
			if ( ! listItems[checkNames[i]].hasOwnProperty(j)) {
				continue;
			}
			parent.appendChild(listItems[checkNames[i]][j]);
		}
	}
};

HSIMP.possibleCharacters = function(password) {
	var result = {
		possibleCharacters:0,fromCharacterSets:[]
	},i;for (i in HSIMP.matches) {
		if (HSIMP.matches.hasOwnProperty(i)) {
			if (password.match(HSIMP.matches[i].match)) {
				result.possibleCharacters += HSIMP.matches[i].length;
				result.fromCharacterSets.push(i);
			}
		}
	}
	return result;
};

HSIMP.calculationsPerSecondGuide = {
	'Standard Desktop PC':'50 million','Fast Desktop PC':'200 million','GPU':'500 million','Fast GPU':'1 billion','Parallel GPUs':'10 billion','Botnet':'100 trillion'
};

HSIMP.combinations = function(password) {
	var length = password.length,possibleCharacters=HSIMP.possibleCharacters(password).possibleCharacters;
	return Math.pow(possibleCharacters,length);
};

HSIMP.time = function(password,calculationsPerSecond) {
	var length = password.length,possibleCharacters=HSIMP.possibleCharacters(password).possibleCharacters;
	return Math.pow(possibleCharacters,length)/calculationsPerSecond;
};

HSIMP.timeInPeriods = function(timeInSeconds) {
	var periods = HSIMP.periods.length,result= {
		time:timeInSeconds,period:'seconds'
	},i;for (i=0;i<periods;i+=1) {
		if (timeInSeconds < HSIMP.periods[i].inSecs) {
			break;
		} else {
			result.time = Math.floor(timeInSeconds/HSIMP.periods[i].inSecs);
			if (result.time !== 1 && (HSIMP.periods[i].plural)) {
				result.period = HSIMP.periods[i].period + 's';
			} else {
				result.period = HSIMP.periods[i].period;
			}
		}
	}
	return result;
};

HSIMP.mooresLaw = function(time,years) {
	var i,results=[],tempTime,periods,safeFor;
	for (i=0;i<years;i++) {
		tempTime = time/Math.pow(2,i/2);
		if (tempTime < 86400 && ! safeFor) {
			safeFor = i;
		}
		periods = HSIMP.timeInPeriods(tempTime);
		results[i] = {};
		results[i].inPeriods = periods.time + ' ' + periods.period;
		results[i].time = tempTime;
	}
	return results;
};

HSIMP.safeFor = function(time,max) {
	var i = 0,tempTime,result,safe=true;
	while(safe) {
		tempTime = time/Math.pow(2,i/2);
		if (tempTime < max) {
			safe = false;
			result = i;
		}
		i++;
	}
	return result;
};

HSIMP.formatNumber = function(number) {
	var rgx = /(\d+)(\d{3})/,split,integer,decimal;number += '';
	split = number.split('.');
	integer = split[0];
	decimal = split.length > 1?'.' + split[1]:'';
	while(rgx.test(integer)) {
		integer = integer.replace(rgx,'$1' + ',' + '$2');
	}
	return integer + decimal;
};

HSIMP.convertToNumber = function(string) {
	var result = {},replace=function(match) {
		var value,exp;if (HSIMP.largeNumbers[match]) {
			value = HSIMP.largeNumbers[match];
			value += '';
			exp = value.match(/^1e\+([\d]+)$/);
			if (exp && exp[1]) {
				value = '';
				while(exp[1]--) {
					value += '0';
				}
			} else {
				value = value.replace(/^1/,'');
			}
			return value;
		}
	};

	string = string.replace(/[a-zA-z]+/g,replace);
	string = string.replace(/[^\d\.]/g,'');
	result.numeric = string;
	result.formatted = HSIMP.formatNumber(string);
	return result;
};

