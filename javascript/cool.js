var cool_formats = {
	"simple list": {
		"opener":"",
		"joiner":", ",
		"closer":""
	},
	"run on list": {
		"opener":"",
		"joiner":" ",
		"closer":""
	},
	"severity list": {
		"opener":"",
		"joiner":"-",
		"closer":" out of 10"
	},
	"sentences": {
		"opener":"",
		"joiner":". ",
		"closer":"."
	},
	"min per session": {
		"opener":"",
		"joiner":"-",
		"closer":" minutes per session"
	},
	"bullets": {
		"opener":"<ul><li>",
		"joiner":"</li><li>",
		"closer":"</li></ul>"
	},
	"topics": {
		"opener":"<ul><li>Topic: ",
		"joiner":" ***</li><li>Topic: ",
		"closer":" ***</li></ul>"
	}
}

var strGreen = "#008000";
var objPersonal = {}

function patient_data_handling() {
	if($("input#load_patient_data_handling_ADODB").is(":checked")) { 	// THIS CONDITION WILL NEVER BE TRUE AT THE TIME OF: $(document).ready()
																		// BECAUSE THE "Script" OPTION IS HARD-CODED AS checked,
																		// SO WE INVOKE THIS FUNCTION AND TEST IT AGAIN WHEN WE CLICK "OK"
		jsStrProvider = vbsLOGIN(); // e.g. "Tony" (at home) or "M173732" (at work)
		alert("Connecting " + jsStrProvider + " to DB...")
		vbsCONNECT_DB("frontend");
		objProviderParms = {"user_id":jsStrProvider, "last_name":"", "first_name":""};
		strProviderParms = JSON.stringify(objProviderParms); // THE VALUE OF strProviderParms IS NOW A STRING NOT AN [Object]
		alert(strProviderParms);
		vbsQUERY_DB("frontend",4,"qryProvidersAddProvider",128,strProviderParms); // EXPECTS (IN ORDER): user_id, last_name, first_name
		// vbsQUERY_DB("frontend",1,"INSERT INTO tblPatients(patient_last, patient_first) VALUES ('Shaw','Tony')",129, "");
		// alert(vbsLAST_INSERT_ID("frontend")); //  SAME AS: alert(vbsQUERY_DB("frontend",1,"SELECT @@Identity",129,""));
		// vbsQUERY_DB("frontend",1,"INSERT INTO tblProviders(user_id) VALUES ('" + jsStrProvider + "')",129, "");
		// vbsQUERY_DB("frontend",1,"UPDATE tblProviders SET login_count = (login_count + 1) WHERE user_id = '" + jsStrProvider + "'",129, "");
		// parms = [jsStrProvider];
		// '[{"firstname":"Tony","lastname":"Shaw","dos":"2017-02-26","dob":"","hep":["af01","af02"]}]'
		vbsQUERY_DB("frontend",4,"qryProvidersUpdateLogin",128,strProviderParms);
		// objPatient = {"firstname":"Tony","lastname":"Shaw","dos":"2017-02-26","dob":"1958-12-11","hep":["af01","af02"]};
		// strPatient = JSON.stringify(objPatient);
		// vbsQUERY_DB("frontend",4,"testingJSON",128,strPatient);
		vbsDISCONNECT_DB("frontend");
	}
}

$.fn.instantiatePatient = function() { // WHEN "OK" IS PRESSED ON THE USER INFO FORM...
	patient_data_handling();
	fields_by_number = this.find("input:text"); // IGNORE THE RADIO BUTTONS AT THE TOP!!
	objPersonal["firstname"] = fields_by_number.eq(0).val();
	objPersonal["lastname"] = fields_by_number.eq(1).val();
	objPersonal["mrn"] = vbsLpad(fields_by_number.eq(2).val(),"0",10);
	objPersonal["dob"] = fields_by_number.eq(4).val();
	// COMMIT THE PATIENT TO THE DB NOW, BEFORE POPULATING objPersonal AND FURTHER
	strPersonal = JSON.stringify(objPersonal);
	// alert(strPersonal);
	if($("input#load_patient_data_handling_ADODB").is(":checked")) {
		vbsQUERY_DB("frontend",4,"qryPatientsAddPatient",128, strPersonal); // EXPECTS (IN ORDER): patient_last, patient_first, patient_mrn, patient_dob
		vbsQUERY_DB("frontend",4,"qryPatientsAgeCalc",128, ""); // FOR parms, OK TO PASS EITHER "" OR "{}"
	}
	// NOW... WE ADD DOS TO objPersonal[]!
	objPersonal["dos"] = fields_by_number.eq(3).val();
	objPersonal["hep"] = {};
	var strPatient = objPersonal["firstname"] + " " + objPersonal["lastname"];
	self.document.title = strPatient + " | " + objPersonal["dos"] + " | " + objPersonal["mrn"] + " | " + objPersonal["dob"];
	$("span#patient_by_name").html(self.document.title);
	auto_correct["nm"] = strPatient;
	auto_correct["dob"] = objPersonal["dob"];
	auto_correct["ed"] = objPersonal["dos"];
}

$.fn.fancyDetails = function() {
	// alert( event.type + ": " +  event.which );
	// see: https://api.jquery.com/event.which/
	var txtAbbr = this.text();
	var txtLng = this.data("full");
	var intNow = Date.now();
	$("div#myfancybox").find("button").unbind("click").bind("click",function(){
		$("div[data-uid='"+intNow+"']").trigger("click").trigger("click");
		$.fancybox.close();
		return false;
	});
	this.attr("data-uid",intNow);
	
	$("div#myfancybox input:checkbox").prop('checked',(this.hasClass('cool'))?"checked":"");
	
	$("div#myfancybox").find("input:checkbox").each(function() {
		$(this).unbind("change").bind("change",function(){
			$("div[data-uid='"+intNow+"']").trigger("click");
		});
		// BECAUSE IT IS HARD TO SEE WHEN A CHECKBOX HAS THE FOCUS,
		// A span AFTER THE CHECKBOX WILL SHOW/HIDE...
		$(this).next().css({'display':'none'});
		$(this).on("focus",function(){
			$(this).next().css({'display':'inline'});
		});
		$(this).on("blur",function(){
			$(this).next().css({'display':'none'});
		});
	});
	$("div#myfancybox").find("textarea").each(function(index) {
		switch(index) {
			case 0:
				$(this).val(txtAbbr);
				// see: http://api.jquery.com/unbind/
				$(this).unbind( "keyup" );
				// see: https://api.jquery.com/keyup/
				$(this).keyup(function(event){
					if(event.which == 13) {
						// when user hits [enter], 1) the target div gets a pair of triggered clicks
						// to update the h3 > span value, and 2) the fancybox closes
						$("div[data-uid='"+intNow+"']").trigger("click").trigger("click");
						$.fancybox.close();
						return false;
					}
					$("div[data-uid='"+intNow+"']").text($(this).val());
				});
				/*
				$(this).focus(function() {
					alert( "Handler for .focus() called." );
				});
				*/
				break;
			case 1:
				$(this).val(txtLng);
				// see: http://api.jquery.com/unbind/
				$(this).unbind( "keyup" );
				// see: https://api.jquery.com/keyup/
				$(this).keyup(function(event){
					if(event.which == 13) {
						// when user hits [enter], 1) the target div gets a pair of triggered clicks
						// to update the h3 > span value, and 2) the fancybox closes
						$("div[data-uid='"+intNow+"']").trigger("click").trigger("click");
						$.fancybox.close();
						return false;
					}
					$("div[data-uid='"+intNow+"']").data("full",$(this).val());
				});
				break;
		}
	});
	$.fancybox($("div#myfancybox"));
	$("div#myfancybox textarea:first").focus();
	return false;
}

$.fn.beCool = function(e) {
	e = e || window.event;
	if(e.keyCode == 9) {
		// alert("tab pressed...");
	} else {
		this.addClass("cool");
	}
}

$.fn.autoCorrect = function() {
	// SEE auto_correct.js WHICH CONTAINS > 550 HEP REPLACEMENT TEXTS
	// AND 350+ MORE NON-HEP REPLACEMENT TEXTS
	var objTarget = this;
	$.each(auto_correct, function (strKey, strValue) {
		// SEARCH THE NODE'S html() FOR strKey (w/ WORD BOUNDARY TO LEFT, SPACE TO RIGHT).
		// WE DO NEED TO KNOW, SPECIFICALLY, WHAT THE PRECEDING AND TRAILING WORD BOUNDARIES ARE
		var patt = new RegExp("(\\b)" + strKey + "(\\s)");
		if(patt.test(objTarget.html())) {
			objTarget.html(objTarget.html().replace(patt,"$1" + strValue + "$2"));
			objTarget.addClass("cool");
			return false;
		}
	});
}

$.fn.blurMe = function() {
	var data_format = this.closest("div[class~='preview']").prev("h3").data("format");
	this.closest("div[class~='preview']").prev("h3").children("span").last().AssembleString(data_format);
}

$.fn.toggleMe = function(){
	this.toggleClass("cool"); // THEY ARE EITHER COOL, OR THEY'RE NOT
	this.parents().prev("h3").css("color", "red");
	
	// WE SET EACH h3 NODE COLOR TO GREEN vs. RED BEFORE WE GET TO (RE-)POPULATING
	// THE FINAL SPAN TAG IN: this.closest("div[class~='preview']").prev("h3")
	// alert(this.parents("div.section").length);
	this.parents("div.section").each(function() {
		var strColor = "red";
		if($(this).find("div[class~='cool']").length > 0) strColor = strGreen;
		// alert(strColor);
		$(this).prev("h3").css("color",strColor);
		$(this).prev("h3").children("span").last().css("color",strColor);
	});
	// RE: THE TARGET div.section AND ITS PRECEDING h3,
	// THE TEXT WE WANT TO WRITE WILL GO HERE: .prev("h3").children("span").last()
	// AND IF WE WANT TO DOUBLE CHECK ITS GOING TO THE RIGHT PLACE/DEBUG, THE LABEL SPAN IS HERE: .last().prev()
	// var data_format = this.closest("div[class~='preview']").prev("h3").data("format");
	var data_format = this.closest("div[class~='section']:not('.omit')").prev("h3").data("format");
	if(!data_format) alert(this.closest("div[class~='section']:not('.omit')").prev("h3").text());
	// this.closest("div[class~='preview']").prev("h3").children("span").last().AssembleString(data_format);
	this.closest("div[class~='section']:not('.omit')").prev("h3").children("span").last().AssembleString(data_format);
	
	// COLOR THE {F2} BUTTONS RED/GREEN, DEPENDING ON THE PRESENCE OR ABSENCE
	// OF CLOSE BY (OR DEEPLY NESTED) ".cool" CONTENT DIVS CONTAINING WILDCARD STRINGS (***).
	var strF2Color = (this.closest("div[class~='preview']").find("div.cool:contains('***')").length > 0) ? "red":strGreen;
	this.parents("div[class~='preview']").each(function(){
		var strF2Color = ($(this).find("div.cool:contains('***')").length > 0) ? "red":strGreen;
		$(this).prev("h3").children("button:contains('{F2}')").css({"color":strF2Color});
	});

}

$.fn.selectText = function(){
	this.find('input').each(function() {
		if($(this).prev().length == 0 || !$(this).prev().hasClass('p_copy')) { 
			$('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
		}
		$(this).prev().html($(this).val());
	});
	var doc = document;
	var element = this[0];
	if (doc.body.createTextRange) {
		var range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) {
		var selection = window.getSelection();        
		var range = document.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
};

$.fn.TameString = function() {
	// see: http://learn.jquery.com/plugins/basic-plugin-creation/
	var chunks = this.text().split("***");
	// alert(chunks.join("|"));
	for(i = 1; i < chunks.length; i = i + 2) {
		chunks.splice(i, 0, "***"); 
	}
	for(i = 0; i < chunks.length; i++) {
		if(chunks[i] == "***") {
			chunks[i] = prompt(chunks.slice(0,i).join("") + "[***]" + chunks.slice(i+1,chunks.length).join(""),"***");
		}
	}
	this.text(chunks.join(""));
	this.trigger("click").trigger("click"); 	// TWO CLICKS TO UPDATE THE h3 > span:last IS RESOURCE INTENSIVE,
												// BUT GETS THE JOB DONE
	return false;
}
$.fn.AssembleString= function(format) {
	var opener = cool_formats[format].opener;
	var joiner = cool_formats[format].joiner;
	var closer = cool_formats[format].closer;
	if(!opener) opener = "";
	if(!joiner) joiner = ", ";
	if(!closer) closer = "";
	var a = [];
	var blnOmits = (this.parent("h3").next().find("div.section.omit").length) ? true: false;
	// if(blnOmits) alert(this.prev().text() + " contains 1+ 'omit' sections: " + blnOmits);
	var collectedDivs = this.parent("h3").next().find("div[class~='cool']");
	// var collectedDivs = this.parent("h3").next().children("div[class~='cool']");
	for ( var i = 0; i < collectedDivs.length; i++ ) {
		strPush = (collectedDivs.eq(i).attr("data-full")) ? collectedDivs.eq(i).data("full"):collectedDivs.eq(i).text();
		a.push(strPush); // vs. .innerHTML vs. .text()
	}
	this.text(opener + a.join(joiner) + closer);
	if (format == "bullets" || format == "topics") this.html(opener + a.join(joiner) + closer);
	return false;
}

$(document).ready(function(){
	i = 0;
	a = [];
	$("h1").each(function(){
		// alert($(this).children("span").last().prev().text());
		a[i] = $(this).children("span").last().prev().text();
		n = $(this).parents("div.accordion").length;
		if(n > 2) {
			// objParent = $(this).parent().closest("div.accordion");
			// alert($(this).children("span").last().prev().text());
			// alert($(this).children("span").last().prev().text() + " is the direct descendant of: " + a[i-1]);
		}
		i++;
	});
	
	// WE HAVE A WHOLE BUNCH OF NESTED ACCORDIONS TO INSTANTIATE. IF THIS PROJECT EVER STARTS TO
	// OVERWHELM THE BROWSER/APP/ENGINE, IT MAY WELL BE DUE TO THIS FACT.
	// NB: THEY GET BUNGLED UP IF YOU TRY MAKING THE FILE CSS3 COMPATIBLE, 
	// AS FOLLOWS: <meta http-equiv="x-ua-compatible" content="ie=9">
	$("div.accordion").accordion({"active": false, "heightStyle": "content", "collapsible": true, "icons": {"header": "ui-icon-plus", "activeHeader": "ui-icon-minus"}});
	
	// THE h3 TEXT COLOR DEFAULTS TO RED, THEN WE:
	// 1) PERFORM A CLICK EVENT ON EACH OF THE MANY div.default NODES, AND
	// 2) APPLY LOGIC TO TURN SOME/ALL GREEN TO SIGNIFY THERE IS ***SOME*** SELECTED CONTENT FROM THE GET-GO.
	$('h3').css({color: 'red'});
	
	// FROM THIS POINT ON, EVERY ONE OF THE EDITABLE DIVs CAN BE FOUND/FILTERED USING SIMPLY: div.normal
	$("div.section > div:not('.accordion')").attr("contenteditable","true").addClass("normal floating"); // .draggable();
	$("div.floating_longform > div:not('.accordion')").addClass("longform"); // .draggable();
	$("div.section > div[data-full]").addClass("better_right_click"); // .draggable();
	
	// $("div.section").droppable().sortable();
	/*
	$("div.section > div.normal").last().each(function(){
		var newA = $("a").css({'clear':'both'}).html("more...").attr("href","#").on("click",function(){return false;});
		$(this).after(newA);
	});
	*/
	// after($("a").css({'clear':'both'}).html("more...").attr("href","#").on("click",function(){return false;}));
	
	// A COUPLE OF USEFUL BUTTONS ({F2} AND CLR) ARE ADDED/ENABLED, FLOATING LEFT, IN MOST h3 NODES
	$("div[class~='accordion'] h3").each(function(index) {
		if($(this).hasClass("omit")) return true;
		button = $("<button>").html("{F2}");
		$(this).prepend(button);
		button.on("click",function(){
			$(this).parent().next().find("div[class~='cool']:contains('***')").each(function() {
				$(this).TameString();
			});
			return false;
		}).css({'float':'left','margin-right':'1em'}); // floating buttons inside a h3 are whacky in HTA/IE6
		
		button = $("<button>").html("CLR");
		$(this).prepend(button);
		button.on("click",function(){
			$(this).parent().next().find("div[class~='cool']").each(function() {
				$(this).trigger("click");
			});
			// THERE IS SOMETHING NOT QUITE RIGHT IN THE ASSESSMENT ACCORDION,
			// BECAUSE THE FINAL span CONTINUES TO HOLD CONTENT EVEN AFTER A CLR IS EXECUTED.
			// DEBUG!! THE HACK - FOR NOW - IS HERE:
			$(this).parent().children("span").last().html("");
			return false;
		}).css({'float':'left','margin-right':'1em'}); // floating buttons inside a h3 is whacky in HTA/IE6
		
		button = $("<button>").html("[+]&gt;");
		$(this).prepend(button);
		button.on("click",function(event){ // INSTANTIATE A NEW WILDCARD DIV AND GIVE IT FOCUS
			// HAVING FAILED TO INSTANTIATE COOL DIVs USING THE delegate() FUNCTION,
			// THE NEXT BEST THING IS TO ENCAPSULATE EACH OF THE EVENT-HANDLERS IN $.fn... SO THAT 
			// ANY NEWLY CREATED DIVs CAN BE ENABLED ON THE FLY W/ .on(), .on(), etc.
			var newCoolDiv = $("<div>")
				.html("***")
				.addClass("normal floating")
				.on("click",function(){$(this).toggleMe();})
				.on("blur",function(){$(this).blurMe();})
				.on("contextmenu",function( event ) {$(this).fancyDetails();return false;})
				.on("keyup",function( event ){$(this).autoCorrect();$(this).beCool(event);})
				.attr("contenteditable","true");
			$(this).parent().next("div.section").first().children("div.normal").last().after(newCoolDiv);
			newCoolDiv.trigger("click").focus();
			event.stopPropagation();
			return false;
		}).css({'float':'left','margin-right':'1em'}); // floating buttons inside a h3 is whacky in HTA/IE6
		
		button = $("<button>").html("&lt;[+]");
		$(this).prepend(button);
		button.on("click",function(event){ // INSTANTIATE A NEW WILDCARD DIV AND GIVE IT FOCUS
			// HAVING FAILED TO INSTANTIATE COOL DIVs USING THE delegate() FUNCTION,
			// THE NEXT BEST THING IS TO ENCAPSULATE EACH OF THE EVENT-HANDLERS IN $.fn... SO THAT 
			// ANY NEWLY CREATED DIVs CAN BE ENABLED ON THE FLY W/ .on(), .on(), etc.
			var newCoolDiv = $("<div>")
				.html("***")
				.addClass("normal floating")
				.on("click",function(){$(this).toggleMe();})
				.on("blur",function(){$(this).blurMe();})
				.on("contextmenu",function( event ) {$(this).fancyDetails();return false;})
				.on("keyup",function( event ){$(this).autoCorrect();$(this).beCool(event);})
				.attr("contenteditable","true");
			$(this).parent().next("div.section").first().prepend(newCoolDiv);
			newCoolDiv.trigger("click").focus();
			event.stopPropagation();
			return false;
		}).css({'float':'left','margin-right':'1em'}); // floating buttons inside a h3 is whacky in HTA/IE6
	});

	$("div.normal") // THERE ARE SEVERAL HUNDRED (IF NOT THOUSANDS) OF THESE
	  .on("blur",function(){ 
		$(this).blurMe();
	}).on("click",function(){
		$(this).toggleMe();
	}).on("keyup",function( event ){
		$(this).autoCorrect();
		$(this).beCool(event);
	}).on("contextmenu",function( event ) {
		$(this).fancyDetails();
		return false;
	});

	// COLLAPSE ALL ACCORDIONS THAT ARE IN THE ACTIVE STATE
	$('a#expand_collapse').on("click",function(e) {
		$('.accordion .ui-accordion-header.ui-state-active').trigger( "click" );
		$("a#top").trigger("click");
		e.preventDefault();			
		return false;
	});
	
	// SCROLL TO THE TOP OF THE PAGE (AND div#wrapper)
	$("a#top").on("click",function(e){
		see: http://api.jquery.com/scrollTop/
		$(document).scrollTop(0);
		$("div#wrapper").scrollTop(0);
		e.preventDefault();
		return false;
	});
	
	// see: http://stackoverflow.com/a/9976413/5863730
	// HIGHLIGHT A RANGE OF TEXT SO THAT IT CAN BE COPIED TO THE CLIPBOARD
	$("a#copy_html").on('click', function(e) {
		var selector = $(this).data('selector');
		$(selector).selectText();
		document.execCommand("copy");
		$("a#copy_html").selectText();
		$("a#top").trigger("click");
		vbsNewEXCEL(); // THE ZIP FILE CONTAINS receiver.xlsx. THERE ARE A FEW ISSUES TO IRON OUT STILL.
		alert("Excellent!!! Now, paste this output to PRISM...");
		e.preventDefault();
		return false;
	});
	
	// HIDE THE NOTE PREVIEW AND SHOW INSTEAD THE ACCORDION EDITOR/COMPOSER
	$("a#compose").on("click",function(e){
		$("div#editor").css({display: "block"});
		$("div#colophon").css({display: "block"});
		$("div#preview_of_note").css({display: "none"});
		$("a#top").trigger("click");
		$(this).css({display: "none"});
		$('a#expand_collapse').css({display: "inline-block"}).addClass("tools");
		$("a#preview_button").css({display: "inline-block"}).addClass("tools");
		$("a#copy_html").css({display: "none"});
		e.preventDefault();
		return false;
	});
	
	// B/C MULTIPLE INSTANCES OF THE HTA CAN BE OPEN AND RUNNING, SIMULTANEOUSLY
	$("a#new_note").on("click",function(e){
		vbsNewInstance(); // vbscript
		e.preventDefault();
		return false;
	});
	
	$("a#calculator").on("click",function(e){
		vbsNewCalculator(); // vbscript
		e.preventDefault();
		return false;
	});
	
	$("a#hep_in_word").on("click",function(e){
		var a = [];
		$("h3 > span:contains('Therapeutic Exercise')").parent().next("div.section").find("h3").first().next("div.section").children("div.cool").each(function(){
			var patt = new RegExp("\(([a-zA-Z]+)-([0-9]+)\)");
			strMatch = patt.exec($(this).html());
			if(strMatch) {
				a.push(strMatch[2] + strMatch[3]);
			}
		});
		objPersonal["hep"] = a;
		// HTA/IE6 DON'T HAVE THE JSON ENGINE AT THE READY
		// SEE: http://www.devcurry.com/2010/12/resolve-json-is-undefined-error-in.html
		strPersonal = JSON.stringify(objPersonal);
		$("div#hep_json").html("[" + strPersonal + "]");
		$("div#hep_json").selectText();
		document.execCommand("copy");
		// IT IS VERY COOL THAT VBA/WORD CAN ACCESS THE CONTENTS OF THE CLIPBOARD, AS DESCRIBED HERE:
		// https://msdn.microsoft.com/en-us/library/office/ff194373.aspx
		// THEN, IF THE CLIPBOARD HOLDS A STRINGIFY-ED JSON OBJECT, THIS VBA/WORD MODULE CAN PARSE/DECODE IT!
		// SEE: https://codingislove.com/excel-json/ AND https://github.com/VBA-tools/VBA-JSON/releases
		vbsNewHEP(); // vbscript
		e.preventDefault();
		return false;
	});
	
	$("button#load_patient_OK").on("click",function(e){
		$(this).closest("form").instantiatePatient();
		$.fancybox.close();
		e.preventDefault();
		return false;
	});
	
	// PURE/CONCISE JQUERY WIZARDRY BUILDS A TABLE AND POPULATES IT WITH TEXT (OR HTML) 
	// FROM THE PENULTIMATE AND THE ULTIMATE span NODES IN EACH RELEVANT h3
	$("a#preview_button").on("click",function(e){
		if($(document).find("div[class~='cool']").length == 0) {
			alert("First, you'll need to start populating the note!");
			e.preventDefault();
			return false;
		}
		$(this).css({display: "none"});
		$('a#expand_collapse').css({display: "none"});
		$("a#copy_html").css({display: "inline-block"}).addClass("tools");
		$("a#compose").css({display: "inline-block"}).addClass("tools");
		
		$("div#editor").css({display: "none"});
		$("div#colophon").css({display: "none"});
		$("div#preview_of_note").css({display: "block"});
		$("div#preview_of_note").html("");
		// WE NOW HAVE A BLANK SLATE, IN WHICH TO WRITE THE STORED TEXT IN TABLE FORMAT.
		// PRISM ***MAY*** BE MORE RECEPTIVE to <table></table> THAN <table><tbody></tbody></table>, BUT
		// SINCE PRISM IGNORES SETTINGS LIKE font-family, text-decoration, ETC.
		// (EVEN WHEN SET USING .css({}), WE END UP NEEDING ALWAYS TO PASTE TO EXCEL...THEN PRISM.
		// WOULD THAT IT WEREN'T SO...
		
		// STARTING 2017-02-05, INSTEAD OF CAPTURING THE .text() IN THE FINAL SPAN OF EACH <h3>
		// WE COMMIT THE .html() APPEARING THERE TO: txtContent. THIS BRINGS OVER THE BULLETED ITEMS
		// IN BOTH THE SHORT TERM GOALS AND LONG TERM GOALS,
		// EACH ON ITS OWN LINE (THOUGH EXCEL IGNORES THE BULLETS THEMSELVES)
		
		$("div#preview_of_note").append($("<table>")); // .append($("<tbody>")));
		// $("div#preview_of_note table").addClass("bordered_table"); // WE DON'T WANT OR NEED
		$("div#preview_of_note table").removeClass("bordered_table"); // THE TABLE (CELLS) BORDERED

		var patt_hep_code = new RegExp("\\([a-zA-Z]{2}\-[0-9]{2,3}\\)","g"); // (af-14) e.g. BECOMES ""
		
		$("div#editor h3").each(function(){ // 119 OF THESE (AND COUNTING)
			// see: http://api.jquery.com/jQuery.each/
			// We can break the $.each() loop at a particular iteration by making the callback function return false. 
			// Returning non-false is the same as a continue statement in a for loop
			// (it will skip immediately to the next iteration)
			var txtContent = "";
			var blnSOAP = ($(this).hasClass('soap')) ? true: false;
			var blnNineCats = ($(this).hasClass('ninecats')) ? true: false;
			if(!blnSOAP) { // OMIT DISPLAYING ANY h3 NODES THAT ARE .omit OR WHOSE FINAL span is EMPTY
				if($(this).hasClass("omit")) return true;
				// txtContent = $(this).children("span").last().text();
				txtContent = $(this).children("span").last().html();
				
				if(patt_hep_code.test(txtContent)) {
					txtContent = txtContent.replace(patt_hep_code,"");
					// alert("Got one!");	
				}
				
				if(txtContent == "" && !blnNineCats) return true;
			}
			// THE h3 IS EITHER soap ***OR*** IT IS NOT .omit ***AND*** IT HAS CONTENT TO DISPLAY IN ITS FINAL span
			var jsonLabelCSS = {
				"font-family":"arial",
				"vertical-align":"top",
				"text-align":(blnSOAP) ? "left":"right",
				"text-decoration":(blnNineCats) ? "underline":"none",
				"font-weight":(blnSOAP) ? "bold":"normal"
			}
			var jsonContentCSS = {
				"font-family":"arial",
				"vertical-align":"top",
				"color":(false && !txtContent && !blnSOAP)? "#ffffff":"#000000"
			}
			if(!txtContent && !blnSOAP) txtContent = ".";
			txtLabel = $(this).children("span").last().prev().text();
			// if(txtLabel == "Therapeutic Exercise: ") alert(txtContent);
			objLabel = $("<td>").css(jsonLabelCSS).text(txtLabel);
			// objContent = $("<td>").css(jsonContentCSS).text(txtContent);
			objContent = $("<td>").css(jsonContentCSS).html(txtContent);
			// txtContent = $(this).children("span").last().text();
			$("div#preview_of_note table").append($("<tr>").append(objLabel).append(objContent));
		});
		$("a#copy_html").trigger("click");
		$("a#top").trigger("click");
		e.preventDefault();
		return false;
	});
	
	// NOW THAT WE KNOW HOW TO RESPOND TO A CLICK EVENT ON ONE OF THE SCORES OF 'RESPONSE' DIVS,
	// TRIGGER A CLICK EVENT ON THE ONES WE IDENTIFY AS DEFAULTS
	$("div.default").each(function(){
		$(this).trigger("click");
	});
	
	// THIS IS SWEET. WE'LL SEE THE PATIENT/ENCOUNTER SIMPLY HOVERING OVER THE TASK BAR ICON!
	// self.document.title = prompt("Patient Name and Encounter Date?","TS");
	// $("span#patient_by_name").html(self.document.title);
	
	$("div#load_patient label").each(function() {
		$(this).css({"font-weight":"bold"});
		$(this).parent().css({"text-align": "right"});
	});

	$.fancybox($("div#load_patient"));
	
	// ALL ACCORDIONS ARE FULLY COLLAPSED, ON STARTUP
	// BY VIRTUE OF THE SETTING: {"active":false}
	// $('a#expand_collapse').trigger("click"); 
	
	// SADLY, THE HTA/IE6 CSS RULES ARE NOT BEEFY ENOUGH TO UNDERSTAND span:last
	// SO WITH jQuery WE LOCATE THE LAST span AND THEN STYLE THE span AHEAD OF IT
	$("div#editor h3.ninecats").each(function(){ 
		$(this).children("span").last().prev().css({'text-decoration':'underline'});
	});
	
	$("div.section").on("contextmenu",function( event ) {
		if(confirm("Add a wildcard (***) <div>???")) {
			$(this).append(
				// HAVING FAILED TO INSTANTIATE THESE DIVs USING THE delegate() FUNCTION,
				// THE NEXT BEST THING IS TO ENCAPSULATE EACH OF THE EVENT-HANDLERS IN $.fn... SO THAT 
				// ANY NEWLY CREATED DIV CAN BE ENABLED ON THE FLY W/ .on(), .on(), etc.
				$("<div>")
					.html("***")
					.addClass("normal floating")
					.on("click",function(){$(this).toggleMe();})
					.on("blur",function(){$(this).blurMe();})
					.on("contextmenu",function( event ) {$(this).fancyDetails();return false;})
					.on("keyup",function( event ){$(this).autoCorrect();$(this).beCool(event);})
					.attr("contenteditable","true")
			);
		}
		event.stopPropagation();
		return false;
	});
	
	// SHOW/HIDE LINKS AND DIVS, INTUITIVELY, ON STARTUP
	$("a#compose").css({display: "none"});
	$("a#copy_html").css({display: "none"});
	$("div#editor").css({'display':'block'});
	$("div#please_wait").css({'display':'none'});
	
	var today = new Date().getFullYear(); // NO NEED TO ADD 1900 IF YOU USE: getFullYear();
	today += "-";
	m = new Date().getMonth()+1;
	today += (m < 10) ? ("0" + m) : m;
	today += "-";
	d = new Date().getDate();
	today += (d < 10) ? ("0" + d) : d;
	$("input#load_patient_date").val(today);
	$("input#load_patient_referral_date").val(today);
	// $("button#load_patient_OK").focus();
	$("input#load_patient_first").focus();
	// alert(CONNECT_DB());
	// CONNECT_DB()
	// QUERY_DB();
	// DISCONNECT_DB();
});
