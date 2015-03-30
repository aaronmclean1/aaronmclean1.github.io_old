$(document)
	.ready(function()
	{
        // Load the SDK asynchronously
	  (function(d, s, id)
	  {
		 var js, fjs = d.getElementsByTagName(s)[0];
		 if (d.getElementById(id)) {return;}
		 js = d.createElement(s); js.id = id;
		 js.src = "//connect.facebook.net/en_US/sdk.js";
		 fjs.parentNode.insertBefore(js, fjs);
	   }(document, 'script', 'facebook-jssdk'));
	   
        window.fbAsyncInit = function() 
        {
                FB.init({
                appId: '830332383679546',
                status: true,
                cookie: true,
                xfbml: true,
                version    : 'v2.3'
            });
            
            userData = postLogin();
            //alert(userData)
        };	
		

	});
	
function errorMessage()
{
	$.modal.close();
	$('#addACategory').hide();
	$('#addAGearItem').hide();	
	$('#status').html('');
	alert('Please login if you would like to edit the application');
	document.location.reload();
}	

function postLogin()
{
	FB.getLoginStatus(function(response)
	{
		if (response.status === 'connected')
		{
			// the user is logged in and has authenticated your
			// app, and response.authResponse supplies
			// the user's ID, a valid access token, a signed
			// request, and the time the access token
			// and signed request each expire
			var facebookId = response.authResponse.userID;
			var accessToken = response.authResponse.accessToken;			
			
			$('#accessToken').val(accessToken);
			$('#facebookId').val(facebookId);
			
			$('#addACategory').show();
			$('#addAGearItem').show();			
			
			FB.api('/me', function(response)
			{	
				if(response.name == 'undefined')
				{
					$.modal.close();
					$('#addACategory').hide();
					$('#addAGearItem').hide();
					$('#status').html('');
					alert('Please login if you would like to edit the application');				
				}
				else
				{
					$('#status').html('Thanks for logging in <a href="#" onClick="viewUsers()" >' + response.name + '</a>')
					//Add user to database
					addUser(facebookId, response.name, accessToken);				
				}
			});			
		}
		else
		{
			// the user isn't logged in to Facebook.			
			$.modal.close();
			$('#addACategory').hide();
			$('#addAGearItem').hide();	
			$('#status').html('');			
		}
	});
}

function addUser(facebookId, name, accessToken)
{	
	//check to see if the user is in the DB. If not, add them
	$.ajax({
		type: 'GET',
		url: '/catalog/addUser/' + facebookId + '/' + name + '/' + accessToken + '/',		
		success: function(data)
		{
			if(data == 'False')
			{
				errorMessage();
			}
		},
		error: function(data)
		{			
			errorMessage();
		}
	});
}

function viewUsers()
{		
	
	//initialize the modal window
	$('#basic-modal-content').modal();

	//use ajax to go get our gear data based on the gearId
	$.ajax({
		url: '/catalog/users/JSON',
		async: true,
		dataType: 'json',
		success: function(data)
		{
			//clear the gear div of previous data
			$("#basic-modal-content").html('');
			
			//add a header and table
			$('#basic-modal-content').append('<h3>Users</h3>');
			$('#basic-modal-content').append('<table></table>');

			//loop through gear data and list it
			//alert(data.user.length)
			
			for (var i = 0; i < data.user.length; i++)
			{			
				var trow = $('<tr>');
				var p = data.user[i]
				for (var key in p)
				{
					

					if (p.hasOwnProperty(key))
					{
						if (key == 'id')
						{
							//append to user table
							$('<td valign="top">').append('<a href="#" onclick="deleteUsers(' + p[key] + ')">delete</a>').width('50').data("col", 2).appendTo(trow);							
						}	
						
						if (key == 'name')
						{
							//append to user table							
							$('<td valign="top">').append(p[key]).width('100').data("col", 2).appendTo(trow);							
						}				
					}
				}
				trow.appendTo('table');
			}
		},
		error: function(data)
		{
			alert('Problem. No user data was found.');
			errorMessage();
		}
	});
}

function deleteUsers(userId)
{	
	//Make sure the user wants to delete the user
	if(confirm("Are you sure?"))
	{
		//use ajax to delete the user
		$.ajax({
			type: 'POST',
			url: '/catalog/users/' + userId + '/delete/' + $('#facebookId').val() + '/' + $('#accessToken').val() + '/',
			success: function(data)
			{				
				//close modal window
				$.modal.close();
				if(data == 'logout')
				{
					FB.logout(function(response) {document.location.reload()});
				}			
			},
			error: function(data)
			{
				alert('Problem! Unable to delete the user.');
				errorMessage();
			}			
		});
	}
	else
	{
		return
	}
}



function populateCategoriesDiv()
{
	//clear the category div of previous data
	$("#categoryDiv").html('');

	//use ajax to go get our new data
	$.ajax({
		url: '/catalog/JSON',
		async: true,
		dataType: 'json',
		success: function(data)
		{
			//success!
			if(data.categories[0])
			{
				//add a header
				$('#categoryDiv').append('<h3 style="margin: 5px 0px 5px 0px; font-weight:600; ">Categories</h3>');
				
				//build the unordered list
				$('#categoryDiv').append("<ul id='categoryDivItems' style='padding-left:0;list-style:none;'></ul>");

				//add the items to the list
				for (j = 0; j < data.categories.length; j++)
				{
					$('#categoryDivItems').append('<li ><a href="#" style="color: #E34D07; font-weight:600" onclick="populateGearDiv(' + data.categories[j].id + ',\'' + data.categories[j].name.replace(/'/g, "\\'") + '\')">'+ data.categories[j].name + '</a></li>');
				}
			}
			else
			{				
				//There was a problem finding data
				$('#categoryDivItems').append('<li>Oops! There was a problem.</li>');
			}

		},
		error: function(data)
		{
			alert('Problem! Unable to get data.');
		}
	});
}

function populateGearDiv(categoryId, categoryName)
{
	
	//clear the gear div of previous data
	$("#gearDiv").html('');

	//use ajax to go get our new data
	$.ajax({
		url: '/catalog/' + categoryId + '/gear/JSON',
		async: true,
		dataType: 'json',
		success: function(data)
		{
			//success!
			if(data.GearItems[0])
			{
				//add a header
				$('#gearDiv').append("<h3 style='margin: 5px 0px 5px 0px; font-weight:600'>" + categoryName + " Items (" + data.GearItems.length + (data.GearItems.length == 1 ? ' item' : ' items') + ")</h3>");
				
				//build the unordered list
				$('#gearDiv').append("<ul id='gearDivItems' style='padding-left:0;list-style:none;'></ul>");

				//add the items to the list
				for (j = 0; j < data.GearItems.length; j++)
				{
					$('#gearDivItems').append('<li ><a href="#" style="color: #E34D07; font-weight:600" onclick="populateGearModal('+ categoryId + ',' + data.GearItems[j].id + ',\'' + data.GearItems[j].name.replace(/'/g, "\\'") + '\',\'' + categoryName.replace(/'/g, "\\'") + '\')">'+ data.GearItems[j].name + '</a></li>');
				}
			}
			else
			{
				//no data was found yet so just add the header
				$('#gearDiv').append("<h3 style='margin: 5px 0px 5px 0px; font-weight:600'>" + categoryName + "</h3>");
			}
			
			//add an edit and cancel button
			$('#gearDiv').append('<button type="button" Category" onclick="editCategory(' + categoryId + ',\'' + categoryName.replace(/'/g, "\\'") + '\')">Edit</button> | <button type="button" onclick="deleteCategory(' + categoryId + ')">Delete Category</button>');

		},
		error: function(data)
		{
			alert('Problem! Unable to get data.');
		}
	});
}

function populateGearModal(categoryId, gearId, gearItemName, categoryName)
{	
	
	//initialize the modal window
	$('#basic-modal-content').modal();

	//use ajax to go get our gear data based on the gearId
	$.ajax({
		url: '/catalog/' + categoryId + '/gear/' + gearId + '/JSON',
		async: true,
		dataType: 'json',
		success: function(data)
		{
			//clear the gear div of previous data
			$("#basic-modal-content").html('');
			
			//add a header and table
			$('#basic-modal-content').append('<h3>' + gearItemName + ' Gear Details</h3>');
			$('#basic-modal-content').append('<table></table>');

			//loop through gear data and list it
			var p = data.Gear_Item
			for (var key in p)
			{
				var trow = $('<tr>');

				if (p.hasOwnProperty(key))
				{
					if (key !== 'id')
					{
						//append to gear table
						$('<td valign="top">').append(key.charAt(0).toUpperCase() + key.slice(1)).width('100').data("col", 1).appendTo(trow);
						$('<td valign="top">').append(p[key].replace(/\n/g, "<br />")).width('450').data("col", 2).appendTo(trow);
						trow.appendTo('table');
					}
				}
			}

			
			//define save and cancel buttons
			var trow = $('<tr>');
			var input = $('<button type="button" onclick="editGearModal(' + categoryId + ',' + gearId + ',\'' + gearItemName.replace(/'/g, "\\'") + '\',\'' + categoryName.replace(/'/g, "\\'") + '\')">Edit</button> | <button type="button" onclick="deleteGearModal(' + categoryId + ',' + gearId + ',\'' + gearItemName.replace(/'/g, "\\'") + '\',\'' + categoryName.replace(/'/g, "\\'") + '\')">Delete</button>').width('144');
			
			//add edit and delete buttons
			$('<td style="padding-top: 10px">').append(' ').width('100').data("col", 1).appendTo(trow);
			$('<td style="padding-top: 10px">').append(input).data("col", 2).appendTo(trow);
			trow.appendTo('table');
		},
		error: function(data)
		{
			alert('Problem. No gear data was found.');
		}
	});
}

function editGearModal(categoryId, gearId, gearItemName, categoryName)
{	
	//initialize the modal window
	$('#basic-modal-content').modal();

	//use ajax to go get the gear data based on gear id
	$.ajax({
		url: '/catalog/' + categoryId + '/gear/' + gearId + '/JSON',
		async: true,
		dataType: 'json',
		success: function(data)
		{
			//clear the gear div of previous data
			$("#basic-modal-content").html('');
			
			//add a header, form and table
			$('#basic-modal-content').append('<h3 id="gearItemName">' + gearItemName + ' Gear Details</h3>');
			$('#basic-modal-content').append('<form name="myForm" method="POST"> </form>');
			$("form[name='myForm']").append('<table></table>');
			
			//loop through gear data and list it
			var p = data.Gear_Item
			for (var key in p)
			{
				var trow = $('<tr>');

				//Make sure the key has a property
				if (p.hasOwnProperty(key))
				{
					if(key == 'id')
					{
						var myIdval = p[key];
					}

					//build a textarea for the summary
					if(key == 'summary')
					{
						var textarea = $('<textarea name="' + key + '">' + p[key] + '</textarea>').width('450').height('90');
						$('<td valign="top">').append(key.charAt(0).toUpperCase() + key.slice(1)).data("col", 1).appendTo(trow);
						$('<td>').append(textarea).data("col", 2).appendTo(trow);
						trow.appendTo('table');
					}
					
					//don't build an input for the id colum. it's read only
					else if(key !== 'id')
					{
						
						//for the name input we have a special onkeyup function that displays the name as the user types it. 
						if(key == 'name')
						{
							var input = $('<input onKeyUp="$(\'#gearItemName\').html(this.value + \' Details\')" style="width:100px" type="text" name="' + key + '" value="' + p[key] + '"  />').width('450');
						}
						
						//build inputs for the remianing fields
						else
						{
							var input = $('<input style="width:100px" type="text" name="' + key + '" value="' + p[key] + '"  />').width('450');
						}

						$('<td>').append(key.charAt(0).toUpperCase() + key.slice(1)).width('100').data("col", 1).appendTo(trow);
						$('<td>').append(input).data("col", 2).appendTo(trow);

						trow.appendTo('table');
					}
				}
			}

			//define save and cancel buttons
			var trow = $('<tr>');
			var input = $('<button type="button" id="saveButton" onclick="saveGearModal(' + categoryId + ',' + gearId + ',\'' + categoryName.replace(/'/g, "\\'") + '\')">Save</button> | <button type="button" onclick="$.modal.close();//populateGearModal(' + categoryId + ',' + gearId + ',\'' + gearItemName.replace(/'/g, "\\'") + '\',\'' + categoryName.replace(/'/g, "\\'") + '\')">Cancel</button>').width('144');
			
			//add save and cancel buttons
			$('<td style="padding-top: 10px">').append(' ').width('100').data("col", 1).appendTo(trow);
			$('<td style="padding-top: 10px">').append(input).data("col", 2).appendTo(trow);
			trow.appendTo('table');
		},
		error: function(data)
		{
			alert('Problem. No gear data was found.');
		}
	});
}

function saveGearModal(categoryId, gearId, name)
{
	//convert the submitted form into a serialized form
	var formData = $("form[name='myForm']").serialize();
	

	//use ajax to send the form to our python code
	$.ajax({
		type: 'POST',
		url: '/catalog/' + categoryId + '/gear/' + gearId + '/edit/' + $('#facebookId').val() + '/' + $('#accessToken').val() + '/',
		data: formData,
		success: function(data)
		{
			//tell the user the form data was saved		
			$('#saveButton').val('Saved!');
			//change the color of the text in the save button
			if ($('#saveButton').css('color') == 'rgb(255, 0, 0)')
			{				
				$('#saveButton').css('color', 'rgb(0, 0, 255)');
			}
			else
			{			
				$('#saveButton').css('color', 'rgb(255, 0, 0)');
			}
			//update the gear div with the new data
			populateGearDiv(categoryId, name);			
		},
		error: function(data)
		{
			alert('Problem! Unable to save data.');
			errorMessage();
		}
	});
}

function deleteGearModal(categoryId, gearId, gearItemName, categoryName)
{

	//ask the user if they want to delete the gear from the category
	if(confirm("Are you sure?"))
	{
		//use ajax to delete the gear
		$.ajax({
			type: 'POST',
			url: '/catalog/' + categoryId + '/gear/' + gearId + '/delete/' + $('#facebookId').val() + '/' + $('#accessToken').val() + '/',
			complete: function(data)
			{
				//refersh the gear div
				populateGearDiv(categoryId, categoryName);
				
				//close the modal window
				$.modal.close();
			},
			error: function(data)
			{
				alert('Problem! Unable to delete the gear.');
				errorMessage();
			}			
		});
	}
	else
	{
		return
	}
}

function addNewGearModal()
{
	//initialize the modal window
	$('#basic-modal-content').modal();

	//remove previous modal content
	$("#basic-modal-content").html('');
	
	//add a header
	$('#basic-modal-content').append('<h3>Add New Gear Item</h3>');
	
	//add a form
	$('#basic-modal-content').append('<form name="myForm" method="POST"> </form>');
	
	//add a table
	$("form[name='myForm']").append('<table></table>');

	//add a name input
	var trow = $('<tr>');
	var input = $('<input style="width:100px" type="text" name="name" />').width('450');
	$('<td>').append('Name').width('100').data("col", 1).appendTo(trow);
	$('<td>').append(input).data("col", 2).appendTo(trow);
	//append the name input to the table
	trow.appendTo('table');
	
	//add a Price input
	var trow = $('<tr>');
	var input = $('<input style="width:100px" type="text" name="price" />').width('450');
	$('<td>').append('Price').width('100').data("col", 1).appendTo(trow);
	$('<td>').append(input).data("col", 2).appendTo(trow);
	
	//append the price input to the table
	trow.appendTo('table');

	//add a category input
	var trow = $('<tr>');
	var select = $('<select style="width:100px" id="selectId" name="id"></select>').width('450');
	$('<td>').append('Category').width('100').data("col", 1).appendTo(trow);
	$('<td>').append(select).data("col", 2).appendTo(trow);
	
	//append the category input to the table
	trow.appendTo('table');

	//use ajax to get a list of categories and ids
	$.ajax({
		url: '/catalog/JSON',
		async: true,
		dataType: 'json',
		success: function(data)
		{
			if(data.categories[0])
			{
				for (j = 0; j < data.categories.length; j++)
				{
					//add the category and id to the select
					$('#selectId').append($("<option></option>").attr("value",data.categories[j].id).text(data.categories[j].name));
				}
			}
			else
			{
				alert('Problem! Unable to get data.');
			}
		},
		error: function(data)
		{
			alert('Problem! Unable to get data.');
		}
	});

	//add a summary textarea
	var trow = $('<tr>');
	var textarea = $('<textarea name="summary"></textarea>').width('450').height('90');
	$('<td valign="top">').append('Summary').data("col", 1).appendTo(trow);
	$('<td>').append(textarea).data("col", 2).appendTo(trow);
	
	//append the summary textarea to the table
	trow.appendTo('table');

	//define the save and cancel buttons
	var trow = $('<tr>');
	var input = $('<button type="button" id="saveButton" onclick="saveNewGearModal($(\'#selectId option:selected\').text())">Save</button> | <button type="button" onclick="$.modal.close();">Cancel</button>').width('144');

	//append the save and cancel buttons to the table
	$('<td style="padding-top: 10px">').append(' ').width('100').data("col", 1).appendTo(trow);
	$('<td style="padding-top: 10px">').append(input).data("col", 2).appendTo(trow);
	trow.appendTo('table');
}

function saveNewGearModal(categoryName)
{
	//serilize the form data
	var formData = $("form[name='myForm']").serializeArray();
	
	//use ajax to save the gear data
	$.ajax({
		type: 'POST',
		url: '/catalog/' + formData[2].value + '/gear/new/' + $('#facebookId').val() + '/' + $('#accessToken').val() + '/',
		data: formData,
		success: function(data)
		{
			//refresh the gear div to show new data
			populateGearDiv(formData[2].value, categoryName);
			
			//tell the user the form data was saved		
			$('#saveButton').val('Saved!');
			//change the color of the text in the save button
			if ($('#saveButton').css('color') == 'rgb(255, 0, 0)')
			{				
				$('#saveButton').css('color', 'rgb(0, 0, 255)');
			}
			else
			{			
				$('#saveButton').css('color', 'rgb(255, 0, 0)');
			}
		},
		error: function(data)
		{
			alert('Problem! Unable to save data.');
			errorMessage();
		}
	});
}

function addNewCategory()
{
	//initialize the modal window
	$('#basic-modal-content').modal();

	//remove previous modal content
	$("#basic-modal-content").html('');
	
	//add a new header
	$('#basic-modal-content').append('<h3> Add a New Category</h3>');
	
	//add a form
	$('#basic-modal-content').append('<form name="myForm" method="POST"> </form>');
	
	//add a table
	$("form[name='myForm']").append('<table></table>');

	//define the name input
	var trow = $('<tr>');
	var input = $('<input style="width:100px" type="text" name="name" />').width('450');
	$('<td>').append('Name').width('100').data("col", 1).appendTo(trow);
	$('<td>').append(input).data("col", 2).appendTo(trow);
	
	//append the name input to the table
	trow.appendTo('table');

	//define the save and cancel buttons
	var trow = $('<tr>');
	var input = $('<button type="button" id="saveButton" onclick="saveNewCategory()">Save</button> | <button type="button" onclick="$.modal.close();">Cancel</button>').width('144');

	//append the save and cancel buttons to the table
	$('<td style="padding-top: 10px">').append(' ').width('100').data("col", 1).appendTo(trow);
	$('<td style="padding-top: 10px">').append(input).data("col", 2).appendTo(trow);
	trow.appendTo('table');
}

function saveNewCategory()
{
	var formData = $("form[name='myForm']").serializeArray();

	$.ajax({
		type: 'POST',		
		url: '/catalog/new/' + $('#facebookId').val() + '/' + $('#accessToken').val() + '/',
		data: formData,
		success: function(data)
		{
			//refresh categories div to show new data
			populateCategoriesDiv();
			
			//tell the user the form data was saved		
			$('#saveButton').val('Saved!');
			//change the color of the text in the save button
			if ($('#saveButton').css('color') == 'rgb(255, 0, 0)')
			{				
				$('#saveButton').css('color', 'rgb(0, 0, 255)');
			}
			else
			{			
				$('#saveButton').css('color', 'rgb(255, 0, 0)');
			}
		},
		error: function(data)
		{
			alert('Problem! Unable to save data.');
			errorMessage();
		}
	});
}

function editCategory(categoryId, categoryName)
{
	//initialize the modal window
	$('#basic-modal-content').modal();

	//clear previous modal data
	$("#basic-modal-content").html('');
	
	//add a header
	$('#basic-modal-content').append('<h3>Edit ' + categoryName + ' Category</h3>');
	
	//add a form
	$('#basic-modal-content').append('<form name="myForm" method="POST"> </form>');
	
	//add a table
	$("form[name='myForm']").append('<table></table>');

	//define a name input
	var trow = $('<tr>');
	var input = $('<input style="width:100px" type="text" name="name" value="' + categoryName + '" />').width('450');
	var input2 = $('<input type="hidden" id="' + categoryId + '" name="id" value="' + categoryId + '" />');
	$('<td>').append('Name').width('100').data("col", 1).appendTo(trow);
	$('<td>').append(input).append(input2).data("col", 2).appendTo(trow);
	
	//append the name input to the table
	trow.appendTo('table');

	//define save and cancel buttons
	var trow = $('<tr>');
	var input = $('<button type="button" id="saveButton" onclick="saveCategory()">Save</button> | <button type="button" onclick="$.modal.close();">Cancel</button>').width('144');

	//append the save and cancel buttons to the table
	$('<td style="padding-top: 10px">').append(' ').width('100').data("col", 1).appendTo(trow);
	$('<td style="padding-top: 10px">').append(input).data("col", 2).appendTo(trow);
	trow.appendTo('table');
}

function saveCategory()
{
	//serialize the form data
	var formData = $("form[name='myForm']").serializeArray();

	//use ajax to save our category form data
	$.ajax({
		type: 'POST',
		url: '/catalog/' + formData[1].value + '/edit/' + $('#facebookId').val() + '/' + $('#accessToken').val() + '/',
		data: formData,
		success: function(data)
		{
			//refresh the categories div to show new data
			populateCategoriesDiv();
			
			//refresh the gear div to show new data
			populateGearDiv(formData[1].value, formData[0].value);
			
			//tell the user the form data was saved		
			$('#saveButton').val('Saved!');
			//change the color of the text in the save button
			if ($('#saveButton').css('color') == 'rgb(255, 0, 0)')
			{				
				$('#saveButton').css('color', 'rgb(0, 0, 255)');
			}
			else
			{			
				$('#saveButton').css('color', 'rgb(255, 0, 0)');
			}
		},
		error: function(data)
		{
			alert('Problem! Unable to save data.');
			errorMessage();
		}
	});
}

function deleteCategory(categoryId)
{
	//Make sure the user wants to delete the category
	if(confirm("Are you sure?"))
	{
		//use ajax to delete the category
		$.ajax({
			type: 'POST',
			url: '/catalog/' + categoryId + '/delete/' + $('#facebookId').val() + '/' + $('#accessToken').val() + '/',
			complete: function(data)
			{
				//refresh the category div
				populateCategoriesDiv();
				
				//set the gear div to blank
				$('#gearDiv').html('');
			},
			error: function(data)
			{
				alert('Problem! Unable to delete the category.');
				errorMessage();
			}			
		});
	}
	else
	{
		return
	}
}

