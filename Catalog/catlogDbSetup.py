import os
import sys

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
 
Base = declarative_base()
 
class Category(Base):
    __tablename__ = 'category'
   
    id = Column(Integer, primary_key=True)
    name = Column(String(250), nullable=False)

    @property
    def serialize(self):
       """Return object data in easily serializeable format"""
       return {
           'name'         : self.name,
           'id'         : self.id
       }
 
class GearItem(Base):
    __tablename__ = 'gear_item'
    
    id = Column(Integer, primary_key = True)  
    name =Column(String(80), nullable = False)
    price = Column(String(8))    
    category_id = Column(Integer,ForeignKey('category.id'))
    summary = Column(String(250))
    category = relationship(Category) 

    @property
    def serialize(self):
       """Return object data in easily serializeable format"""
       return {
           'name'			: self.name,
           'summary'	: self.summary,
           'id'				: self.id,
           'price'			: self.price
           
       }
       
class FbUsers(Base):
    __tablename__ = 'fbusers'
   
    id = Column(Integer, primary_key=True)
    fbid = Column(Integer, nullable=False)
    name = Column(String(250), nullable=False)

    @property
    def serialize(self):
       """Return object data in easily serializeable format"""
       return {
           'name'         : self.name,
           'id'         : self.id,
           'fbid'         : self.fbid
       }       
 

engine = create_engine('sqlite:///catalog.db')


 

Base.metadata.create_all(engine)
