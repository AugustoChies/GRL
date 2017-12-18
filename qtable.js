/*
Tentei usar uma estrutura de classes com includes não funcionou,tive que deixar todas em um arquivo mesmo.

Darn it Javascript

*/


//Baseada em quimeraIA https://github.com/jrbitt/quimera

//classe QArmazenaValor(chamei de QTable) (int,int)
var QTable = function (e, a) {
	//O construtor fica aqui mesmo-----------------------------------------
    this.estados = e;
	this.acoes= a;
	this.matriz=[e];
	
	for (i = 0; i < e; i++) {
		var submat = [a];
		this.matriz[i] = submat;
		
		for (j = 0; j<a; j++) {
			this.matriz[i][j] = Math.random(); //rand entre 0 e 1
		}
	}	
	//--------------------------------------------------||||||||||||||||||

	//(int,int,float)
    this.armazenaValorQ = function(estado,acao,q) {
        this.matriz[estado][acao] = q;
    };
	
	//return float (int,int)
    this.getValorQ = function(estado,acao) {
        return this.matriz[estado][acao];
    };
	
	//retorna int(qual ação) (int, vector<int>)
	this.getMelhorAcao = function(estado,acoes) {
        var melhori = 0;
		var melhorq = -1.0;
		
		for (i = 0; i < acoes.length; i++) {
			if (this.matriz[estado][acoes[i]] > melhorq) {
				melhorq = this.matriz[estado][acoes[i]];
				melhori = i;
			}
		}
		return melhori;
    };
	
	//retorna int(valor da ação) (int, vector<int>)
	this.getAcao = function(estado,acoes) {
        var melhori = 0; 
		var melhorq = -1000000; //Nao tem MIN_INT mas é extremamente improvavel que tudo fique tão baixo
		for (i = 0; i < acoes.length; i++) {
			if (this.matriz[estado][acoes[i]] > melhorq) {
				melhorq = this.matriz[estado][acoes[i]];
				melhori = acoes[i];
			}
		}
		return melhori;
    };
	
	
	//Não sei usar sistemas de leitura/escrita de arquivos com js, então os próximos métodos improvisam isso postando um 
	//log que pode ser copiado e inserido depois dentro do código.
	this.getTabelaEmString= function()
	{
		var str = "[";
		
		for (i = 0; i < this.estados; i++) { 
			var str = str + "[";
		
			for (j = 0; j< this.acoes; j++) {
				if(j > 0)
					{
						var str = str + ",";
					}
				var str = str + this.matriz[i][j];
			}
			
			var str = str + "]";
			if(i < this.estados - 1)
				{
					var str = str + ",";
				}
		}	
		
		var str = str + "]";
		
		console.log(str);
		
	};
	
	this.setTabela = function(table){
		this.matriz = table;	
	};
	
};

//classe Paproblema(criei separado pra não confundir por causa do javascript :p)
var Parproblema = function(){
	this.recompensa=0;
	this.novoestado=0;
};

//classe problema. Foi completamente dilacerada por causa do motivo descrito no .html. Sorry
var Problema = function(){
	this.estadoatual= 0;
	this.acoes= [];
	//para o main no .html saber o que fazer, cima,baixo,esquerda,direita e tiro (0 a 4)
	this.acaoatual = 0;
	
	
	//funcao de achar estado via sensores
	this.achaestado = function(areaX,col1,col2,col3,col4,col5,col6){
		this.estadoatual = 0;
		this.estadoatual += areaX * 64;
		this.estadoatual += col1 * 32;
		this.estadoatual += col2 * 16;
		this.estadoatual += col3 * 8;
		this.estadoatual += col4 * 4;
		this.estadoatual += col5 * 2; 
		this.estadoatual += col6;	
	
	};
	//return vector<int>  (bool)
	this.getAcoes = function(cooldown){
		if(cooldown)
			{
				this.acoes = [0,1,2,3];
			}
		else
		{
			this.acoes = [0,1,2,3,4];
		}
	};
	
	
	//return int
	this.getNumEstados = function(){
		return 640;
	};
	
	//return int
	this.getNumMaxAcoes = function(){
		return 5;
	};
	
};


//classe QLearning (Problema)
var Qlearning = function(p){
	
	this.problema = p;
	this.armazem = new QTable(p.getNumEstados(),p.getNumMaxAcoes());
	this.iteracoes= 1;
	this.alpha = 0;
	this.gamma = 0;
	this.rho = 0;
	this.nu = 0;
	
	
	//precisam ser variaveis para existir entre o aprender1 e 2
	this.aprenderestado = 0;
	this.aprenderacao = 0;
	this.aprenderacoes = []
	//------------------------------------------------
	//return int (vector <int>)
	this.randomUm = function(acoes){
		return (Math.floor(Math.random() * acoes.length));  
	};
	//return float
	this.aleatorio = function(){
		return Math.random();
	};
	
	
	//aprender teve que ser separado em 2 para executar uma parte no "main". O pt1 retorna a melhor ação,ou uma aleatória
	this.aprenderpt1 = function()
	{
		this.aprenderestado = this.problema.estadoatual;
		
		
		this.aprenderacoes = this.problema.acoes;
		
		this.aprenderacao = -1;
		
		if(this.aleatorio() < this.rho)
		{			
			this.aprenderacao = this.randomUm(this.aprenderacoes);
		}
		else 
		{ 
			this.aprenderacao = this.aprenderacoes[this.armazem.getMelhorAcao(this.aprenderestado, this.aprenderacoes)];
		}
		
		return this.aprenderacao;
	
	};
	
	//atribui o Q (Parproblema)
	this.aprenderpt2 = function(par)
	{				
				
				var q = this.armazem.getValorQ(this.aprenderestado,this.aprenderacao);
				var maxq = this.armazem.getValorQ(par.novoestado,this.armazem.getMelhorAcao(par.novoestado, this.aprenderacoes));
												  
				q = (1 - this.alpha)*q + this.alpha*(par.recompensa+ this.gamma*maxq);
				
				this.armazem.armazenaValorQ(this.aprenderestado, this.aprenderacao, q);
				
	};
	
	
	this.salvar = function(){
		this.armazem.getTabelaEmString();
	};
	
	this.carregar = function(table){
		this.armazem.setTabela(table);
	};
};




