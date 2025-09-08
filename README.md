# Medical Appointment Backend

Sistema de agendamiento de citas médicas para asegurados usando arquitectura serverless en AWS.

## 🏗️ Arquitectura

El sistema implementa una arquitectura event-driven usando los siguientes servicios de AWS:

- **API Gateway + Lambda**: Endpoints HTTP
- **DynamoDB**: Almacenamiento de estados de citas
- **SNS**: Distribución de eventos por país
- **SQS**: Colas de mensajes por país (PE/CL)
- **EventBridge**: Bus de eventos para confirmaciones
- **RDS MySQL**: Persistencia por país

## 🔄 Flujo de Procesamiento

### **Flujo Completo (PE y CL):**
1. **POST /appointments** → `Lambda(appointment)` crea cita `pending` en DynamoDB
2. **SNS** → Filtra por país y envía a `SQS_PE` o `SQS_CL`
3. **SQS_PE/SQS_CL** → Trigger `Lambda(appointment_pe)` o `Lambda(appointment_cl)`  
4. **Lambda Country** → Guarda en RDS + publica a EventBridge
5. **EventBridge** → Regla automática envía a `SQS(confirmations)`
6. **SQS confirmations** → Trigger `Lambda(confirmationProcessor)`
7. **Lambda Confirmation** → Actualiza estado `completed` en DynamoDB
8. **GET /appointments/{insuredId}** → Consulta desde DynamoDB

### **Componentes Clave:**
- **4 Lambdas**: `appointment` (HTTP), `appointment_pe`, `appointment_cl`, `confirmationProcessor`  
- **1 SNS Topic**: Con filtros por país
- **3 SQS Queues**: `SQS_PE`, `SQS_CL`, `SQS_confirmations`
- **1 EventBridge**: Bus unificado para confirmaciones
- **2 Bases de Datos**: DynamoDB (estados) + RDS MySQL (persistencia)

## 🚀 Instalación y Despliegue

### Prerrequisitos

- Node.js 18+
- AWS CLI configurado
- Serverless Framework
- Base de datos RDS MySQL ya creada

### Instalación

```bash
npm install
```

### Variables de Entorno

El archivo `serverless.yml` incluye estas variables de entorno:

```yaml
environment:
  APPOINTMENTS_TABLE: appointment-backend-appointments-dev
  SNS_TOPIC_ARN: arn:aws:sns:us-east-1:xxx:appointment-topic-dev
  EVENT_BUS_NAME: appointment-event-bus-dev
  RDS_HOST: medical-appointment-db.cqzy2q8yetvp.us-east-1.rds.amazonaws.com
  RDS_USER: admin
  RDS_PASSWORD: :qgkFd!<*))8iOFk-J6|e7_]cAi-
  RDS_DATABASE: appointments_db
```

### Despliegue

```bash
# Desarrollo
sls deploy --stage dev

# Producción
sls deploy --stage prod
```

### Despliegue Local para Testing

```bash
sls offline start
```

## 📡 API Endpoints

### POST /appointments
Crea una nueva cita médica.

**Request:**
```json
{
  "insuredId": "00001",
  "scheduleId": 100,
  "countryISO": "PE",
  "centerId": 4,
  "specialtyId": 3,
  "medicId": 4,
  "date": "2024-09-30T12:30:00Z"
}
```

**Response (202):**
```json
{
  "message": "agendamiento en proceso",
  "appointment": {
    "insuredId": "00001",
    "scheduleId": 100,
    "countryISO": "PE",
    "status": "pending",
    "createdAt": "2024-09-07T10:30:00Z"
  }
}
```

### GET /appointments/{insuredId}
Obtiene todas las citas de un asegurado.

**Response (200):**
```json
{
  "insuredId": "00001",
  "appointments": [
    {
      "scheduleId": 100,
      "countryISO": "PE",
      "status": "completed",
      "centerId": 4,
      "specialtyId": 3,
      "medicId": 4,
      "date": "2024-09-30T12:30:00Z",
      "createdAt": "2024-09-07T10:30:00Z",
      "updatedAt": "2024-09-07T10:35:00Z"
    }
  ]
}
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Ejemplos de Uso con cURL

```bash
# Crear cita para Perú
curl -X POST https://your-api.amazonaws.com/dev/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "insuredId": "00001",
    "scheduleId": 100,
    "countryISO": "PE",
    "centerId": 4,
    "specialtyId": 3,
    "medicId": 4,
    "date": "2024-09-30T12:30:00Z"
  }'

# Obtener citas del asegurado
curl https://your-api.amazonaws.com/dev/appointments/00001
```

## 🏛️ Arquitectura del Código

### Principios SOLID Implementados

- **Single Responsibility**: Cada comando/query tiene una responsabilidad específica
- **Open/Closed**: Interfaces permiten extensión sin modificación
- **Liskov Substitution**: Implementaciones son intercambiables
- **Interface Segregation**: Interfaces específicas por funcionalidad
- **Dependency Inversion**: Inyección de dependencias via constructores

### Arquitectura Limpia

```
src/
├── application/          # Casos de uso (Commands/Queries)
│   ├── appointment/
│   │   ├── commands/     # CreateAppointment, ProcessCountry, Complete
│   │   ├── queries/      # GetAppointmentsByInsuredId
│   │   └── repositories/ # Interfaces
│   ├── eventbridge/      # EventBridge abstractions
│   └── sns/              # SNS abstractions
├── domain/               # Entidades del dominio
│   └── Appointment.ts
├── infrastructure/       # Implementaciones concretas
│   ├── dynamo/          # Repositorio DynamoDB
│   ├── rds/             # Repositorio RDS
│   ├── eventbridge/     # Publisher EventBridge
│   └── sns/             # Publisher SNS
└── interfaces/          # Controladores/Handlers
    ├── http/            # API handlers
    ├── sqs/             # SQS handlers
    └── confirmation/    # Confirmation handler
```

### Patrones de Diseño Utilizados

- **Repository Pattern**: Abstracción de persistencia
- **Command Pattern**: Comandos para operaciones
- **Query Pattern**: Queries para consultas
- **Publisher Pattern**: Publicación de eventos
- **Factory Pattern**: Creación de entidades

## 🗄️ Modelo de Datos

### DynamoDB Table: appointments
```
Partition Key: insuredId (String)
Sort Key: scheduleId (Number)

Attributes:
- insuredId: String (5 digits)
- scheduleId: Number
- countryISO: String ("PE" | "CL")
- centerId: Number (optional)
- specialtyId: Number (optional)
- medicId: Number (optional)
- date: String ISO (optional)
- status: String ("pending" | "completed")
- createdAt: String ISO
- updatedAt: String ISO (optional)
```

### RDS MySQL Table: appointments
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  insured_id VARCHAR(5) NOT NULL,
  schedule_id INT NOT NULL,
  country_iso VARCHAR(2) NOT NULL,
  center_id INT,
  specialty_id INT,
  medic_id INT,
  datetime DATETIME,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_appointment (insured_id, schedule_id)
);
```

## 🔍 Validaciones Implementadas

- **insuredId**: Debe ser exactamente 5 dígitos (ej: "00001")
- **scheduleId**: Debe ser un número entero
- **countryISO**: Solo acepta "PE" o "CL"
- **status**: Solo acepta "pending" o "completed"

## 🛠️ Tecnologías Utilizadas

- **Node.js 18** + **TypeScript**
- **Serverless Framework** para IaC
- **AWS SDK v3** para servicios AWS
- **Jest** para testing
- **Webpack** para bundling
- **mysql2** para conexión RDS
- **OpenAPI/Swagger** para documentación

## 📊 Monitoreo y Logs

Todos los lambdas incluyen logging detallado:

```typescript
console.log("Processing appointment:", payload);
console.error("Error in handler:", error);
```

Los logs están disponibles en CloudWatch Logs con los siguientes grupos:
- `/aws/lambda/appointment-backend-dev-appointment`
- `/aws/lambda/appointment-backend-dev-appointmentPe`
- `/aws/lambda/appointment-backend-dev-appointmentCl`
- `/aws/lambda/appointment-backend-dev-confirmationProcessor`

## 🔐 Permisos IAM

El `serverless.yml` incluye todos los permisos necesarios:
- DynamoDB: PutItem, Query, UpdateItem, GetItem
- SNS: Publish
- SQS: SendMessage, ReceiveMessage, DeleteMessage
- EventBridge: PutEvents
- CloudWatch: CreateLogGroup, CreateLogStream, PutLogEvents

## 📋 Consideraciones Importantes

1. **RDS ya debe existir**: La base de datos MySQL debe estar creada previamente
2. **No hay rollback**: El sistema no maneja fallos de agendamiento (como especifica el reto)
3. **Proceso asíncrono**: Las citas se procesan de forma asíncrona
4. **Sin notificaciones**: No se implementa envío de emails (fuera del scope)
5. **Asegurados preexistentes**: Se asume que los asegurados ya están registrados

## 🚨 Troubleshooting

### Error común: EventBridge no funciona
- Verificar que `EVENT_BUS_NAME` esté configurado correctamente
- Revisar permisos IAM para EventBridge

### Error común: SNS no llega a SQS
- Verificar filtros de SNS (`countryISO`)
- Revisar políticas de SQS

### Error común: RDS connection failed
- Verificar credenciales de base de datos
- Confirmar que la base de datos existe
- Revisar security groups y subnets

## 📞 Soporte

Para reportar issues o solicitar features, crear un issue en el repositorio del proyecto.