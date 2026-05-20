/* ==========================================================================
   1. CONFIGURAÇÃO DO FIREBASE (BASE DE DADOS)
========================================================================== */
// ATENÇÃO: Tens de substituir as chaves abaixo pelas chaves do teu projeto no Firebase.
// Vai a firebase.google.com -> Consola -> Criar Projeto -> Web App (ícone </>)
const firebaseConfig = {
    apiKey: "COLOCA_A_TUA_API_KEY_AQUI",
    authDomain: "O_TEU_PROJETO.firebaseapp.com",
    projectId: "O_TEU_PROJETO",
    storageBucket: "O_TEU_PROJETO.appspot.com",
    messagingSenderId: "O_TEU_ID_AQUI",
    appId: "O_TEU_APP_ID_AQUI"
};

// Inicializar o Firebase e o Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ==========================================================================
   2. FUNÇÃO DE AGENDAMENTO (GRAVAR DADOS)
========================================================================== */
async function agendar(event) {
    event.preventDefault(); // Impede que a página recarregue ao submeter

    // Capturar os valores inseridos pelo utilizador
    const nome = document.getElementById('nome').value.trim();
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;

    // Selecionar o botão para criar o efeito de "A carregar..."
    const btnAgendar = document.querySelector('.btn-agendar');
    const textoOriginalBtn = btnAgendar.innerText;
    
    btnAgendar.innerText = "A processar reserva...";
    btnAgendar.disabled = true;
    btnAgendar.style.opacity = "0.7";

    try {
        // 2.1 Verificar se o horário já está ocupado nessa mesma data
        const snapshot = await db.collection("agendamentos")
            .where("data", "==", data)
            .where("hora", "==", hora)
            .get();

        if (!snapshot.empty) {
            alert("⚠️ Este horário já se encontra reservado. Por favor, escolhe outra hora.");
            restaurarBotao(btnAgendar, textoOriginalBtn);
            return;
        }

        // 2.2 Se estiver livre, grava na base de dados
        await db.collection("agendamentos").add({
            nome: nome,
            servico: servico,
            data: data,
            hora: hora,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2.3 Sucesso
        alert("✅ Agendamento confirmado com sucesso! O Ruy já está à tua espera.");
        document.getElementById('formAgendamento').reset(); // Limpa o formulário

    } catch (erro) {
        console.error("Erro ao guardar o agendamento: ", erro);
        alert("❌ Ocorreu um erro ao ligar à base de dados. Tenta novamente mais tarde.");
    } finally {
        restaurarBotao(btnAgendar, textoOriginalBtn);
    }
}

// Função auxiliar para restaurar o estado do botão
function restaurarBotao(botao, texto) {
    botao.innerText = texto;
    botao.disabled = false;
    botao.style.opacity = "1";
}

/* ==========================================================================
   3. FUNÇÃO PARA LER OS DADOS EM TEMPO REAL
========================================================================== */
function escutarAgendamentos() {
    const listaUI = document.getElementById("ulAgendamentos");

    // O onSnapshot mantém uma ligação ativa: se alguém agendar, a lista atualiza sozinha
    db.collection("agendamentos")
        .orderBy("data")
        .orderBy("hora")
        .onSnapshot((querySnapshot) => {
            listaUI.innerHTML = ""; // Limpa a lista antes de redesenhar
            
            // Se não houver agendamentos, mostra uma mensagem amigável
            if (querySnapshot.empty) {
                listaUI.innerHTML = "<li style='text-align:center; color: var(--text-muted);'>Nenhum horário reservado de momento. Seja o primeiro!</li>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const agendamento = doc.data();
                
                // Formatar a data (De AAAA-MM-DD para DD/MM/AAAA)
                const partesData = agendamento.data.split("-");
                const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

                // Criar o item da lista (li)
                const li = document.createElement("li");
                li.innerHTML = `
                    <span class="agendamento-data">📅 ${dataFormatada} às ${agendamento.hora}</span><br>
                    👤 <span style="color: var(--text-main); font-weight: 500;">${agendamento.nome}</span> <br>
                    ✂️ <span style="color: var(--text-muted); font-size: 0.85rem;">${agendamento.servico}</span>
                `;
                
                listaUI.appendChild(li);
            });
        }, (erro) => {
            console.error("Erro ao escutar os agendamentos: ", erro);
            listaUI.innerHTML = "<li style='color: #ef4444;'>Sem ligação à base de dados.</li>";
        });
}

// Iniciar a escuta da base de dados assim que a página carregar
window.onload = escutarAgendamentos;