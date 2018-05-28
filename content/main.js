var sendemailextension = (function () {

    // Used in releaseType dropdown as value for item 'create'. to avoid other dynamic values  
    // TODO: Need to change
    var createStaticId="create3b951d5a916e463d81e59f02f0ff09c3";
    var projectId="";

    var settingArray=[];

    clearSettings = function () {
        $("#to").val('');
        $("#backendurl").val('');                
        $("#name").val('');
        $("#qid").val('');
        $("#body").val('');
        $("#bodyContainer .richText-editor").empty();
    }

    onChangeReleaseType= function () {

        clearSettings();

        $("#settingcontent").show();

        if($("#releaseType").val()==createStaticId){
            $("#btnDel").hide();
        }else{
            $("#btnDel").show();

            var existingObj = settingArray.find(x=>x.Name==$("#releaseType").val());
            
            $("#to").val(existingObj.To);
            $("#backendurl").val(existingObj.BackendUrl);                
            $("#name").val(existingObj.Name);
            $("#qid").val(existingObj.Qid);
            $("#body").val(existingObj.Body);
            $("#bodyContainer .richText-editor").append(existingObj.Body);
        }

    }

    deleteSettings =function () {
        
        var selelctedName =$("#releaseType").val();
        let existsIndex= settingArray.findIndex(x=>x.Name==selelctedName);
        if (existsIndex !== -1) {
            settingArray.splice(existsIndex, 1);
        }

        var jsonString = JSON.stringify(settingArray);

        // Get data service
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function(dataService) {
        // Set value in user scope
        dataService.setValue("setting"+sendemailextension.projectId , jsonString).then(function(value) {
            clearSettings();
            populateDropdown();

            $("#btnSave").text("Save");
            $("#btnSave").prop("disabled", false);
            alert("Successfully Deleted!");

        });
      });



    }


    populateDropdown = function (){
        
        $("#btnDel").hide();
        var dropdownReleaseType=$("#releaseType");
        var dropdownSendmailreleaseType=$("#sendmailreleaseType");


        dropdownReleaseType.empty();
        dropdownSendmailreleaseType.empty();

        dropdownReleaseType.append('<option value="" disabled selected>--- Select ---</option>');
        dropdownSendmailreleaseType.append('<option value="" disabled selected>--- Select ---</option>');

        dropdownReleaseType.append(' <option  value="create3b951d5a916e463d81e59f02f0ff09c3"><u>Create New Release</u></option>');

            $.each(settingArray, function (index, item) {
                dropdownReleaseType.append(
                    $('<option>', {
                        value: item.Name,
                        text: item.Name
                    }, '</option>'));

                    dropdownSendmailreleaseType.append(
                        $('<option>', {
                            value: item.Name,
                            text: item.Name
                        }, '</option>'));

                  }
                 );
    }

    loadSettings = function () {

        // Get data service
        VSS.getService(VSS.ServiceIds.ExtensionData).then(function(dataService) {
            // Get value in user scope
                dataService.getValue("setting"+sendemailextension.projectId).then(function(value) {
                   
                    settingArray = JSON.parse(value);
                    
                    clearSettings();
                    populateDropdown();

                });
            });
    }

    saveSettings = function () {
        
        $("#btnSave").text("Processing");
        $("#btnSave").prop("disabled", true);


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


        var jsonString = JSON.stringify(settingArray);

              // Get data service
              VSS.getService(VSS.ServiceIds.ExtensionData).then(function(dataService) {
              // Set value in user scope
              dataService.setValue("setting"+sendemailextension.projectId , jsonString).then(function(value) {
                  clearSettings();
                  populateDropdown();

                  $("#btnSave").text("Save");
                  $("#btnSave").prop("disabled", false);
                  alert("Successfully Saved!");

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
                        workitemhtml +=  '<a href="'+workitemsarray[i].url+'" target="_blank">'+workitemsarray[i].id+'</a> <br>' 
                    }

             }

            let emailcontent =this.getBodyValue(); 
            emailcontent= emailcontent.replace("{workitem}", workitemhtml);

            $("#previewemail").val(emailcontent);
            $("#previewemailContainer .richText-editor").append(emailcontent);
           
            });    
        });
        
    }

    sendEmail=function(){

        $("#btnsendemail").prop("disabled",true);
        var selelctedObj =getSelectedObjectValue();

        var emailObj={};
        emailObj.To= selelctedObj.To;
        emailObj.Subject=$('#subject').val();
        emailObj.Body=$('#previewemail').val();   
    
    
    
        $.ajax({
    
            url: selelctedObj.BackendUrl,
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
        var selectedReleaseType=$("#sendmailreleaseType").val();        
        let selectedObj= settingArray.find(x=>x.Name==selectedReleaseType);       
        return selectedObj.Qid;
    }

    getBodyValue=function(){
        var selectedReleaseType=$("#sendmailreleaseType").val();        
        let selectedObj= settingArray.find(x=>x.Name==selectedReleaseType);       
        return selectedObj.Body;
    }

    getSelectedObjectValue=function(){
        var selectedReleaseType=$("#sendmailreleaseType").val();        
        let selectedObj= settingArray.find(x=>x.Name==selectedReleaseType);       
        return selectedObj;
    }

    return {
        loadSettings:loadSettings,
        saveSettings:saveSettings,
        previewEmail:previewEmail,
        sendEmail:sendEmail,
        onChangeReleaseType:onChangeReleaseType,
        createStaticId: createStaticId,
        populateDropdown:populateDropdown,
        projectId:projectId,
        deleteSettings:deleteSettings
    }

})();