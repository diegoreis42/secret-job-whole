import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% das requisições devem ser menores que 500ms
        http_req_failed: ['rate<0.01'], // menos de 1% de falhas
    },
    stages: [
        {
            duration: '10s',
            target: 100
        },
        {
            duration: '30s',
            target: 100
        },
        {
            duration: '10s',
            target: 0
        }
    ]
};

const BASE_URL = 'http://localhost:4567';

// Adicionando headers para enviar JSON
const headers = {
    'Content-Type': 'application/json',
};

const keywords = [
    'security', 'scalability', 'reliability', 'concurrency', 'testing', 'optimization',
    'deployment', 'monitoring', 'logging', 'debugging', 'configuration', 'maintenance',
    'availability', 'throughput', 'load', 'volume', 'capacity',
    'backup', 'recovery', 'audit'];

export default function () {
    // Selecionar uma palavra-chave aleatória
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

    // Teste 1: Iniciar busca com palavra-chave aleatória
    const randomSearchPayload = JSON.stringify({ keyword: randomKeyword });

    const randomSearchResponse = http.post(`${BASE_URL}/crawl`, randomSearchPayload, { headers });

    check(randomSearchResponse, {
        'POST /crawl status 200': (r) => r.status === 200,
        'Response is JSON': (r) => r.headers['Content-Type'] === 'application/json',
        'Response contains id': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.id !== undefined;
            } catch (e) {
                return false;
            }
        },
    });

    // Extraindo o ID da pesquisa aleatória, se existir
    let randomSearchId;
    try {
        randomSearchId = JSON.parse(randomSearchResponse.body).id;
    } catch (e) {
        console.error(randomSearchResponse.body);
        console.error('Erro ao extrair ID da resposta:', e);
    }

    if (randomSearchId) {
        // Teste 2: Obter resultados da busca aleatória
        const getRandomResultResponse = http.get(`${BASE_URL}/crawl/${randomSearchId}`);

        check(getRandomResultResponse, {
            'GET /crawl/{id} status 200': (r) => r.status === 200,
            'Search status is active or done': (r) => {
            try {
                const body = JSON.parse(r.body);
                return ['active', 'done'].includes(body.status);
            } catch (e) {
                return false;
            }
            },
            'If status is done, urls field is not empty': (r) => {
            try {
                const body = JSON.parse(r.body);
                if (body.status === 'done') {
                return body.urls && body.urls.length > 0;
                }
                return true;
            } catch (e) {
                return false;
            }
            },
        });
    }

    // Pausa para simular tempo entre requisições
    sleep(1);
}
