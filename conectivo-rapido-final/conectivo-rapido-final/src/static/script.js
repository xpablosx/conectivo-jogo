// Banco de dados de conectivos e seus tipos
const conectivosDB = {
    'Adição': ['Ademais', 'Outrossim', 'E assim'],
    'Conclusão': ['Portanto', 'Por isso', 'Dessa forma'],
    'Explicação': ['Logo', 'Então', 'Seguindo o raciocínio'],
    'Conformidade': ['Conforme', 'É esse respeito'],
    'Contraste/Oposição': ['Entretanto', 'Todavia'],
    'Oposição': ['Entretanto', 'Todavia'], // Alias para Contraste/Oposição
    'Causa e consequência': ['A partir disso', 'Sob essa perspectiva']
};

// Variáveis globais
let pontuacaoTotal = 0;
let validandoFrases = false;

// Configuração da tabela conforme ordem específica do usuário
const configuracaoTabela = [
    // Linha 1: Ademais | preencha | preencha
    {
        conectivo: { valor: 'Ademais', corretos: ['Ademais'], pontos: 0 },
        tipo: { valor: '', corretos: ['Adição'], pontos: 1 },
        frase: { valor: '', corretos: [], pontos: 1, conectivoUsado: 'Ademais' }
    },
    // Linha 2: preencha | Conclusão | preencha
    {
        conectivo: { valor: '', corretos: conectivosDB['Conclusão'], pontos: 1 },
        tipo: { valor: 'Conclusão', corretos: ['Conclusão'], pontos: 0 },
        frase: { valor: '', corretos: [], pontos: 1, conectivoUsado: '' }
    },
    // Linha 3: Logo | Explicação | preencha
    {
        conectivo: { valor: 'Logo', corretos: ['Logo'], pontos: 0 },
        tipo: { valor: 'Explicação', corretos: ['Explicação'], pontos: 0 },
        frase: { valor: '', corretos: [], pontos: 1, conectivoUsado: 'Logo' }
    },
    // Linha 4: preencha | Adição | preencha
    {
        conectivo: { valor: '', corretos: conectivosDB['Adição'], pontos: 1 },
        tipo: { valor: 'Adição', corretos: ['Adição'], pontos: 0 },
        frase: { valor: '', corretos: [], pontos: 1, conectivoUsado: '' }
    },
    // Linha 5: Portanto | preencha | preencha
    {
        conectivo: { valor: 'Portanto', corretos: ['Portanto'], pontos: 0 },
        tipo: { valor: '', corretos: ['Conclusão'], pontos: 1 },
        frase: { valor: '', corretos: [], pontos: 1, conectivoUsado: 'Portanto' }
    },
    // Linha 6: Entretanto | Oposição | preencha
    {
        conectivo: { valor: 'Entretanto', corretos: ['Entretanto'], pontos: 0 },
        tipo: { valor: 'Oposição', corretos: ['Oposição', 'Contraste/Oposição'], pontos: 0 },
        frase: { valor: '', corretos: [], pontos: 1, conectivoUsado: 'Entretanto' }
    },
    // Linha 7: Conforme | preencha | preencha
    {
        conectivo: { valor: 'Conforme', corretos: ['Conforme'], pontos: 0 },
        tipo: { valor: '', corretos: ['Conformidade'], pontos: 1 },
        frase: { valor: '', corretos: [], pontos: 1, conectivoUsado: 'Conforme' }
    }
];

// Função para normalizar texto (remover acentos e converter para minúsculas)
function normalizarTexto(texto) {
    return texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// Função para verificar se a resposta está correta (aceita múltiplas respostas)
function verificarResposta(resposta, respostasCorretas) {
    const respostaNormalizada = normalizarTexto(resposta);
    return respostasCorretas.some(correta => 
        normalizarTexto(correta) === respostaNormalizada
    );
}

// Função para validar frase via API
async function validarFraseViaAPI(frase, conectivo) {
    try {
        const response = await fetch('/api/validar-frase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                frase: frase,
                conectivo: conectivo
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.sucesso) {
            return data.resultado;
        } else {
            throw new Error(data.erro || 'Erro desconhecido na validação');
        }
    } catch (error) {
        console.error('Erro ao validar frase:', error);
        // Fallback: validação básica local
        return validarFraseLocal(frase, conectivo);
    }
}

// Função de validação local como fallback
function validarFraseLocal(frase, conectivo) {
    const fraseValida = frase.length >= 10 && 
                       frase.trim().split(' ').length >= 3 &&
                       /^[A-Z]/.test(frase) &&
                       /[.!?]$/.test(frase.trim());
    
    const conectivoPresente = !conectivo || 
                             frase.toLowerCase().includes(conectivo.toLowerCase());
    
    const pontuacao = (fraseValida && conectivoPresente) ? 1 : 0;
    
    return {
        valida: pontuacao === 1,
        pontuacao: pontuacao,
        pontos: pontuacao,
        feedback: pontuacao === 1 ? 
                 ['✓ Frase válida (validação local)'] : 
                 ['✗ Frase inválida (validação local)']
    };
}

// Função para obter o conectivo usado na linha
function obterConectivoUsado(linha, index) {
    if (linha.conectivo.valor !== '') {
        return linha.conectivo.valor;
    } else {
        const inputConectivo = document.getElementById(`conectivo-${index}`);
        return inputConectivo ? inputConectivo.value.trim() : '';
    }
}

// Função para criar a tabela
function criarTabela() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    configuracaoTabela.forEach((linha, index) => {
        const tr = document.createElement('tr');
        
        // Coluna Conectivo
        const tdConectivo = document.createElement('td');
        if (linha.conectivo.valor === '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-field';
            input.id = `conectivo-${index}`;
            input.placeholder = 'Digite o conectivo...';
            tdConectivo.appendChild(input);
        } else {
            const span = document.createElement('span');
            span.className = 'filled-cell';
            span.textContent = linha.conectivo.valor;
            tdConectivo.appendChild(span);
        }
        tr.appendChild(tdConectivo);

        // Coluna Tipo
        const tdTipo = document.createElement('td');
        if (linha.tipo.valor === '') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-field';
            input.id = `tipo-${index}`;
            input.placeholder = 'Digite o tipo...';
            tdTipo.appendChild(input);
        } else {
            const span = document.createElement('span');
            span.className = 'filled-cell';
            span.textContent = linha.tipo.valor;
            tdTipo.appendChild(span);
        }
        tr.appendChild(tdTipo);

        // Coluna Frase (sempre vazia para o usuário preencher)
        const tdFrase = document.createElement('td');
        const inputFrase = document.createElement('input');
        inputFrase.type = 'text';
        inputFrase.className = 'input-field';
        inputFrase.id = `frase-${index}`;
        inputFrase.placeholder = 'Crie uma frase usando o conectivo...';
        tdFrase.appendChild(inputFrase);
        tr.appendChild(tdFrase);

        tbody.appendChild(tr);
    });
}

// Função para verificar as respostas
async function verificarRespostas() {
    if (validandoFrases) {
        return; // Evitar múltiplas validações simultâneas
    }

    validandoFrases = true;
    
    // Mostrar indicador de carregamento
    const verificarBtn = document.getElementById('verificar-btn');
    const textoOriginal = verificarBtn.textContent;
    verificarBtn.textContent = 'Validando...';
    verificarBtn.disabled = true;

    let pontuacao = 0;
    let totalLacunas = 0;
    let acertos = 0;

    try {
        for (let index = 0; index < configuracaoTabela.length; index++) {
            const linha = configuracaoTabela[index];

            // Verificar conectivo
            if (linha.conectivo.valor === '') {
                totalLacunas++;
                const inputConectivo = document.getElementById(`conectivo-${index}`);
                const resposta = inputConectivo.value.trim();
                
                if (resposta !== '') {
                    if (verificarResposta(resposta, linha.conectivo.corretos)) {
                        pontuacao += linha.conectivo.pontos;
                        acertos++;
                        inputConectivo.classList.remove('incorrect');
                        inputConectivo.classList.add('correct');
                    } else {
                        inputConectivo.classList.remove('correct');
                        inputConectivo.classList.add('incorrect');
                    }
                } else {
                    inputConectivo.classList.remove('correct', 'incorrect');
                }
            }

            // Verificar tipo
            if (linha.tipo.valor === '') {
                totalLacunas++;
                const inputTipo = document.getElementById(`tipo-${index}`);
                const resposta = inputTipo.value.trim();
                
                if (resposta !== '') {
                    if (verificarResposta(resposta, linha.tipo.corretos)) {
                        pontuacao += linha.tipo.pontos;
                        acertos++;
                        inputTipo.classList.remove('incorrect');
                        inputTipo.classList.add('correct');
                    } else {
                        inputTipo.classList.remove('correct');
                        inputTipo.classList.add('incorrect');
                    }
                } else {
                    inputTipo.classList.remove('correct', 'incorrect');
                }
            }

            // Verificar frase (nova funcionalidade)
            totalLacunas++;
            const inputFrase = document.getElementById(`frase-${index}`);
            const frase = inputFrase.value.trim();
            
            if (frase !== '') {
                const conectivoUsado = obterConectivoUsado(linha, index);
                
                try {
                    const resultadoValidacao = await validarFraseViaAPI(frase, conectivoUsado);
                    
                    if (resultadoValidacao.valida) {
                        pontuacao += linha.frase.pontos;
                        acertos++;
                        inputFrase.classList.remove('incorrect');
                        inputFrase.classList.add('correct');
                        
                        // Mostrar feedback positivo
                        inputFrase.title = resultadoValidacao.feedback.join('\n');
                    } else {
                        inputFrase.classList.remove('correct');
                        inputFrase.classList.add('incorrect');
                        
                        // Mostrar feedback de erro
                        inputFrase.title = resultadoValidacao.feedback.join('\n');
                    }
                } catch (error) {
                    console.error('Erro na validação da frase:', error);
                    inputFrase.classList.remove('correct', 'incorrect');
                    inputFrase.title = 'Erro na validação da frase';
                }
            } else {
                inputFrase.classList.remove('correct', 'incorrect');
                inputFrase.title = '';
            }
        }

        pontuacaoTotal = pontuacao;
        atualizarPontuacao();
        
        // Mostrar feedback no console para debug
        console.log(`Acertos: ${acertos}/${totalLacunas} | Pontuação: ${pontuacao}`);
        
    } finally {
        // Restaurar botão
        verificarBtn.textContent = textoOriginal;
        verificarBtn.disabled = false;
        validandoFrases = false;
    }
}

// Função para atualizar a pontuação na tela
function atualizarPontuacao() {
    const pontuacaoDisplay = document.getElementById('pontuacao-display');
    pontuacaoDisplay.textContent = `Pontuação: ${pontuacaoTotal}`;
    
    // Adicionar animação de feedback
    pontuacaoDisplay.classList.remove('feedback-correct');
    setTimeout(() => {
        pontuacaoDisplay.classList.add('feedback-correct');
    }, 100);
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    pontuacaoTotal = 0;
    criarTabela();
    atualizarPontuacao();
    
    // Limpar classes de feedback
    document.querySelectorAll('.input-field').forEach(input => {
        input.classList.remove('correct', 'incorrect');
        input.value = '';
        input.title = '';
    });
}

// Função para verificar status da API
async function verificarStatusAPI() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        console.log('Status da API:', data);
        return data.status === 'ativo';
    } catch (error) {
        console.warn('API de validação não disponível, usando validação local:', error);
        return false;
    }
}

// Função de inicialização
async function inicializar() {
    // Verificar status da API
    const apiDisponivel = await verificarStatusAPI();
    if (!apiDisponivel) {
        console.warn('API de validação não disponível. Usando validação local básica.');
    }
    
    // Criar a tabela
    criarTabela();
    
    // Configurar o botão de verificar
    const verificarBtn = document.getElementById('verificar-btn');
    verificarBtn.addEventListener('click', verificarRespostas);
    
    // Adicionar evento de Enter nos campos de input
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('input-field')) {
            verificarRespostas();
        }
    });
    
    // Inicializar pontuação
    atualizarPontuacao();
    
    console.log('Jogo Conectivo Rápido inicializado com validação de frases!');
    console.log('Nova configuração da tabela:');
    configuracaoTabela.forEach((linha, index) => {
        const conectivoInfo = linha.conectivo.valor === '' ? `[PREENCHER: ${linha.conectivo.corretos.join(', ')}]` : linha.conectivo.valor;
        const tipoInfo = linha.tipo.valor === '' ? `[PREENCHER: ${linha.tipo.corretos.join(', ')}]` : linha.tipo.valor;
        console.log(`Linha ${index + 1}: ${conectivoInfo} | ${tipoInfo} | [FRASE COM VALIDAÇÃO]`);
    });
}

// Aguardar o carregamento completo da página
document.addEventListener('DOMContentLoaded', inicializar);

