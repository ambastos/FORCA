var F
var MALE = 1, FEMALE = 2
var _SP, _TR

FORCA = function() {
	this.over = false	
	this.errors = 0
	this.completed = false
	this.audio
	this.letters
	this.incorrects = {}
  
	this.init = function() {
	  
		//inicia as variaveis
		this.completed = false
		this.audio = $("#song").get(0)
		this.letters = this._getLetters()
		  
		this._config()		
		this._setUpTracos()
		this._setUpLetras()
	}
  
	this._config = function() {
		//tela	  
		$("*").removeClass("incorrect")
		$(".text").hide()
		$("img").hide()	  
		$("body").fadeIn(500,null,null)

		//configura
		$("#forca").draggable()
		$("#enforcados img").draggable()
		$("#letters span").draggable()

		var title = "Clique aqui para iniciar"
		$("#play").css("left", 400).css("top", 200).attr("title",title).show()
		$("#play").click(
		function() {
			F.start()
		}
		)	  

		$(".text").focusout(
		  function(){	  	
				_TR = $(this)
				//window.setTimeout(function(){
					F._changeText(_TR.val())	  			
				//},50)	  		
		  }
		)
	}
	this._setUpTracos = function() {
		var width = $(".traco").width()
		var cWidth = 0.8
		var nWidth = width * cWidth
		$(".traco").width(nWidth)
	}
  
	this._setUpLetras = function() {
		var width = $(".letra").width()
		var cWidth = 0.8
		var nWidth = width * cWidth
		$(".letra").width(nWidth)
	}
  
	this.getTracejo = function() {
		var trs =  [
					$("#tracejo-1"),
					$("#tracejo-2"),
					$("#tracejo-3")
					]

		var r = random(0,2) 
		if (r == - 1)
			return trs[0]
		return trs[r]
	}
	
	this.getSpace = function() {
		return   $("#tracejo-space")
	}
  
	this._getLetters = function() {
		var letters = ""
		if (localStorage && localStorage.word) {
			letters = localStorage.word.split(" ")
		}else {
			//32 = Espaço
			//D O N T  Y O U  F O R G E T  A B O U T
			letters = "4 15 14 20  25 15 21  6 15 18 7 5 20  1 2 15 21 20".split(" ")
		}	
		return letters
	}

	this._letterSpaces = function() {
		var l = $("#letters")
		l.removeClass("gameOver")	
		l.html("")

		for (var i=0; i < this.letters.length;i++) 
			this._configTracejo (l, i)

		l.show()
	}
	this._configTracejo = function(l,i) {
		var tr 
		var isSpace = this.letters[i] == 0
		if (isSpace) 
			tr = this.getSpace()
		else 
			tr = this.getTracejo()			

		tr = tr.clone()		
		tr.css("position", "relative")	
		
		tr.show()
		var html = tr.get(0).outerHTML

		var sp = "<span>"+(html)+"</span>"
		l.append(sp)
		sp = l.find("span:eq("+i+")")
		if (isSpace)
			sp.addClass("space")
		else
			sp.addClass("tracejo")	
		sp.attr("index", i)
		sp.attr("tabIndex", i+2)
		var _this = this
		sp.click(function(ev) {		
				_SP = this
				//window.setTimeout(function(){
					_this._showTextLetter(_SP) 
				//},20)
		}).keydown(function(k){
			_SP = this
			let keyCode = k.keyCode

			let keyName = ""
			if (k.originalEvent.code)
				keyName = k.originalEvent.code.replace("Key", "")
 
			window.setTimeout(()=>{
				if (keyCode) {
					switch(keyCode) {
						case 38://Seta pra cima
						case 40://Seta pra baixo
							break;
						case 37:
							//Volta para a anterior(se houver)
							console.log('seta a esquerda')
							//_this._showTextLetter(_SP, keyCode)
							break;
						case 18: //alt+TAB
							console.log("tab")	
						case 9: //TAB		
							console.log("tab")	
						case 13: //Enter	
							console.log("enter")	
						case 39:
							//Avanca	
							console.log('seta a direita')
							//_this._showTextLetter(_SP, keyCode)
							break;
						default:
							if (keyCode >= 65 && keyCode <=90) {
								console.log("tecla: ",keyName)	
								_this._showTextLetter(_SP, keyName) 
							}
					}
		
				}
				 				
			},50)			
		})
	}

	this._showTextLetter = function(tracejo, keyName) {

		var text = $(".text")
		tracejo = $(tracejo)

		var top = tracejo.offset().top

		var cLeft = 3
		var left = tracejo.offset().left + cLeft

		var cHeight = 1.5 //coeficiente
		var height = text.height() * cHeight

		var tTop = top - height
		var tLeft = left
			
		text.css("top", tTop).css("left", tLeft)	
		text.appendTo(tracejo).show()

		this._setTextAndSelectIt(text,tracejo) 

		text.focus()

		//Se alguma tecla foi apertada
		if (keyName) 
			text.val(keyName) 		
		
	}

  	this._setTextAndSelectIt = function(text,tracejo) {
		var txt = tracejo.attr("text")
		if (txt) {
			text.val(txt)
			text.get(0).selectionStart = 0
			text.get(0).selectionEnd = 1
		}else{
			text.val("")	
		}	
	}	

	this._changeText = function(txt) {
		var text = $(".text")
		var sp = text.parent()
		if (!sp.hasClass("tracejo"))
			return false
		var txt = txt.toUpperCase()

		this._setTextToSpan(sp,txt)
		//apaga a letra se nao houver imagem de letra
		sp.find(".letra").remove()
		//verifica se nao tem a letra e apaga 

		text.appendTo(document.body)

		var index = parseInt(sp.attr("index"))
		var correct = isCorrect(index,txt)

		this.putIncorrect(index,correct)
		this._changeStatusOfLetter(sp,correct)	

		var code = txt.charCodeAt()	
		var nLetter = this._getNLetter(code)
		var imgL = $("#letra-"+nLetter) 

		this._configNLetterImage(imgL, sp)

		$(".text").hide()

		this.tryToComplete()

	}

	this._setTextToSpan = function(sp,txt) {
		if (txt.length > 0 ) {
			var anterior = sp.attr("text")
			if( anterior && anterior.length > 0)
				sp.attr("previous", anterior)

			sp.attr("text", txt)		

		} else {
			sp.removeAttr("text")	
		}
	}
	this._configNLetterImage = function(imgL, sp) {
		if (imgL.length > 0) {		
			imgL = imgL.clone()
			var top = sp.offset().top
			var left = sp.offset().left
			
			var coeficiente = 1.2
			
			var cTop = sp.height() * coeficiente
			var cLeft = sp.width() * 0.1
			
			var tTop = (top - cTop )
			var tLeft = (left) - cLeft
			
			imgL.appendTo(sp)
			imgL.css("position","absolute").css("top", tTop).css("left",tLeft)

			imgL.click(function() {
				F._showTextLetter(this)
			})
			imgL.show()
		}
	}
	this._getNLetter = function(code) {
		var ini = 65
		var nLetter = code - ini+ 1
		return nLetter
	}
  
	this.putIncorrect = function(position, isCorrect) {
		if (isCorrect) {
			delete this.incorrects[position]
		}else {
			this.incorrects[position] = true
			this.errors++		
		}
	}

	this._changeStatusOfLetter = function(sp, isCorrect) {
		if (isCorrect) {
			sp.removeClass("incorrect")  		
		}else{
			var currentIsIncorrect = sp.hasClass("incorrect")
			var previous = sp.attr("previous")
			var current = sp.attr("text")
			var isNotSame = (previous ? previous : "") != (current ? current: "")
			
			if (!currentIsIncorrect || isNotSame) {
				sp.addClass("incorrect")
				this.hanging()
			}
		}	
	}
	
	this.tryToComplete = function() {
		var letters = $("#letters>span").not(".space")
		var numbers = letters.length
		var hasIncorrects = letters.hasClass("incorrect")
		var filleds = letters.filter("[text^='']")
		var allFilleds = filleds.length == numbers

		if (!hasIncorrects && allFilleds) 
			this.markAsCompleted()
		else 
			this.markAsNotCompleted()
	}

	this.markAsCompleted = function() {
		this.completed = true

		//Mostra
		var toExecute4 = function() {		
			var p = $("#song-play")
			p.fadeIn()
			F.save()
		}
		//wait(3 phases)
		var toExecute3 = function(phase) {
			var el = $("#bottom>td")
			var message = "WAIT"
			for (var i = 1 ; i <=phase; i++)
				message += "."
			F.setMessage(el,message)
			if (phase == 3) {
				setTimeout(toExecute4, 1000)
				F.hideMessage()
			}	
		}

		//show Completed message
		var toExecute2 = function() {
			$("#letters").fadeOut()
			var el = $("#bottom>td")
			var message = "GAME COMPLETE!"
			F.setMessage(el,message)

			setTimeout(function(){toExecute3(1)}, 1500)
			setTimeout(function(){toExecute3(2)}, 2200)
			setTimeout(function(){toExecute3(3)}, 3000)
		}
		//hideLetters
		var toExecute1 = function() {		
			$("#ME").show()		
			setTimeout(toExecute2, 2500)
		}

		setTimeout(toExecute1, 500)

	}

	this.markAsNotCompleted = function()  {
		this.completed = false
	}

	this.start = function() {
		if (this.started) {
			if (confirm("Tem certeza que deseja reiniciar?"))
				this._start()
		}else {	
			this._start()
		}
	}

	this._start = function() {
		this.reset()
		
		$("#forca").show()
		$("#top>td").show(1000)
		this._letterSpaces() 
		$("#enforcados>img").hide()
		$("#enforcado").show()
		var top = "Complete a palavra abaixo para a surpresa."
		$("#top>td").html(top)
		this._montaGuy()
	}

	this.reset = function() {
		
		this.started = true
		this.completed = false  	
	}	

//O Enforcado
	this.gu = null
	this._montaGuy = function() {

		this.gu = {
			all:  ["head","corpo","bracos","pernas","pes","cabelo","olhos","nariz","boca","rola","checa",
						"tetas"],
			//em percentual a mais em relacao a parte anterior							
			offSets: [100,100, -8, 90, 100,-600,50,100,100,-505,-505,-830],	
			init: function() {
				var ft = function(a,b,c){
					if (F.gu.gender == MALE) {
						if (b !=10 && b !=11) 
							return a
					}else {
						if (b !=9) 
							return a
					}	
				}
				var c_all = this.all.filter(ft)
				var c_offs = this.offSets.filter(ft)
						
				this.all = c_all
				this.offSets = c_offs
				if (this.gender == MALE)
					this.cabelo = $("#enforcado-cabelo-male")
			},		 
			stage:  0,
			gender: MALE,
			boca: $("#enforcado-boca"),	
			bracos: $("#enforcado-bracos"),
			cabelo: $("#enforcado-cabelo"),
			checa: $("#enforcado-checa"),
			corpo: $("#enforcado-corpo"),
			head: $("#enforcado-head"),
			nariz: $("#enforcado-nariz"),
			olhos: $("#enforcado-olhos"),
			pernas: $("#enforcado-pernas"),
			pes: $("#enforcado-pes"),
			rola: $("#enforcado-rola"),
			tetas: $("#enforcado-tetas"),
			get: function() {			
						
				var pt = this.all[this.stage]			
				return this[pt]
			},
			getOffset: function() {
				var enf = $("#enforcado")
				var eTop = enf.offset().top
				var eLeft = enf.offset().left
				var eWidth = enf.width()
				var eHeight = enf.height()	
				var eMiddle = eLeft + (eWidth/2)
				
				var g = this.get()
				if (!g)
					return null
				
				var percent = 1.05
				var top = (120) *  percent
				var left = (eMiddle - (g.width() / 2)) 

				var offSet = this.offSets[this.stage]
				var iP = this.stage -  Math.ceil(Math.abs(offSet /100))
				var p = this.all[iP]			
				if (!p)
					return {top: top, left: left}
				
				var previous = this[p]
				var os = previous.offset()

				with (Math) {
					var comp = offSet / 100
					var a = abs(comp)
					var b = a - Math.floor(a)				
					var inteiro = offSet % 100 == 0 ? 1 : 0
					var newOffset = inteiro +b		
				}
				top = os.top + previous.height() * newOffset			
				
				return {top:top, left:left}
			},
			setStage: function(stage) {
				this.stage = stage	
			},
			hasNext: function() {
				return this.stage < this.all.length  	
			}
		}

		var g = random(MALE, FEMALE)
		if (g == -1)
			g = MALE
		this.gu.gender = FEMALE	
		this.gu.init()
	}	

	this.hanging = function() {

		var h = this.gu	

		with(h){
			var g = get()
			g.appendTo("#body-r")
			var os = getOffset()		
			g.css("position","absolute").css("top",os.top).css("left",os.left)
			g.slideDown()
			h.setStage(h.stage+1)

			//descomentar
			if (!hasNext()) {		
				return this.death()
			}
		}
		return true
	}
	
	this.death = function() {
		this.dead = true
		this.showDead()
		this.frozenWords()
	}

	this.showDead = function() {
		var enfs = $("#body-r")	

		var callback = function() {
			var enf = $("#enforcado") 
			var top = enf.offset().top 
			var left = enf.offset().left

			var dead = $("#enforcado-dead")
			dead.css("top",top+100).css("left",left)
			dead.slideDown()

			F.setMessage(enf, "YOU ARE DEAD.")	
		}

		enfs.effect("pulsate",null,null,function(){
			var ens = $("#body-r img")
			ens.slideUp()
			
			callback()
		})


	}

	this.frozenWords = function() {
		var l =  $("#letters")
		var all = l.find("span")
		all.unbind("click")
		l.addClass("gameOver")
		this.over = true
		$(".text").appendTo(document.body)
	}

	this.setMessage = function(to, message) {
		$("#message").remove()

		var div = document.createElement("div")
		div.id = "message"
		div.innerHTML = "          "+message
		document.body.appendChild(div)

		$("#message").show().appendTo(to)
	}

	this.hideMessage = function() {
		$("#message").remove()
	}

	this.playSong = function() {
		this.audio.play()
		$("#song-play").slideUp()
		$("#song-stop").slideDown()
	}
	
	this.stopSong = function() {
		this.audio.pause()
		$("#song-stop").slideUp()
		$("#song-play").slideDown()	
	}

	this.save = function() {
		var idGame = localStorage.getItem("id-game")  	
		var id
		if (!idGame) {
			id = 1
			localStorage.setItem("id-game", id)
		}else {
			id = parseInt(idGame)+1
			localStorage.setItem("id-game", id)
		}
		var erros =F.errors
		var completed = F.completed
		var letters = ""
		$("#letters span").each(function(i){
			var _t = $(this)
			if (_t.hasClass("space"))
				letters+=" "
			else
				letters+=_t.attr("text")
		})

		var options = ""  	
		options	+= "{"
		options	+="id:"+ id+","
		options +="erros:"+erros+","
		options +="letras:"+letters
		options	+="}"

		localStorage.setItem("game-"+id,options)
	}
}

F = new FORCA()
//Funcoes auxiliares
function isCorrect(position, letter) {
	var code = letter.charCodeAt()
	if (isNaN(code))
		return true

	var ini = 65
	code = code -ini + 1
	
	var corr = F.letters[position]
	if (!corr)
		return false
	
	corr = parseInt(corr)

	return code == corr	
}

//Funcoes de Teste

function d___f_a_m() {
	var l = $("#letters>span")
	var acabou = false
	
	var doWord = function(i) {
		var ls = F.letters
		var getLetter = function(codeLetter) {
			var ini = 65
			var code = ini - 1 + parseInt(codeLetter)

			var nLetter = String.fromCharCode(code)
			return nLetter
		}
		var letter = getLetter(ls[i])


		var s =$(this)
		if (!s.hasClass("space")) {			
			s.click()
			
			var aa = s.find(".text")
			aa.val(letter)
			aa.focusout()	
			
		}
	}
	
	l.each(doWord)

}

function sM() {
	var s = $("#bottom>td")
	var m = "aaaa"
	setTimeout(function(){
				F.setMessage(s,m)
	}, 2000)
}

function eff() {
	
	var f2 = function() {
		var d = $("#enforcado-dead")
		d.effect("scale",{percent:75, direction:"left"},null,function() {
			d.effect("scale",{percent:75, direction:"right"}, null,function() {
				d.effect("scale",{percent:75, direction:"left"}, null,function() {
					
				})
			})
		})
	}
	var f = function() {
		var d = $("#enforcado-dead")
		d.effect("scale",{percent:150},null,function() {
			d.effect("scale",{percent:150}, null,function() {
				d.effect("scale",{percent:150}, null,function() {
					f2()
				})
			})
		})
	}
	f()
}

F = new FORCA()

console.log("FORCA")