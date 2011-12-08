
//var db = $.couch.db('ntdchar');  //how do we automate this??? 
var dbname = window.location.pathname.split("/")[1];
var appName = window.location.pathname.split("/")[3];
var db = $.couch.db(dbname);

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
   buildTemplateInput();
   
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
//__________________________________
function buildTemplateInput()
{
  $.get('templates/default_input.html', function(tmp) {               

      $.template("input_template", tmp);   
      $.tmpl("input_template", null).appendTo("#input-form");

      $(function() {
		   $( "#idate" ).datepicker();
	   }); 

      // Form validation
	   buildFormValidation(); 	
	   showDataTypeSubBlock();
	   showWireImpedanceBlock();  	
   });
   
}
//___________________________________
function buildFormValidation()
{
  
  
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
          icsvdata:  "required"//,
          //irnot:     "required",
          //itnot:     "required"
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
          icsvdata:  "***",
          irnot:     "***",
          itnot:     "***",
          ivitemp:   "***",
          ireadoutwireimpedance: "***"
          //icsvfinaldata: "***"
       },

	   errorPlacement: function(error, element) {
          error.appendTo(element.next('.istatus'));
	   }      

   });
   
   
}

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
 
   //$('input[type=submit]', this).attr('disabled', 'disabled');
 
   if ( $("#input").validate().numberOfInvalids() == 0 ) {           

      // Parse the date

      var arr_idate = $("#idate").val().split("/");
       
      var imonth = parseInt(arr_idate[0]); 
      var iday   = parseInt(arr_idate[1]); 
      var iyear  = parseInt(arr_idate[2]); 
     
      var iresult = $("#icsvdata").val().split("\n");
      var theRawData = parseTextData(iresult, $("#idatadelim").val() );
      
      var r0 = parseFloat($("#irnot").val());
      var t0 = parseFloat($("#itnot").val());
      var readoutRes = parseFloat($("#ireadoutwireimpedance").val());
      var numReadoutWires = parseInt($("#ireadoutwires").val());
      var ViT = parseFloat($("#ivitemp").val())
      
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
                //"wiretype":  $("#iwiretype").val(),
                "datatype":  $("#idatatype").val(),
                "readoutwires" : {
                  "number": numReadoutWires,
                  "impedance": readoutRes
                },
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
      
      if( $("#idatatype").val() == "R(T)"){
        output_json["r0"] =  r0;
        output_json["t0"] =  t0;
      }
      else{
        output_json["temperature"] =  ViT;
      }
      
      db.saveDoc(
         output_json,
         { success: function() {
            click_clear_all();
            $( "#dialog-submit" ).dialog( "open" );
         }}

      );

   } 

}


//______________________________________________________________________________________
function click_collapse() {
  $("img[class='collapsibleOpen']").click();
}
// ____________________________________________________________________________________
function click_expand() {
  $("img[class='collapsibleClosed']").click();
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
     search_url  = $.couch.urlPrefix + '/_fti/local/' + dbname + '/_design/' + appName + '/fullsearch?q=' + val; 
     
     if (window.location.host.split(".")[1] == "cloudant"){
       search_url  = window.location.protocol + '//' + window.location.host + '/' + dbname + '/_search?q=' + val; 
     }
   // }
   //    else{
   //      search_url  = $.couch.urlPrefix+'/ntdchar/_fti/_design/app/fullsearch?q=' + val;
   //    }
   //also, how do i get the design document _id and place it in here? the _id is found in the
   //_id file in the top directory of this couchapp. does the couchapp have a mechanism
   //to place this data in here?

   $("#searchntdrecords").empty();
   
   $('#button-search').attr("disabled", "disabled").addClass( 'ui-state-disabled' );
   $('#box-search').attr("disabled", "disabled").addClass( 'ui-state-disabled' );
   
   $.ajax({ 
        
      url: search_url,
      dataType: 'json', 
      async: false,
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
         else {
           $("#searchntdrecords").html("<h3>no results found</h3>");
         }
      
       },
       error: function(req, textStatus, errorThrown){
         alert('Error '+ textStatus);
         },
       complete: function(){
          $('#button-search').removeAttr("disabled").removeClass( 'ui-state-disabled' );
          $('#box-search').removeAttr("disabled").removeClass( 'ui-state-disabled' );
        }
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

//_____________________________________________________________________________________
function showDataTypeSubBlock()
{
  //console.log( $("#idatatype").val() );
  //console.log( typeof($("div.RTnot-block")));
  
  if ( $("#idatatype").val() == "R(T)" ){
    $("div.RTnot-block").show(200);
    $("#irnot").rules("add", "required number");
    $("#itnot").rules("add", "required number");
    $(".RTnot-break").css("display", "block");
    
    $("div.VI-block").hide(200);
    $("#ivitemp").rules("remove", "required");
    $(".VI-break").css("display", "none");
    
  }
  else{
    $("div.RTnot-block").hide(200);
    $("#irnot").rules("remove", "required");
    $("#itnot").rules("remove", "required");
    $(".RTnot-break").css("display", "none");
    
    $("div.VI-block").show(200);
    $("#ivitemp").rules("add", "required number");
    $(".VI-break").css("display", "block");
    
  }
}

//_____________________________________________________________________________________
function showWireImpedanceBlock()
{
  //console.log( $("#idatatype").val() );
  //console.log( typeof($("div.RTnot-block")));
  
  if ( $("#ireadoutwires").val() == "2" ){
    $("div.ReadoutWireImpedance-block").show(200);
    $("#ireadoutwireimpedance").rules("add", "required number");
    $(".ReadoutWireImpedance-break").css("display", "block");
  }
  else{
    $("div.ReadoutWireImpedance-block").hide(200);
    $("#ireadoutwireimpedance").rules("remove", "required");
    $(".ReadoutWireImpedance-break").css("display", "none");
  }
}


