from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
 
from catlogDbSetup import Category, Base, GearItem
 
engine = create_engine('sqlite:///catalog.db')
# Bind the engine to the metadata of the Base class so that the
# declaratives can be accessed through a DBSession instance
Base.metadata.bind = engine
 
DBSession = sessionmaker(bind=engine)
# A DBSession() instance establishes all conversations with the database
# and represents a "staging zone" for all the objects loaded into the
# database session object. Any change made against the objects in the
# session won't be persisted into the database until you call
# session.commit(). If you're not happy about the changes, you can
# revert all of them back to the last commit by calling
# session.rollback()
session = DBSession()



#Gear for Soccer
category1 = Category(name = "Soccer")

session.add(category1)
session.commit()

gearItem1 = GearItem(name = "Ball", summary = "Leather ball. Size 5.", price = "$7.50", category = category1)
session.add(gearItem1)
session.commit()

gearItem2 = GearItem(name = "Shin Guards", summary = "2 Shin guards. Size Large. Color Black", price = "$17.50", category = category1)
session.add(gearItem2)
session.commit()

category2 = Category(name = "Skiing")

session.add(category1)
session.commit()

gearItem1 = GearItem(name = "Skis", summary = "Pair of Rossignol skis. Size Available 140,150,160,170.", price = "$900", category = category2)
session.add(gearItem1)
session.commit()

gearItem2 = GearItem(name = "Boots", summary = "Pair of mens ski boots. Size Large. Color Black", price = "$317.50", category = category2)
session.add(gearItem2)
session.commit()


user1 = FbUsers(name = "Aaron McLean", fbid = "1234")
session.add(user1)
session.commit()

user2 = FbUsers(name = "Amy McLean", fbid = "5678")
session.add(user2)
session.commit()

print "added gear items!"
