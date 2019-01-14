weekly-leaderboard
==================

This application is an example of a weekly ranking and reward system for a system with 10 million users, using mongodb and nodejs.

Before running the application, check that your mongodb settings are correct under config folders.

The application was created in 3 stages. Server, simulation and client interfaces.

### Server

It is the system where requests and mongodb collections are managed. At the end of each day, the user makes the calculations and the total prize to be distributed. It distributes weekly prizes at the end of each week.

### Simulasyon

It is the system that exemplifies 10 million user records and 60 users every minute.

### Client

This is the section where the rankings are shown. It also manages instant record creation for the user name in the system.


## Usage

If your Mongodb connections are correct, just run the following code in the project directory. The first running will take a little longer because of 10 million users are created.

```shell
$ npm start
```

if you want to debug. I've prepared a lot of options for the vscode editor. You can use it there.