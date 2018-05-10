var sendemailextension = (function () {
    

    loadSettings = function () {
        // Get data service
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function(dataService) {
            // Get value in user scope
                dataService.getValue("setting").then(function(value) {
                    console.log("Setting retrieve value is: " + value);
                    
                    var obj = JSON.parse(value);
                    $("#to").val(obj.To);
                    $("#backendurl").val(obj.BackendUrl);                
                    $("#mobileuatqid").val(obj.MobileUatQId);
                    $("#mobileprodqid").val(obj.MobileProdQId);
                    $("#webuatqid").val(obj.WebUatQId);
                    $("#webprodqid").val(obj.WebProdQId);
        
                    $("#body").val(obj.Body);
                    $("#bodyContainer .richText-editor").append(obj.Body);

                });
            });
    }

    saveSettings = function () {

        var obj ={};
        obj.To=$("#to").val();
        obj.BackendUrl=$("#backendurl").val();
        obj.Body=$("#body").val();
        obj.MobileUatQId=$("#mobileuatqid").val();
        obj.MobileProdQId=$("#mobileprodqid").val();
        obj.WebUatQId=$("#webuatqid").val();
        obj.WebProdQId=$("#webprodqid").val();
      
        var jsonString = JSON.stringify(obj);
      
              // Get data service
              VSS.getService(VSS.ServiceIds.ExtensionData).then(function(dataService) {
              // Set value in user scope
              dataService.setValue("setting", jsonString).then(function(value) {
                  console.log("Setting set value is: " + value);
              });
          });
    }


    previewEmail=function(){


        // Load VSTS controls
        // Load VSTS controls and REST client
        VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"],
        function (VSS_Service, TFS_Wit_WebApi) {

        // Get a WIT client to make REST calls to VSTS
        var witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);

        // Call the "queryById" REST endpoint, giving a query ID
        witClient.queryById(this.getQueryId()).then(function(workItems) {
            
            var workitemsarray = workItems.workItems;
            var workitemhtml='';

             if(workitemsarray){
                                       
                    for(var i=0; i < workitemsarray.length ;i++ ){
                        workitemhtml +=  workitemsarray[i].id + '<br>' 
                    }

             }

            let emailcontent =$("#body").val(); 
            emailcontent= emailcontent.replace("{workitem}", workitemhtml);

            $("#previewemail").val(emailcontent);
            $("#previewemailContainer .richText-editor").append(emailcontent);
           
            });    
        });
        
    }

    sendEmail=function(){

        $("#btnsendemail").prop("disabled",true);
        var emailObj={};
        emailObj.To=$('#to').val();
        emailObj.Subject=$('#subject').val();
        emailObj.Body=$('#previewemail').val();   
    
    
    
        $.ajax({
    
            url: $("#backendurl").val(),
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(emailObj),
            success: function( data, textStatus, jQxhr ){
                alert("Email sent successfully!");
                $("#btnsendemail").prop("disabled",false);

            },
            error: function( jqXhr, textStatus, errorThrown ){
                alert("Email failed to send!");
                $("#btnsendemail").prop("disabled",false);
            }
    
        });


    }

    getQueryId=function(){
        var qid='';

        if($('input[name=apptype]:checked').val()=='web'){

            if($('input[name=release]:checked').val()=='uat'){
                qid = $("#webuatqid").val();
            }else if($('input[name=release]:checked').val()=='prod'){
                qid = $("#webprodqid").val();
            }
            
        }else if($('input[name=apptype]:checked').val()=='mobile'){

            if($('input[name=release]:checked').val()=='uat'){
                qid = $("#mobileuatqid").val();
            }else if($('input[name=release]:checked').val()=='prod'){
                qid = $("#mobileprodqid").val();
            }

        }
        
        console.info("Query Id",qid);

        return qid;
    }



    return {
        loadSettings:loadSettings,
        saveSettings:saveSettings,
        previewEmail:previewEmail,
        sendEmail:sendEmail
    }

})();