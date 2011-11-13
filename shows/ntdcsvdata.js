function(doc, req) {  

  if(doc !== null){
    if(doc.ntdname && doc.type == "ntd_characterization"){

      function printKey(obj){
        var text = "";
        for (var key in obj){
          if(key == "data" || key == "_id"  || key == "_rev" || key == "_revisions" || key == "type" )
          continue;
          if (typeof(obj[key]) == 'object'){
            //text += "object<br>";
            text += key + "\n";
            text += printKey(obj[key]);
          }
          else
          text += key + "," + obj[key] + "\n";
        }

        return text;
      }

      theBody = printKey(doc);

      function printData(data){
        var text = "\n";
        var maxLength = 0;
        for (var key in data){
          text += key + ",";
          if(data[key].length > maxLength){ maxLength = data[key].length; }
        }
        text += "\n";
        

        for(var i = 0; i < maxLength; i++){
          for(var key in data){
            if (i < data[key].length){
              text += data[key][i] + ",";
            }
            else{
              text += ",";
            }
            
          }
          text += "\n";
        }

        return text;
      }
      if(doc.measurement.data.raw !== null){
        if(typeof(doc.measurement.data.raw) == "object"){
          theBody += printData(doc.measurement.data.raw);
        }
      }

      if(doc.measurement.data.final !== null){
        if(typeof(doc.measurement.data.final) == "object"){
          theBody += printData(doc.measurement.data.final);
        }
      }      
    
      if(doc.measurement.data.raw == null && typeof(doc.measurement.data) == "object"){
        theBody += printData(doc.measurement.data);
      }
      
      var attName = "attachment;filename=ntd "+doc.ntdname+".csv"

      //return theBody;
      return {
        body: theBody,
        headers: {
          "Content-Type" : "text/csv",
          "Content-disposition" : attName
        }
      }

    }
    else {
      return "not the correct document type"; 
    }
  }
  
  
  else{
    var file = "atest, col1, col2\n";
    file += "0, 1, 2\n";
    file += "0, 1, 2\n";

    var attachName = "test.csv";
    var att = "attachment;filename="+attachName;

    return {
      body: file,
      headers: {
        "Content-Type" : "text/csv",
        "Content-disposition" : att
      }
    }
  }
  
  
}