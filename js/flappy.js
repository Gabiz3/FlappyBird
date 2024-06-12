function NovoElemento(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

class Barreira {
    constructor(reversa = false) {
        this.elemento = NovoElemento('div', 'barreira');

        const borda = NovoElemento('div', 'borda');
        const corpo = NovoElemento('div', 'corpo');

        this.elemento.appendChild(reversa ? corpo : borda);
        this.elemento.appendChild(reversa ? borda : corpo);

        this.setAltura = altura => corpo.style.height = `${altura}px`;
    }
}

class ParDeBarreira {
    constructor(altura, abertura, x) {
        this.elemento = NovoElemento('div', 'par-de-barreira');

        this.superior = new Barreira(true);
        this.inferior = new Barreira(false);

        this.elemento.appendChild(this.superior.elemento);
        this.elemento.appendChild(this.inferior.elemento);

        this.sortearAbertura = () => {
            const alturaSuperior = Math.random() * (altura - abertura);
            const alturaInferior = altura - abertura - alturaSuperior;
            this.superior.setAltura(alturaSuperior);
            this.inferior.setAltura(alturaInferior);
        };

        this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
        this.setX = x => this.elemento.style.left = `${x}px`;
        this.getLargura = () => this.elemento.clientWidth;

        this.sortearAbertura();
        this.setX(x);
    }
}

class Barreiras {
    constructor(altura, largura, abertura, espaco, notificarPonto) {
        this.pares = [
            new ParDeBarreira(altura, abertura, largura),
            new ParDeBarreira(altura, abertura, largura + espaco),
            new ParDeBarreira(altura, abertura, largura + espaco * 2),
            new ParDeBarreira(altura, abertura, largura + espaco * 3)
        ];

        const deslocamento = 1; // Reduzir a velocidade das barreiras

        this.animar = () => {
            this.pares.forEach(par => {
                par.setX(par.getX() - deslocamento);

                if (par.getX() + par.getLargura() <= 0) {
                    par.setX(par.getX() + espaco * this.pares.length);
                    par.sortearAbertura();
                }

                const meio = largura / 2;
                const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio;
                if (cruzouOMeio) notificarPonto();
            });

            requestAnimationFrame(this.animar);
        };

        this.animar = this.animar.bind(this);
    }
}

const notificarPonto = () => {
    const progresso = document.querySelector('.progresso');
    const valorAtual = parseInt(progresso.textContent);
    progresso.textContent = valorAtual + 1;
};

class Passaro {
    constructor(alturaJogo) {
        this.voando = false;
        this.alturaJogo = alturaJogo;
        this.elemento = NovoElemento('img', 'passaro');
        this.elemento.src = 'imgs/passaro.png';

        this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
        this.setY = y => this.elemento.style.bottom = `${y}px`;

        window.onkeydown = () => this.voando = true;
        window.onkeyup = () => this.voando = false;

        this.animar = () => {
            const novoY = this.getY() + (this.voando ? 4 : -4); // Reduzir a velocidade do pássaro
            const alturaMaxima = this.alturaJogo - this.elemento.clientHeight;

            if (novoY <= 0) {
                this.setY(0);
            } else if (novoY >= alturaMaxima) {
                this.setY(alturaMaxima);
            } else {
                this.setY(novoY);
            }

            requestAnimationFrame(this.animar);
        };

        this.setY(alturaJogo / 2);
        this.animar = this.animar.bind(this);
    }
}

const areaDoJogo = document.querySelector('[wm-flappy]');
let jogoIniciado = false;

function iniciarJogo() {
    if (areaDoJogo) {
        
        const abertura = 300; 
        const barreiras = new Barreiras(400, 600, abertura, 300, notificarPonto); // Ajuste do espaçamento entre as barreiras
        barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));

        const passaro = new Passaro(400);
        areaDoJogo.appendChild(passaro.elemento);

        requestAnimationFrame(() => {
            barreiras.animar();
            passaro.animar();
        });

        const temporizador = setInterval(() => {
            if (barreiras.pares.some(par => estaoSobrepostos(passaro.elemento, par.superior.elemento) || estaoSobrepostos(passaro.elemento, par.inferior.elemento))) {
                clearInterval(temporizador);
                exibirTelaReinicio();
            }
        }, 20);
    }
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
    return horizontal && vertical;
}

function exibirTelaInicio() {
    const telaInicio = NovoElemento('div', 'tela-inicio');
    telaInicio.innerHTML = '<h1>Flappy Bird</h1><button>Start</button>';
    areaDoJogo.appendChild(telaInicio);

    telaInicio.querySelector('button').onclick = () => {
        telaInicio.remove();
        iniciarJogo();
    };
}

function exibirTelaReinicio() {
    const telaReinicio = NovoElemento('div', 'tela-reinicio');
    telaReinicio.innerHTML = '<h1>Game Over</h1><button>Restart</button>';
    areaDoJogo.appendChild(telaReinicio);

    telaReinicio.querySelector('button').onclick = () => {
        window.location.reload();
    };
}

exibirTelaInicio();
