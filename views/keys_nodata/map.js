function (doc) {


  function clone(obj){
    if(obj == null || typeof(obj) != 'object')
      return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) //don't copy the data
      if(key != "data") temp[key] = clone(obj[key]);
    return temp;
  }


  if(doc.type){
    var newDoc = clone(doc)
    for (var key in newDoc) {
      emit(key, newDoc);        
    }
  }
}

