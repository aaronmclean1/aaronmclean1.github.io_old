# Notes for later
# http://google-styleguide.googlecode.com/svn/trunk/pyguide.html

import webbrowser

#Define our class
class Movie():

    #data for our class
    #Constructor
    def __init__(self, title, movie_comment, poster_image_url, trailer_youtube_url):        
        #instance variables
        self.title = title
        self.movie_comment = movie_comment
        self.poster_image_url = poster_image_url
        self.trailer_youtube_url = trailer_youtube_url

    #instance methods for our class
    def showTrailer(self):
        webbrowser.open(self.trailer_youtube_url)
        
