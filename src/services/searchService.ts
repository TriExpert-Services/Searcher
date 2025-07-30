import NodeCache from 'node-cache';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  metadata?: Record<string, any>;
}

interface SearchParams {
  query: string;
  limit: number;
  offset: number;
  category?: string;
}

interface SearchResult {
  data: SearchItem[];
  total: number;
}

class SearchService {
  private cache: NodeCache;
  private searchIndex: SearchItem[] = [];

  constructor() {
    this.cache = new NodeCache({ stdTTL: config.cache.ttl });
  }

  async search(params: SearchParams): Promise<SearchResult> {
    const { query, limit, offset, category } = params;
    const cacheKey = `search:${query}:${category || 'all'}:${limit}:${offset}`;
    
    // Verificar caché
    const cachedResult = this.cache.get<SearchResult>(cacheKey);
    if (cachedResult) {
      logger.debug('Resultado obtenido desde caché', { query });
      return cachedResult;
    }

    // Realizar búsqueda
    let filteredItems = this.searchIndex;

    // Filtrar por categoría si se especifica
    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Búsqueda de texto
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    const scoredItems = filteredItems.map(item => {
      const score = this.calculateRelevanceScore(item, searchTerms);
      return { item, score };
    }).filter(({ score }) => score > 0);

    // Ordenar por relevancia
    scoredItems.sort((a, b) => b.score - a.score);

    // Paginación
    const total = scoredItems.length;
    const paginatedItems = scoredItems
      .slice(offset, offset + limit)
      .map(({ item }) => item);

    const result: SearchResult = {
      data: paginatedItems,
      total
    };

    // Guardar en caché
    this.cache.set(cacheKey, result);

    return result;
  }

  async getSuggestions(query: string): Promise<string[]> {
    const cacheKey = `suggestions:${query}`;
    const cached = this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    this.searchIndex.forEach(item => {
      // Sugerencias basadas en títulos
      if (item.title.toLowerCase().includes(queryLower)) {
        suggestions.add(item.title);
      }

      // Sugerencias basadas en tags
      item.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });
    });

    const result = Array.from(suggestions).slice(0, 10);
    this.cache.set(cacheKey, result);
    return result;
  }

  async indexData(data: SearchItem[]): Promise<number> {
    // Validar y limpiar datos
    const validItems = data.filter(item => 
      item.id && item.title && typeof item.title === 'string'
    );

    // Agregar al índice (evitar duplicados)
    const existingIds = new Set(this.searchIndex.map(item => item.id));
    const newItems = validItems.filter(item => !existingIds.has(item.id));
    
    this.searchIndex.push(...newItems);

    // Limpiar caché
    this.cache.flushAll();

    logger.info('Datos indexados', { 
      total: validItems.length, 
      new: newItems.length,
      indexSize: this.searchIndex.length 
    });

    return newItems.length;
  }

  async clearIndex(): Promise<void> {
    this.searchIndex = [];
    this.cache.flushAll();
  }

  private calculateRelevanceScore(item: SearchItem, searchTerms: string[]): number {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descriptionLower = item.description?.toLowerCase() || '';
    const tagsLower = item.tags?.map(tag => tag.toLowerCase()) || [];

    searchTerms.forEach(term => {
      // Puntuación por coincidencia exacta en título (mayor peso)
      if (titleLower.includes(term)) {
        score += titleLower === term ? 10 : 5;
      }

      // Puntuación por coincidencia en descripción
      if (descriptionLower.includes(term)) {
        score += 2;
      }

      // Puntuación por coincidencia en tags
      tagsLower.forEach(tag => {
        if (tag.includes(term)) {
          score += tag === term ? 4 : 2;
        }
      });
    });

    return score;
  }
}

export const searchService = new SearchService();