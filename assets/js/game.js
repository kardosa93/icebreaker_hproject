// Create a new game instance 600px wide and 450px tall:
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-area');
var socketClient;

var Welcome = {

    preload : function() {
        // Loading images is required so that later on we can create sprites based on the them.
        // The first argument is how our image will be refered to, 
        // the second one is the path to our file.
        game.load.image('welcome', './assets/images/welcome.png');
    },

    create: function () {
        socketClient = io.connect();

        // Add a sprite to your game, here the sprite will be the game's logo
        // Parameters are : X , Y , image name (see above) 
        this.add.button(0, 0, 'welcome', this.startGame, this);
    },
    
    startGame: function () {
        // Change the state to the name selection scene
        this.game.state.start('PlayerName');
    }
};

var textStyle, text;

var PlayerName = {
    preload : function() {
        // Here we load all the needed resources for the level.
        // In our case, that's just two squares - one for the snake body and one for the apple.
        game.load.image('playerBg', './assets/images/simple.png');
        game.load.image('buttonContinue', './assets/images/buttonContinue.png');
    },

    create : function() {
        this.add.sprite(0, 0, 'playerBg');
        this.add.button(590, 485, 'buttonContinue', this.startTopic, this);

        var intro = "You don’t have many friends? Are you afraid of talking to strangers? Here is the right Ice Breaker game for you! Find a topic that interests you and start having some great conversation questions!\n \n This game is a prototype, the questions can be found online at: http://conversationstartersworld.com/250-conversation-starters/";
        textStyle = { font: "bold 23px sans-serif", fill: "#fff", wordWrap: true, align: "center" };
        text = game.add.text(game.world.centerX, 250, intro, textStyle);
        text.anchor.set(0.5);
        text.wordWrapWidth = 710;
        
        document.getElementById('textboxName').style.display="inline";
        document.getElementById('textboxName').value = "";
        document.getElementById('textboxName').focus();
    },

    startTopic: function () {
        var inputName = document.getElementById('textboxName').value;
        document.getElementById('textboxName').style.display="none";
        
        // Emitting event, send en event to everyone including the sender
        socketClient.emit('playerName', inputName);

        this.game.state.start('Topic');
    }
};

var Topic = {

    preload : function() {
        game.load.image('topics', './assets/images/topic.png');
        game.load.image('buttonFood', './assets/images/buttonFood.png');
        game.load.image('buttonGoals', './assets/images/buttonGoals.png');
        game.load.image('buttonMovie', './assets/images/buttonMovie.png');
        game.load.image('buttonMusic', './assets/images/buttonMusic.png');
        game.load.image('buttonRandom', './assets/images/buttonRandom.png');
        game.load.image('buttonSports', './assets/images/buttonSports.png');
        game.load.image('buttonTechnology', './assets/images/buttonTechnology.png');
        game.load.image('buttonTravel', './assets/images/buttonTravel.png');
        game.load.image('buttonWeird', './assets/images/buttonWeird.png');
    },

    create: function () {
        this.add.sprite(0, 0, 'topics');
        this.add.button(70, 200, 'buttonRandom', this.startGameRandom, this);
        this.add.button(320, 200, 'buttonMovie', this.startGameMovie, this);
        this.add.button(570, 200, 'buttonMusic', this.startGameMusic, this);
        this.add.button(70, 320, 'buttonTravel', this.startGameTravel, this);
        this.add.button(320, 320, 'buttonTechnology', this.startGameTechnology, this);
        this.add.button(570, 320, 'buttonSports', this.startGameSports, this);
        this.add.button(70, 440, 'buttonGoals', this.startGameGoals, this);
        this.add.button(320, 440, 'buttonFood', this.startGameFood, this);
        this.add.button(570, 440, 'buttonWeird', this.startGameWeird, this);
    },
    
    //Buttons to start the game with the chosen topic
    startGameRandom: function () {
        var txt = "Random";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },
    
    startGameMovie: function () {
        var txt = "Movie";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },   
    
    startGameMusic: function () {
        var txt = "Music";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },
    
    startGameTravel: function () {
        var txt = "Travel";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },
    
    startGameTechnology: function () {
        var txt = "Technology";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },
    
    startGameSports: function () {
        var txt ="Sports";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },
    
    startGameGoals: function () {
        var txt = "Goals";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },
    
    startGameFood: function () {
        var txt = "Food";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    },
    
    startGameWeird: function () {
        var txt = "Weird";
        socketClient.emit("gameTopic", txt);
        this.game.state.start('Room');
    }
};

var Room = {

    preload : function() {
        game.load.image('room', './assets/images/room.png');
        game.load.image('buttonBack', './assets/images/buttonBack.png');
        game.load.image('buttonReady', './assets/images/buttonReady.png');
    },

    create: function () {
        this.add.sprite(0, 0, 'room');
        this.add.button(600, 495, 'buttonReady', this.Ready, this);
        this.add.button(37, 495, 'buttonBack', this.goBack, this);
        
        game.time.events.loop(Phaser.Timer.SECOND, this.updateNames, this);
        
        textStyle = { font: "bold 40px sans-serif", fill: "#fff", align: "center" };
        text = game.add.text(game.world.centerX, game.world.centerY, "", textStyle);
        text.anchor.set(0.5);
    },
    
    updateNames: function () {
        socketClient.emit("getPlayerNames", "");
        
        socketClient.on('getPlayerNames', function(obj){
            text.setText(obj);
        });
    },
    
    goBack: function () {
        this.game.state.start('Topic');
    },
    
    Ready: function () {
        var x = document.createElement("SELECT");
        x.setAttribute("id", "selectTo");
        document.body.appendChild(x);
        document.getElementById("selectTo").style.visibility = 'hidden';
        
        socketClient.emit("radioButton", "");

        socketClient.on('radioButton', function(obj){
            for(var index in obj) {
                var names = obj[index].name;
                var z = document.createElement("option");
                z.setAttribute("value", "names");
                var t = document.createTextNode(names);
                z.appendChild(t);
                document.getElementById("selectTo").appendChild(z);
            }
        });
        this.game.state.start('Question');
    }
};

var questionStyle, textStyle_Key, textStyle_Value, style;

var Question = {

    preload : function() {
        game.load.image('questionBg', './assets/images/question.png');
        game.load.image('buttonSend', './assets/images/buttonSend.png');
        game.load.image('buttonEnd', './assets/images/buttonEnd.png');
    },

    create : function() {
        socketClient.emit("getTopicName", "");

        socketClient.on('getTopicName', function(obj){
            if (obj.numQ == 4)
            {
                document.getElementById('textboxComment').style.display="none";
                document.getElementById('textboxText').style.display="none";
                document.getElementById('textboxDiscussion').style.display="none";
                document.getElementById("selectTo").style.visibility = 'hidden';
                game.state.start('Stats');
            }
            textStyle_Key = { font: "bold 16px sans-serif", fill: "#46c0f9", align: "center" };
            textStyle_Value = { font: "bold 18px sans-serif", fill: "#fff", align: "center" };
            style = { font: "bold 25px sans-serif", fill: "#fff", align: "center" };
            // add text
            game.add.text(30, 20, "TOPIC: ", textStyle_Key);
            game.add.text(90, 18, obj.topic, textStyle_Value);
            game.add.text(30, 60, "NAME: ", textStyle_Key);
            game.add.text(90, 58, obj.name, textStyle_Value);
            game.add.text(615, 75, "question: "+obj.numQ+"/3", style);
        });
        
        socketClient.emit("getQuestion", "");

        socketClient.on('getQuestion', function(obj){
            questionStyle = { font: "bold 30px sans-serif", fill: "#fff", align: "center" };
            var questionText = game.add.text(game.world.centerX, 200, obj, questionStyle);
            questionText.anchor.set(0.5);
            questionText.wordWrap = true;
            questionText.wordWrapWidth = 700;
        });
        
        socketClient.emit("getPlayerNames", "");
        
        socketClient.on('getPlayerNames', function(obj){
            var textStyle = { font: "bold 20px sans-serif", fill: "#fff", align: "left" };
            var text = game.add.text(685, 345, "", textStyle);
            text.anchor.set(0.5);
            text.setText(obj);
        });
        
        this.add.sprite(0, 0, 'questionBg');
        this.add.button(498, 512, 'buttonSend', this.sendAnswer, this);
        this.add.button(635, 5, 'buttonEnd', this.endGame, this);
        
        document.getElementById('textboxText').style.display="inline";
        document.getElementById('textboxText').value = "";
        document.getElementById('textboxText').focus();
    },
    
    sendAnswer: function () {
        socketClient.emit('answer', document.getElementById('textboxText').value);
        
        document.getElementById('textboxText').style.display="none";
        this.game.state.start('Answer');
    },
    
    endGame: function () {
        document.getElementById('textboxComment').style.display="none";
        document.getElementById('textboxText').style.display="none";
        document.getElementById('textboxDiscussion').style.display="none";
        document.getElementById("selectTo").style.visibility = 'hidden';
        
        this.game.state.start('Stats');
    }
};

var flashtext = "";

var Answer = {

    preload : function() {
        game.load.image('buttonAnswer', './assets/images/answer.png');
        game.load.image('buttonSend', './assets/images/buttonSend.png');
        game.load.image('buttonLike', './assets/images/buttonLike.png');
        game.load.image('buttonEnd', './assets/images/buttonEnd.png');
    },

    create : function() {
        socketClient.emit("getName", "");

        socketClient.on('getName', function(obj){
            textStyle_Key = { font: "bold 16px sans-serif", fill: "#46c0f9", align: "center" };
            textStyle_Value = { font: "bold 18px sans-serif", fill: "#fff", align: "center" };
            // add text
            game.add.text(30, 20, "NAME: ", textStyle_Key);
            game.add.text(90, 18, obj, textStyle_Value);
        });
        
        game.time.events.loop(Phaser.Timer.SECOND, this.updateComments, this);
        
        document.getElementById('textboxDiscussion').style.display="inline";
        document.getElementById("selectTo").style.visibility = 'visible';
        
        this.add.button(0, 0, 'buttonAnswer', this.newQuestion, this);
        this.add.button(662, 554, 'buttonSend', this.sendComment, this);
        this.add.button(148, 554, 'buttonLike', this.sendLike, this);
        this.add.button(635, 5, 'buttonEnd', this.endGame, this);
        
        document.getElementById('textboxComment').style.display="inline";
    },

    newQuestion: function () {
        document.getElementById('textboxComment').style.display="none";
        document.getElementById('textboxDiscussion').style.display="none";
        document.getElementById("selectTo").style.visibility = 'hidden';
        
        socketClient.emit('generateQuestion', "");
        
        this.game.state.start('Question');
    },
    
    sendComment: function () {
        var obj = { comment: document.getElementById('textboxComment').value, to: document.getElementById("selectTo").options[document.getElementById('selectTo').selectedIndex].text};
        socketClient.emit('comment', obj);
        
        document.getElementById('textboxComment').value = "";
        document.getElementById('textboxComment').focus();
    },
    
    sendLike: function () {
        var obj = document.getElementById("selectTo").options[document.getElementById('selectTo').selectedIndex].text;
        socketClient.emit('like', obj);
       
        var style = { font: "bold 18px sans-serif", fill: "#fff", align: "center" };
        flashtext = game.add.text(30, 45, "YOU HAVE SENT A LIKE", style);
        game.time.events.add(Phaser.Timer.SECOND * 2, this.flashText, this);
    },
    
    updateComments: function () {
        socketClient.emit("getComments", "");

        socketClient.on('getComments', function(obj){
            document.getElementById('textboxDiscussion').readOnly = true;
            document.getElementById('textboxDiscussion').value = obj;
            var textarea = document.getElementById('textboxDiscussion');
            textarea.scrollTop = textarea.scrollHeight;
        });
    },
    
    flashText: function () {
        flashtext.setText("");
    },
    
    endGame: function () {
        document.getElementById('textboxComment').style.display="none";
        document.getElementById('textboxText').style.display="none";
        document.getElementById('textboxDiscussion').style.display="none";
        document.getElementById("selectTo").style.visibility = 'hidden';
        
        this.game.state.start('Stats');
    }
};

var Stats = {

    preload : function() {
        game.load.image('stats', './assets/images/stats.png');
        game.load.image('buttonReport', './assets/images/buttonReport.png');
    },

    create: function () {
        this.add.sprite(0, 0, 'stats');
        this.add.button(590, 485, 'buttonReport', this.sendReport, this);
        
        document.getElementById("selectTo").style.top = "-150px";
        document.getElementById("selectTo").style.left = "645px";
        document.getElementById("selectTo").style.width = "200px";
        document.getElementById("selectTo").style.height = "40px";
        document.getElementById("selectTo").style.fontSize = "25px";
        document.getElementById("selectTo").style.visibility = 'visible';
        
        socketClient.emit("getStats", "");

        socketClient.on('getStats', function(obj){
            var advice = "";
            if (obj.numC/obj.numA >= 2) {
                advice = "Well Done! You were quite active.";
            }
            else {
                advice = "It was good. Try to be more active next time!";
            }
            var statistics = "\n \n Number Of Answers: "+ obj.numA + "\n" + "Number Of Comments: "+ obj.numC +"\n" + "Number Of Likes Received: "+ obj.numL +"\n \n" + advice +"\n\n" + obj.rank;
            textStyle = { font: "bold 22px sans-serif", fill: "#fff", wordWrap: true, align: "center" };
            text = game.add.text(game.world.centerX, game.world.centerY, statistics, textStyle);
            text.anchor.set(0.5);
            text.wordWrapWidth = 710;
        });
    },
    
    sendReport: function () {
        var player = document.getElementById("selectTo").options[document.getElementById('selectTo').selectedIndex].text;
        // Emitting event, send en event to everyone including the sender
        socketClient.emit('report', player);
    }
};

// First parameter is how our state will be called.
// Second parameter is an object containing the needed methods for state functionality
game.state.add('Welcome', Welcome, true);
game.state.add('PlayerName', PlayerName, false);
game.state.add('Topic', Topic, false);
game.state.add('Room', Room, false);
game.state.add('Question', Question, false);
game.state.add('Answer', Answer, false);
game.state.add('Stats', Stats, false);