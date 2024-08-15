import { chromium, firefox } from 'playwright';
import fs from 'fs';

(async () => {
    console.log("Iniciando o navegador...");
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log("Navegando para a página inicial...");
    await page.goto('https://www.bet365.com/#/MB/');
    await page.waitForTimeout(2000);

    console.log("Aceitando os cookies...");
    await page.click('text=Aceitar todos');
    await page.waitForTimeout(2000);
    
    console.log("Navegando para a página dos Jogos E-Soccer...");
    await page.goto('https://www.bet365.com/#/AC/B1/C1/D1002/E47578772/G938/I1/');
    await page.waitForTimeout(5000);
    
    console.log("Recarregando a página para o Carregamento Completo...");
    await page.reload();
    await page.waitForTimeout(5000);

    var count = 1;
    while (true) {
        console.clear(); // Limpa o console antes de cada nova atualização
        console.log("Capturando informações dos jogos de 8 Minutos...");

        // Captura todas as linhas que possuem informações dos jogos
        const teamRows = await page.locator('.src-ParticipantFixtureDetailsExtraLineHigher').allTextContents();

        for (let i = 0; i < teamRows.length; i += 3) { 
            const matchDetails = teamRows[i].split(' ');
            const hora = matchDetails.shift().match(/\d{2}:\d{2}/)?.[0] || "Hora desconhecida";

            const jogadores = matchDetails.join(' ').match(/\(([^)]+)\)/g) || [];
            const jogador1 = jogadores[0]?.replace(/[()]/g, '') || "Jogador 1";
            const jogador2 = jogadores[1]?.replace(/[()]/g, '') || "Jogador 2";

            const gameStatus = compareTime(hora);
            
            console.log(`Jogo ${Math.floor(i / 3) + 1}: (${gameStatus})`);
            console.log(`Hora:  ${hora}`);
            console.log(`Jogador 1: ${jogador1}`);
            console.log(`Jogador 2: ${jogador2}`);

            // Captura os Handicaps para o jogo atual
            console.log(`Capturando handicaps para o Jogo ${Math.floor(i / 3) + 1}...`);

            var indexHandicap = 0;
            
            if(i > 0){
                indexHandicap = i - count;
                count++;
            }

            const[listOddOne, listOddTwo] = await capturarHandicaps(page, indexHandicap);
            
            console.log("Odds do jogo:");
            for(var j = 0; j < listOddOne.length; j++){
                console.log(`${listOddOne[j]} - ${listOddTwo[j]}`);
            }

            console.log('--------------------------');
        }

        console.log('Informações capturadas com sucesso!');
        console.log("Aguardando 7 segundos para a próxima atualização...");
        count = 1;
        await page.waitForTimeout(7000); // Espera 7 segundos antes de atualizar novamente
    }

    function compareTime(gameTime) { 
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;
    
        if (gameTime <= currentTime) {
            return "acontecendo";
        } else {
            return "em espera";
        }
    }

    async function capturarHandicaps(page, index) {
        const teamRows = await page.locator('.src-ParticipantCenteredStacked48_Handicap').allTextContents();
        
        const [firstHalf, secondHalf] = splitArrayInHalf(teamRows);
        
        var listOddOne = [];
        var listOddTwo = [];
        
        var indexIteration = index;
        var indexComparation = index + 1;

        for(var i = indexIteration; i <= indexComparation; i++){
            // console.log(firstHalf[i]);
            listOddOne.push(firstHalf[i]);
        }

        for(var y = indexIteration; y <= indexComparation; y++){
            // console.log(secondHalf[y]);
            listOddTwo.push(secondHalf[y]);
        }

        return [listOddOne, listOddTwo];
    }

    function splitArrayInHalf(arr) {
        const midIndex = Math.ceil(arr.length / 2); // Ponto do meio, arredondado para cima
        const firstHalf = arr.slice(0, midIndex);  // Primeira metade da lista
        const secondHalf = arr.slice(midIndex);    // Segunda metade da lista
        return [firstHalf, secondHalf];
    }
})();
