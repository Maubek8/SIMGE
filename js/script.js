document.addEventListener('DOMContentLoaded', async function() {
    const registerModal = document.getElementById("registerModal");
    const forgotPasswordModal = document.getElementById("forgotPasswordModal");
    const registerLink = document.getElementById("registerLink");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const closeButtons = document.getElementsByClassName("close");
    const passwordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    // Captura de vídeo para reconhecimento facial
    const video = document.getElementById('video');
    const startButton = document.getElementById('startButton');
    const statusMessage = document.getElementById('statusMessage');

    // Carregar os modelos necessários para o reconhecimento facial
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

    // Iniciar a câmera para capturar o vídeo
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );

    // Função para capturar o rosto e reconhecer
    async function recognizeFace() {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (detections.length === 0) {
            statusMessage.textContent = "Nenhum rosto detectado. Tente novamente.";
            return;
        }

        // Comparar o rosto capturado com um rosto já registrado
        const faceMatcher = new faceapi.FaceMatcher(detections);
        const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);

        if (bestMatch.label === "desconhecido") {
            statusMessage.textContent = "Rosto não reconhecido. Acesso negado.";
        } else {
            statusMessage.textContent = "Rosto reconhecido! Acesso permitido.";
            window.location.href = '/dashboard'; // Redireciona para o dashboard
        }
    }

    // Botão para iniciar reconhecimento facial
    startButton.addEventListener('click', recognizeFace);

    // Exibir modal de registro
    if (registerLink && registerModal) {
        registerLink.onclick = function() {
            registerModal.style.display = "block";
        };
    } else {
        console.error("Elemento de link de registro ou modal de registro não encontrado.");
    }

    // Exibir modal de recuperação de senha
    if (forgotPasswordLink && forgotPasswordModal) {
        forgotPasswordLink.onclick = function() {
            forgotPasswordModal.style.display = "block";
        };
    } else {
        console.error("Elemento de link de recuperação de senha ou modal de recuperação não encontrado.");
    }

    // Fechar modais ao clicar no botão de fechar
    if (closeButtons) {
        Array.from(closeButtons).forEach(function(closeButton) {
            closeButton.onclick = function() {
                if (registerModal) registerModal.style.display = "none";
                if (forgotPasswordModal) forgotPasswordModal.style.display = "none";
            };
        });
    }

    // Fechar modais ao clicar fora deles
    window.onclick = function(event) {
        if (event.target == registerModal) {
            registerModal.style.display = "none";
        }
        if (event.target == forgotPasswordModal) {
            forgotPasswordModal.style.display = "none";
        }
    };

    // Verificar correspondência de senhas no formulário de registro
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity("Senhas não correspondem");
            } else {
                confirmPasswordInput.setCustomValidity("");
            }
        });
    }

    // Validação e registro de senha (se necessário)
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            if (passwordInput.value === confirmPasswordInput.value) {
                alert("Registro realizado com sucesso!");
                registerModal.style.display = "none";
            } else {
                alert("As senhas não correspondem!");
            }
        });
    }
});
