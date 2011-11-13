
var db = $.couch.db('ntdchar');

//dear newbie, $ == jQuery, which is a reference to an instace of a jQuery object. You could replace
//every $ with 'jQuery' and you'd get the same functionality. 

var detailed  = false;
var collapsed = true;

// ____________________________________________________________________________________
$(document).ready(function(){

   // Tabs
   $('#tabs').tabs();

   // Menu bars            
   $( "input:submit", ".menu-bar" ).button();
	$( ".menu-bar" ).click(function() { return false; });             

   // Plug-in to style placeholder in old Browsers
   $( "input, textarea" ).placehold( "something-temporary" );

	// Template - input      
   $.get('templates/default_input.html', function(tmp) {               

      $.template("input_template", tmp);   
      $.tmpl("input_template", null).appendTo("#input-form");

      $(function() {
		   $( "#idate" ).datepicker();
	   }); 

      // Form validation
	    	
	   var validator = $("#input").validate({
	     
         rules: {
            iname:     "required", 
            itech:     "required", 
            iinst:     "required",
            idate:     "required date", 
            imdesc:    "required", 
            iref:      "required",                                                                       
            ientry:    "required",  
            ientrycon: "required email",
            icsvdata:  "required",
            icsvfinaldata: "required"
         }, 
         	   	     
   	   messages: {
            iname:     "***", 
            isrc:      "***",
            itech:     "***", 
            iinst:     "***",
            idate:     "***", 
            imdesc:    "***",
            iref:      "***",  
            ientry:    "***",  
            ientrycon: "***",
            icsvdata:  "***",
            icsvfinaldata: "***"
         },
         
		   errorPlacement: function(error, element) {
            error.appendTo(element.next('.istatus'));
		   }      
	     
	   }); 	
	    	
   });
   
   // Template - output
   $.get('templates/default_output.html', function(tmp) {               
      $.template("output_template", tmp);  
      
      getAllNtds(); 
   });
   

   $( "#button-expand" ).button();   
   $( "#button-collapse" ).button();   

   $( "#button-clear1" ).button();   
   $( "#button-clear2" ).button();
   $( "#button-submit" ).button();  

   $( "#button-clear1_2" ).button();   
   $( "#button-clear2_2" ).button();
   $( "#button-submit_2" ).button();
    
   $( "#button-downloadcsv" ).button();   
   $( "#button-downloadjson" ).button();
     
   $( "#dialog-submit" ).dialog({ autoOpen: false, modal: true, resizable: false });   
   
   $("input:text:visible:first").focus();

   
});


// ____________________________________________________________________________________
function click_clear_all() {

   $(':input','#input')
      .not(':button, :submit, :reset, :hidden')
      .val('')
      .removeAttr('checked')
      .removeAttr('selected');

   $("#input").validate().resetForm()

}

// ____________________________________________________________________________________
function click_clear_warnings() {

   $("#input").validate().resetForm()

}

// ____________________________________________________________________________________
function parseTextData(textData)
{
  var outData = {};
  var headers = textData[0].split("\t");
  for (var h = 0; h < headers.length; h++){
    //console.log(headers[h]);
    outData[headers[h]] = new Array();
  }
  
  for(var i = 1; i < textData.length; i++){
    aLine = textData[i].split("\t");
    for (var j = 0; j < aLine.length; j++){
      var theVal = "";
      if (aLine[j] != ""){
        theVal = parseFloat(aLine[j].replace(",", "."));
      }
      outData[headers[j]].push(theVal);
      //console.log(headers[j] + " " + aLine[j]);
    }
  }
  return outData;
}
// ____________________________________________________________________________________
function click_submit() {

   $("#input").validate().form();
 
   if ( $("#input").validate().numberOfInvalids() == 0 ) {           

      // Parse the date

      var arr_idate = $("#idate").val().split("/");
       
      var imonth = arr_idate[0]; 
      var iday   = arr_idate[1]; 
      var iyear  = arr_idate[2]; 
      
      // Build the JSON for the results 
      //   (complex because fields don't have unique IDs)
      

       
      var iresult = $("#icsvdata").val().split("\n");
      var theRawData = parseTextData(iresult);
      
      var ifinalresult = $("#icsvfinaldata").val().split("\n");
      var theFinalData = parseTextData(ifinalresult);
      
      // Build the overall JSON
            
      var output_json = 
      
         {
            "type": "ntd_characterization",
            "ntdname":        $("#iname").val(),
            "measurement": {
                "technique":   $("#itech").val(),
                "location" :   $("#iinst").val(),
                "date": {
                    "day":     iday,
                    "month":   imonth,
                    "year":    iyear
                },
                "description":  $("#imdesc").val(),
                "wiretype":  $("#iwiretype").val(),
                "datatype":  $("#idatatype").val(),
                "data" : {
                    "raw":     theRawData,
                    "final":   theFinalData,
                  },
                "sambainfo" : {
                  "run" : $("#isambarun").val(),
                  "detector" : $("#idet").val(),
                  "channel" : $("#ichanname").val(),
                  "condition" : $("#isambaruncondition").val(),
                  "comments" : $("#isambacomment").val()
                }
            },
            "data_source": {
                "data_by":          $("#iref").val(),
                "data_entry_name":    $("#ientry").val(),
                "data_entry_contact": $("#ientrycon").val()
            }
         };
      //console.log(output_json);
      
      db.saveDoc(
         output_json,
         { success: function() {
            click_clear_all();
            $( "#dialog-submit" ).dialog( "open" );
         }}

      );

   } 

}


// ____________________________________________________________________________________
function click_detail() {

   if (detailed) {
      
      $(".measurement-metadata").hide();
      $("#button-detail").val("More detail");      
      detailed = false;

   } else {
 
      $(".measurement-metadata").show();
      $("#button-detail").val("Less detail");
      detailed = true;

   };   

}
//______________________________________________________________________________________
function click_collapse() {
  
  $("img[class='collapsibleOpen']").click();
  $("#button-expand").val("Expand");      
  collapsed = true;
  
}
// ____________________________________________________________________________________
function click_expand() {

  $("img[class='collapsibleClosed']").click();
  $("#button-expand").val("Collapse");
  collapsed = false;

}

/*
// ____________________________________________________________________________________
function click_search() {
  
   var entry = $("#box-search").val();

   if ( entry == "" || entry == "e.g. tin") {
      $("#box-search").focus();
      $("div#materials").empty(); 
      return false;
   }    
         
   searchResults($("#box-search").val()); 
     
   collapsed = true;
   $("#button-expand").val("Expand");
   
   detailed = false;
   $("#button-detail").val("More detail");
   
   return false;

}; 
*/

/*
// ____________________________________________________________________________________
function searchResults(val) {

   var search_url  = '/aarm/_fti/_design/test/search?q=' + val + '&include_docs=true';

   if ( val.toLowerCase() == "all" ) {
      search_url = '/aarm/_all_docs?include_docs=true';
   };

   $("#materials").empty();
   
   $.ajax({ 
        
      url: search_url,
      dataType: 'json', 
      async: false,
      success: function(data) {

         if ( data.total_rows > 0 ) {

            $("#materials").append('<ul id="output">');
   
            for ( j = 0; j < data.total_rows; j++ ) { 
   
               var doc = data.rows[j].doc;
               if ( doc.type == "measurement" ) {
                  $.tmpl("output_template", doc).appendTo("#output");
               }
   
            }
   
            $("#materials").append('</ul>');
            makeCollapsible(document.getElementById('output'));
            $(".measurement-metadata").hide();

         }

      }
      
   })

};
*/

// ____________________________________________________________________________________
function getAllNtds() {

   $("#allntdrecords").empty();
   
   db.view("app/keys_nodata",  {
           key:"ntdname",
           success:function(data){ 
               if ( data.rows.length > 0 ) {

                   $("#allntdrecords").append('<ul id="output">');

                   for ( j = 0; j < data.rows.length; j++ ) { 

                      var doc = data.rows[j].value;
                      if ( doc.type == "ntd_characterization" ) {
                         $.tmpl("output_template", doc).appendTo("#output");
                      }

                   }

                   $("#allntdrecords").append('</ul>');
                   makeCollapsible(document.getElementById('output'));
                   $(".measurement-metadata").show();

                }
            },
            error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
            
    });
};
// 
// function downloadcsv(docObj)
// {
//   // $.ajax({
//   //       type: 'GET',
//   //       data: null,
//   //       url: '_show/ntdcsvdata/' + docObj.value
//   //       }
//   //   );
//   $.get('_show/ntdcsvdata/' + docObj.value, function(data){$('.result').html(data);});
// }
// 
// function downloadjson(docObj)
// {
//   $.get('_show/ntdjsondata/' + docObj.value, function(data){return data;});
// }

/*
// ____________________________________________________________________________________
function enter_box(event) {    
 
   if (event.keyCode == 13) {
      
      $( "#box-search" ).autocomplete("close");
      click_search();
      event.returnValue = false; // for IE
      if (event.preventDefault()) event.preventDefault(); 
   
   }

   return false;     
        
}  
*/