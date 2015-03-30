# P2-Tournament-Results

Full Stack Web Developer Nanodegree

P2: Tournament Results

The functions needed to run the tests can be viewed here:

https://github.com/aaronmclean1/P2-Tournament-Results/blob/master/tournament.py

Here is the SQL that I used to set up the DB:

https://github.com/aaronmclean1/P2-Tournament-Results/blob/master/tournament.sql

Here is the Python that tests the DB:

I had to edit line 52 in this file in order for it to handle a FK that I had set up.

If I remove the FK from my table and line 52 the test still runs fine. 

https://github.com/aaronmclean1/P2-Tournament-Results/blob/master/tournament_test.py

Code was added to handle odd number of players and a bye for extra credit

How to run the code:

Follow these directions to Install GIT, VirtualBox, Vagrant

https://www.udacity.com/wiki/ud197/install-vagrant

Use my files for testing. Copy them to your local Git folder:

https://github.com/aaronmclean1/P2-Tournament-Results

Follow these steps:

cd fullstack\vagrant

vagrant up

vagrant ssh

cd /vagrant/tournament

python tournament_test.py