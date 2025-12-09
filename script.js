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
  constructor(nome, cpf) {
    // esses parametros servem para receber quando o objeto pessoa for criado, ou seja, ele precisa ser criado sendo passado o nome e cpf.
    this.nome = nome;
    this.cpf = cpf;
  }
}

class Conta {
  constructor(numeroConta, titular, agencia) {
    this.numeroConta = numeroConta;
    this.titular = titular; // instância de Pessoa
    this.agencia = agencia; // instância de Agencia
    this.saldo = 0;
    this.extrato = [];
  }

  transferir(valor, contaDestino) {
    if (valor <= 0) {
      console.log("Valor de transferência inválido");
      return false;
    }

    if (this.saldo < valor) {
      console.log("Transferência cancelada. Saldo insuficiente.");
      return false;
    }

    const saldoAnteriorRemetente = this.saldo;

    const saldoAnteriorDestinatario = contaDestino.saldo;

    // Realizar transferência
    this.saldo -= valor;
    contaDestino.saldo += valor;

    // Registrar no extrato do remetente
    const extratoRemetente = {
      tipo: "Transferencia - envio",
      valor,
      para: contaDestino.titular.nome,
      contaDestino: contaDestino.numeroConta,
      saldoAnterior: saldoAnteriorRemetente,
      saldoAtual: this.saldo,
      data: new Date().toISOString(),
    };

    this.extrato.push(extratoRemetente);

    // Registrar no extrato do destinatário

    const extratoDestinatario = {
      tipo: "Transferencia - recebimento",
      valor,
      de: this.titular.nome,
      contaOrigem: this.numeroConta,
      saldoAnterior: saldoAnteriorDestinatario,
      saldoAtual: contaDestino.saldo,
      data: new Date().toISOString(),
    };

    contaDestino.extrato.push(extratoDestinatario);

    console.log(
      `Transferência de R$ ${valor} de ${this.titular.nome} para ${contaDestino.titular.nome} realizada com sucesso`
    );
    masterBank.verificarTransacoes({
      tipo: "Transferencia",
      remetente: this.titular.nome,
      destinatario: contaDestino.titular.nome,
      valor,
    });

    return true;
  }

  sacar(valor) {
    if (valor <= 0) {
      console.log("Valor de saque inválido");
      return false;
    }

    if (this.saldo < valor) {
      console.log("Saque cancelado. Saldo insuficiente.");
      return false;
    }

    const saldoAnterior = this.saldo;
    this.saldo -= valor;

    const registroExtrato = {
      tipo: "Saque",
      valor,
      saldoAnterior,
      saldoAtual: this.saldo,
      data: new Date().toISOString(),
    };

    this.extrato.push(registroExtrato);
    console.log(
      `Saque de R$ ${valor} realizado com sucesso para ${this.titular.nome}`
    );

    masterBank.verificarTransacoes({ tipo: "Saque", valor });
  }

  depositar(valor) {
    if (valor <= 0) {
      console.log("Valor de depósito inválido");

      return false;
    }

    const saldoAnterior = this.saldo;

    this.saldo += valor;

    const registroExtrato = {
      tipo: "Deposito",

      valor,

      saldoAnterior,

      saldoAtual: this.saldo,

      data: new Date().toISOString(),
    };

    this.extrato.push(registroExtrato);

    console.log(
      `Depósito de R$ ${valor} realizado com sucesso para ${this.titular.nome}`
    );
    masterBank.verificarTransacoes({ tipo: "Deposito", valor });
  }

  visualizarExtrato() {
    console.log(`\n===== Extrato da Conta ${this.numeroConta} =====`);
    console.log(`Titular: ${this.titular.nome}`);
    console.log(`Agência: ${this.agencia.numeroAgencia}`);
    console.log(`Saldo atual: R$ ${this.saldo.toFixed(2)}\n`);

    if (this.extrato.length === 0) {
      console.log("Nenhuma transação realizada.");
    } else {
      this.extrato.forEach((transacao, index) => {
        console.log(
          `${index + 1}. ${transacao.tipo} - R$ ${transacao.valor.toFixed(2)}`
        );
        console.log(
          `   Data: ${new Date(transacao.data).toLocaleString("pt-BR")}`
        );
        console.log(
          `   Saldo anterior: R$ ${transacao.saldoAnterior.toFixed(
            2
          )} -> Saldo atual: R$ ${transacao.saldoAtual.toFixed(2)}`
        );
        if (transacao.para)
          console.log(
            `   Para: ${transacao.para} (Conta: ${transacao.contaDestino})`
          );
        if (transacao.de)
          console.log(
            `   De: ${transacao.de} (Conta: ${transacao.contaOrigem})`
          );
        console.log("");
      });
    }
    console.log("=======================================\n");
  }
}

/*============================================
                Classe da AGENCIA
  Setar 3 agencias padroes
  1. 00011
  2. 00022
  3. 00033
=============================================*/

class Agencia {
  constructor(numeroAgencia, banco) {
    this.numeroAgencia = numeroAgencia;
    this.banco = banco; // instância de Banco
    this.contas = {}; // dicionário: numeroConta -> Conta
    this.proximoNumeroConta = 1;
  }

  criarConta(titular) {
    const numeroConta = `${this.numeroAgencia}-${String(
      this.proximoNumeroConta
    ).padStart(6, "0")}`;

    const novaConta = new Conta(numeroConta, titular, this);

    this.contas[numeroConta] = novaConta;

    this.proximoNumeroConta++;

    console.log(`Conta ${numeroConta} criada com sucesso para ${titular.nome}`);

    return novaConta;
  }

  buscarConta(numeroConta) {
    return this.contas[numeroConta];
  }

  listarContas() {
    console.log(`\n===== Contas da Agência ${this.numeroAgencia} =====`);

    const listaContas = Object.values(this.contas);

    if (listaContas.length === 0) {
      console.log("Nenhuma conta cadastrada.");
    } else {
      listaContas.forEach((conta) => {
        console.log(
          `Conta: ${conta.numeroConta} | Titular: ${
            conta.titular.nome
          } | Saldo: R$ ${conta.saldo.toFixed(2)}`
        );
      });
    }

    console.log("=======================================\n");
  }
}

/*============================================

Classe do BANCO

=============================================*/

// Banco gerencia agências e oferece serviços bancários

class Banco {
  constructor(nomeBanco, codigoBanco) {
    this.nomeBanco = nomeBanco;
    this.codigoBanco = codigoBanco;
    this.agencias = {}; // dicionário: numeroAgencia -> Agencia

    // Criar automaticamente as três agências fixas
    ["00011", "00022", "00033"].forEach((num) => {
      this.agencias[num] = new Agencia(num, this);
    });

    console.log(
      `Banco ${this.nomeBanco} criado com as agências 00011, 00022 e 00033`
    );
  }

  buscarAgencia(numeroAgencia) {
    return this.agencias[numeroAgencia];
  }

  buscarConta(numeroAgencia, numeroConta) {
    const agencia = this.buscarAgencia(numeroAgencia);
    if (!agencia) {
      console.log("Agência não encontrada.");
      return null;
    }
    return agencia.buscarConta(numeroConta);
  }

  listarAgencias() {
    console.log(
      `\n===== Agências do ${this.nomeBanco} (${this.codigoBanco}) =====`
    );
    const listaAgencias = Object.values(this.agencias);
    listaAgencias.forEach((agencia) => {
      const numContas = Object.keys(agencia.contas).length;
      console.log(`Agência: ${agencia.numeroAgencia} | Contas: ${numContas}`);
    });
    console.log("=======================================\n");
  }

  relatorioCompleto() {
    console.log(`\n========== RELATÓRIO ${this.nomeBanco} ==========`);

    console.log(`Código do Banco: ${this.codigoBanco}`);
    console.log(`Total de Agências: ${Object.keys(this.agencias).length}`);

    Object.values(this.agencias).forEach((agencia) => {
      console.log(`\n--- Agência ${agencia.numeroAgencia} ---`);
      const contas = Object.values(agencia.contas);
      console.log(`Total de Contas: ${contas.length}`);
      contas.forEach((conta) => {
        console.log(
          ` ${conta.numeroConta} - ${
            conta.titular.nome
          }: R$ ${conta.saldo.toFixed(2)}`
        );
      });
    });

    console.log("\n=======================================\n");
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

// Criar Banco e Banco Central
const redBank = new Banco("Red Bank", "001");
const masterBank = new bancoCentral();

// Criar pessoas
const maria = new pessoa("Maria Silva", "123.456.789-00");
const matheus = new pessoa("Matheus Santos", "987.654.321-00");
const joao = new pessoa("João Oliveira", "111.222.333-44");

// Buscar agências já criadas automaticamente
const agencia00011 = redBank.buscarAgencia("00011");
const agencia00022 = redBank.buscarAgencia("00022");
const agencia00033 = redBank.buscarAgencia("00033");

// Criar contas para os clientes
const contaMaria = agencia00011.criarConta(maria);
const contaMatheus = agencia00011.criarConta(matheus);
const contaJoao = agencia00022.criarConta(joao);

// Operações bancárias
console.log("\n========== OPERAÇÕES ==========\n");

// Depósitos
contaMaria.depositar(5000); // transação suspeita (>1000)
contaMatheus.depositar(800);
contaJoao.depositar(1200); // transação suspeita (>1000)

// Saques
contaMaria.sacar(500);
contaMatheus.sacar(200);

// Transferências
contaMaria.transferir(1000, contaMatheus); // suspeita
contaJoao.transferir(300, contaMaria);

// Consultas
console.log("\n========== CONSULTAS ==========\n");
contaMaria.visualizarExtrato();
contaMatheus.visualizarExtrato();
contaJoao.visualizarExtrato();

// Relatórios
console.log("\n========== RELATÓRIO DO BANCO ==========\n");
redBank.listarAgencias();
redBank.relatorioCompleto();

// Banco Central - transações suspeitas
console.log("\n========== TRANSAÇÕES SUSPEITAS ==========\n");
masterBank.listarSuspeitos();
