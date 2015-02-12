import media
import fresh_tomatoes

#create multiple instances of our class here
men_in_black = media.Movie("Men In Black", "Two men protecting our universe", "http://www.movieposter.com/posters/archive/main/25/MPW-12559", "https://www.youtube.com/watch?v=jM2tgZBZtQw")
top_gun = media.Movie("Top Gun", "The best pilots in the Navy", "http://www.movieposter.com/posters/archive/main/15/A70-7600", "https://www.youtube.com/watch?v=kyvkjzPCKEc")
ice_age = media.Movie("Ice Age", "A prehistoric squirrel and his nut", "http://www.movieposter.com/posters/archive/main/31/A70-15720", "https://www.youtube.com/watch?v=cMfeWyVBidk")
men_of_honor = media.Movie("Men of Honor", " Navy Divers and the man who trained them", "http://www.movieposter.com/posters/archive/main/99/MPW-49690", "https://www.youtube.com/watch?v=E21xH5vg0yo")
independence_day = media.Movie("Independence Day", "The aliens are coming!", "http://www.movieposter.com/posters/archive/main/26/A70-13387", "https://www.youtube.com/watch?v=UqNRkA0Zq3Q")
divergent  = media.Movie("Divergent ", "Tris does not fit in", "http://www.movieposter.com/posters/archive/main/191/MPW-95784", "https://www.youtube.com/watch?v=sutgWjz10sM")

#build an array called movies
movies = [men_in_black, top_gun, ice_age, men_of_honor, independence_day, divergent]

#open our html
fresh_tomatoes.open_movies_page(movies)


