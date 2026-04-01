# Validación de Flujo Crítico de Pedidos 🍔

Este documento detalla el mecanismo técnico para asegurar la integridad de los datos en el sistema de Hamburguesería, especialmente bajo condiciones de alta concurrencia.

## Mecanismo de Concurrencia (Atomicidad)

El sistema utiliza una estrategia de **Control de Concurrencia Optimista (OCC)** reforzado con **Nivel de Aislamiento SERIALIZABLE**.

### Pasos en la Transacción:

1.  **Inicio de Transacción:** Se abre una transacción global con `Prisma.TransactionIsolationLevel.Serializable`.
2.  **Validación Atómica de Stock (`updateMany`):**
    *   Para cada ingrediente necesario, se intenta realizar un `UPDATE` con una cláusula `WHERE stock >= cantidad_necesaria`.
    *   Este paso es atómico a nivel de base de datos (Compare-And-Swap).
    *   Si el `affected rows` es 0, significa que el stock bajó por debajo del mínimo *exactamente* en ese milisegundo, disparando un rollback inmediato.
3.  **Persistencia del Pedido:** Una vez asegurado el stock de **todos** los ingredientes, se insertan la cabecera y los ítems del pedido.
4.  **Confirmación (Commit):** Se liberan los bloqueos y el stock queda permanentemente descontado.

## Trazabilidad y Observabilidad

### Logs Estructurados
Cada petición genera un `X-Request-ID` único. Las trazas en producción siguen este modelo JSON:

```json
{
  "timestamp": "2026-03-31 15:10:00:123",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "level": "info",
  "message": "[OrderRepository] ✅ Transaction COMMITTED",
  "orderId": "uuid-del-pedido",
  "durationMs": 45,
  "status": "success"
}
```

## Manejo de Fallos (Rollback)

*   **Falla de Stock:** Si falla un solo ingrediente de 10, la transacción completa se revierte. No hay "descuentos parciales".
*   **Falla de Sistema:** Si el servidor se apaga a mitad del paso 3, la base de datos revierte automáticamente los pasos 1 y 2 al detectar la pérdida de conexión.

## Diagnóstico en Tiempo Real

*   `/api/health`: Verifica que el proceso Node.js esté saludable.
*   `/api/health/db`: Mide la latencia real (roundtrip) hacia PostgreSQL.
