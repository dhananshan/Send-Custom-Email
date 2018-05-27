var sendemailextension = (function () {

    // Used in releaseType dropdown as value for item 'create'. to avoid other dynamic values  
    // TODO: Need to change
    var createStaticId="create3b951d5a916e463d81e59f02f0ff09c3";

    var settingArray=[];

    clearSettings = function () {
        $("#to").val('');
        $("#backendurl").val('');                
        $("#name").val('');
        $("#qid").val('');
        $("#body").val('');
    }

    onChangeReleaseType= function () {

        clearSettings();

        $("#settingcontent").show();

        if($("#releaseType").val()==createStaticId){
            $("#btnSave").text("Save");
        }else{
            $("#btnSave").text("Update");
         
            var existingObj = settingArray.find(x=>x.Name==$("#releaseType").val());
            console.log("Existing Object", existingObj );
            
            $("#to").val(existingObj.To);
            $("#backendurl").val(existingObj.BackendUrl);                
            $("#name").val(existingObj.Name);
            $("#qid").val(existingObj.Qid);
            $("#body").val(existingObj.Body);
            $("#bodyContainer .richText-editor").append(existingObj.Body);
        }

    }

    populateDropdown = function (){
            
        var dropdown=$("#releaseType");

        dropdown.empty();
        dropdown.append('<option value="" disabled selected>--- Select ---</option>');
        dropdown.append(' <option  value="create3b951d5a916e463d81e59f02f0ff09c3"><u>Create new release</u></option>');

            $.each(settingArray, function (index, item) {
                dropdown.append(
                    $('<option>', {
                        value: item.Name,
                        text: item.Name
                    }, '</option>'))
                  }
                 );
    }

    loadSettings = function () {

        // Get data service
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function(dataService) {
            // Get value in user scope
                dataService.getValue("setting").then(function(value) {
                    console.log("Setting retrieve value is: " + value);
                    
                    settingArray = JSON.parse(value);
                    populateDropdown();

                });
            });
    }

    saveSettings = function () {

        var obj ={};
        obj.To=$("#to").val();
        obj.BackendUrl=$("#backendurl").val();
        obj.Body=$("#body").val();
        obj.Name=$("#name").val();
        obj.Qid=$("#qid").val();
        obj.Body=$("#body").val();
 
        let existsIndex= settingArray.findIndex(x=>x.Name==obj.Name);

        if(existsIndex<0){
            settingArray.push(obj);
        }else{
        settingArray[existsIndex]=obj;
        }

        populateDropdown();

        var jsonString = JSON.stringify(settingArray);

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
        sendEmail:sendEmail,
        onChangeReleaseType:onChangeReleaseType,
        createStaticId: createStaticId,
        populateDropdown:populateDropdown
    }

})();