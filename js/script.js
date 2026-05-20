/* ==========================================================================
   1. CONFIGURAÇÃO DO FIREBASE (BASE DE DADOS)
========================================================================== */
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
   2. INICIALIZAÇÃO DO CALENDÁRIO (FLATPICKR)
========================================================================== */
document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#dataHora", {
        enableTime: true,        // Ativa a escolha da hora
        dateFormat: "Y-m-d H:i", // Formato final salvo na base de dados
        minDate: "today",        // Impede agendamentos no passado
        minTime: "09:00",        // Hora de abertura da barbearia
        maxTime: "20:00",        // Hora de fecho
        locale: "pt",            // Tradução para português
        disableMobile: "true"    // Força o nosso visual premium em vez do nativo do telemóvel
    });
});

/* ==========================================================================
   3. FUNÇÃO DE AGENDAMENTO (GRAVAR DADOS)
========================================================================== */
async function agendar(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const servico = document.getElementById('servico').value;
    const dataHoraInput = document.getElementById('dataHora').value; 

    // O input tem data e hora juntos, dividimos a string ao meio (no espaço vazio)
    const data = dataHoraInput.split(" ")[0]; 
    const hora = dataHoraInput.split(" ")[1];

    if (!data || !hora) {
        alert("Por favor, seleciona uma data e horário válidos no calendário.");
        return;
    }

    const btnAgendar = document.querySelector('.btn-agendar');
    const textoOriginalBtn = btnAgendar.innerText;
    
    btnAgendar.innerText = "A processar reserva...";
    btnAgendar.disabled = true;
    btnAgendar.style.opacity = "0.7";

    try {
        // Verificar se o horário já está ocupado nessa mesma data
        const snapshot = await db.collection("agendamentos")
            .where("data", "==", data)
            .where("hora", "==", hora)
            .get();

        if (!snapshot.empty) {
            alert("⚠️ Este horário já se encontra reservado. Por favor, escolhe outra hora.");
            restaurarBotao(btnAgendar, textoOriginalBtn);
            return;
        }

        // Grava na base de dados (Firebase)
        await db.collection("agendamentos").add({
            nome: nome,
            servico: servico,
            data: data,
            hora: hora,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("✅ Agendamento confirmado com sucesso! O Ruy já está à tua espera.");
        document.getElementById('formAgendamento').reset();

    } catch (erro) {
        console.error("Erro ao guardar o agendamento: ", erro);
        alert("❌ Ocorreu um erro ao ligar à base de dados. Tenta novamente mais tarde.");
    } finally {
        restaurarBotao(btnAgendar, textoOriginalBtn);
    }
}

function restaurarBotao(botao, texto) {
    botao.innerText = texto;
    botao.disabled = false;
    botao.style.opacity = "1";
}

/* ==========================================================================
   4. FUNÇÃO PARA LER OS DADOS EM TEMPO REAL
========================================================================== */
function escutarAgendamentos() {
    const listaUI = document.getElementById("ulAgendamentos");

    db.collection("agendamentos")
        .orderBy("data")
        .orderBy("hora")
        .onSnapshot((querySnapshot) => {
            listaUI.innerHTML = ""; 
            
            if (querySnapshot.empty) {
                listaUI.innerHTML = "<li style='text-align:center; color: var(--text-muted);'>Nenhum horário reservado de momento. Seja o primeiro!</li>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const agendamento = doc.data();
                
                const partesData = agendamento.data.split("-");
                const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

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

window.onload = escutarAgendamentos;