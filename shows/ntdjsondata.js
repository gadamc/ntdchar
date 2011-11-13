function(doc, req) {  

  if(doc !== null){
    //if(doc.ntdname && doc.type == "ntd_characterization"){
      // var attName = "attachment;filename=ntd "+doc.ntdname+".json"
      //       return {
      //         body: doc,
      //         headers: {
      //           "Content-Type" : "application/json",
      //           "Content-disposition" : attName
      //         }
      //       }
      return doc;
  //}
  
}