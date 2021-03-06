/*

  En el anterior prototipo (06-player), el objeto Game permite
  gestionar una colección de tableros (boards). Los tres campos de
  estrellas, la pantalla de inicio, y el sprite de la nave del
  jugador, se añaden como tableros independientes para que Game pueda
  ejecutar sus métodos step() y draw() periódicamente desde su método
  loop(). Sin embargo los objetos que muestran los tableros no pueden
  interaccionar entre sí. Aunque se añadiesen nuevos tableros para los
  misiles y para los enemigos, resulta difícil con esta arquitectura
  pensar en cómo podría por ejemplo detectarse la colisión de una nave
  enemiga con la nave del jugador, o cómo podría detectarse si un
  misil disparado por la nave del usuario ha colisionado con una nave
  enemiga.


  Requisitos:

  Este es precisamente el requisito que se ha identificado para este
  prototipo: diseñar e implementar un mecanismo que permita gestionar
  la interacción entre los elementos del juego. Para ello se diseñará
  la clase GameBoard. Piensa en esta clase como un tablero de un juego
  de mesa, sobre el que se disponen los elementos del juego (fichas,
  cartas, etc.). En Alien Invasion los elementos del juego serán las
  naves enemigas, la nave del jugador y los misiles. Para el objeto
  Game, GameBoard será un board más, por lo que deberá ofrecer los
  métodos step() y draw(), siendo responsable de mostrar todos los
  objetos que contenga cuando Game llame a estos métodos.

  Este prototipo no añade funcionalidad nueva a la que ofrecía el
  prototipo 06.


  Especificación: GameBoard debe

  - mantener una colección a la que se pueden añadir y de la que se
    pueden eliminar sprites como nave enemiga, misil, nave del
    jugador, explosión, etc.

  - interacción con Game: cuando Game llame a los métodos step() y
    draw() de un GameBoard que haya sido añadido como un board a Game,
    GameBoard debe ocuparse de que se ejecuten los métodos step() y
    draw() de todos los objetos que contenga

  - debe ofrecer la posibilidad de detectar la colisión entre
    objetos. Un objeto sprite almacenado en GameBoard debe poder
    detectar si ha colisionado con otro objeto del mismo
    GameBoard. Los misiles disparados por la nave del jugador deberán
    poder detectar gracias a esta funcionalidad ofrecida por GameBoard
    cuándo han colisionado con una nave enemiga; una nave enemiga debe
    poder detectar si ha colisionado con la nave del jugador; un misil
    disparado por la nave enemiga debe poder detectar si ha
    colisionado con la nave del jugador. Para ello es necesario que se
    pueda identificar de qué tipo es cada objeto sprite almacenado en
    el tablero de juegos, pues cada objeto sólo quiere comprobar si ha
    colisionado con objetos de cierto tipo, no con todos los objetos.

*/

describe("Clase GameBoard", function(){

    var canvas, ctx;

    beforeEach(function(){
      loadFixtures('index.html');

      canvas = $('#game')[0];
      expect(canvas).toExist();

      ctx = canvas.getContext('2d');
      expect(ctx).toBeDefined();

      miBoard = new GameBoard();
      miPlayerShip = new PlayerShip();
      miPlayerShip2 = new PlayerShip();
    });

    it("Method add", function(){
      _([miPlayerShip,miPlayerShip2]).each(function(obj) { 
        expect(miBoard.add(obj)).toBe(obj);
      });    
      expect(miBoard.objects[1]).toBe(miPlayerShip2);
      expect(miBoard.objects.length).toBe(2); 
    });

    it ("Method reset removed", function() {  
      miBoard.resetRemoved(); 
      expect(miBoard.removed.length).toBe(0);
    });

    it ("Method remove", function() {  
      miBoard.resetRemoved();  
      _([miPlayerShip,miPlayerShip2]).each(function(obj) { 
        miBoard.remove(obj);
      });   
      expect(miBoard.removed.length).toBe(2);
    });

     it ("Method finalizeRemoved", function() {  
      _([miPlayerShip,miPlayerShip2]).each(function(obj) { 
        miBoard.add(obj);
      });   
      miBoard.resetRemoved();
      miBoard.remove(miPlayerShip);
      miBoard.finalizeRemoved();
      expect(miBoard.objects[0]).toBe(miPlayerShip2);
      expect(_.contains(miBoard.objects, miPlayerShip)).toBeFalsy;
    });

    it ("Method iterate", function() {  
      miBoard.add(miPlayerShip);
      spyOn(miPlayerShip, "step");
      miBoard.iterate("step",1.0);
      expect(miPlayerShip.step).toHaveBeenCalledWith(1.0);
    });  

    it ("Method collide detect y overlap", function() {       
      var miMisil = function () {
        this.w = miPlayerShip.w;
        this.h = miPlayerShip.h;
        this.x = miPlayerShip.x;
        this.y = miPlayerShip.y;        
      };
      var miobj = function() {
        this.w = 3;
        this.h = 4;
        this.x = 2;
        this.y = 1;
      };
 
      _([miPlayerShip,miMisil,miobj]).each(function(obj) { 
        miBoard.add(obj);
      });  
      _(["detect","overlap"]).each(function(obj) { 
        spyOn(miBoard,obj).andCallThrough();
      });   
      miBoard.collide(miPlayerShip);  
      _([miBoard.detect, miBoard.overlap]).each(function(obj) { 
        expect(obj).toHaveBeenCalled(); 
      });  
      expect(miBoard.collide(miPlayerShip)).toEqual(miMisil); 
      expect(miBoard.overlap(miMisil,miPlayerShip)).toBeTruthy;
      expect(miBoard.overlap(miMisil,miobj)).toBeFalsy;
    });  

    it ("Method step", function() {  
      _(["resetRemoved", "iterate", "finalizeRemoved"]).each(function(obj) { 
        spyOn(miBoard, obj); 
      });   
      miBoard.step(1.0);
      _([miBoard.resetRemoved, miBoard.iterate, miBoard.finalizeRemoved]).each(function(obj) { 
        expect(obj).toHaveBeenCalled();
      });    
    });  

    it ("Method draw", function() {  
      spyOn(miBoard, "iterate"); 
      miBoard.draw(ctx);
      expect(miBoard.iterate).toHaveBeenCalled();
    });  

});  