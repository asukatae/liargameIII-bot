const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');
var teamRed = new LinkedList();
var teamBlue = new LinkedList();
var numPlayers=0; //also num of rounds
var numRoundsLeftOver=0;
var middleRound=0;

var strSmuggler;
var idSmuggler;
var strOfficer;
var idOfficer;

var gameStart=false;

var numSmuggle=-1;

var alreadySmuggled=false;

var i=0;

client.on('ready', () => {
  client.user.setGame('Let\'s play Liar Game-Contraband!');
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  var content = msg.content //contains all the text Ex: !addrole Member
  var parts = content.split(" "); //splits everything up on spaces so you'll have an array of two strings
  
  if (msg.isMentioned(client.user)) {
    msg.channel.send('Welcome to a game of liar game-contraband!\nCommands:\n`l!rules` `l!join` `l!play`');
  }
  if (msg.content === config.prefix  + '!' + 'rules') {
	explainRules(msg);
  }
  if (msg.content === config.prefix  + '!' + 'join') {
	join(msg);
  }
  if (msg.content === config.prefix  + '!' + 'play') {
	if(ifEvenandNotZero()){
		play(msg);
	}
	else{
		msg.channel.send('We don\'t have an even number of people to play the game.');
	}
  }

  if(parts[0] === config.prefix + '!' + 'smuggle'){
  	if(msg.author.toString()===strSmuggler){
  		if(alreadySmuggled == false){
			if (checkSmuggle(parts[1])){
  				numSmuggle = parts[1];
  				alreadySmuggled = true;
  			}else{
  				msg.channel.send("Please note that the number has to be between 0 and 100000000 (100m). Try l!smuggle number again!");
  			}
  		}else{
  			msg.channel.send('You\'ve already smuggled once.');
  		}
  	}else{
  		msg.channel.send('You are not authorized with this command.');
  	}
  }

  if((parts[0] === config.prefix + '!' + 'pass')||(parts[0] === config.prefix + '!' + 'doubt')){

  }







});

function explainRules(msg){
    msg.channel.send('Welcome to a game of Liar Game-Contraband. \n__**How to play the game:**__\nThere are two teams (countries), team red and team blue. \nThe objective of the game is to smuggle money from the opposing country to the 3rd neutral country.   The smuggler will DM the host how much money he try to smuggle. However, the opposing country has an inspector customs officer that can either pass or doubt a certain amount of money   as to whether a smuggling took place.   If he passes, then the amount smuggled goes to the opposing team. If he doubts, there are two cases: if the money is less than his amount, it\'s a smuggling success for the smuggling team. He will have to pay 1/2 of his doubted amount. This is called an “indemnity”. If the smuggled money is equal or greater than the doubted amount, then the customs officer confiscates the money for his team. Each person can only smuggle at most 100,000,000. You can only only doubt 3,000,000 the least. Any money left in a countries ATM once the round is finished will be given to the opposing country.');
}
function join(msg){

	if(teamRed.contains(msg.author.toString())||teamBlue.contains(msg.author.toString())){
		msg.reply('You\'ve already joined');
	}
	//if it's Tensai
	else if('<@85614143951892480>'=== msg.author.toString()){
		console.log(`Tensai tried to join the game`);
	}
	else{
		if (numPlayers%2==0){
			teamRed.insert(msg.author.toString());
			numPlayers++;
		}else{
			teamBlue.insert(msg.author.toString());
			numPlayers++;
		}
		
	}
	client.channels.get('340390312847343616').send('Team Red: ' + teamRed.printList() + '\nTeam Blue: '+ teamBlue.printList());

}
function ifEvenandNotZero(){
	if ((numPlayers%2 == 0) && (numPlayers!=0)){
		return true;
	}
	else{
		return false;
	} 
		
}	
function play(msg){
	if (gameStart==true){
		msg.channel.send("Game already started");
	}else{
		gameStart=true;
		numRoundsLeftOver=numPlayers;
		middleRound=numRoundsLeftOver/2;
			var rounds = teamRed.getSize();
			msg.channel.send("Team Red Smuggler: "+ teamRed.findAt(i).toString() +"\nTeam Blue Customs Officer: "+teamBlue.findAt(i).toString()+"\nplease stand forth.");
			strSmuggler = teamRed.findAt(i).toString();
			idSmuggler= strSmuggler.replace(/[<@!>]/g, '');
			client.fetchUser(idSmuggler).then(user => {user.send("You are a smuggler! DM me how much you’ll be smuggling (0~100M). ie. l!smuggle 50000000")});
			strOfficer = teamBlue.findAt(i).toString();
			idOfficer= strOfficer.replace(/[<@!>]/g, '');
			client.fetchUser(idOfficer).then(user => {user.send("You are an officer! DM me if you pass, or doubt a certain amount of money (3~100M). ie. l!pass or l!doubt 50000000")});
			msg.channel.send("If you are a smuggler, DM me how much you’ll be smuggling (0~100M).\nIf you are an officer, DM me if you pass, or doubt a certain amount of money (3~100M).");
			
	}
}
function checkSmuggle(num){
	if(num>=0 && num<=100000000){
		return true;
	}else{
		return false;
	}

}

client.login(config.token);
