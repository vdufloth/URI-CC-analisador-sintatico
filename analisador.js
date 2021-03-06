var analisando = true;
var aceita = null;
var Niteracao = 1;
var pilha = ['$', 'S'];
var entrada = [];
var tabelaPassos = [];
var savedInput = '';

// Definição da gramática
// Minificada para ocupar menos espaço
const gramatica = { 'S': ['BA'], 'A': ['aBA', 'ε'], 'B': ['DC'], 'C': ['bDC', 'ε'], 'D': ['cD', 'd'] };
const tabelaParsing = { 'S': { 'c': ['B', 'A'], 'd': ['B', 'A'] }, 'A': { 'a': ['a', 'B', 'A'], '$': ['ε'] }, 'B': { 'c': ['D', 'C'], 'd': ['D', 'C'] }, 'C': { 'a': ['ε'], 'b': ['b', 'D', 'C'], '$': ['ε'] }, 'D': { 'c': ['c', 'D'], 'd': ['d'] } };

//Motor principal
function proximoPasso() {
    var novaLinha = {
        iteracao: Niteracao,
        pilha: pilha.join(''),
        entrada: entrada.join('')
    };

    var topoDaPilha = pilha[pilha.length - 1];
    var caracterEntrada = entrada[0];

    //Se o topo da pilha e o caracter de entrada ambos são 'finais' a sentença foi aceita
    if (topoDaPilha === '$' && caracterEntrada === '$') {
        analisando = false;
        aceita = true;
        var s = 'Aceita em ' + Niteracao + ' iterações!'
        novaLinha.action = s;
        $('#input-tip').text(s);
    } else {
        //Se o topo da pilha e o caracter de entrada são iguais, remove o caracter da pilha e ve 
        // o próximo da entrada
        if (topoDaPilha === caracterEntrada) {
            novaLinha.action = 'Lê ' + caracterEntrada;
            pilha.pop();
            entrada.shift();
        } else if (tabelaParsing[topoDaPilha] !== undefined && tabelaParsing[topoDaPilha][caracterEntrada] !== undefined) {
            // Empilha o resultado da tabela de parsing para esse caracter
            // e remove da pilha
            var paraEmpilhar = tabelaParsing[topoDaPilha][caracterEntrada];
            var producao = paraEmpilhar.join('');
            novaLinha.action = topoDaPilha + ' &rarr; ' + producao;
            pilha.pop();
            if (producao !== 'ε') {
                for (var j = paraEmpilhar.length - 1; j >= 0; j--) {
                    pilha.push(paraEmpilhar[j])
                }
            }
        } else {
            //Se não tiver registros do topo da pilha na tabela de parsing,
            // é erro
            analisando = false;
            aceita = false;
            var s = 'Erro em ' + Niteracao + ' iterações!'
            novaLinha.action = s;
            $('#input-tip').text(s);
        }
    }

    Niteracao = Niteracao + 1;
    tabelaPassos.push(novaLinha);
}

function limpaVariaveis() {
    analisando = true;
    aceita = null;
    Niteracao = 1;
    pilha = ['$', 'S'];
    entrada = [];
    tabelaPassos = [];
    $('#input-tip').text('');
}

function getEstado() {
    return {
        entrada: entrada.join(''),
        pilha: pilha.join(''),
        aceita: aceita,
        table: tabelaPassos
    };
}

function passoAPasso(e) {
    if (e !== savedInput || !analisando) {
        limpaVariaveis();
        savedInput = e;
        entrada = (e + '$').split('');
    }
    proximoPasso();
    return getEstado();
}

function verificaTudo(e) {
    limpaVariaveis();
    entrada = (e + '$').split('');
    while (analisando) {
        proximoPasso();
    }
    return getEstado();
}

function mostraTabelaPassos(t) {
    if (t === undefined) {
        t = tabelaPassos;
    }
    $htmlTable = $('.tabela-passos > tbody');
    $htmlTable.html('');
    for (var i = 0; i < t.length; i++) {
        $row = $('<tr class="d-flex">');
        $row.append('<td class="col-2">' + t[i].iteracao + '</td>');
        $row.append('<td class="col-2">' + t[i].pilha + '</td>');
        $row.append('<td class="col-6 text-right">' + t[i].entrada + '</td>');
        $row.append('<td class="col-2">' + t[i].action + '</td>');
        $htmlTable.append($row);
    }
}

function pintaInput(aceita) {
    $('#i-entrada-sentenca').removeClass('invalida valida');
    if (aceita === true) {
        $('#i-entrada-sentenca').addClass('valida');
    } else if (aceita === false) {
        $('#i-entrada-sentenca').addClass('invalida');
    }
}

function atualizaTela(valor) {
    if (valor === undefined) {
        pintaInput(null);
        mostraTabelaPassos([]);
    } else {
        pintaInput(valor.aceita);
        mostraTabelaPassos(valor.table);
    }
}

function geraSentencaAleatoria() {
    var regra = 'S';
    var gerando = true;
    var sentenca = '';
    var naoTerminais = ['S', 'A', 'B', 'C', 'D'];

    while (gerando) {
        var opcoes = gramatica[regra].length;
        var producao = gramatica[regra][Math.floor(Math.random() * opcoes)];

        if (sentenca === '') {
            sentenca = producao;
        } else {
            sentenca = sentenca.replace(regra, producao);
        }

        var indiceRegra = -1;
        for (var i = 0; i < sentenca.length; i++) {
            indiceRegra = naoTerminais.indexOf(sentenca[i]);
            if (indiceRegra !== -1) {
                regra = naoTerminais[indiceRegra];
                break;
            }
        }

        if (indiceRegra === -1) {
            gerando = false;
        } 
    }

    while (sentenca.indexOf('ε') !== -1) {
        sentenca = sentenca.replace('ε', '');
    }

    return sentenca;
}

// Abaixo, ações dos botões
$(document).ready(function () {
    $('#i-entrada-sentenca').on('keyup', function () {
        limpaVariaveis();
        atualizaTela();
    });

    $('#b-verifica-tudo').click(function () {
        var valor = verificaTudo($('#i-entrada-sentenca').val());
        atualizaTela(valor);
    });

    $('#b-passo-a-passo').click(function () {
        var valor = passoAPasso($('#i-entrada-sentenca').val());
        atualizaTela(valor);
        window.scrollTo(0,document.body.scrollHeight);
    });

    $('#b-limpar-tudo').click(function () {
        $('#i-entrada-sentenca').val('').focus();
        limpaVariaveis();
        atualizaTela();
    });

    $('#b-gerar-sentenca').click(function() {
        limpaVariaveis();
        atualizaTela();
        var sentenca = geraSentencaAleatoria();
        $('#i-entrada-sentenca').val(sentenca);
        $('#b-verifica-tudo').click()
    });
});