# Chazz

Sistema de monetização para tomadas inteligentes integradas com Tuya. O Chazz permite receber pagamentos via PIX através de QR codes e liberar o uso de dispositivos inteligentes por tempo determinado, possibilitando monetizar o uso de diversos aparelhos eletrônicos.

### Como Funciona

1. **Cadastro de Devices**: Cada tomada inteligente é cadastrada no sistema com:
   - ID externo (Tuya)
   - Valor em centavos por ciclo de uso
   - Duração em segundos por ciclo

2. **Geração de QR Code PIX**: Um QR code PIX é gerado (externamente) com o nome seguindo o padrão `Device id_<ID_DO_DEVICE>`

3. **Pagamento e Webhook**: Quando um pagamento é realizado:
   - O sistema recebe um webhook com os dados do pagamento
   - O valor pago é validado contra o valor mínimo por ciclo
   - Se suficiente, a tomada é ligada e o tempo de uso é agendado

4. **Desligamento Automático**: Um cron job verifica periodicamente (a cada 5 segundos) quais dispositivos devem ser desligados e os desativa automaticamente.

## Tecnologias

- **Node.js** com TypeScript
- **Express.js** para API REST
- **Prisma** com SQLite para persistência
- **Tuya Connector** para integração com dispositivos Tuya
- **Zod** para validação de schemas
- **Vitest** para testes
- **Docker** para containerização

## Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn
- Conta Tuya com credenciais de API
- Serviço de pagamento PIX com suporte a webhooks (ex: Woovi, OpenPix)

## Instalação

### Desenvolvimento Local

1. Clone o repositório:
```bash
git clone <repository-url>
cd chazz
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env`:
```env
# Servidor
PORT=3000

# Prisma
DATABASE_URL="file:./dev.db"

# Tuya API
TUYA_BASE_URL=https://openapi.tuyacn.com
TUYA_ACCESS_KEY=seu_access_key
TUYA_SECRET_KEY=seu_secret_key

# Autenticação Webhook PIX
WEBHOOK_USERNAME=usuario_webhook
WEBHOOK_PASSWORD=senha_webhook

# Autenticação API de Devices
DEVICE_API_USERNAME=usuario_device_api
DEVICE_API_PASSWORD=senha_device_api
```

4. Gere o cliente Prisma:
```bash
npx prisma generate
```

5. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

6. Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

### Docker

#### Desenvolvimento
```bash
npm run docker:dev
```

#### Produção
```bash
npm run docker:prod
```

Para visualizar logs em produção:
```bash
npm run docker:prod:logs
```

Para parar os containers:
```bash
# Desenvolvimento
npm run docker:dev:down

# Produção
npm run docker:prod:down
```

## Uso

### Endpoints da API

#### Health Check
```http
GET /health
```

Retorna o status da aplicação.

#### CRUD de Devices

`GET /devices` é público (sem autenticação). As demais rotas de devices exigem Basic Auth com `DEVICE_API_USERNAME` e `DEVICE_API_PASSWORD`.

**Criar Device**
```http
POST /devices
Content-Type: application/json
Authorization: Basic <base64(username:password)>

{
  "externalId": "device_tuya_123",
  "centsPerCycle": 1000,
  "secondsPerCycle": 3600,
  "turnOffAt": "2024-01-01T10:00:00Z" // opcional
}
```

**Listar Devices** (público)
```http
GET /devices
```

**Buscar Device por ID**
```http
GET /devices/:id
Authorization: Basic <base64(username:password)>
```

**Atualizar Device**
```http
PUT /devices/:id
Content-Type: application/json
Authorization: Basic <base64(username:password)>

{
  "centsPerCycle": 1500,
  "secondsPerCycle": 7200
}
```

**Deletar Device**
```http
DELETE /devices/:id
Authorization: Basic <base64(username:password)>
```

#### Webhook PIX

O webhook requer autenticação Basic Auth usando as credenciais configuradas em `WEBHOOK_USERNAME` e `WEBHOOK_PASSWORD`.

**Observação**: O webhook atual faz referência ao formato do gateway de pagamentos [Woovi](https://woovi.com/). Caso queira usar esse gateway, você pode se cadastrar em https://woovi.com/

```http
POST /webhooks/received-pix
Content-Type: application/json
Authorization: Basic <base64(username:password)>

{
  "pixQrCode": {
    "name": "Device id_1",
    "value": 1000
  }
}
```

O nome do QR code deve seguir o padrão `Device id_<ID_DO_DEVICE>`, onde `<ID_DO_DEVICE>` é o ID numérico do device cadastrado no sistema.

### Exemplo de Fluxo Completo

1. **Cadastrar uma tomada inteligente:**
```bash
curl -X POST http://localhost:3000/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'usuario:senha' | base64)" \
  -d '{
    "externalId": "bf1234567890abcdef",
    "centsPerCycle": 500,
    "secondsPerCycle": 1800
  }'
```

2. **Gerar QR Code PIX** (externamente, ex: via Woovi/OpenPix) com o nome `Device id_1` (onde 1 é o ID retornado no cadastro)

3. **Quando o pagamento for realizado**, o sistema receberá automaticamente o webhook e:
   - Validará se o valor pago (em centavos) é suficiente
   - Ligará a tomada via Tuya
   - Agendará o desligamento baseado no tempo pago

4. **O cron job** desligará automaticamente a tomada quando o tempo expirar

## Estrutura do Projeto

```
src/
├── api/                    # Rotas e middlewares da API
│   ├── device-routes.ts   # Rotas CRUD de devices
│   ├── device-schema.ts   # Schemas de validação Zod
│   ├── device-auth-middleware.ts  # Auth para API de devices
│   ├── webhook-routes.ts  # Rotas de webhook PIX
│   └── webhook-schema.ts  # Schema de validação do webhook
├── errors/                 # Classes de erro customizadas
├── lib/                    # Utilitários (logger, prisma)
├── repository/             # Camada de acesso a dados
├── service/                # Serviços externos (Tuya)
└── use-cases/              # Lógica de negócio
    ├── create-device.ts
    ├── get-device.ts
    ├── list-devices.ts
    ├── update-device.ts
    ├── delete-device.ts
    ├── reschedule-device-turn-off.ts
    └── turn-off-pending-devices.ts
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `npm run build` - Compila o projeto TypeScript
- `npm start` - Inicia o servidor em modo produção
- `npm test` - Executa os testes em modo watch
- `npm run test:run` - Executa os testes uma vez
- `npm run docker:dev` - Inicia containers Docker em desenvolvimento
- `npm run docker:prod` - Inicia containers Docker em produção

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `PORT` | Porta do servidor | Não (padrão: 3000) |
| `DATABASE_URL` | URL de conexão do banco de dados | Sim |
| `TUYA_BASE_URL` | URL base da API Tuya | Não (padrão: https://openapi.tuyacn.com) |
| `TUYA_ACCESS_KEY` | Access Key da API Tuya | Sim |
| `TUYA_SECRET_KEY` | Secret Key da API Tuya | Sim |
| `WEBHOOK_USERNAME` | Usuário para autenticação de webhooks | Sim |
| `WEBHOOK_PASSWORD` | Senha para autenticação de webhooks | Sim |
| `DEVICE_API_USERNAME` | Usuário para autenticação da API de devices | Sim |
| `DEVICE_API_PASSWORD` | Senha para autenticação da API de devices | Sim |

## Testes

Execute os testes com:
```bash
npm test
```

Os testes cobrem os use cases principais e seguem o padrão de mock do repositório e serviços externos.
