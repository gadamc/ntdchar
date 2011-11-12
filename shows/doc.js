function(doc, req) {  
  
  function printKeyValues(anObject){
    var text = "";
    for (var key in anObject){
      if (typeof(anObject[key]) == 'object'){
        //text += "object<br>";
        text += key + "<br>";
        text += "  " + printKeyValues(anObject[key]) + "<br>";
      }
      else
        text += key + " " + anObject[key] + "<br>";
    }
    
    return text;
  }
  
  
  
  return printKeyValues(doc);
}