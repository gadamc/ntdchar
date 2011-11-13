
var db = $.couch.db('ntdchar');  //how do we automate this??? 

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
            icsvdata:  "required"
            //icsvfinaldata: "required"
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
            icsvdata:  "***"
            //icsvfinaldata: "***"
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
    
   $( "#button-login" ).button();
   $( "#button-logout").button();
   
   $( "#button-search").button();
   $( "#button-expand2" ).button();   
   $( "#button-collapse2" ).button();
   
   $.couch.session({  //check to see if a user has already logged in. 
     success: function(data) {
       if(data.userCtx.name != null){
         $("#loginname").hide();
         $("#loginpassword").hide();
         $("#button-login").hide();
         $("#button-logout").show();
       }
       else{
         $("#loginname").val("");
         $("#loginpassword").val("");
         $("#loginname").show();
         $("#loginpassword").show();
         $("#button-login").show();
         $("#button-logout").hide();
       }
       
       },
       error: function(data){
         $("#loginname").val("");
          $("#loginpassword").val("");
          $("#loginname").show();
          $("#loginpassword").show();
          $("#button-login").show();
          $("#button-logout").hide();
       }
     });
     
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
function parseTextData(textData, delimiter)
{
  var outData = {};
  var headers = textData[0].split(delimiter);
  for (var h = 0; h < headers.length; h++){
    //console.log(headers[h]);
    outData[headers[h]] = new Array();
  }
  
  for(var i = 1; i < textData.length; i++){
    aLine = textData[i].split(delimiter);
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
     
      var iresult = $("#icsvdata").val().split("\n");
      var theRawData = parseTextData(iresult, $("#idatadelim").val() );
      
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
                    "raw":     theRawData
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
  //$("#button-expand").val("Expand");      
  //collapsed = true;
  
}
// ____________________________________________________________________________________
function click_expand() {

  $("img[class='collapsibleClosed']").click();
  //$("#button-expand").val("Collapse");
  //collapsed = false;

}


// ____________________________________________________________________________________
function click_search() {
  
   var entry = $("#box-search").val();

   if ( entry == "" || entry == "e.g. 38-2") {
      $("#box-search").focus();
      $("div#materials").empty(); 
      return false;
   }    
         
   searchResults($("#box-search").val()); 
     
   //collapsed = true;
   //$("#button-expand").val("Expand");
   
   //detailed = false;
   //$("#button-detail").val("More detail");
   
   return true;

}; 



// ____________________________________________________________________________________
function searchResults(val) {

  //need to get couchdb version from $.couch.info() in order to determine
  //the correct couchdb-lucene search URL. They format has changed. 
   //var search_url  = $.couch.urlPrefix+'/_fti/local/'+db.info.db_name+'/_design/app/fullsearch?q=' + val;
   // var cinfo = {};
   //    $.couch.info({async=false, function(data){
   //      cinfo = data.constructor();
   //     }
   //    });
   //    
   //    var version = cinfo.split('.');
   //    var search_url = "";
   //    
   //    if(version[0] >= 1 && version[1] >= 1) {
     search_url  = $.couch.urlPrefix+'/_fti/local/ntdchar/_design/app/fullsearch?q=' + val; 
   // }
   //    else{
   //      search_url  = $.couch.urlPrefix+'/ntdchar/_fti/_design/app/fullsearch?q=' + val;
   //    }
   //also, how do i get the design document _id and place it in here? the _id is found in the
   //_id file in the top directory of this couchapp. does the couchapp have a mechanism
   //to place this data in here?

   $("#searchntdrecords").empty();
   
   $.ajax({ 
        
      url: search_url,
      dataType: 'json', 
      success: function(data) {

         if ( data.total_rows > 0 ) {
           
           $("#searchntdrecords").append('<ul id="search_output">');
           
           for ( j = 0; j < data.rows.length; j++ ) {
             var nodata_url = "_show/nodata/" + data.rows[j].id;
             
             $.ajax({
               url: nodata_url,
               dataType: 'json',
               async: false,
               success:function(data){
                 $.tmpl("output_template", data).appendTo("#search_output");
               },
                error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
             });
              
           }
           
           $("#searchntdrecords").append('</ul>');
           makeCollapsible(document.getElementById('search_output'));
           $(".measurement-metadata").show();

         }
      
       },
       error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
     });

};


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

//______________________________________________________________________________________
function login() {

  $.couch.login({
    name:  $("#loginname").val(), 
    password: $("#loginpassword").val(),
    success: function(data) {
        $("#loginname").hide(1000);
        $("#loginpassword").hide(1000);
        $("#button-login").hide(1000);
        $("#button-logout").show(1000);
      },
    error : function(data) {
        alert("Incorrect login credentials. Please try again.");
     }
    });
  
}

//______________________________________________________________________________________
function logout() {

  $("#loginname").val("");
  $("#loginpassword").val("");
  $("#loginname").show(1000);
  $("#loginpassword").show(1000);
  $("#button-login").show(1000);
  $("#button-logout").hide(1000);
    
  $.couch.logout({
    success: function(data) {
       console.log('couch log out');
      },
    error : function(data) {
       alert("ZOMG! Couldn't log out. Call an admin, now! ")
     }
    });
  
}


/// ____________________________________________________________________________________
function enter_box(event) {    
 
   if (event.keyCode == 13) {  //keycode 13 is the enter key
      
      //$( "#box-search" ).autocomplete("close");
      click_search();
      event.returnValue = false; // for IE
      if (event.preventDefault()) event.preventDefault(); 
   
   }

   return false;     
        
}

/// ____________________________________________________________________________________
function enter_password(event) {    
 
   if (event.keyCode == 13) {  //keycode 13 is the enter key
      
      login();
      event.returnValue = false; // for IE
      if (event.preventDefault()) event.preventDefault(); 
   
   }

   return false;     
        
}
