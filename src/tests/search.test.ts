import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Search API', () => {
  beforeEach(async () => {
    // Limpiar índice antes de cada test
    await request(app).delete('/api/search/index');
  });

  describe('GET /api/search', () => {
    it('debería requerir parámetro query', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body.error).toContain('Query no puede estar vacío');
    });

    it('debería retornar resultados vacíos cuando no hay datos indexados', async () => {
      const response = await request(app)
        .get('/api/search?query=test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('debería buscar y retornar resultados correctos', async () => {
      // Primero indexar algunos datos
      const testData = [
        {
          id: '1',
          title: 'Restaurante Pizza Palace',
          description: 'Deliciosas pizzas artesanales',
          category: 'comida',
          tags: ['pizza', 'italiana']
        },
        {
          id: '2',
          title: 'Café Central',
          description: 'El mejor café de la ciudad',
          category: 'bebidas',
          tags: ['café', 'desayuno']
        }
      ];

      await request(app)
        .post('/api/search/index')
        .send({ data: testData })
        .expect(200);

      // Buscar por "pizza"
      const response = await request(app)
        .get('/api/search?query=pizza')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Restaurante Pizza Palace');
      expect(response.body.total).toBe(1);
    });

    it('debería filtrar por categoría', async () => {
      const testData = [
        {
          id: '1',
          title: 'Restaurante Pizza Palace',
          description: 'Deliciosas pizzas artesanales',
          category: 'comida',
          tags: ['pizza']
        },
        {
          id: '2',
          title: 'Café Central',
          description: 'El mejor café',
          category: 'bebidas',
          tags: ['café']
        }
      ];

      await request(app)
        .post('/api/search/index')
        .send({ data: testData })
        .expect(200);

      const response = await request(app)
        .get('/api/search?query=a&category=bebidas')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('bebidas');
    });

    it('debería manejar paginación correctamente', async () => {
      const testData = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Item ${i + 1}`,
        description: 'Descripción de prueba',
        category: 'test'
      }));

      await request(app)
        .post('/api/search/index')
        .send({ data: testData })
        .expect(200);

      // Primera página
      const page1 = await request(app)
        .get('/api/search?query=Item&limit=5&offset=0')
        .expect(200);

      expect(page1.body.data).toHaveLength(5);
      expect(page1.body.total).toBe(15);

      // Segunda página
      const page2 = await request(app)
        .get('/api/search?query=Item&limit=5&offset=5')
        .expect(200);

      expect(page2.body.data).toHaveLength(5);
      expect(page2.body.total).toBe(15);

      // Verificar que son elementos diferentes
      const ids1 = page1.body.data.map((item: any) => item.id);
      const ids2 = page2.body.data.map((item: any) => item.id);
      expect(ids1).not.toEqual(ids2);
    });
  });

  describe('GET /api/search/suggestions', () => {
    it('debería requerir parámetro query', async () => {
      const response = await request(app)
        .get('/api/search/suggestions')
        .expect(400);

      expect(response.body.error).toContain('requerido');
    });

    it('debería retornar sugerencias basadas en datos indexados', async () => {
      const testData = [
        {
          id: '1',
          title: 'Pizza Margherita',
          description: 'Pizza clásica',
          tags: ['pizza italiana', 'margherita']
        }
      ];

      await request(app)
        .post('/api/search/index')
        .send({ data: testData })
        .expect(200);

      const response = await request(app)
        .get('/api/search/suggestions?query=piz')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/search/index', () => {
    it('debería indexar datos correctamente', async () => {
      const testData = [
        {
          id: '1',
          title: 'Test Item',
          description: 'Test description'
        }
      ];

      const response = await request(app)
        .post('/api/search/index')
        .send({ data: testData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('1 elementos indexados');
    });

    it('debería rechazar datos inválidos', async () => {
      const response = await request(app)
        .post('/api/search/index')
        .send({ data: 'invalid' })
        .expect(400);

      expect(response.body.error).toContain('array');
    });

    it('debería filtrar elementos sin ID o título', async () => {
      const testData = [
        { id: '1', title: 'Valid Item' },
        { title: 'Missing ID' },
        { id: '2' },
        { id: '3', title: 'Another Valid Item' }
      ];

      const response = await request(app)
        .post('/api/search/index')
        .send({ data: testData })
        .expect(200);

      expect(response.body.message).toContain('2 elementos indexados');
    });
  });

  describe('DELETE /api/search/index', () => {
    it('debería limpiar el índice correctamente', async () => {
      // Primero indexar datos
      await request(app)
        .post('/api/search/index')
        .send({ data: [{ id: '1', title: 'Test' }] })
        .expect(200);

      // Limpiar índice
      await request(app)
        .delete('/api/search/index')
        .expect(200);

      // Verificar que está vacío
      const response = await request(app)
        .get('/api/search?query=Test')
        .expect(200);

      expect(response.body.total).toBe(0);
    });
  });
});