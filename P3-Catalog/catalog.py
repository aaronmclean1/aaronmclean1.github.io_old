from flask import Flask, render_template, request, redirect,jsonify, url_for
from sqlalchemy import func
from sqlalchemy.orm import aliased
app = Flask(__name__)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from catlogDbSetup import Base, Category, GearItem, FbUsers, ApplicationParameters

import json, requests

engine = create_engine('sqlite:///catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


@app.route('/catalog/isLoggedIn/')
def isLoggedIn(accessToken,facebookId):

	#get secretKey from database
	secretKey = session.query(ApplicationParameters).from_statement("SELECT * FROM applicationparameters where appParam='FacebookSecretKey'").all()
	if secretKey:
		#This code is used to prove that the client side authenication codes are genuine	
		url = 'https://graph.facebook.com/debug_token?'

		params = dict(
			input_token = secretKey[0].appValue,
			access_token =  accessToken
		)
		resp = requests.get(url=url, params=params)
		data = json.loads(resp.text)

		#If Facebook agrees that the codes match then save the user to the database.		
		if data["data"]["is_valid"] == True:
			print "True"
			return "True"
		else:
			return "False"
	else:
		return "False"

#Server side authentication. It takes a client side token and uses server side to validate it.
@app.route('/catalog/addUser/<int:facebookId>/<name>/<accessToken>/')
def addUser(facebookId, name, accessToken):	
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)

	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":
		#see if user exists. If not add user
		users = session.query(FbUsers).filter_by(facebookId = facebookId).all()

		#If the user doesn't exist in the database add them.
		if users :
			return jsonify(user=[i.serialize for i in users])
		else:	
			#add user
			newUser = FbUsers(name = name, facebookId = facebookId)	

			#add to the DB
			session.add(newUser)

			#commit to the db
			session.commit()

			return 'new user created'
	else:
		return "False"

		
#Delete a category
@app.route('/catalog/users/<int:user_id>/delete/<int:facebookId>/<accessToken>/', methods = ['POST'])
def deleteUser(user_id, facebookId, accessToken):
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)
	
	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":
		#delete the uswe by id
		userToDelete = session.query(FbUsers).filter_by(id = user_id).one()
		session.delete(userToDelete)
		session.commit()
		
		#see if user exists. If not log out the user
		users = session.query(FbUsers).filter_by(facebookId = facebookId).all()

		#If the user doesn't exist in the database then logout.
		if users :			
			return 'success'
		else:		
			return 'logout'
	else:
		return "False"		

#This is the primary page
@app.route('/catalog/')
def showCatalog():
	
	#get all categories
	categories = session.query(Category).order_by(Category.name.desc()).all()
	
	#get all gear items
	gearItems = session.query(GearItem).order_by(GearItem.name.desc()).all()
	
	#get a list of the last 10 gear items added
	latestItems = session.query(GearItem.id, GearItem.name, Category.name, Category.id).join(Category).order_by(GearItem.id.desc()).limit(10)
	return render_template('catalog.html', categories = categories, gearItems = gearItems, latestItems = latestItems)	

#JSON: Show Users JSON
@app.route('/catalog/users/JSON')
def usersJSON():
	
	#get the users
	users = session.query(FbUsers).all()
	
	#serialize and return items
	return jsonify(user=[i.serialize for i in users])
	
#JSON: Show Catalog > Category detail JSON
@app.route('/catalog/<int:category_id>/gear/JSON')
def categoryGearJSON(category_id):
	
	#get the category item
	category = session.query(Category).filter_by(id = category_id).one()
	
	#get the list of items
	items = session.query(GearItem).filter_by(category_id = category_id).order_by(GearItem.name.asc()).all()
	
	#serialize and return items
	return jsonify(GearItems=[i.serialize for i in items])

#JSON: Show Catalog > Category > Gear item detail JSON
@app.route('/catalog/<int:category_id>/gear/<int:gear_id>/JSON')
def gearItemJSON(category_id, gear_id):
	
	#get the gear item
	Gear_Item = session.query(GearItem).filter_by(id = gear_id).one()
	
	#serialize and return items
	return jsonify(Gear_Item = Gear_Item.serialize)

#JSON: Show Catalog details
@app.route('/catalog/JSON')
def categoriesJSON():
	
	#get the category items
	categories = session.query(Category).order_by(Category.name.desc()).all()
	
	#serialize and return items
	return jsonify(categories= [r.serialize for r in categories])

#Create a new category
@app.route('/catalog/new/<int:facebookId>/<accessToken>/', methods=['POST'])
def newCategory(facebookId, accessToken):	
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)

	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":
		#set the form name
		newCategory = Category(name = request.form['name'])

		#add to the DB
		session.add(newCategory)

		#commit to the db
		session.commit()
		return 'success'
	else:
		return "False"	
	

#Edit a category
@app.route('/catalog/<int:category_id>/edit/<int:facebookId>/<accessToken>/', methods = ['POST'])
def editCategory(category_id, facebookId, accessToken):
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)

	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":
		
		#edit the category name by id
		editCategory = session.query(Category).filter_by(id = category_id).one()
		if request.form['name']:
			editCategory.name = request.form['name']
			return 'success'
	else:
		return "False"	
		
#Delete a category
@app.route('/catalog/<int:category_id>/delete/<int:facebookId>/<accessToken>/', methods = ['POST'])
def deleteCategory(category_id, facebookId, accessToken):
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)

	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":
		
		#delete the category name by id
		categoryToDelete = session.query(Category).filter_by(id = category_id).one()
		session.delete(categoryToDelete)
		session.commit()
		return 'success'
	else:
		return "False"		

#Create a new gear item
@app.route('/catalog/<int:category_id>/gear/new/<int:facebookId>/<accessToken>/',methods=['POST'])
def newGearItem(category_id, facebookId, accessToken):
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)

	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":
		
		#add form items
		newItem = GearItem(name = request.form['name'], summary = request.form['summary'], price = request.form['price'], category_id = category_id)

		#add to the DB
		session.add(newItem)

		#commit to the db
		session.commit()		
		return 'success'
	else:
		return "False"		

#Edit a gear item
@app.route('/catalog/<int:category_id>/gear/<int:gear_id>/edit/<int:facebookId>/<accessToken>/', methods=['POST'])
def editGearItem(category_id, gear_id, facebookId, accessToken):
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)

	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":
		
		#edit the gear item by id
		editedItem = session.query(GearItem).filter_by(id = gear_id).one()	
		if request.form['name']:
			editedItem.name = request.form['name']
		if request.form['summary']:
			editedItem.summary = request.form['summary']
		if request.form['price']:
			editedItem.price = request.form['price']
		session.add(editedItem)
		session.commit() 
		return 'success'	
	else:
		return "False"		

#Delete a gear item
@app.route('/catalog/<int:category_id>/gear/<int:gear_id>/delete/<int:facebookId>/<accessToken>/', methods = ['POST'])
def deleteGearItem(category_id, gear_id, facebookId, accessToken):

	print "i am here"
	
	#Check to see if user is logged in
	loggedIn = isLoggedIn(accessToken,facebookId)

	#If Facebook agrees that the codes match then save the user to the database.		
	if loggedIn == "True":		
	
		#delete the gear item by id
		itemToDelete = session.query(GearItem).filter_by(id = gear_id).one()	
		session.delete(itemToDelete)
		session.commit()
		return 'success'	
	else:
		return "False"		


if __name__ == '__main__':
	app.debug = True
	app.run(host = '0.0.0.0', port = 8000)
