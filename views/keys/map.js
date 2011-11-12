function (doc) {
  if(doc.type){
    for (var key in doc) {
      emit(key, 1);        
    }
  }
}