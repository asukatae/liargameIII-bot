const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');
var teamRed = new LinkedList();
var teamBlue = new LinkedList();
var numPlayers=0; //also num of rounds
var numRounds;
var round; //which round it is
var midRound;

var moneyInOppositeCountryRed= new LinkedList();
var moneyInOppositeCountryBlue= new LinkedList();
var moneySmuggledRed= new LinkedList();
var moneySmuggledBlue= new LinkedList();
var moneyInThirdCountryRed=new LinkedList();
var moneyInThirdCountryBlue = new LinkedList();
var moneySumRed= new LinkedList();
var moneySumBlue= new LinkedList();

var strSmuggler;
var idSmuggler;
var strOfficer;
var idOfficer;
var teamSmuggler;
var teamOfficer;

var gameStart=false;

var numSmuggle=-1;
var numDoubt=-1;

var alreadySmuggled=false;
var alreadyPassorDoubt=false;

var i=0;

client.on('ready', () => {
  client.user.setGame('Let\'s play Liar Game-Contraband!');
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  var content = msg.content //contains all the text Ex: !addrole Member
  var parts = content.split(" "); //splits everything up on spaces so you'll have an array of two strings
  
  if (msg.isMentioned(client.user)) {
    msg.channel.send('Welcome to a game of Liar Game-Contraband!\nCommands:\n`l!rules` `l!join` `l!play` `l!quit`');
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
  if (msg.content === config.prefix  + '!' + 'quit') {
      clearAll();
      msg.channel.send('Game restart.');
  }

  if(parts[0] === config.prefix + '!' + 'smuggle'){
  	if(msg.author.toString()===strSmuggler){
  		if(alreadySmuggled == false){
			if (checkSmuggle(parts[1])){
  				numSmuggle = parts[1];
  				alreadySmuggled = true;
  				msg.channel.send('You have smuggled '+ numSmuggle +'.');
                
                msgOfficer(msg);

	
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

  if(parts[0] === config.prefix + '!' + 'pass'){
  	if(msg.author.toString()===strOfficer){
  		if(alreadyPassorDoubt == false){
  				alreadyPassorDoubt = true;
  				msg.channel.send('You have passed.');
  				client.channels.get('340390312847343616').send(teamSmuggler+" Smuggler smuggled "+ numSmuggle+ ", while "+teamOfficer+ " Customs Officer passed. Smuggling success!");
  				
                calculateTransferPass();
  			    calculateIndividualScores(msg);
                calculateTotalScore(msg);
            
                round++;
                i++;
                if( round <= midRound){
                    clearRound();
                    strSmuggler = teamRed.findAt(i).toString();
                    idSmuggler= strSmuggler.replace(/[<@!>]/g, '');
                    strOfficer = teamBlue.findAt(i).toString();
                    idOfficer= strOfficer.replace(/[<@!>]/g, '');
                    msgSmuggler(msg);
                }else if(round>numRounds){
                    results(msg);
                         
                }
                
                else if(round > midRound){
                    clearRound();
                    console.log(round+"&"+midRound);
                    if(round ==midRound+1){
                        i=0;
                    }
                    teamSmuggler='Team Blue';
                    teamOfficer='Team Red';
                    
                    strSmuggler = teamBlue.findAt(i).toString();
                    idSmuggler= strSmuggler.replace(/[<@!>]/g, '');
                    strOfficer = teamRed.findAt(i).toString();
                    idOfficer= strOfficer.replace(/[<@!>]/g, '');
                    
                    msgSmuggler(msg);
	  			
                }
  			
  			
  		}else{
  			msg.channel.send('You\'ve already made your command.');
  		}
  	}else{
  		msg.channel.send('You are not authorized with this command.');
  	}
  }

  if(parts[0] === config.prefix + '!' + 'doubt'){
  	if(msg.author.toString()===strOfficer){
  		if(alreadyPassorDoubt == false){
			if (checkDoubt(parts[1])){
  				numDoubt = parts[1];
  				alreadyPassorDoubt = true;
	  			msg.channel.send('You have doubted '+ numDoubt +'.');

	  			if(numSmuggle==0){
					client.channels.get('340390312847343616').send("Smuggler smuggled 0, while inspector doubts "+ numDoubt+ ". Smuggling success!");
	  			}else if (smugglingSuccess(numSmuggle,numDoubt)){
                  console.log(numSmuggle+"&"+numDoubt);
                    client.channels.get('340390312847343616').send("Smuggler smuggled "+ numSmuggle+ " , which is more than doubt "+ numDoubt+ ". Smuggling success! This might be error");
                }else{
                    client.channels.get('340390312847343616').send("Smuggler smuggled "+ numSmuggle+ ", which is less than or equal to doubt "+ numDoubt+ ". Smuggling failed!");
                }
                
                
	  			
                if(numSmuggle==0){
                   calculateTransferDoubtSmuggleZero(msg);
                }else if (smugglingSuccess(numSmuggle,numDoubt)){
                   calculateTransferDoubtSmuggleSuccess(msg);
                }else {
                   calculateTransferDoubtSmuggleFailure(msg);      
                }
                
  			    calculateIndividualScores(msg);
                calculateTotalScore(msg);
                
                
                
                round++;
                i++;
                if( round <= midRound){
                    clearRound();
                    strSmuggler = teamRed.findAt(i).toString();
                    idSmuggler= strSmuggler.replace(/[<@!>]/g, '');
                    strOfficer = teamBlue.findAt(i).toString();
                    idOfficer= strOfficer.replace(/[<@!>]/g, '');
                    msgSmuggler(msg);
                }else if(round>numRounds){
                    results(msg);
                         
                }
                
                else if(round > midRound){
                    clearRound();
                    
                    if(round ==midRound+1){
                        i=0;
                    }
                    teamSmuggler='Team Blue';
                    teamOfficer='Team Red';
                    
                    strSmuggler = teamBlue.findAt(i).toString();
                    idSmuggler= strSmuggler.replace(/[<@!>]/g, '');
                    strOfficer = teamRed.findAt(i).toString();
                    idOfficer= strOfficer.replace(/[<@!>]/g, '');
                    
                    msgSmuggler(msg);
	  			
                }
                
  			}else{
  				msg.channel.send("Please note that the number has to be between 1 and 100000000 (100m). Try l!doubt number again!");
  			}
  		}else{
  			msg.channel.send('You\'ve already made your command.');
  		}
  	}else{
  		msg.channel.send('You are not authorized with this command.');
  	}
  }



});

function explainRules(msg){
    msg.channel.send('__**How to play the game:**__\nThere are two teams (countries), team red and team blue. \nThe objective of the game is to smuggle money from the opposing country to the 3rd neutral country.   The smuggler will DM the host how much money he try to smuggle. However, the opposing country has an inspector customs officer that can either pass or doubt a certain amount of money as to whether a smuggling took place.   If he passes, then the amount smuggled goes to the opposing team. If he doubts, there are three cases: if the money is less than or equal to his doubt, it\'s a smuggling failure, and the customs officer confiscates the money for his team. If the smuggled money is greater than the doubted amount, it\'s a smuggling success and the customs officer will have to pay 1/2 of his doubted amount. This is called an “indemnity”. The last case is if the smuggler smuggled 0, and the inspector doubts- it\'s a smuggling success and this will also trigger an indemnity. Each person can only smuggle at most 100,000,000. Any money left in a countries ATM once the round is finished will be given to the opposing country.');
}

function join(msg){

	if(gameStart==true){
		client.channels.get('340390312847343616').send("The game already started. You cannot join.");
	}
	else if (teamRed.contains(msg.author.toString())||teamBlue.contains(msg.author.toString())){
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
		client.channels.get('340390312847343616').send('Team Red: ' + teamRed.printList() + '\nTeam Blue: '+ teamBlue.printList());
	}
	
}

function ifEvenandNotZero(){
	if ((numPlayers%2 == 0) && (numPlayers!=0)){
		return true;
	}
	else{
		return false;
	} 
}	

async function play(msg){
	if (gameStart==true){
		msg.channel.send("Game already started");
	}else{
		gameStart=true;
        gameSetUp();


        msgSmuggler(msg);
	}
}
function checkSmuggle(num){
	if(num>=0 && num<=100000000){
		return true;
	}else{
		return false;
	}
}
function checkDoubt(num){
	if(num>=1 && num<=100000000){
		return true;
	}else{
		return false;
	}
}
function smugglingSuccess(numSmuggle, numDoubt){
	if (+numSmuggle > +numDoubt){
		return true;
	}else{
		return false;
	}
}
function clearRound(){
	alreadySmuggled=false;
	alreadyPassorDoubt=false;
}

function gameSetUp(){
    teamSmuggler='Team Red';
    teamOfficer='Team Blue';
    numRounds= numPlayers;
    round=1;
    midRound=numRounds/2;
    
    strSmuggler = teamRed.findAt(i).toString();
	idSmuggler= strSmuggler.replace(/[<@!>]/g, '');
	strOfficer = teamBlue.findAt(i).toString();
	idOfficer= strOfficer.replace(/[<@!>]/g, '');
    
    //money in opposite country RED
    var x=0;
	for (x = 0; x < teamRed.getSize(); x++) {
    	moneyInOppositeCountryRed.insert(100000000);
	}
    //money in opposite country BLUE
    x=0;
	for (x = 0; x < teamBlue.getSize(); x++) {
    	moneyInOppositeCountryBlue.insert(100000000);
	}
    //money smuggled RED
    x=0;
	for (x = 0; x < teamRed.getSize(); x++) {
    	moneySmuggledRed.insert(0);
	}
    //money smuggled BLUE
    x=0;
	for (x = 0; x < teamBlue.getSize(); x++) {
    	moneySmuggledBlue.insert(0);
	}
    //money 3rd country RED
    x=0;
	for (x = 0; x < teamRed.getSize(); x++) {
    	moneyInThirdCountryRed.insert(100000000);
	}
    //money 3rd country BLUE
    x=0;
	for (x = 0; x < teamBlue.getSize(); x++) {
    	moneyInThirdCountryBlue.insert(100000000);
	}
    //sumRED
    x=0;
	for (x = 0; x < teamRed.getSize(); x++) {
    	moneySumRed.insert(0);
	}
    //sumBlue
    x=0;
	for (x = 0; x < teamBlue.getSize(); x++) {
    	moneySumBlue.insert(0);
	}
}

function msgSmuggler(msg){
   
    msg.channel.send("Round "+ round +"\n"+teamSmuggler+" Smuggler: "+ strSmuggler+"\n"+teamOfficer+ " Customs Officer: "+strOfficer+"\nplease stand forth.");

	client.fetchUser(idSmuggler).then(user => {user.send("You are a smuggler! DM me how much you’ll be smuggling (0~100M). ie. l!smuggle 50000000")});
	msg.channel.send(teamSmuggler+" Smuggler "+ strSmuggler+", DM me how much you’ll be smuggling (0~100M).");
}

function msgOfficer(msg){
	client.channels.get('340390312847343616').send(teamOfficer+ " Officer "+strOfficer+", declare if you pass, or doubt a certain amount of money (1~100M). ie. l!pass or l!doubt 50000000");
    
}

function calculateIndividualScores(msg){
    var index=0;
    for (index = 0; index < teamRed.getSize(); index++) { 
        var smuggled = moneySmuggledRed.findAt(index).getData();
        var in3rdCountry= moneyInThirdCountryRed.findAt(index).getData();
        
        var j=0;
        var leftOver=0;
        for(j=0; j<teamBlue.getSize(); j++){
           
            mioc=moneyInOppositeCountryBlue.findAt(j).getData();
           
            leftOver = +leftOver + +mioc;
        }
        leftOver= leftOver/teamRed.getSize();
        
        var sum= +smuggled + +in3rdCountry + +leftOver;
        moneySumRed.findAt(index).editData(sum);
        
        client.channels.get('340390312847343616').send(teamRed.findAt(index).getData()+": "+sum);
        
    }
    index=0;
    for (index = 0; index < teamBlue.getSize(); index++) { 
        var smuggled = moneySmuggledBlue.findAt(index).getData();
        var in3rdCountry= moneyInThirdCountryBlue.findAt(index).getData();
        
        var j=0;
        var leftOver=0;
        for(j=0; j<teamRed.getSize(); j++){
            
            leftOver = +leftOver + +moneyInOppositeCountryRed.findAt(j).getData();
        }
        leftOver= leftOver/teamBlue.getSize();
        
        var sum= +smuggled + +in3rdCountry + +leftOver;
        moneySumBlue.findAt(index).editData(sum); 
        client.channels.get('340390312847343616').send(teamBlue.findAt(index).getData()+": "+sum);
    }
}

function calculateTransferPass(){
    if(teamSmuggler=='Team Red'){
        var mioc= moneyInOppositeCountryRed.findAt(i).getData();
        moneyInOppositeCountryRed.findAt(i).editData(mioc-numSmuggle);
        moneySmuggledRed.findAt(i).editData(numSmuggle);
        
    }else{
        var mioc= moneyInOppositeCountryBlue.findAt(i).getData();
        moneyInOppositeCountryBlue.findAt(i).editData(mioc-numSmuggle);
        moneySmuggledBlue.findAt(i).editData(numSmuggle);
    }
    
}
function calculateTransferDoubtSmuggleZero(msg){
    var indemnity=numDoubt/2;
    if (teamOfficer=='Team Blue'){
        var mitc = moneyInThirdCountryBlue.findAt(i).getData();
        moneyInThirdCountryBlue.findAt(i).editData(mitc-indemnity);
        moneySmuggledRed.findAt(i).editData(indemnity);

    }else{ //Team Red is Team Officer
        var mitc = moneyInThirdCountryRed.findAt(i).getData();
        moneyInThirdCountryRed.findAt(i).editData(mitc-indemnity);
        moneySmuggledBlue.findAt(i).editData(indemnity);
    }
    client.channels.get('340390312847343616').send(teamOfficer+" Customs Officer pays "+indemnity +" to " + teamSmuggler +" Smuggler.");
}
function calculateTransferDoubtSmuggleSuccess(msg){
    var indemnity=numDoubt/2;
    if(teamSmuggler=='Team Red'){
        var miocr= moneyInOppositeCountryRed.findAt(i).getData();
        moneyInOppositeCountryRed.findAt(i).editData(miocr-numSmuggle);
        moneySmuggledRed.findAt(i).editData(+numSmuggle+ +indemnity);
        var mitcb= moneyInThirdCountryBlue.findAt(i).getData();
        moneyInThirdCountryBlue.findAt(i).editData(mitcb-indemnity);
        
    }else{
        var miocb= moneyInOppositeCountryBlue.findAt(i).getData();
        moneyInOppositeCountryBlue.findAt(i).editData(miocb-numSmuggle);
        moneySmuggledBlue.findAt(i).editData(+numSmuggle+ +indemnity);
        var mitcr= moneyInThirdCountryRed.findAt(i).getData();
        moneyInThirdCountryRed.findAt(i).editData(mitcr-indemnity);
    }
    
}
function calculateTransferDoubtSmuggleFailure(msg){
    if(teamSmuggler=='Team Red'){
        var mioc= moneyInOppositeCountryRed.findAt(i).getData();
        moneyInOppositeCountryRed.findAt(i).editData(mioc-numSmuggle);
        var mitcb=moneyInThirdCountryBlue.findAt(i).getData();
        moneyInThirdCountryBlue.findAt(i).editData(+mitcb + +numSmuggle);
        
    }else{
        var mioc= moneyInOppositeCountryBlue.findAt(i).getData();
        moneyInOppositeCountryBlue.findAt(i).editData(mioc-numSmuggle);
        var mitcr=moneyInThirdCountryRed.findAt(i).getData();
        moneyInThirdCountryRed.findAt(i).editData(+mitcr+ +numSmuggle);
    }
}

function calculateTotalScore(msg){
    var index=0;
    var sumRed=0;
    console.log(moneySumRed.printList());
    for (index = 0; index< moneySumRed.getSize(); index++){
        sumRed= +sumRed + +moneySumRed.findAt(index).getData();
    }
    index=0;
    var sumBlue=0;
    for (index = 0; index< moneySumBlue.getSize(); index++){
        sumBlue= +sumBlue + +moneySumBlue.findAt(index).getData();
    }
    client.channels.get('340390312847343616').send("Team Red: "+sumRed +" Team Blue: "+sumBlue);
}
function results(msg){
    var index=0;
    var sumRed=0;
    console.log(moneySumRed.printList());
    for (index = 0; index< moneySumRed.getSize(); index++){
        sumRed= +sumRed + +moneySumRed.findAt(index).getData();
    }
    index=0;
    var sumBlue=0;
    for (index = 0; index< moneySumBlue.getSize(); index++){
        sumBlue= +sumBlue + +moneySumBlue.findAt(index).getData();
    }
    
    //display results
    if (sumRed==sumBlue){
        client.channels.get('340390312847343616').send("Result: Team Red and Team Blue tied!");
        
    }else if(sumRed> sumBlue){
        client.channels.get('340390312847343616').send("Result: Team Red has won the game!");
    }else{
        client.channels.get('340390312847343616').send("Result: Team Blue has won the game!");
    }
    clearAll();
    client.channels.get('340390312847343616').send("Press l!join and l!play to play the game again!");
    
}

function clearAll(){
teamRed.clear();
teamBlue.clear();
numPlayers=0; //also num of rounds
numRounds=0;
round=0; //which round it is
midRound=0;

moneyInOppositeCountryRed.clear();
moneyInOppositeCountryBlue.clear();
moneySmuggledRed.clear();
moneySmuggledBlue.clear();
moneyInThirdCountryRed.clear();
moneyInThirdCountryBlue.clear();
moneySumRed.clear();
moneySumBlue.clear();

strSmuggler="";
idSmuggler="";
strOfficer="";
idOfficer="";
teamSmuggler="";
teamOfficer="";

gameStart=false;

numSmuggle=-1;
numDoubt=-1;

alreadySmuggled=false;
alreadyPassorDoubt=false;

i=0;
}

client.login(config.token);
