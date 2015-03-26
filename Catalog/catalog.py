from flask import Flask, render_template, request, redirect,jsonify, url_for
from sqlalchemy import func
from sqlalchemy.orm import aliased
app = Flask(__name__)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from catlogDbSetup import Base, Category, GearItem, FbUsers

engine = create_engine('sqlite:///catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()

#This is the primary page
@app.route('/catalog/addUser/<int:fbid>/<name>/')
def addUser(fbid,name):
	
	#see if user exists. If not add user
	users = session.query(FbUsers).filter_by(fbid = fbid).all()
	if users :
		return jsonify(user=[i.serialize for i in users])
	else:	
		#add user
		newUser = FbUsers(name = name, fbid = fbid)	

		#add to the DB
		session.add(newUser)

		#commit to the db
		session.commit()
		
		return 'new user created'

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
@app.route('/catalog/new/', methods=['POST'])
def newCategory():
	#set the form name
	newCategory = Category(name = request.form['name'])
	
	#add to the DB
	session.add(newCategory)
	
	#commit to the db
	session.commit()
	return 'success'

#Edit a category
@app.route('/catalog/<int:category_id>/edit/', methods = ['POST'])
def editCategory(category_id):
	#edit the category name by id
	editCategory = session.query(Category).filter_by(id = category_id).one()
	if request.form['name']:
		editCategory.name = request.form['name']
		return 'success'

#Delete a category
@app.route('/catalog/<int:category_id>/delete/', methods = ['POST'])
def deleteCategory(category_id):
	#delete the category name by id
	categoryToDelete = session.query(Category).filter_by(id = category_id).one()
	session.delete(categoryToDelete)
	session.commit()
	return 'success'

#Create a new gear item
@app.route('/catalog/<int:category_id>/gear/new/',methods=['POST'])
def newGearItem(category_id):
	
	#add form items
	newItem = GearItem(name = request.form['name'], summary = request.form['summary'], price = request.form['price'], category_id = category_id)
	
	#add to the DB
	session.add(newItem)
	
	#commit to the db
	session.commit()		
	return 'success'

#Edit a gear item
@app.route('/catalog/<int:category_id>/gear/<int:gear_id>/edit/', methods=['POST'])
def editGearItem(category_id, gear_id):
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

#Delete a gear item
@app.route('/catalog/<int:category_id>/gear/<int:gear_id>/delete', methods = ['POST'])
def deleteGearItem(category_id,gear_id):
	
	#delete the gear item by id
	itemToDelete = session.query(GearItem).filter_by(id = gear_id).one()	
	session.delete(itemToDelete)
	session.commit()
	return 'success'

if __name__ == '__main__':
	app.debug = True
	app.run(host = '0.0.0.0', port = 8000)
