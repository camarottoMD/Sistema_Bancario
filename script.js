// --- Banco
// --- Controlar as transações
// --- Agencia(s)
// --- Clientes - sacar - transferir entre os clientes - depositar
// Extrato por cliente
// Banco Central - Registra transações maiores que 1000 reais

/*============================================
          VAR DOS ELEMENTOS DO INDEX
=============================================*/
// const depositar = document.getElementById('depositar')
// const sacar = document.getElementById('sacar')
// const transferir = document.getElementById('transferir')
// const valor = document.getElementById('valor')
// const nome = document.getElementById('nome')
// const conta = document.getElementById('conta')


/*============================================
                Classe da PESSOA
=============================================*/
//classe pessoa inicializa com os parametros setados. Na classe pessoa temos as operações que ela pode fazer, que são as funções.
class pessoa {
  constructor(nome, agencia) {
    // esses parametros servem para receber quando o objeto pessoa for criado, ou seja, ele precisa ser criado sendo passado o nome, banco e agencia.
    this.nome = nome;
    this.extrato = [];
    this.conta;
    this.agencia; //dar um jeito de linkar agencia de pessoa para agencia da classe agencia
    this.saldo = 0;
  }

  transferir(valor, remetente, agenciaRemetente, destinatario, agenciaDestinatario){
    if (remetente.agencia === agenciaRemetente && destinatario.agencia === agenciaDestinatario){
      if (remetente.saldo < valor) {
        console.log('Transferencia cancelada. Verifique seu saldo')
      }
      else {
        /*
        Essas variaveis irão armazenar o saldo antigo para adiciona-los ao extrato 
        */
        const antesRemetente = remetente.saldo
        const antesDestinatario = destinatario.saldo

        remetente.saldo -= valor;
        destinatario.saldo += valor;

        const extratoRemetente = { tipo: 'Transferencia - envio', valor, para: destinatario.nome, data: new Date().toISOString(), saldoAntes: antesRemetente, saldoDepois: remetente.saldo };
        const extratoDestinatario = { tipo: 'Transferencia - recebimento', valor, de: remetente.nome, data: new Date().toISOString(), saldoAntes: antesDestinatario, saldoDepois: destinatario.saldo };
        
        //registra nos extratos de ambos
        remetente.extrato.push(extratoRemetente)
        destinatario.extrato.push(extratoDestinatario)
        console.log(
          `${destinatario.nome} recebeu a grana de valor ${valor} de ${remetente.nome}!`
        );
        //verificação do banco central
        masterBank.verificarTransacoes({ tipo: 'Transferencia', remetente: remetente.nome, destinatario: destinatario.nome, valor })
      }
    }
    else{
      console.log(`Número da agencia incorreta`)
    }
  }

  sacar(valor, nome, agencia){
    if (nome.agencia !== agencia || agencia === undefined){
      console.log(`Número da agencia incorreta`)
    }
    else{
      if (nome.saldo < valor) {
      console.log("Saque cancelado. Por favor verifique seu saldo atual.")
      }
      else {

      const saldoAnterior = nome.saldo

      nome.saldo -= valor;

      const addExtrato = {tipo: 'Saque', valor, saldoAnterior: saldoAnterior, data: new Date().toISOString()};
      nome.extrato.push(addExtrato)
      console.log(`${this.nome} foi descontado ${valor}.`);
      masterBank.verificarTransacoes({ tipo: 'Saque', valor})
      }

    }
  }

  depositar(valor, nome, agencia) {
    if (nome.agencia !== agencia || agencia === undefined){
      console.log(`Número da agencia incorreta`)
    }

    else{
      const saldoAnterior = nome.saldo

      nome.saldo += valor;

      const addExtrato = {tipo: 'Saque', valor, saldoAnterior: saldoAnterior, data: new Date().toISOString()}
      nome.extrato.push(addExtrato)
      console.log(`${this.nome} foi adicionado ${valor}.`);
      masterBank.verificarTransacoes({ tipo: 'Deposito', valor })

    }
  }

  visualizarExtrato(nome, agencia) {
    if (nome.agencia !== agencia || agencia === undefined){
      console.log(`Número da agencia incorreta`)
    }
    else{
      console.log(`Esse é o seu extrato ${this.nome}: ${saldo}`)
    }
  }
}

/*============================================
                Classe da AGENCIA
  Setar 3 agencias padroes
  1. 00011
  2. 00022
  3. 00033
=============================================*/

class agencia {
  constructor() {
    this.listaAgencias = {}; //como sincar as agencias a contas
    this.listaPessoasAgencia //lista de pessoas em cada agencia
  }

  registrarAgencias(agencia){
     pessoa.agencia = agencia
     this.listaAgencias[agencia]=({Usuario: pessoa.nome, Saldo: pessoa.saldo})
     pessoa.conta += 1
  }

  registrarPessoaAgencia(agencia, pessoa){
    for (agenciaDaLista in this.listaAgencias){
      if (agencia !== agenciaDaLista){
        console.log(`A agencia ${agencia} não existe. Consulte Nossa lista de agencias!`) //não sei se crio uma função para listar as agencias, preciso ver isso
      }
      else if (pessoa ){ //preciso fazer uma lista de todas as pessoas do meu banco
        
      }
    }

  }
}

/*============================================
            Classe do BANCO CENTRAL 

 IDEAS
  - Como representante do banco central voce pode, 
  1. adicionar bancos, 
  2. visualizar todas as agencias de um banco
  3. excluir contas?
  4.
=============================================*/
//Banco central além de armazenar as transações suspeitas ele faz a verificação de qual é suspeita
class bancoCentral {
  constructor() {
    
    this.transacoesSuspeitas = {};
    this.idSuspeito = 0;
  }
  //transacoesSuspeitas é um dicionario, com index idSuspeito
  verificarTransacoes(transacao) {
    if (transacao.valor > 1000) {
      this.idSuspeito++;
      this.transacoesSuspeitas[this.idSuspeito] = transacao;
    }
  }

  listarSuspeitos() {
    for (const id in this.transacoesSuspeitas) {
      console.log(`Transação ${id}:`, this.transacoesSuspeitas[id]);
    }
  }
}

/*============================================
                CRIAÇÕESSSSSSS
=============================================*/

// depositar.addEventListener('click', depositar)
// sacar.addEventListener('click', sacar)
// transferir.addEventListener('click', transferir)

const masterBank = new bancoCentral()

//preciso criar primeiro a pessoa para assim criar uma agencia, pois agencia anexa o nome e saldo da pessoa num dict
var maria = new pessoa("maria", "0123456");
var matheus = new pessoa("Matheus", "", "")

const novaAgencia = new agencia()
novaAgencia.registrarAgencias('0123-4', maria)


