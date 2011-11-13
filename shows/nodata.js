function(doc, req) {  

  function clone(obj){
    if(obj == null || typeof(obj) != 'object')
      return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) //don't copy the data
      if(key != "data") temp[key] = clone(obj[key]);
    return temp;
  }


  if(doc !== null){
    if(doc.ntdname && doc.type == "ntd_characterization"){
      var newDoc = clone(doc);
      return toJSON(newDoc);
    }
  }
  
}
