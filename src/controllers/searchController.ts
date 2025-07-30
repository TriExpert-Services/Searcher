import { Request, Response } from 'express';
import { searchService } from '../services/searchService.js';
import { logger } from '../utils/logger.js';
import { createError } from '../middleware/errorHandler.js';

export const searchController = {
  async search(req: Request, res: Response) {
    const { query, limit = 10, offset = 0, category } = req.query;
    
    try {
      const results = await searchService.search({
        query: query as string,
        limit: Number(limit),
        offset: Number(offset),
        category: category as string
      });

      logger.info('Búsqueda realizada', {
        query,
        resultsCount: results.data.length,
        total: results.total
      });

      res.json({
        success: true,
        data: results.data,
        total: results.total,
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error) {
      logger.error('Error en búsqueda:', error);
      throw createError('Error al realizar la búsqueda', 500);
    }
  },

  async getSuggestions(req: Request, res: Response) {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      throw createError('Query es requerido para sugerencias', 400);
    }

    const suggestions = await searchService.getSuggestions(query);
    
    res.json({
      success: true,
      data: suggestions
    });
  },

  async indexData(req: Request, res: Response) {
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      throw createError('Se requiere un array de datos para indexar', 400);
    }

    const indexed = await searchService.indexData(data);
    
    logger.info('Datos indexados', { count: indexed });
    
    res.json({
      success: true,
      message: `${indexed} elementos indexados correctamente`
    });
  },

  async clearIndex(req: Request, res: Response) {
    await searchService.clearIndex();
    
    logger.info('Índice limpiado');
    
    res.json({
      success: true,
      message: 'Índice limpiado correctamente'
    });
  }
};