# Tactical Overview #

This is a League of Legends [Developers Api](https://developer.riotgames.com/) based application, made for
 [The Riot Games API Challenge](https://developer.riotgames.com/discussion/riot-games-api/show/bX8Z86bm). The concept
 is to present a tool to review a finished URF mode game in terms of time-based champions movements around the
 game map throughout the match.

**PLEASE NOTE:** This project is built as a pure web application for the sake of simplicity. It requests Developers Api
 directly, which is possible since it conveniently provides corresponding CORS headers (thanks, Riot!). However, this
 also means that the api key used by the application is placed directly in the browser, thus making this application
 insecure for production use. In order to publish the application, Developers Api calls should be proxied through a
 secure layer.

### Description ###

Project features a website where a user can pick one of a few finished URF games and watch a _very_ schematic
 time-based representation of the match on the game map. The application idea that I got, when NURF was announced, was
 to provide a rough, really high-level 'replay' of the match, giving an impression of how really strategic and
 thoughtful the game is in that game mode. I actually thought that there will be about a day of NURF mode and then it
 will be changed to URF, so I could provide a direct comparison between the two. Since it turned out to be just URF, I
 decided to keep the idea, however now it is supposed to demonstrate how messy and chaotic the match is :)
  
The main challenges of the project:
 
- TimeLine events positioning conversion to Summoner's Rift in Leaflet

    In order to display the map I am partially reusing the absolutely awesome Riot Games
     [Summoner's Rift Preview](http://promo.na.leagueoflegends.com/en/srmapexperience/) website resources (leaflet layer
     configuration and the images). However I had to invent the mapping from game coordinates into ui map coordinates
     myself. Minimap information from [Game Constants](https://developer.riotgames.com/docs/game-constants) helped me a
     bit, but in the end I had to do manual adjustments.
     *Actually, final result is still not ideal. I had to do the
     final adjustments based on initial champions positions, placing them on the summoning platforms, but even when these
     two corner points are adjusted about right, towers, and some other events are shifted. I suspect that the leaflet
     resources do not match real map 1:1 (compare blue side top lane with the minimap image, for example), but
     detailed investigation of the issue in more details is out of scope of this project. It might be worth to just
     rescan the map tiles from the game itself. However I feel like current level of accuracy is good enough for demo
     purposes.*

- Approximating champions positions

    When I first saw 'timeline' part of the match object, my head just exploded with ideas of how to use this data.
    Unfortunately reality turned out to be not that elaborate as Response Classes of match service documentation
    advertised, so I had to improvise in order to reach my goal. And one of the biggest parts was champion positioning.
    To cut the long story short I bring together all timestamped positions (api provides one for every minute), merge
    them with all other available events with position (where participant is killer, victim or assistant), sort by
    timestamp and approximate it linearly by requested timestamp based on 2 closest known points.
    
- Considering deaths and level mystery

    Once champion died, he used to just slowly and sadly walk to his next observable position (because of linear
    approximation). This wasn't that nice, so I am forcing position to summoners platform immediately after death.
    However there is no revive event in timeline, so I had to estimate death timer myself. I am utilising
    [LolWiki Death Timer Formula](http://leagueoflegends.wikia.com/wiki/Death#Death_Timer). One of parameters is level.
    Guess what - there is no direct way to get level based on time in the match response object. So I decided to base
    my approximation of champions level on the number of 'SKILL_LEVEL_UP' events that happened prior to observed time
    moment. You'll have to excuse me for skipping possible impact of 'Quintessence of Revival'.
    
### Tech stack ###

I like to learn new technologies by implementing a side project. This was a perfect chance for me to try out tools
 and libraries that I haven't used before:

- [Webpack](http://webpack.github.io/)
- [Babel](http://babeljs.io/)
- [Bacon.js](https://baconjs.github.io/)
- [React](https://facebook.github.io/react/)
- [Materialize](http://materializecss.com/)
- [Leaflet](http://leafletjs.com/)
- [Ion.RangeSlider](http://ionden.com/a/plugins/ion.rangeSlider/en.html)
- and, of course, the actual [Developers Api](https://developer.riotgames.com/).

### Installation ###

Given that you've read and understood the **NOTE** in the beginning you can start the
project locally. You will need installed [Node.js](https://nodejs.org/).

Clone or download the repository, then run inside project directory: 

> npm install
>
> npm install -g grunt-cli

### Configuration ###

Root folder of the project contains config.json file. You need to set **apiKey** for application to work. Here is the
description of all options there:
#### apiKey ####
Your personal Api Key used to query the api. You can register for free at [Developers Api](https://developer.riotgames.com/)
to get your own.

**REMEMBER: Do not commit or publish your Api Key anywhere. This config file is part of the web
application, which means that its contents is insecure. It is suggested only for local use.**
#### serviceThrottling ####
Free api key that you get by default has a usage limit of 10 request(s) every 10 second(s) and 500 request(s) every 10
minute(s). In order to address that limit, I have included service throttling mechanism to all (but static) api calls.
This setting defines the delay between each call, defaulting to 1000 ms
#### apiUrl ####
Main part of api url. I play on EUNE, so it defaults to that realm.
#### staticDataPrefix ####
Part of static calls urls. Doesn't really worth changing it unless Riot changes the services url. 
#### apiRegion ####
Region requested. I play on EUNE, so it defaults to that region.
#### matchApiUrl ####
Match Api Url. Is requested without timeline for short description in Match Picker. Is requested with timeline in Rift
Map. *With the latest update Riot removed Blue Golem and Red Lizard ELITE_MONSTER_KILL events, which is unfortunate,
because application actually supports those. I have actually a cached example of the game which has those events to
prove that they were there. Maybe it's a bug. Dragon and Baron Nashor kills are still in place as of now.*
#### championApiUrl ####
Champion Api Url (static). This application uses (and therefore requests) only 'images' part of the data. It is not
affected by **serviceThrottling**. 
#### challengeApiUrl ####
Challenge Api Url. Used to retrieve chunks of games. I've hardcoded 10 dates from the latest 8 hours of URF mode. As of
now (4 days after end of URF) they are still working. Just in case, I have included 1 hardcoded game id which is set by
default in Match Picker.

### Building ###

Once you have everything installed and configured you have two options:

1. Build dist version into ./dist directory. You can start it just by opening index.html in your browser.
> grunt build
1. Start a local webpack-developer server and launch default browser
> grunt serve

### Testing ###

I have used a small number of tests during development for convenience. Even though they are part of the repository,
they will fail, since they are relying on some static data, submitting which is against the rules of the Api Challenge.
It was removed from the repository.

Installation and building procedures were tested under Windows 8.1 x64 and CentOS 7.0 x64 with node v0.12.2

### Troubleshooting ###

Please note that since images for Summoner's Rift map are served directly from promo.na.leagueoflegends.com, AdBlock
extension consider those as suspicious. Not that I blame it, but if you see gray block instead of map, disable AdBlock
extension for the time of testing.
