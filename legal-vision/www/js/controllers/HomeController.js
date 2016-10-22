(function(){
	angular.module('starter')
	.controller('HomeController', ['$scope', '$cordovaFile', '$cordovaFileTransfer', '$cordovaCamera', HomeController]);

	function HomeController($scope, $cordovaFile, $cordovaFileTransfer, $cordovaCamera){

		var me = this;
		me.current_image = 'img/legaldoc1.jpg';
		me.image_description = '';
    	me.detection_type = 'TEXT_DETECTION';
    	me.word = '';
		me.definition = '';
		me.usage = '';
		me.sign = '';
	    me.detection_types = {
	      LABEL_DETECTION: 'label',
	      TEXT_DETECTION: 'text',
	      LOGO_DETECTION: 'logo',
	      LANDMARK_DETECTION: 'landmark'
	    };

		var api_key = 'AIzaSyDADZ6HGkhovfcQn8SB9QAaznyPZL6JsE8';


		$scope.takePicture = function(){
      		alert('detection type: ' + me.detection_type);

			var options = {
			  	destinationType: Camera.DestinationType.DATA_URL,
	    		sourceType: Camera.PictureSourceType.CAMERA,
		        targetWidth: 500,
		        targetHeight: 500,
		        correctOrientation: true,
		        cameraDirection: 0,
		        encodingType: Camera.EncodingType.JPEG
			};

			$cordovaCamera.getPicture(options).then(function(imagedata){

				me.current_image = "data:image/jpeg;base64," + imagedata;
		        me.image_description = '';
		        me.locale = '';

				var vision_api_json = {
				  "requests":[
				    {
				      "image":{
				        "content": imagedata
				      },
				      "features":[
				        {
				          "type": me.detection_type,
				          "maxResults": 1
				        }
				      ]
				    }
				  ]
				};

				var file_contents = JSON.stringify(vision_api_json);

				$cordovaFile.writeFile(
					cordova.file.applicationStorageDirectory,
					'file.json',
					file_contents,
					true
				).then(function(result){

					var headers = {
						'Content-Type': 'application/json'
					};

					options.headers = headers;

					var server = 'https://vision.googleapis.com/v1/images:annotate?key=' + api_key;
					var filePath = cordova.file.applicationStorageDirectory + 'file.json';

					$cordovaFileTransfer.upload(server, filePath, options, true)
				  		.then(function(result){

			                var res = JSON.parse(result.response);
			                var key = me.detection_types[me.detection_type] + 'Annotations';

			                var legal_dict = [
    						{
    							"id": 1,
    							"word": "tenancy",
    							"definition": "The right to control, enjoy and live on land owned by someone else",
    							"usage": "Now that I have the tenancy of the house, I can start living there",
    							"sign": "https://media.spreadthesign.com/video/mp4/1/225191.mp4"
    						},
    						{
    							"id": 2,
    							"word": "possession",
    							"definition": "Right to use the property and prevent others from coming in the property, as well as the owner",
    							"usage": "Bruce has the exclusive possession of his house and he does not let anyone in except for his boyfriend",
    							"sign": "https://media.spreadthesign.com/video/mp4/1/99336.mp4"
    						},
    						{
    							"id": 3,
    							"word": "lodger",
    							"definition": "A person who lives in the property with the owner and who pays him for his stay. They do not have the right to prevent others from coming in the property, as well as the owner. The owner may clean the property and give food",
    							"usage": "Mrs Smith’s lodger who stays in her spare bedroom is angry because she won’t cook, Bill stays in the hotel so he is a lodger there",
    							"sign": "https://media.spreadthesign.com/video/mp4/1/101330.mp4"
    						},
    						{
    							"id": 4,
    							"word": "lease",
    							"definition": "A lease is an agreement between the person wishing to stay in the property and the owner of the property",
    							"usage": "My lease lets me stay legally in my house",
    							"sign": "https://media.spreadthesign.com/video/mp4/1/46914.mp4"
    						},
    						{
    							"id": 5,
    							"word": "license",
    							"definition": "Letting someone who is not the owner of the property to use the property as they wish without giving any further rights",
    							"usage": "Bruce has a licence to use Ben’s driveway",
    							"sign": "Couldn't find a sign equivalent"
    						},
    						{
    							"id": 6,
    							"word": "occupying",
    							"definition": "To live in a property",
    							"usage": "Bill occupies the house on 42nd street",
    							"sign": "Couldn't find a sign equivalent"
    						},
    					]  //legal dictionary 

				    		me.image_description = res.responses[0][key][0].description;
				    		console.log(me.image_description);
				    		var result = me.image_description.split(" ");
				    		
				    		var resultsArray = [];
				    		for (var i=0; i < result.length; i++) {
				    			for(var k=0; k <legal_dict.length; k++){
				    				if(result[i]==legal_dict[k].word) {
				    					var legalDefitions = {
				    						word: legal_dict[k].word,
				    						definition: legal_dict[k].definition,
				    						usage: legal_dict[k].usage,
				    						sign: legal_dict[k].sign,
				    					}
				    					resultsArray.push(legalDefitions);
				    					console.log(legal_dict[k].word);
				    				} //finding words in dictionary: future note for efficieny, use binary search
				    			} //looping over words in dictionary 
				    		} //looping over content acquired from photograph
				    		$scope.home_ctrl_array = resultsArray;
					  }, function(err){
					    alert('An error occured while uploading the file');
					  });

				}, function(err){
        			alert('An error occured while writing to the file');
        		});

				}, function(err){
			  		alert('An error occured getting the picture from the camera');
				});


		}

	}

})();